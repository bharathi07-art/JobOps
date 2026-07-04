import { Request, Response } from "express";
import axios from "axios";
import AIResultModel from "../models/AIResult";
import ResumeModel from "../models/ResumeModel";
import LogModel from "../models/Log";
import AnalyticsModel from "../models/Analytics";
import { incrementUsage } from "../services/subscriptionService";
import { extractResumeText, parseAiResponse, validateResumeUpload } from "../utils/resumeProcessing";

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
    const aiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        generationConfig: { responseMimeType: "application/json" },
        contents: [{
          role: "user",
          parts: [{
            text: `I will upload my resume. I want you to act as an AI recruiter and Job hunting machine. Analyse my resume in depth to identify the most suitable fresher or entry-level (the role mentioned in resume) role for me to target in India and outside of the India. Find companies across startups, MNCs, service-based, product-based companies currently hiring, make sure to provide the verified ones. Use indeed connector as well to find jobs apart from finding jobs from web search. Match every job opening with my resume and provide the score out of 100 matching with my profile. Create a list of 50 such opportunities. Create a job application categorized with the score with high, medium and low probability.

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
      "location": "City, India",
      "match_percentage": <number 0-100>,
      "category": "high|medium|low",
      "career_url": "https://careers.companyname.com",
      "job_url": "https://careers.companyname.com/jobs/junior-developer-12345",
      "search_url": "https://careers.companyname.com/jobs?q=Developer&location=India"
    }
  ]
}
Rules:
- category must be "high" if match_percentage >= 70, "medium" if >= 40, else "low"
- career_url must be the real official careers/jobs page URL of the company (no job board URLs)
- job_url must be the DIRECT URL to the specific job vacancy listing page on the company's own careers portal.
- search_url must be a URL that pre-fills a search for this job title on the company's careers portal.
`
          }]
        }]
      },
      { headers: { "Content-Type": "application/json" }, timeout: 120000 }
    );

    const raw: string = aiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!raw) {
      throw new Error('The AI returned an empty response.');
    }

    console.log("RAW AI RESPONSE (first 300):", raw.substring(0, 300));

    const parsed = parseAiResponse(raw);

    // ── Save AI result to MongoDB ──────────────────────────────────────────
    const savedResult = await AIResultModel.create({
      userId,
      resume_score: parsed.resume_score,
      ats_score: parsed.ats_score,
      missing_skills: parsed.missing_skills,
      recommendations: parsed.recommendations,
      matched_jobs: parsed.matched_jobs,
    });

    // ── Update Analytics ───────────────────────────────────────────────────
    const highCount = parsed.matched_jobs?.filter((j: any) => j.category === "high").length ?? 0;

    await AnalyticsModel.findOneAndUpdate(
      { userId },
      {
        $inc: { totalAnalyses: 1 },
        $set: {
          lastResumeScore: parsed.resume_score,
          lastAtsScore: parsed.ats_score,
          totalJobsMatched: parsed.matched_jobs?.length ?? 0,
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
      detail: `Analyzed ${uploadFile.originalname} — ${parsed.matched_jobs?.length ?? 0} jobs matched`,
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
    }).catch(() => {});

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
