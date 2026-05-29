import prisma from '../config/prisma';
import transporter from '../utils/sendEmail';
import AIResultModel from '../models/AIResult';

const pad2 = (n: number) => String(n).padStart(2, '0');

const getNowHHmm = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const renderEmailBody = (jobs: any[], maxResults: number) => {
  // Requirement: email body contains first 7 jobs (regardless of configured maxResults).
  const first7 = jobs.slice(0, 7);

  const list = first7
    .map((j: any, idx: number) => {
      const title = j.title ?? 'Untitled';
      const company = j.company ?? '';
      const location = j.location ?? '';
      const pct = typeof j.match_percentage === 'number' ? `${j.match_percentage}%` : '';
      return `<li>${idx + 1}. ${title} — ${company}${location ? ` (${location})` : ''}${pct ? ` [${pct}]` : ''}</li>`;
    })
    .join('');

  return `
    <div>
      <h2>Your JobOps ${maxResults} match results (showing first 7 in this email)</h2>
      <p>Generated at: ${new Date().toISOString()}</p>
      <ol>${list}</ol>
      <p>Log in to JobOps for full results and details.</p>
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
          subscriptionPlan: { in: ['ProMonthly', 'ProYearly'] },
          emailAutomationEnabled: true,
          emailAutomationSearchTime: nowHHmm,
        },
        select: {
          id: true,
          email: true,
          subscriptionPlan: true,
          emailAutomationMaxResults: true,
          emailAutomationSearchTime: true,
        },
      });

      if (!users.length) return;

      for (const user of users) {
        // Get latest AIResult for this user (Mongo)
        const latest = await AIResultModel.findOne({ userId: String(user.id) }).sort({ createdAt: -1 });
        const jobs = latest?.matched_jobs || [];

        const html = renderEmailBody(jobs, user.emailAutomationMaxResults);

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'JobOps automated job matches',
          html,
        });
      }
    } catch (err) {
      console.error('Email automation scheduler error:', err);
    }
  }, 60 * 1000);
};

