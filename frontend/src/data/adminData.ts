// ── Admin Mock Data ────────────────────────────────────────────────────────────

export const adminStats = {
  totalUsers: 12847,
  activeUsers: 8432,
  newUsersWeek: 634,
  premiumSubscribers: 2341,
  monthlySubscribers: 1876,
  yearlySubscribers: 465,
  totalRevenue: 48320,
  aiRequestsProcessed: 94210,
  totalApplicationsTracked: 31540,
  totalJobsMatched: 187430,
}

export const statGrowth = {
  totalUsers: +12.4,
  activeUsers: +8.7,
  newUsersWeek: +23.1,
  premiumSubscribers: +15.3,
  monthlySubscribers: +11.2,
  yearlySubscribers: +28.6,
  totalRevenue: +18.9,
  aiRequestsProcessed: +34.2,
  totalApplicationsTracked: +21.7,
  totalJobsMatched: +41.5,
}

export const weeklyVisits = [
  { day: 'Mon', users: 1240, sessions: 2100 },
  { day: 'Tue', users: 1580, sessions: 2640 },
  { day: 'Wed', users: 1320, sessions: 2200 },
  { day: 'Thu', users: 1890, sessions: 3100 },
  { day: 'Fri', users: 1650, sessions: 2750 },
  { day: 'Sat', users: 980,  sessions: 1600 },
  { day: 'Sun', users: 760,  sessions: 1240 },
]

export const monthlyRevenue = [
  { month: 'Jan', revenue: 28400, subscriptions: 180 },
  { month: 'Feb', revenue: 31200, subscriptions: 210 },
  { month: 'Mar', revenue: 29800, subscriptions: 195 },
  { month: 'Apr', revenue: 34600, subscriptions: 240 },
  { month: 'May', revenue: 38100, subscriptions: 268 },
  { month: 'Jun', revenue: 41500, subscriptions: 290 },
  { month: 'Jul', revenue: 39200, subscriptions: 275 },
  { month: 'Aug', revenue: 44800, subscriptions: 312 },
  { month: 'Sep', revenue: 43100, subscriptions: 301 },
  { month: 'Oct', revenue: 47600, subscriptions: 334 },
  { month: 'Nov', revenue: 46200, subscriptions: 322 },
  { month: 'Dec', revenue: 48320, subscriptions: 341 },
]

export const aiUsageData = [
  { day: 'Mon', requests: 8420, success: 8180, failed: 240 },
  { day: 'Tue', requests: 10340, success: 10100, failed: 240 },
  { day: 'Wed', requests: 9120, success: 8900, failed: 220 },
  { day: 'Thu', requests: 12600, success: 12300, failed: 300 },
  { day: 'Fri', requests: 11200, success: 10950, failed: 250 },
  { day: 'Sat', requests: 7400, success: 7200, failed: 200 },
  { day: 'Sun', requests: 5800, success: 5650, failed: 150 },
]

export const subscriptionPieData = [
  { label: 'Free', value: 10506, color: '#94a3b8' },
  { label: 'Monthly', value: 1876, color: '#FF4500' },
  { label: 'Yearly', value: 465, color: '#FFCBA4' },
]

export const adminSubscribers = [
  { id: '1', name: 'Bharathi Kumar', email: 'bharathi@example.com', plan: 'Yearly', billing: 'Annual', startDate: '2024-01-15', expiry: '2025-01-15', status: 'Active', amount: 220 },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', plan: 'Monthly', billing: 'Monthly', startDate: '2024-11-01', expiry: '2024-12-01', status: 'Active', amount: 20 },
  { id: '3', name: 'Marcus Williams', email: 'marcus@example.com', plan: 'Monthly', billing: 'Monthly', startDate: '2024-10-15', expiry: '2024-11-15', status: 'Expired', amount: 20 },
  { id: '4', name: 'Priya Patel', email: 'priya@example.com', plan: 'Yearly', billing: 'Annual', startDate: '2024-03-20', expiry: '2025-03-20', status: 'Active', amount: 220 },
  { id: '5', name: 'Jordan Lee', email: 'jordan@example.com', plan: 'Free', billing: '—', startDate: '2024-09-10', expiry: '—', status: 'Free', amount: 0 },
  { id: '6', name: 'Alex Rivera', email: 'alex@example.com', plan: 'Monthly', billing: 'Monthly', startDate: '2024-11-20', expiry: '2024-12-20', status: 'Active', amount: 20 },
  { id: '7', name: 'Nina Okafor', email: 'nina@example.com', plan: 'Yearly', billing: 'Annual', startDate: '2024-06-01', expiry: '2025-06-01', status: 'Active', amount: 220 },
  { id: '8', name: 'Tom Zhang', email: 'tom@example.com', plan: 'Monthly', billing: 'Monthly', startDate: '2024-11-05', expiry: '2024-12-05', status: 'Trial', amount: 0 },
]

export const adminFeedback = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', avatar: 'SC', category: 'AI Matching Issue', message: 'The AI job matching sometimes shows irrelevant results for senior roles. The match percentage seems off for niche positions.', date: '2024-12-01', priority: 'High', read: false },
  { id: '2', name: 'Marcus Williams', email: 'marcus@example.com', avatar: 'MW', category: 'Feature Request', message: 'Would love to see LinkedIn integration for auto-importing profile data. This would save a lot of time during onboarding.', date: '2024-11-30', priority: 'Medium', read: false },
  { id: '3', name: 'Priya Patel', email: 'priya@example.com', avatar: 'PP', category: 'UI Feedback', message: 'The mobile dashboard is great but the kanban board is hard to use on small screens. Needs better touch support.', date: '2024-11-29', priority: 'Medium', read: true },
  { id: '4', name: 'Jordan Lee', email: 'jordan@example.com', avatar: 'JL', category: 'Bug Report', message: 'After uploading a PDF resume, the analysis sometimes fails silently with no error message shown to the user.', date: '2024-11-28', priority: 'High', read: false },
  { id: '5', name: 'Alex Rivera', email: 'alex@example.com', avatar: 'AR', category: 'Billing Issue', message: 'Was charged twice for the monthly subscription in November. Please check and refund the duplicate charge.', date: '2024-11-27', priority: 'Critical', read: false },
  { id: '6', name: 'Nina Okafor', email: 'nina@example.com', avatar: 'NO', category: 'General Suggestion', message: 'Adding a cover letter generator directly in the dashboard would be amazing. Currently I have to use a separate tool.', date: '2024-11-26', priority: 'Low', read: true },
]

export const recentActivity = [
  { id: '1', user: 'Bharathi Kumar', action: 'Uploaded resume', time: '2 min ago', type: 'upload' },
  { id: '2', user: 'Sarah Chen', action: 'AI matching completed — 12 jobs found', time: '5 min ago', type: 'ai' },
  { id: '3', user: 'Marcus Williams', action: 'Applied to Senior Frontend Developer at Vercel', time: '8 min ago', type: 'apply' },
  { id: '4', user: 'Priya Patel', action: 'Saved 3 jobs', time: '12 min ago', type: 'save' },
  { id: '5', user: 'Jordan Lee', action: 'Logged in', time: '15 min ago', type: 'login' },
  { id: '6', user: 'Alex Rivera', action: 'Upgraded to Pro plan', time: '22 min ago', type: 'upgrade' },
  { id: '7', user: 'Nina Okafor', action: 'AI matching completed — 8 jobs found', time: '31 min ago', type: 'ai' },
  { id: '8', user: 'Tom Zhang', action: 'Registered new account', time: '45 min ago', type: 'register' },
]

export const aiWorkflowLogs = [
  { id: '1', requestId: 'req_8f2a1c', user: 'Bharathi Kumar', provider: 'Gemini', status: 'Success', duration: '2.3s', time: '2 min ago', tokens: 1840 },
  { id: '2', requestId: 'req_7e1b9d', user: 'Sarah Chen', provider: 'Gemini', status: 'Success', duration: '1.8s', time: '5 min ago', tokens: 2100 },
  { id: '3', requestId: 'req_6d0c8e', user: 'Marcus Williams', provider: 'Gemini', status: 'Failed', duration: '—', time: '8 min ago', tokens: 0 },
  { id: '4', requestId: 'req_5c9b7f', user: 'Priya Patel', provider: 'Gemini', status: 'Success', duration: '3.1s', time: '12 min ago', tokens: 1560 },
  { id: '5', requestId: 'req_4b8a6g', user: 'Jordan Lee', provider: 'Gemini', status: 'Success', duration: '2.7s', time: '18 min ago', tokens: 1920 },
  { id: '6', requestId: 'req_3a7b5h', user: 'Alex Rivera', provider: 'Gemini', status: 'Timeout', duration: '30s', time: '25 min ago', tokens: 0 },
]
