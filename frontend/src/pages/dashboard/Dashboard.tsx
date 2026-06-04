import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Briefcase, TrendingUp, Activity, AlertCircle, MapPin } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, StatCard } from '../../components/ui/index'
import { weeklyActivity } from '../../data/mockData'
import { useSubscription } from '../../contexts/SubscriptionContext'
import SetPasswordModal from '../../components/SetPasswordModal'
import UsageBanner from '../../components/UsageBanner'

interface MatchedJob {
  title: string
  company: string
  location?: string
  match_percentage: number
  category: 'high' | 'medium' | 'low'
}

interface AIResult {
  matched_jobs?: MatchedJob[]
  missing_skills?: string[]
  recommendations?: string[]
  resume_score?: number
  ats_score?: number
}

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.08 },
})

const statIcons = [Briefcase, TrendingUp, Activity, Sparkles]

function getStoredUserInfo() {
  try {
    const parsed = JSON.parse(localStorage.getItem('userInfo') || 'null')
    if (!parsed) return null
    const nested = parsed?.user || parsed?.User
    return {
      ...parsed,
      plan: parsed?.plan || nested?.plan || parsed?.subscription || nested?.subscription || 'Free',
    }
  } catch {
    return null
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [aiResult, setAiResult] = useState<AIResult | null>(null)

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    // Handle Google/GitHub OAuth callback — token arrives as URL query params
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const isAdmin = params.get('isAdmin')
    const plan = params.get('plan')
    const name = params.get('name')
    const email = params.get('email')
    const avatar = params.get('avatar')
    const hasPassword = params.get('hasPassword') // 'true' or 'false'

    if (token) {
      const userInfo = {
        token,
        isAdmin: isAdmin === 'true',
        plan: plan || 'Free',
        hasPassword: hasPassword !== 'false', // persist for future checks
        user: {
          id: '',
          name: name || '',
          email: email || '',
          plan: plan || 'Free',
          avatar: avatar || '',
        }
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      // Clean up URL so params don't persist on refresh
      window.history.replaceState({}, document.title, window.location.pathname)

      if (isAdmin === 'true') {
        navigate('/admin')
        return
      }

      // New OAuth user with no password yet — show the set-password modal
      if (hasPassword === 'false') {
        setShowPasswordModal(true)
      }
    } else {
      // Check if an existing OAuth user still hasn't set a password
      // (e.g. they skipped on first login and came back)
      try {
        const stored = JSON.parse(localStorage.getItem('userInfo') || 'null')
        if (stored && stored.hasPassword === false) {
          setShowPasswordModal(true)
        }
      } catch { /* ignore */ }
    }
  }, [navigate])


  useEffect(() => {
    // 1. Load from local storage immediately for fast UI
    const stored = localStorage.getItem('aiResumeResult')
    if (stored) {
      try { setAiResult(JSON.parse(stored)) } catch { /* ignore */ }
    }

    // 2. Fetch the latest from backend in case an automated background search happened
    const fetchLatest = async () => {
      try {
        const rawUser = localStorage.getItem('userInfo');
        if (!rawUser) return;
        const token = JSON.parse(rawUser).token;
        if (!token) return;

        const res = await fetch('/api/jobresult/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data.success && data.result) {
          setAiResult(data.result);
          localStorage.setItem('aiResumeResult', JSON.stringify(data.result));
        }
      } catch (err) {
        console.error('Failed to fetch latest AI result:', err);
      }
    };
    
    fetchLatest();
  }, [])

  const subscriptionContext = useSubscription()
  const { subscription, isPremium } = subscriptionContext

  const storedUser = getStoredUserInfo()
  const planName =
    subscription?.subscriptionPlan ||
    subscription?.plan ||
    storedUser?.plan ||
    storedUser?.subscription ||
    'Free'
  const hasNeverActivatedPlan =
    !subscription?.subscriptionPlan &&
    !subscription?.plan &&
    !storedUser?.plan &&
    !storedUser?.subscription

  const jobs = aiResult?.matched_jobs ?? []
  const resumeScore = aiResult?.resume_score ?? 0
  const atsScore = aiResult?.ats_score ?? 0
  const highJobs = jobs.filter(j => j.category === 'high')

  const stats = [
    { label: 'Total Matches', value: String(jobs.length), change: jobs.length > 0 ? 'From AI analysis' : 'No data yet', positive: true },
    { label: 'High Matches', value: String(highJobs.length), change: jobs.length > 0 ? `${Math.round((highJobs.length / jobs.length) * 100)}% of total` : 'No data yet', positive: true },
    { label: 'Resume Score', value: resumeScore > 0 ? `${resumeScore}` : '—', change: resumeScore >= 80 ? 'Great score' : resumeScore > 0 ? 'Needs improvement' : 'Upload resume', positive: resumeScore >= 60 },
    { label: 'ATS Score', value: atsScore > 0 ? `${atsScore}` : '—', change: atsScore >= 70 ? 'ATS friendly' : atsScore > 0 ? 'Improve formatting' : 'Upload resume', positive: atsScore >= 60 },
  ]

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false)
    // Mark as "seen" so we don't re-show on every visit when user skips.
    // If they successfully set a password the backend handles the truth,
    // but we still update the local flag so we stop re-prompting.
    try {
      const stored = JSON.parse(localStorage.getItem('userInfo') || 'null')
      if (stored) {
        stored.hasPassword = true
        localStorage.setItem('userInfo', JSON.stringify(stored))
      }
    } catch { /* ignore */ }
  }

  return (
    <DashboardLayout>
      {/* Set-Password Modal — shown to new OAuth users on first login */}
      {showPasswordModal && (
        <SetPasswordModal required onClose={handlePasswordModalClose} />
      )}
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard 👋</h1>
            <p className="text-gray-500 mt-1">
              {jobs.length > 0
                ? `${jobs.length} jobs matched from your last resume analysis.`
                : "Upload your resume to get AI-powered job matches."}
            </p>
          </div>
          <Link to="/dashboard/resume">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] text-white text-sm font-medium rounded-lg hover:bg-[#e03e00] transition-colors">
              <Sparkles className="w-4 h-4" /> {jobs.length > 0 ? 'Re-analyze Resume' : 'Analyze Resume'}
            </button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = statIcons[i]
            return (
              <motion.div key={stat.label} {...fadeUp(i + 1)}>
                <StatCard label={stat.label} value={stat.value} change={stat.change} positive={stat.positive} icon={<Icon className="w-5 h-5" />} />
              </motion.div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly Activity */}
          <motion.div {...fadeUp(5)} className="lg:col-span-2">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Weekly Activity</h2>
                <span className="text-xs text-gray-400">This week</span>
              </div>
              <div className="flex items-end gap-3 h-32">
                {weeklyActivity.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1 items-center">
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(day.matches / 15) * 80}px` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full bg-orange-100 rounded-t-md relative group"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.matches} matches
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(day.applications / 7) * 40}px` }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="w-full bg-[#FF4500] rounded-t-md"
                      />
                    </div>
                    <span className="text-xs text-gray-400">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#FF4500] rounded-sm" /><span className="text-xs text-gray-500">Applications</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-100 rounded-sm" /><span className="text-xs text-gray-500">Matches</span></div>
              </div>
            </Card>
          </motion.div>

          {/* Resume Score */}
          <motion.div {...fadeUp(6)}>
            <Card className="p-5 h-full">
              <h2 className="font-semibold text-gray-900 mb-6">Resume Score</h2>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#FF4500" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - resumeScore / 100) }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{resumeScore || '—'}</span>
                    {resumeScore > 0 && <span className="text-xs text-gray-400">/ 100</span>}
                  </div>
                </div>
                {resumeScore === 0 ? (
                  <p className="text-xs text-gray-400 mt-4 text-center">Upload your resume to see your score</p>
                ) : (
                  <div className="mt-4 w-full space-y-2">
                    {[['ATS Score', atsScore], ['Resume Score', resumeScore]].map(([label, val]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8, delay: 0.6 }}
                              className="h-full bg-[#FF4500] rounded-full" />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8 text-right">{val}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Usage limits and upgrade banner for free users */}
        {!isPremium && (
          <motion.div {...fadeUp(7)}>
            <UsageBanner />
          </motion.div>
        )}

        {/* Top Job Matches */}
        <motion.div {...fadeUp(8)}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Top AI Job Matches</h2>
              <Link to="/dashboard/jobs" className="flex items-center gap-1 text-sm text-[#FF4500] hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <AlertCircle className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-500">No job matches yet.</p>
                <Link to="/dashboard/resume" className="text-sm text-[#FF4500] hover:underline mt-1">
                  Analyze your resume to get matches →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.filter(j => j.category === 'high').slice(0, 5).map((job, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-[#FF4500]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FF4500] transition-colors">{job.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        {job.company}
                        {job.location && <><span>·</span><MapPin className="w-3 h-3" />{job.location}</>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`text-sm font-bold ${job.match_percentage >= 70 ? 'text-green-600' : job.match_percentage >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                        {job.match_percentage}%
                      </span>
                      <p className="text-xs text-green-600 font-medium">High Match</p>
                    </div>
                  </motion.div>
                ))}
                {jobs.filter(j => j.category === 'high').length === 0 && jobs.slice(0, 5).map((job, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-[#FF4500]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FF4500] transition-colors">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${job.match_percentage >= 70 ? 'text-green-600' : job.match_percentage >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                      {job.match_percentage}%
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
