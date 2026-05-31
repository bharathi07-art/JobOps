import { Request, Response } from "express";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import axios from "axios";
import AIResultModel from "../models/AIResult";
import ResumeModel from "../models/ResumeModel";
import LogModel from "../models/Log";
import AnalyticsModel from "../models/Analytics";

// ── Analyze Resume ────────────────────────────────────────────────────────────
export const analyzeResume = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found" });
    return;
  }

  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "Resume Required" });
      return;
    }

    // ── Parse resume text ──────────────────────────────────────────────────
    let resumeText = "";

    if (file.mimetype === "application/pdf") {
      const parser = new PDFParse({ data: file.buffer });
      const parsed = await parser.getText();
      resumeText = parsed.text;
    }

    if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = parsed.value;
    }

    // ── Save resume parse to MongoDB ───────────────────────────────────────
    await ResumeModel.create({
      userId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      extractedText: resumeText,
      fileSize: file.size,
    });

    // ── Call Gemini AI ─────────────────────────────────────────────────────
    const aiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        generationConfig: { responseMimeType: "application/json" },
        contents: [{
          role: "user",
          parts: [{
            text: `You are an AI job matching engine. Analyze the resume and return a JSON object.

Resume:
${resumeText}

Task: Identify suitable fresher/entry-level MERN Stack developer roles in India. List at least 10 job opportunities from startups, MNCs, service-based and product-based companies.

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
      "category": "high",
      "career_url": "https://careers.companyname.com",
      "job_url": "https://careers.companyname.com/jobs/junior-mern-stack-developer-12345",
      "search_url": "https://careers.companyname.com/jobs?q=MERN+Stack+Developer&location=India"
    }
  ]
}
Rules:
- category must be "high" if match_percentage >= 70, "medium" if >= 40, else "low"
- career_url must be the real official careers/jobs page URL of the company (e.g. https://careers.google.com). Never use job board URLs like linkedin.com or naukri.com.
- job_url must be the DIRECT URL to the specific job vacancy listing page on the company's own careers portal. This is the most important field — users will click this to apply to THAT exact job. If you cannot find a real direct link, construct the most specific URL possible using the company's known careers URL pattern.
- search_url must be a URL that pre-fills a search for this job title on the company's careers portal (use query parameters like ?q=, ?keyword=, ?search=, or ?title= as appropriate for that company's portal). This is used as a fallback if job_url is unavailable.
- All three URL fields must point to the company's own official domain, never third-party job boards.`
          }]
        }]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const raw: string = aiResponse.data.candidates[0].content.parts[0].text;
    console.log("RAW AI RESPONSE (first 300):", raw.substring(0, 300));

    const parsed = JSON.parse(raw);

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
      detail: `Analyzed ${file.originalname} — ${parsed.matched_jobs?.length ?? 0} jobs matched`,
    });

    res.status(200).json({ success: true, result: raw, id: savedResult._id });

  } catch (error: any) {
    console.log("FULL ERROR:", error?.response?.data || error?.message || error);

    await LogModel.create({
      userId,
      action: "ai_analyze",
      status: "error",
      detail: error?.message || "Unknown error",
    }).catch(() => {});

    res.status(500).json({ message: "AI processing failed" });
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
