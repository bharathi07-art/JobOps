import connDB from '../config/mDB';
import ChatQAModel from '../models/ChatQA';

const normalizeQuestion = (question: string) => question.trim().toLowerCase();

const questionAnswers: Array<[string, string]> = [
  // Account & Login Questions
  ['How do I create an account?', 'Go to the registration page, enter your email and password, and follow the on-screen steps to create your JobOps account.'],
  ['How do I login with Google?', 'Click the Google sign-in button on the login page and authorize JobOps using your Google credentials.'],
  ['Can I login using GitHub?', 'Currently JobOps supports Google sign-in only; GitHub login is not available at this time.'],
  ['I forgot my password. What should I do?', 'Use the Forgot Password link on the login page, enter your email, and follow the password reset instructions sent to your inbox.'],
  ['Why am I unable to login?', 'Check your email and password, make sure your account is verified, and verify that your internet connection is working before trying again.'],
  ['How do I change my password?', 'Open Settings, go to the security or password section, and use the change password form to update your credentials.'],
  ['Can I use the application without signup?', 'No, you need to create an account and log in before using JobOps features like resume matching and saved jobs.'],
  ['Why am I not receiving OTP/email verification?', 'Check your spam folder, confirm your email address is correct, and wait a few minutes before requesting a new verification email.'],
  ['How do I logout?', 'Use the Logout or Sign Out option in the dashboard navigation to end your session securely.'],
  ['Can I use one account on multiple devices?', 'Yes, you can access the same account from multiple devices as long as you log in with the same credentials.'],
  ['How do I delete my account?', 'Go to Settings or contact support to permanently delete your account and remove your data.'],

  // Resume Privacy & Security Questions
  ['Is my resume secure?', 'Yes, JobOps stores resumes securely and only uses them for matching and analysis within the platform.'],
  ['Will my personal data be safe?', 'Yes, your personal data is protected by the platforms security controls and is not shared without your permission.'],
  ['Does JobOps store my resume permanently?', 'No, your resume is stored as long as you keep your account, and you can delete it whenever you want.'],
  ['Who can view my uploaded resume?', 'Only you and authorized JobOps processes can access your resume; it is not visible to other users.'],
  ['Is my resume shared with companies?', 'Your resume is only shared with companies when you explicitly choose to apply or send it through the platform.'],
  ['Can other users access my data?', 'No, other users cannot access your personal data or resume information.'],
  ['Is my uploaded file encrypted?', 'Yes, resume files are stored securely and handled with appropriate security measures.'],
  ['Can I delete my uploaded resume?', 'Yes, you can delete your uploaded resume from the Resume page or via account settings.'],
  ['Does AI train on my resume data?', 'No, your data is used only for matching and analysis, not to train external models or share with third parties.'],
  ['What happens to my data after account deletion?', 'When you delete your account, JobOps removes your personal data and uploaded files according to the platforms privacy policy.'],
  ['Is my payment information secure?', 'Yes, payment details are handled securely through the payment provider and are not stored directly on JobOps.'],
  ['Do you sell user data?', 'No, JobOps does not sell your personal data to third parties.'],

  // Application Usage Questions
  ['How does JobOps work?', 'JobOps analyzes your resume, matches your skills with job openings, and helps you track applications and recommendations.'],
  ['How do I upload my resume?', 'Open the Resume page, choose your file, and upload it to start AI matching.'],
  ['What file types are supported?', 'JobOps supports common resume formats like PDF and DOCX.'],
  ['How do I start AI matching?', 'Upload your resume and start the analysis process from the Resume section or matching workflow.'],
  ['What happens after uploading my resume?', 'The system parses it, scores skills and compatibility, and generates job matches based on your profile.'],
  ['How does the AI find jobs?', 'It compares your resume content to job requirements and ranks opportunities by relevance and skill fit.'],
  ['Can I search for remote jobs only?', 'Yes, use the search or filter options to narrow results to remote positions if that filter is available.'],
  ['Can I search jobs by country?', 'Yes, use location filters or search settings to focus on jobs in a specific country.'],
  ['Can I customize AI prompts?', 'Currently JobOps uses built-in matching logic; custom prompt editing may not be available in the current version.'],
  ['What is the best prompt to use?', 'Use a clear career goal, target role, and location when searching so the system can match you with relevant jobs.'],
  ['Can I upload multiple resumes?', 'The platform generally works with one active resume at a time; upload a new version to replace the previous one.'],
  ['How do I update my resume?', 'Upload a fresh resume file on the Resume page or replace the existing upload.'],

  // AI Matching & Scoring Questions
  ['What is resume match percentage?', 'It shows how closely your resume matches a job opening based on skills, experience, and role requirements.'],
  ['How is the probability score calculated?', 'The score is based on keyword fit, skills overlap, experience level, and other resume-to-job indicators.'],
  ['Why is my score low?', 'A low score usually means your resume is missing key skills, experience, or job-specific keywords.'],
  ['What are missing skills?', 'These are skills the AI identified in job listings that are not clearly present in your resume.'],
  ['How accurate is AI matching?', 'AI matching is a helpful guide, but it is not perfect; always review jobs manually to confirm the fit.'],
  ['Does AI analyze ATS compatibility?', 'Yes, the platform assesses resume format and keywords for applicant tracking system compatibility.'],
  ['How can I improve my resume score?', 'Add relevant skills, use clear job-related keywords, and ensure your resume formatting is easy to read.'],
  ['Why am I getting unrelated jobs?', 'This can happen if the resume is broad or the filters are wide; refine your profile and apply tighter search criteria.'],
  ['How frequently are jobs updated?', 'Job listings are refreshed regularly, typically daily or whenever new positions become available.'],
  ['Can AI suggest resume improvements?', 'Yes, it can recommend skills and resume changes to improve your match rate.'],
  ['Does the AI compare experience levels?', 'Yes, the system considers entry-level versus senior-level requirements when matching jobs.'],
  ['Can I target specific companies?', 'Yes, use company filters or search by company name if that option is available.'],

  // Subscription & Pricing Questions
  ['Is JobOps free?', 'JobOps offers a free plan with basic matching features and a premium plan for advanced capabilities.'],
  ['What features are included in the free plan?', 'The free plan typically includes basic resume analysis, job matching, and limited saves or tracking features.'],
  ['What features are included in premium?', 'Premium usually adds unlimited matches, faster updates, priority alerts, and enhanced recommendations.'],
  ['How much does premium cost?', 'Pricing depends on the current plan; check the subscription page for the latest monthly and yearly rates.'],
  ['Is there a monthly subscription?', 'Yes, JobOps offers a monthly subscription option.'],
  ['Is there a yearly subscription?', 'Yes, there is typically a yearly subscription for better value.'],
  ['Can I cancel anytime?', 'Yes, you can cancel your subscription anytime through your account settings.'],
  ['Will I be charged automatically?', 'Yes, premium subscriptions renew automatically until you cancel.'],
  ['Is there a student discount?', 'Student discounts may be offered occasionally; check current promotions or contact support.'],
  ['Do you offer refunds?', 'Refunds depend on the refund policy; contact support if you need help with billing.'],
  ['What payment methods are supported?', 'Common payment methods like credit/debit cards are accepted; check the payment page for details.'],
  ['Can I upgrade later?', 'Yes, you can upgrade from free to premium at any time.'],
  ['What happens if my subscription expires?', 'Your account reverts to the free plan and premium benefits are disabled until you renew.'],

  // Free Plan Limit Questions
  ['How many resume scans are allowed in free plan?', 'The free plan includes a limited number of resume scans; check your account details for exact quotas.'],
  ['How many job matches can I generate daily?', 'JobOps may limit daily job match generation on the free plan, while premium users get higher or unlimited limits.'],
  ['Is there a limit for AI requests?', 'Yes, the free tier has request limits and premium plans raise those limits.'],
  ['Can I save jobs in free plan?', 'Yes, you can save jobs on the free plan.'],
  ['Can free users access AI recommendations?', 'Yes, free users can access AI recommendations, but with limited volume or frequency.'],
  ['Can free users track applications?', 'Yes, application tracking is usually available to free users.'],
  ['What are the daily AI usage limits?', 'Daily AI usage limits vary by plan; premium users get higher allowances.'],
  ['How many prompts can I use per day?', 'The free version limits prompts per day, while premium plans offer more usage.'],
  ['What is restricted in free version?', 'Free users have smaller quotas, fewer premium features, and slower update frequency than paid users.'],

  // Saved Jobs & Application Tracker Questions
  ['How do I save a job?', 'Click the save or bookmark icon on the job card to add it to your saved jobs list.'],
  ['How do I remove saved jobs?', 'Go to Saved Jobs and click remove or unsave on the job entry.'],
  ['How does application tracking work?', 'Application tracking lets you mark jobs as applied, interview, or rejected and keep notes on each application.'],
  ['Can I track applied jobs?', 'Yes, you can track jobs you have applied to within the application tracker.'],
  ['How do I update application status?', 'Open the application entry and change its status to applied, interview, rejected, or another state.'],
  ['Can I mark a job as applied?', 'Yes, use the status controls in your application tracker to mark jobs as applied.'],
  ['Why is my application not visible in tracker?', 'Refresh the page, check filters, and make sure the job was saved or added to the tracker.'],
  ['Can I add interview notes?', 'Yes, add notes to the application entry if that feature is available.'],
  ['Can I track rejected applications?', 'Yes, you can update the status to rejected to keep a record of those applications.'],
  ['Can I filter applications by status?', 'Yes, use the tracker filters to view applications by applied, interview, rejected, or other status.'],

  // Resume Upload Questions
  ['Why is my resume upload failing?', 'Check file type, size, and network connection; make sure you choose a supported format and try again.'],
  ['What file size is allowed?', 'Most systems allow files up to 5MB; check the upload instructions for the exact limit.'],
  ['Does PDF work better than DOCX?', 'PDF is usually more reliable for parsing layout, but DOCX is also supported.'],
  ['Why is resume parsing incorrect?', 'Complex formatting or images can confuse parsing; clear, text-based resumes give better results.'],
  ['Can I upload image resumes?', 'No, image-based resumes are not supported; use a text-based PDF or DOCX file.'],
  ['How long does resume processing take?', 'Resume processing typically takes a few seconds to a minute depending on file size and system load.'],
  ['Can I replace my uploaded resume?', 'Yes, upload a new resume file to replace the existing one.'],
  ['Why are some skills missing from analysis?', 'The resume may not explicitly list those skills or may use different wording, so make sure key skills are clear.'],

  // Workflow & Processing Questions
  ['Why is AI processing taking time?', 'Processing time depends on file size and system load; large resumes may take longer to analyze.'],
  ['Is the workflow currently active?', 'You can check the dashboard status or workflow indicator to see if analysis is running.'],
  ['What does “Processing” mean?', 'Processing means the system is analyzing your resume and generating job matches.'],
  ['Why are no jobs appearing?', 'No jobs may appear if the resume content is too narrow or if filters are too strict; try updating your resume.'],
  ['How often does AI refresh recommendations?', 'Recommendations are refreshed regularly, often daily or whenever new jobs are added.'],
  ['Can I rerun analysis manually?', 'Yes, upload your resume again or use the analyze/refresh option if available.'],
  ['Why did my workflow fail?', 'A workflow can fail due to upload errors, file issues, or temporary system problems; try again or contact support.'],
  ['Is the AI currently offline?', 'Check system status or support notices; if the AI service is offline, you may need to wait until it is restored.'],
  ['How do I know when processing is complete?', 'The dashboard will update, or you will receive a notification once analysis is finished.'],

  // Technical Support Questions
  ['Why is the website slow?', 'Performance issues may be caused by network latency, browser cache, or server load.'],
  ['Why am I getting server errors?', 'Try refreshing, clearing cache, or contacting support if server errors keep appearing.'],
  ['Why is dashboard not loading?', 'Check your connection, sign out and back in, and try again if the dashboard fails to load.'],
  ['Why are job cards not visible?', 'Job cards may be hidden by filters or there may be no matching positions; clear filters and refresh.'],
  ['Why am I getting empty AI results?', 'Empty results usually mean the resume didn’t match any jobs; update your resume or broaden your search.'],
  ['Does JobOps support mobile devices?', 'Yes, JobOps is designed to work on modern mobile browsers.'],
  ['Is there a mobile app?', 'A dedicated mobile app may not be available yet; use the mobile web version instead.'],
  ['Which browsers are supported?', 'Use the latest versions of Chrome, Edge, Firefox, or Safari for the best experience.'],
  ['How do I report a bug?', 'Use the support or contact page to report bugs, or send a message to the support team.'],
  ['How do I contact support?', 'Contact support through the help page or email address provided in the app.'],

  // Profile & Settings Questions
  ['How do I change my avatar?', 'Open Settings and use the profile avatar option to choose a new image.'],
  ['Can I upload my own profile image?', 'Yes, upload your own profile image through the avatar or profile settings section.'],
  ['How do I edit my profile?', 'Go to Settings, edit your name, email, role, and other profile details, then save changes.'],
  ['How do I change theme mode?', 'Use the theme toggle in Settings to switch between light and dark mode.'],
  ['How do I update my email address?', 'Update your email in profile settings and follow any verification steps if required.'],
  ['How do I manage notifications?', 'Use the Notifications settings tab to enable or disable alerts and email preferences.'],
  ['How do I delete uploaded resumes?', 'Delete uploaded resumes from the Resume page or account settings if that option is available.'],
  ['Can I export my data?', 'If data export is supported, use the account settings export option or contact support for assistance.'],

  // AI Ethics & Trust Questions
  ['Is AI replacing recruiters?', 'No, AI is a tool to support your job search and does not replace human recruiters.'],
  ['Are job recommendations guaranteed?', 'No, recommendations are suggestions based on the data and do not guarantee a job.'],
  ['Does AI make hiring decisions?', 'No, AI helps match you with jobs but hiring decisions are made by employers.'],
  ['Are these jobs real?', 'Yes, recommended jobs are real opportunities, but always verify the details before applying.'],
  ['Does JobOps directly apply to jobs?', 'JobOps may provide application links, but it does not automatically apply to jobs without your action.'],
  ['Can AI guarantee interviews?', 'No, AI cannot guarantee interviews; it only helps surface matching opportunities.'],
  ['How trustworthy are recommendations?', 'Recommendations are based on resume fit and job data, but you should still review them carefully.'],
  ['Does AI favor certain resumes?', 'No, the system matches based on content and qualifications rather than favoritism.'],

  // Advanced User Questions
  ['Can I integrate LinkedIn?', 'LinkedIn integration may be a planned feature; check current product updates for availability.'],
  ['Can I import jobs automatically?', 'Automatic job import may not be available currently; check the platform features or future updates.'],
  ['Will API access be available?', 'Public API access is not guaranteed; contact the team for any developer access plans.'],
  ['Can recruiters use JobOps?', 'Recruiters can use JobOps if the platform supports recruiter or employer accounts.'],
  ['Can I schedule automatic job matching?', 'Scheduled matching may be a future enhancement; for now, run analysis manually when needed.'],
  ['Can I receive daily job alerts?', 'If alerts are available, enable notifications to receive daily or frequent job updates.'],
  ['Will there be browser extension support?', 'Browser extension support is not available by default; this would be a future feature.'],
  ['Can I connect multiple resumes?', 'Multiple resume connections are not typically supported; use one active resume at a time.'],

  // Admin/Business Related Questions
  ['Can companies partner with JobOps?', 'Yes, companies can partner with JobOps through the business or partnership contact channels.'],
  ['How can recruiters post jobs?', 'Recruiters can post jobs through partnership programs or employer-facing features if available.'],
  ['Is there enterprise pricing?', 'Enterprise pricing is typically available for larger organizations; contact sales for details.'],
  ['Can universities use this platform?', 'Universities can use JobOps for student career support if a dedicated education program is offered.'],
  ['Is white-label solution available?', 'White-label options may be available through custom partnership agreements; contact the JobOps team.'],
];

const answers: Record<string, string> = Object.fromEntries(
  questionAnswers.map(([question, answer]) => [normalizeQuestion(question), answer])
);

async function populate() {
  await connDB();

  const results = {
    updated: 0,
    skipped: 0,
    missing: 0,
  };

  for (const [rawQuestion, answer] of Object.entries(answers)) {
    const normalizedQuestion = normalizeQuestion(rawQuestion);
    const entry = await ChatQAModel.findOne({ normalizedQuestion });

    if (!entry) {
      console.warn(`Missing entry for question: ${rawQuestion}`);
      results.missing += 1;
      continue;
    }

    if (entry.answer === answer && entry.answered) {
      results.skipped += 1;
      continue;
    }

    entry.answer = answer;
    entry.answered = true;
    entry.lastAsked = new Date();
    await entry.save();
    results.updated += 1;
  }

  console.log('Chat QA population complete:', results);
  process.exit(0);
}

populate().catch(error => {
  console.error('Population failed:', error);
  process.exit(1);
});
