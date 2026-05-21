export interface Job {
  id: string
  title: string
  company: string
  companyLogo: string
  location: string
  type: 'Remote' | 'Hybrid' | 'On-site'
  salary: string
  matchPercentage: number
  skillsMatched: string[]
  missingSkills: string[]
  aiRecommendation: string
  postedAt: string
  saved: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  resumeScore: number
  atsScore: number
}

export interface Application {
  id: string
  jobTitle: string
  company: string
  companyLogo: string
  status: 'Applied' | 'Under Review' | 'Interview Scheduled' | 'Shortlisted' | 'Rejected' | 'Offer Received'
  appliedAt: string
  salary: string
  location?: string
  matchPercentage?: number
  notes?: string
  careerUrl?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'match' | 'application' | 'system'
}

export interface AnalyticsStat {
  label: string
  value: string
  change: string
  positive: boolean
}
