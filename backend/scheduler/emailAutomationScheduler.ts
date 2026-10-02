import prisma from '../config/prisma';
import transporter from '../utils/sendEmail';
import AIResultModel from '../models/AIResult';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { canPerformAction } from '../services/subscriptionService';
const pad2 = (n: number) => String(n).padStart(2, '0');

const getNowHHmm = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const renderEmailBody = (jobs: any[], autoLoginUrl: string) => {
  const first4 = jobs.slice(0, 4);

  const jobCards = first4.map((j: any) => {
    const title = j.title ?? 'Untitled';
    const company = j.company ?? 'Unknown Company';
    const location = j.location ?? '';
    const pct = typeof j.match_percentage === 'number' ? j.match_percentage : 0;
    
    let pctColor = '#ef4444'; // red
    let pctLabel = 'Low Match';
    if (pct >= 70) {
      pctColor = '#16a34a'; // green
      pctLabel = 'High Match';
    } else if (pct >= 40) {
      pctColor = '#d97706'; // amber
      pctLabel = 'Medium Match';
    }

    return `
      <div style="background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-cell; vertical-align: top;">
          <h3 style="margin: 0 0 4px 0; color: #111827; font-size: 16px; font-weight: 600;">${title}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 13px;">${company}${location ? ` &middot; ${location}` : ''}</p>
        </div>
        <div style="display: table-cell; vertical-align: top; text-align: right; width: 100px;">
          <div style="color: ${pctColor}; font-size: 16px; font-weight: bold;">${pct}%</div>
          <div style="color: ${pctColor}; font-size: 12px; font-weight: 500;">${pctLabel}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 32px 16px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background-color: #fff8f4; padding: 32px 24px; text-align: center; border-bottom: 1px solid #ffedd5;">
          <div style="display: inline-block; background-color: #FF4500; border-radius: 12px; padding: 8px; margin-bottom: 16px;">
            <span style="color: white; font-weight: bold; font-size: 20px;">✦ JobOps</span>
          </div>
          <h2 style="margin: 0; color: #111827; font-size: 24px;">Your Latest AI Job Matches</h2>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">We've analyzed your resume and found ${jobs.length} potential matches for you today.</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Top Opportunities</h3>
          ${jobCards}
          
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
            <a href="${autoLoginUrl}" style="display: inline-block; padding: 14px 28px; background-color: #FF4500; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Full Results in JobOps
            </a>
            <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">Clicking this button will securely log you into your dashboard.</p>
          </div>
        </div>

      </div>
    </div>
  `;
};

// NOTE: current repo has no job searching/matching function that we can safely reuse for automation.
// So this scheduler sends the most recent AIResult.matched_jobs for the user.
// If you want automation to generate new matches, we will need to reuse your analyzeResume logic
// with a stored resume file or saved resume text per user.
export const startEmailAutomationScheduler = () => {
  // Run every minute and trigger when HH:mm matches user's configured time.
  setInterval(async () => {
    try {
      const nowHHmm = getNowHHmm();


      const users = await prisma.user.findMany({
        where: {
          subscriptionStatus: 'active',
          subscriptionPlan: { in: ['Monthly', 'Yearly'] },
          emailAutomationEnabled: true,
          emailAutomationSearchTime: nowHHmm,
        },
        select: {
          id: true,
          email: true,
          subscriptionPlan: true,
          emailAutomationMaxResults: true,
          emailAutomationSearchTime: true,
          // @ts-ignore
          emailAutomationResumeText: true,
        },
      });

      if (!users.length) return;

      for (const user of users) {
        let jobs: any[] = [];

        // @ts-ignore
        if (user.emailAutomationResumeText) {
          // User has an automation resume uploaded, generate fresh results
          try {
            const aiResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
              {
                generationConfig: { responseMimeType: "text/plain" },
                contents: [{
                  role: "user",
                  parts: [{
                    text: `You are an AI job matching engine. Analyze the resume and return a JSON object.
        
                  Resume:
                      ${(user as any).emailAutomationResumeText}
        
        Task: Identify suitable fresher/entry-level MERN Stack developer roles in India. List at least 10 job opportunities from startups, MNCs, service-based and product-based companies.
        
        Return ONLY this exact JSON structure with these exact keys:
        {
          "resume_score": 85,
          "ats_score": 80,
          "missing_skills": ["skill1", "skill2"],
          "recommendations": ["recommendation1", "recommendation2"],
          "matched_jobs": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "location": "City, India",
              "match_percentage": 90,
              "category": "high",
              "career_url": "https://careers.companyname.com"
            }
          ]
        }
        Rules:
        - category must be "high" if match_percentage >= 70, "medium" if >= 40, else "low"
        - career_url must be the real official careers/jobs page URL of the company. Never use job board URLs like linkedin.com or naukri.com.`
                  }]
                }]
              },
              { headers: { "Content-Type": "application/json" } }
            );

            const raw = aiResponse.data.candidates[0].content.parts[0].text;
            const parsed = JSON.parse(raw);
            jobs = parsed.matched_jobs || [];

            // Save the newly generated results to MongoDB history
            await AIResultModel.create({
              userId: String(user.id),
              resume_score: parsed.resume_score,
              ats_score: parsed.ats_score,
              missing_skills: parsed.missing_skills,
              recommendations: parsed.recommendations,
              matched_jobs: parsed.matched_jobs,
            });

          } catch (aiErr) {
            console.error(`Failed to generate fresh jobs for user ${user.id}:`, aiErr);
          }
        }

        // If generation failed or user has no automation resume, fallback to their last AIResult
        if (jobs.length === 0) {
          const latest = await AIResultModel.findOne({ userId: String(user.id) }).sort({ createdAt: -1 });
          jobs = latest?.matched_jobs || [];
        }

        if (jobs.length === 0) continue;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        // Generate an auto-login token that mimics Google OAuth
        const emailToken = jwt.sign(
          { id: user.id, email: user.email, plan: user.subscriptionPlan },
          process.env.JWT_SECRET as string,
          { expiresIn: '7d' }
        );
        const autoLoginUrl = `${frontendUrl}/dashboard?token=${encodeURIComponent(emailToken)}&id=${user.id}&plan=${encodeURIComponent(user.subscriptionPlan)}&email=${encodeURIComponent(user.email)}`;
        // Check if user can perform AI search (usage limit)
        const { allowed, message } = await canPerformAction(user.id, 'aiSearch');
        if (!allowed) {
          console.log(`Skipping email for user ${user.id}: ${message}`);
          continue;
        }

        const html = renderEmailBody(jobs, autoLoginUrl);

        // Send email and increment usage
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'JobOps Automated Job Matches',
          html,
        });
        // Increment AI search usage for automation
        await import('../services/subscriptionService').then(m => m.incrementUsage(user.id, 'aiSearchesUsed'));

      }
    } catch (err) {
      console.error('Email automation scheduler error:', err);
    }
  }, 60 * 1000);
};

