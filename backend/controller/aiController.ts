import { Request, Response } from "express";
import axios from "axios";
import AIResultModel from "../models/AIResult";
import ResumeModel from "../models/ResumeModel";
import LogModel from "../models/Log";
import AnalyticsModel from "../models/Analytics";
import { incrementUsage } from "../services/subscriptionService";
import { extractResumeText, parseAiResponse, validateResumeUpload } from "../utils/resumeProcessing";
import { validateMatchedJobs } from "../utils/urlValidator";

// ── Analyze Resume ────────────────────────────────────────────────────────────
export const analyzeResume = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }

  try {
    const file = req.file;
    const validation = validateResumeUpload(file as any);

    if (!validation.ok) {
      res.status(validation.status || 400).json({ message: validation.message || 'Resume validation failed' });
      return;
    }

    const uploadFile = validation.file as any;
    const resumeText = await extractResumeText(uploadFile);

    // ── Save resume parse to MongoDB ───────────────────────────────────────
    await ResumeModel.create({
      userId,
      fileName: uploadFile.originalname,
      mimeType: uploadFile.mimetype,
      extractedText: resumeText,
      fileSize: uploadFile.size,
    });

    // ── Call Gemini AI ─────────────────────────────────────────────────────
    // NOTE: Both responseMimeType and google_search tools are enabled. If the
    // API returns a 400 error, it means this version doesn't support both together.
    // In that case, remove responseMimeType, rely on explicit JSON instructions,
    // and strip markdown code fences (```json) from the raw response before parsing.
    const aiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        generationConfig: { responseMimeType: "text/plain" },
        tools: [], // removed google_search to avoid tool calls
        contents: [{
          role: "user",
          parts: [{
            text: `I will upload my resume. I want you to act as an AI recruiter and Job hunting machine. Analyse my resume in depth to identify the most suitable fresher or entry-level (the role mentioned in resume) role for me to target in India and outside of India. Find companies across startups, MNCs, service-based, product-based companies currently hiring, make sure to provide the verified ones.

**CRITICAL: Use web search to find real, currently active job postings.** Do not rely on memory, hallucinations, or pattern-completion for company names, roles, or URLs. Only use URLs that you have directly retrieved from search results.

Match every job opening with my resume and provide a score out of 100 matching with my profile. Create a list of 50 such opportunities. Categorize jobs by match quality: high (>=70%), medium (>=40%), low (<40%).

Resume:
${resumeText}

Return ONLY this exact JSON structure with these exact keys:
{
  "resume_score": <number 0-100>,
  "ats_score": <number 0-100>,
  "missing_skills": ["skill1", "skill2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "matched_jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "match_percentage": <number 0-100>,
      "category": "high|medium|low",
      "career_url": "https://careers.companyname.com",
      "job_url": "https://careers.companyname.com/jobs/specific-job-id" | null,
      "search_url": "https://careers.companyname.com/jobs?q=Developer&location=India"
    }
  ]
}

**Rules (non-negotiable):**
- category MUST be "high" if match_percentage >= 70, "medium" if >= 40, else "low"
- career_url is REQUIRED: the real official careers/jobs page URL of the company (not a job board).
- search_url is REQUIRED: a URL that pre-fills a search for this job title on the company's careers portal. This must remain valid even if a specific posting is later removed.
- job_url is OPTIONAL: Set to null unless you retrieved it directly from a real, current search result with high confidence it is a live, direct link to a specific job vacancy.
- **CRITICAL: Do NOT invent, guess, or pattern-complete a job_url or any numeric ID within one.** If you are not certain a specific URL is real and currently active, set job_url to null. The backend will safely fall back to search_url.
`
          }]
        }]
      },
      { headers: { "Content-Type": "application/json" }, timeout: 120000 }
    );

    // Extract raw AI response text. If the expected text field is missing, fallback to the entire part JSON.
    const candidate = aiResponse?.data?.candidates?.[0];
    let raw: string = candidate?.content?.parts?.[0]?.text || '';
    if (!raw) {
      try {
        // Some responses may return the JSON payload directly in the part object.
        raw = JSON.stringify(candidate?.content?.parts?.[0] ?? {});
      } catch {
        raw = '';
      }
    }
    if (!raw) {
      throw new Error('The AI returned an empty response.');
    }

    console.log('FULL GEMINI RESPONSE:', JSON.stringify(aiResponse?.data, null, 2));

    const parsed = parseAiResponse(raw);

    // ── Validate matched job URLs (remove hallucinations, fallback to search_url) ──
    console.log(`Validating ${parsed.matched_jobs?.length ?? 0} job URLs...`);
    const validatedJobs = await validateMatchedJobs(parsed.matched_jobs || []);
    const jobsAfterValidation = validatedJobs.filter((j: any) => j.job_url !== null || j.search_url);

    console.log(
      `URL validation complete: ${jobsAfterValidation.length} jobs with valid fallbacks.`,
    );

    // ── Save AI result to MongoDB ──────────────────────────────────────────
    const savedResult = await AIResultModel.create({
      userId,
      resume_score: parsed.resume_score,
      ats_score: parsed.ats_score,
      missing_skills: parsed.missing_skills,
      recommendations: parsed.recommendations,
      matched_jobs: jobsAfterValidation,
    });

    // ── Update Analytics ───────────────────────────────────────────────────
    const highCount = jobsAfterValidation?.filter((j: any) => j.category === "high").length ?? 0;

    await AnalyticsModel.findOneAndUpdate(
      { userId },
      {
        $inc: { totalAnalyses: 1 },
        $set: {
          lastResumeScore: parsed.resume_score,
          lastAtsScore: parsed.ats_score,
          totalJobsMatched: jobsAfterValidation?.length ?? 0,
          totalHighMatches: highCount,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // ── Log success ────────────────────────────────────────────────────────
    await LogModel.create({
      userId,
      action: "ai_analyze",
      status: "success",
      detail: `Analyzed ${uploadFile.originalname} — ${jobsAfterValidation?.length ?? 0} jobs matched (after URL validation)`,
    });

    // Increment usage counters
    await incrementUsage(userId, "aiSearchesUsed");
    await incrementUsage(userId, "resumeUploadsCount");

    res.status(200).json({ success: true, result: raw, id: savedResult._id });

  } catch (error: any) {
    console.error("FULL ERROR:", error?.response?.data || error?.message || error);

    await LogModel.create({
      userId,
      action: "ai_analyze",
      status: "error",
      detail: error?.message || "Unknown error",
    }).catch(() => { });

    const message = error?.response?.status === 429
      ? 'The AI service is temporarily rate-limited. Please try again shortly.'
      : error?.message || 'AI processing failed';

    res.status(error?.response?.status || 500).json({ message });
  }
};

// ── Save a Job ────────────────────────────────────────────────────────────────
export const saveJob = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    const job = await (await import("../models/SavedJob")).default.create({ userId, ...req.body });

    await AnalyticsModel.findOneAndUpdate(
      { userId },
      { $inc: { totalSavedJobs: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true }
    );

    await LogModel.create({ userId, action: "save_job", status: "success", detail: `Saved: ${req.body.title} at ${req.body.company}` });

    res.status(201).json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to save job" });
  }
};

// ── Get Saved Jobs ────────────────────────────────────────────────────────────
export const getSavedJobs = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    const jobs = await (await import("../models/SavedJob")).default.find({ userId }).sort({ savedAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch saved jobs" });
  }
};

// ── Delete Saved Job ──────────────────────────────────────────────────────────
export const deleteSavedJob = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    await (await import("../models/SavedJob")).default.findOneAndDelete({ _id: req.params.id, userId });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete saved job" });
  }
};

// ── Get AI Result History ─────────────────────────────────────────────────────
export const getHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    const history = await AIResultModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("-matched_jobs -missing_skills -recommendations"); // summary only
    res.status(200).json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

// ── Get Latest Full AI Result ────────────────────────────────────────────────
// ── Get Latest Full AI Result (original) ────────────────────────────────────────────────
// ── Get Matched Jobs (for UI) ────────────────────────────────────────────────
export const getMatchedJobs = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    const latest = await AIResultModel.findOne({ userId }).sort({ createdAt: -1 });
    const matched = latest?.matched_jobs ?? [];
    res.status(200).json({ success: true, matched_jobs: matched });
  } catch (error: any) {
    console.error('Error fetching matched jobs:', error);
    res.status(500).json({ message: "Failed to fetch matched jobs" });
  }
};

// ── Get Latest Full AI Result (original) ────────────────────────────────────────────────
export const getLatestResult = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    const latest = await AIResultModel.findOne({ userId }).sort({ createdAt: -1 });
    if (!latest) {
      res.status(404).json({ message: "No AI results found" });
      return;
    }
    res.status(200).json({ success: true, result: latest });
  } catch (error: any) {
    console.error('Error fetching latest result:', error);
    res.status(500).json({ message: "Failed to fetch latest result" });
  }
};



// ── Get Analytics ─────────────────────────────────────────────────────────────
export const getAnalytics = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    const analytics = await AnalyticsModel.findOne({ userId });
    res.status(200).json({ success: true, analytics });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

// ── Get Logs ──────────────────────────────────────────────────────────────────
export const getLogs = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }
  try {
    const logs = await LogModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};
