import connDB from '../config/mDB';
import ChatQAModel from '../models/ChatQA';

const questions = [
  // Account & Login Questions
  'How do I create an account?',
  'How do I login with Google?',
  'Can I login using GitHub?',
  'I forgot my password. What should I do?',
  'Why am I unable to login?',
  'How do I change my password?',
  'Can I use the application without signup?',
  'Why am I not receiving OTP/email verification?',
  'How do I logout?',
  'Can I use one account on multiple devices?',
  'How do I delete my account?',
  // Resume Privacy & Security Questions
  'Is my resume secure?',
  'Will my personal data be safe?',
  'Does JobOps store my resume permanently?',
  'Who can view my uploaded resume?',
  'Is my resume shared with companies?',
  'Can other users access my data?',
  'Is my uploaded file encrypted?',
  'Can I delete my uploaded resume?',
  'Does AI train on my resume data?',
  'What happens to my data after account deletion?',
  'Is my payment information secure?',
  'Do you sell user data?',
  // Application Usage Questions
  'How does JobOps work?',
  'How do I upload my resume?',
  'What file types are supported?',
  'How do I start AI matching?',
  'What happens after uploading my resume?',
  'How does the AI find jobs?',
  'Can I search for remote jobs only?',
  'Can I search jobs by country?',
  'Can I customize AI prompts?',
  'What is the best prompt to use?',
  'Can I upload multiple resumes?',
  'How do I update my resume?',
  // AI Matching & Scoring Questions
  'What is resume match percentage?',
  'How is the probability score calculated?',
  'Why is my score low?',
  'What are missing skills?',
  'How accurate is AI matching?',
  'Does AI analyze ATS compatibility?',
  'How can I improve my resume score?',
  'Why am I getting unrelated jobs?',
  'How frequently are jobs updated?',
  'Can AI suggest resume improvements?',
  'Does the AI compare experience levels?',
  'Can I target specific companies?',
  // Subscription & Pricing Questions
  'Is JobOps free?',
  'What features are included in the free plan?',
  'What features are included in premium?',
  'How much does premium cost?',
  'Is there a monthly subscription?',
  'Is there a yearly subscription?',
  'Can I cancel anytime?',
  'Will I be charged automatically?',
  'Is there a student discount?',
  'Do you offer refunds?',
  'What payment methods are supported?',
  'Can I upgrade later?',
  'What happens if my subscription expires?',
  // Free Plan Limit Questions
  'How many resume scans are allowed in free plan?',
  'How many job matches can I generate daily?',
  'Is there a limit for AI requests?',
  'Can I save jobs in free plan?',
  'Can free users access AI recommendations?',
  'Can free users track applications?',
  'What are the daily AI usage limits?',
  'How many prompts can I use per day?',
  'What is restricted in free version?',
  // Saved Jobs & Application Tracker Questions
  'How do I save a job?',
  'How do I remove saved jobs?',
  'How does application tracking work?',
  'Can I track applied jobs?',
  'How do I update application status?',
  'Can I mark a job as applied?',
  'Why is my application not visible in tracker?',
  'Can I add interview notes?',
  'Can I track rejected applications?',
  'Can I filter applications by status?',
  // Resume Upload Questions
  'Why is my resume upload failing?',
  'What file size is allowed?',
  'Does PDF work better than DOCX?',
  'Why is resume parsing incorrect?',
  'Can I upload image resumes?',
  'How long does resume processing take?',
  'Can I replace my uploaded resume?',
  'Why are some skills missing from analysis?',
  // Workflow & Processing Questions
  'Why is AI processing taking time?',
  'Is the workflow currently active?',
  'What does “Processing” mean?',
  'Why are no jobs appearing?',
  'How often does AI refresh recommendations?',
  'Can I rerun analysis manually?',
  'Why did my workflow fail?',
  'Is the AI currently offline?',
  'How do I know when processing is complete?',
  // Technical Support Questions
  'Why is the website slow?',
  'Why am I getting server errors?',
  'Why is dashboard not loading?',
  'Why are job cards not visible?',
  'Why am I getting empty AI results?',
  'Does JobOps support mobile devices?',
  'Is there a mobile app?',
  'Which browsers are supported?',
  'How do I report a bug?',
  'How do I contact support?',
  // Profile & Settings Questions
  'How do I change my avatar?',
  'Can I upload my own profile image?',
  'How do I edit my profile?',
  'How do I change theme mode?',
  'How do I update my email address?',
  'How do I manage notifications?',
  'How do I delete uploaded resumes?',
  'Can I export my data?',
  // AI Ethics & Trust Questions
  'Is AI replacing recruiters?',
  'Are job recommendations guaranteed?',
  'Does AI make hiring decisions?',
  'Are these jobs real?',
  'Does JobOps directly apply to jobs?',
  'Can AI guarantee interviews?',
  'How trustworthy are recommendations?',
  'Does AI favor certain resumes?',
  // Advanced User Questions
  'Can I integrate LinkedIn?',
  'Can I import jobs automatically?',
  'Will API access be available?',
  'Can recruiters use JobOps?',
  'Can I schedule automatic job matching?',
  'Can I receive daily job alerts?',
  'Will there be browser extension support?',
  'Can I connect multiple resumes?',
  // Admin/Business Related Questions
  'Can companies partner with JobOps?',
  'How can recruiters post jobs?',
  'Is there enterprise pricing?',
  'Can universities use this platform?',
  'Is white-label solution available?',
];

const normalizeQuestion = (question: string) => question.trim().toLowerCase();

async function seed() {
  await connDB();

  const results = {
    inserted: 0,
    skipped: 0,
    updated: 0,
  };

  for (const question of questions) {
    const normalizedQuestion = normalizeQuestion(question);
    const existing = await ChatQAModel.findOne({ normalizedQuestion });
    if (existing) {
      results.skipped += 1;
      continue;
    }

    await ChatQAModel.create({
      question,
      normalizedQuestion,
      answer: '',
      answered: false,
    });
    results.inserted += 1;
  }

  console.log('Chat QA seed complete:', results);
  process.exit(0);
}

seed().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
