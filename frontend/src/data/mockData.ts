import type { Job, User, Application, Notification, AnalyticsStat } from '../types'

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'Senior Frontend Developer',
  resumeScore: 87,
  atsScore: 92,
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Vercel',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Vercel&backgroundColor=000000',
    location: 'San Francisco, CA',
    type: 'Remote',
    salary: '$140k - $180k',
    matchPercentage: 94,
    skillsMatched: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    missingSkills: ['Rust'],
    aiRecommendation: 'Excellent match! Your React and TypeScript skills align perfectly.',
    postedAt: '2 hours ago',
    saved: false,
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'Linear',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Linear&backgroundColor=5E6AD2',
    location: 'New York, NY',
    type: 'Hybrid',
    salary: '$130k - $160k',
    matchPercentage: 88,
    skillsMatched: ['React', 'Node.js', 'PostgreSQL'],
    missingSkills: ['Go', 'Kubernetes'],
    aiRecommendation: 'Strong match. Consider learning Go to boost your score to 96%.',
    postedAt: '5 hours ago',
    saved: true,
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Notion',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Notion&backgroundColor=000000',
    location: 'Remote',
    type: 'Remote',
    salary: '$120k - $150k',
    matchPercentage: 91,
    skillsMatched: ['React', 'TypeScript', 'GraphQL'],
    missingSkills: ['Electron'],
    aiRecommendation: 'Great fit for your profile. Notion values strong React expertise.',
    postedAt: '1 day ago',
    saved: false,
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'Stripe',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Stripe&backgroundColor=635BFF',
    location: 'Dublin, Ireland',
    type: 'On-site',
    salary: '$150k - $200k',
    matchPercentage: 79,
    skillsMatched: ['React', 'TypeScript', 'Testing'],
    missingSkills: ['Ruby', 'AWS'],
    aiRecommendation: 'Good match. Stripe values payment systems knowledge.',
    postedAt: '2 days ago',
    saved: false,
  },
  {
    id: '5',
    title: 'UI Engineer',
    company: 'Figma',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Figma&backgroundColor=F24E1E',
    location: 'Remote',
    type: 'Remote',
    salary: '$135k - $170k',
    matchPercentage: 85,
    skillsMatched: ['React', 'CSS', 'Animation', 'TypeScript'],
    missingSkills: ['WebGL', 'C++'],
    aiRecommendation: 'Your animation skills are a strong asset for this role.',
    postedAt: '3 days ago',
    saved: true,
  },
  {
    id: '6',
    title: 'Software Engineer',
    company: 'OpenAI',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=OpenAI&backgroundColor=10A37F',
    location: 'San Francisco, CA',
    type: 'Hybrid',
    salary: '$180k - $250k',
    matchPercentage: 72,
    skillsMatched: ['Python', 'React', 'APIs'],
    missingSkills: ['ML', 'PyTorch', 'CUDA'],
    aiRecommendation: 'Stretch role. Strong in frontend but ML skills needed.',
    postedAt: '4 days ago',
    saved: false,
  },
]

export const mockApplications: Application[] = [
  { id: '1', jobTitle: 'Senior Frontend Developer', company: 'Vercel', companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Vercel&backgroundColor=000000', status: 'Interview Scheduled', appliedAt: '2024-01-10', salary: '$140k - $180k', location: 'San Francisco, CA', matchPercentage: 94, notes: 'Technical round on Jan 20' },
  { id: '2', jobTitle: 'React Developer', company: 'Notion', companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Notion&backgroundColor=000000', status: 'Applied', appliedAt: '2024-01-12', salary: '$120k - $150k', location: 'Remote', matchPercentage: 91 },
  { id: '3', jobTitle: 'Full Stack Engineer', company: 'Linear', companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Linear&backgroundColor=5E6AD2', status: 'Under Review', appliedAt: '2024-01-08', salary: '$130k - $160k', location: 'New York, NY', matchPercentage: 88 },
  { id: '4', jobTitle: 'UI Engineer', company: 'Figma', companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Figma&backgroundColor=F24E1E', status: 'Offer Received', appliedAt: '2024-01-05', salary: '$135k - $170k', location: 'Remote', matchPercentage: 85, notes: 'Offer expires Jan 25' },
  { id: '5', jobTitle: 'Frontend Engineer', company: 'Stripe', companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Stripe&backgroundColor=635BFF', status: 'Rejected', appliedAt: '2024-01-03', salary: '$150k - $200k', location: 'Dublin, Ireland', matchPercentage: 79 },
  { id: '6', jobTitle: 'Software Engineer', company: 'OpenAI', companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=OpenAI&backgroundColor=10A37F', status: 'Shortlisted', appliedAt: '2024-01-14', salary: '$180k - $250k', location: 'San Francisco, CA', matchPercentage: 72 },
]

export const mockNotifications: Notification[] = [
  { id: '1', title: 'New Job Match!', message: 'Vercel is looking for a Senior Frontend Developer — 94% match', time: '2 min ago', read: false, type: 'match' },
  { id: '2', title: 'Application Update', message: 'Linear moved your application to Interview stage', time: '1 hour ago', read: false, type: 'application' },
  { id: '3', title: 'Resume Analyzed', message: 'Your resume scored 87/100. View improvement tips.', time: '3 hours ago', read: true, type: 'system' },
  { id: '4', title: 'New Job Match!', message: 'Notion has a React Developer role — 91% match', time: '5 hours ago', read: true, type: 'match' },
]

export const mockStats: AnalyticsStat[] = [
  { label: 'Applications Sent', value: '24', change: '+8 this week', positive: true },
  { label: 'Interview Rate', value: '38%', change: '+5% vs last month', positive: true },
  { label: 'Resume Score', value: '87', change: '+3 after update', positive: true },
  { label: 'ATS Score', value: '92%', change: '-2% vs last week', positive: false },
]

export const weeklyActivity = [
  { day: 'Mon', applications: 3, matches: 8 },
  { day: 'Tue', applications: 5, matches: 12 },
  { day: 'Wed', applications: 2, matches: 6 },
  { day: 'Thu', applications: 7, matches: 15 },
  { day: 'Fri', applications: 4, matches: 10 },
  { day: 'Sat', applications: 1, matches: 4 },
  { day: 'Sun', applications: 2, matches: 7 },
]

export const jobCategories = [
  { name: 'Frontend', value: 45 },
  { name: 'Full Stack', value: 25 },
  { name: 'Backend', value: 15 },
  { name: 'DevOps', value: 10 },
  { name: 'Mobile', value: 5 },
]

export const testimonials = [
  { name: 'Sarah Chen', role: 'Frontend Engineer at Google', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', text: 'JobOps matched me with my dream job in 2 weeks. The AI resume analysis was spot on!' },
  { name: 'Marcus Williams', role: 'Full Stack Dev at Shopify', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', text: 'The ATS optimization feature helped me get 3x more interview callbacks. Incredible tool.' },
  { name: 'Priya Patel', role: 'React Developer at Airbnb', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', text: 'I was skeptical at first but the 94% match accuracy is real. Landed a $160k offer!' },
]

export const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['4 AI job search permonth', 'Resume-based job recommendations', 'Up to 10 matched jobs', 'JBasic dashboard access'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: 'per month',
    features: ['Unlimited AI job matches', '1 AI-powered job search per day', 'ATS optimization', 'Priority support', 'Analytics dashboard', 'Full dashboard access', 'Automated email alerts for matched jobs', 'Custom notification schedule', 'Smart resume-based recommendations'],
    cta: 'Fees portal',
    popular: true,
  },
  {
    name: 'Yearly plan',
    price: '$220',
    period: 'year',
    features: ['Everything in Pro plan', 'Unlimited AI job matches', 'Automated email job alerts', 'Full dashboard access', 'Priority support', 'Save $20 annually'],
    cta: 'Fees Portal',
    popular: false,
  },
]
