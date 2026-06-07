import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Send, TrendingUp, Star, Bookmark, Sparkles, Brain, Target, Activity } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/ui/index'
import { cn } from '../../utils/utils'
import type { Application } from '../../types'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useUpgradePrompt } from '../../hooks/useUpgradePrompt'
import { UpgradeBanner } from '../../utils/UpgradeBanner'

interface AIResult {
  matched_jobs?: { match_percentage: number; category: string }[]
  resume_score?: number
  ats_score?: number
  recommendations?: string[]
}

function loadRealData() {
  // Applications from tracker
  let apps: Application[] = []
  try { apps = JSON.parse(localStorage.getItem('trackedApplications') ?? '[]') } catch { /* */ }

  // AI result from resume analysis
  let ai: AIResult | null = null
  try { ai = JSON.parse(localStorage.getItem('aiResumeResult') ?? 'null') } catch { /* */ }

  // Saved jobs keys
  let savedKeys: string[] = []
  try { savedKeys = JSON.parse(localStorage.getItem('savedJobKeys') ?? '[]') } catch { /* */ }

  const jobs = ai?.matched_jobs ?? []
  const matchScores = jobs.map(j => j.match_percentage)
  const avgMatch = matchScores.length
    ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
    : 0
  const highestMatch = matchScores.length ? Math.max(...matchScores) : 0

  // Build weekly activity from apps (last 7 days)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const label = days[d.getDay()]
    const dateStr = d.toLocaleDateString()
    const count = apps.filter(a => a.appliedAt === dateStr).length
    return { day: label, applications: count }
  })

  // Status breakdown
  const statusCounts = {
    Applied: apps.filter(a => a.status === 'Applied').length,
    'Under Review': apps.filter(a => a.status === 'Under Review').length,
    'Interview Scheduled': apps.filter(a => a.status === 'Interview Scheduled').length,
    Shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
    'Offer Received': apps.filter(a => a.status === 'Offer Received').length,
    Rejected: apps.filter(a => a.status === 'Rejected').length,
  }

  return {
    totalMatched: jobs.length,
    totalApplied: apps.length,
    highestMatch,
    avgMatch,
    savedCount: savedKeys.length,
    resumeScore: ai?.resume_score ?? 0,
    atsScore: ai?.ats_score ?? 0,
    recommendationCount: ai?.recommendations?.length ?? 0,
    weekly,
    statusCounts,
    matchScores,
    hasAiData: !!ai,
    hasApps: apps.length > 0,
  }
}

const statusColors: Record<string, string> = {
  'Applied':             'bg-blue-400',
  'Under Review':        'bg-amber-400',
  'Interview Scheduled': 'bg-purple-400',
  'Shortlisted':         'bg-cyan-400',
  'Offer Received':      'bg-green-500',
  'Rejected':            'bg-red-400',
}

export default function AnalyticsPage() {
  const { isPremium, loading } = useSubscription()
  const { showUpgradeModal } = useUpgradePrompt({
    featureName: 'Advanced Analytics',
  })
  const [apiUpgradeInfo, setApiUpgradeInfo] = useState<{ message: string; requiredPlans: string[]; upgradeUrl: string } | null>(null)

  // Initialize empty data structure
  const initialData = {
    totalMatched: 0,
    totalApplied: 0,
    highestMatch: 0,
    avgMatch: 0,
    savedCount: 0,
    resumeScore: 0,
    atsScore: 0,
    recommendationCount: 0,
    weekly: [],
    statusCounts: {},
    matchScores: [],
    hasAiData: false,
    hasApps: false,
  };
  const [data, setData] = useState(initialData);


  // Fetch latest AI result and analytics data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aiRes, analyticsRes] = await Promise.all([
          axios.get('/api/ai/latest'),
          axios.get('/api/analytics'),
        ]);
        const ai = aiRes.data?.result || null;
        const analytics = analyticsRes.data?.analytics || {};
        const apps = JSON.parse(localStorage.getItem('trackedApplications') ?? '[]');
        const savedKeys = JSON.parse(localStorage.getItem('savedJobKeys') ?? '[]');
        const jobs = ai?.matched_jobs ?? [];
        const matchScores = jobs.map(j => j.match_percentage);
        const avgMatch = matchScores.length ? Math.round(matchScores.reduce((a,b)=>a+b,0)/matchScores.length) : 0;
        const highestMatch = matchScores.length ? Math.max(...matchScores) : 0;
        const weekly = analytics.weekly || [];
        const statusCounts = analytics.statusCounts || {};
        setData({
          totalMatched: jobs.length,
          totalApplied: apps.length,
          highestMatch,
          avgMatch,
          savedCount: savedKeys.length,
          resumeScore: ai?.resume_score ?? 0,
          atsScore: ai?.ats_score ?? 0,
          recommendationCount: ai?.recommendations?.length ?? 0,
          weekly,
          statusCounts,
          matchScores,
          hasAiData: !!ai,
          hasApps: apps.length > 0,
        });
      } catch (err: any) {
        if (err.response?.status === 403) {
          setApiUpgradeInfo({
            message: err.response?.data?.message || 'Upgrade required',
            requiredPlans: err.response?.data?.requiredPlans || [],
            upgradeUrl: err.response?.data?.upgradeUrl || '/dashboard/pricing',
          });
        } else {
          console.error('Failed to fetch analytics data', err);
        }
      }
    };
    fetchData();
    // also set up listeners for updates
    const refresh = () => fetchData();
    window.addEventListener('applicationsUpdated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('applicationsUpdated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);


  const isEmpty = !data.hasAiData && !data.hasApps && data.savedCount === 0

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4500]"></div>
        </div>
      </DashboardLayout>
    )
  }

    if (!isPremium) {
      return (
        <DashboardLayout>
          <UpgradeBanner
            message={apiUpgradeInfo?.message || 'Upgrade required to access analytics'}
            requiredPlans={apiUpgradeInfo?.requiredPlans || []}
            upgradeUrl={apiUpgradeInfo?.upgradeUrl || '/dashboard/pricing'}
          />
        </DashboardLayout>
      );
    }

  const statCards = [
    { label: 'Jobs Matched', value: data.totalMatched, icon: Sparkles, color: 'text-[#FF4500]', note: data.hasAiData ? 'From AI analysis' : 'No resume analyzed yet' },
    { label: 'Applications Sent', value: data.totalApplied, icon: Send, color: 'text-blue-600', note: data.hasApps ? `${data.statusCounts['Offer Received']} offers received` : 'No applications yet' },
    { label: 'Best Match Score', value: data.highestMatch ? `${data.highestMatch}%` : '—', icon: Star, color: 'text-amber-500', note: data.avgMatch ? `Avg: ${data.avgMatch}%` : 'Analyze resume to see' },
    { label: 'Saved Jobs', value: data.savedCount, icon: Bookmark, color: 'text-purple-600', note: 'Bookmarked for later' },
  ]

  const maxWeekly = Math.max(...data.weekly.map(d => d.applications), 1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Your real career intelligence dashboard</p>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-[#FF4500]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              Upload your resume and start applying to jobs. Your real analytics will appear here automatically.
            </p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.note}</p>
                  </div>
                  <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <s.icon className={cn('w-4 h-4', s.color)} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resume Intelligence */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5 h-full">
              <div className="flex items-center gap-2 mb-5">
                <Brain className="w-4 h-4 text-[#FF4500]" />
                <h2 className="font-semibold text-gray-900">Resume Intelligence</h2>
              </div>
              {!data.hasAiData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-xs text-gray-400">Analyze your resume to see AI insights</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Resume Score', value: data.resumeScore, color: 'bg-[#FF4500]' },
                    { label: 'ATS Score', value: data.atsScore, color: 'bg-green-500' },
                    { label: 'Avg Match', value: data.avgMatch, color: 'bg-blue-500' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 text-xs">{item.label}</span>
                        <span className="font-semibold text-gray-900 text-xs">{item.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className={cn('h-full rounded-full', item.color)} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-[#FF4500]">{data.recommendationCount}</span> AI recommendations generated
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Application Status Breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2">
            <Card className="p-5 h-full">
              <div className="flex items-center gap-2 mb-5">
                <Send className="w-4 h-4 text-[#FF4500]" />
                <h2 className="font-semibold text-gray-900">Application Pipeline</h2>
              </div>
              {!data.hasApps ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Send className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-xs text-gray-400">Start applying to jobs to see your pipeline</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.statusCounts).map(([status, count]) => {
                    const pct = data.totalApplied > 0 ? Math.round((count / data.totalApplied) * 100) : 0
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{status}</span>
                          <span className="font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className={cn('h-full rounded-full', statusColors[status] ?? 'bg-gray-400')} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF4500]" />
                <h2 className="font-semibold text-gray-900">Weekly Applications</h2>
              </div>
              <span className="text-xs text-gray-400">Last 7 days</span>
            </div>
            {!data.hasApps ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">Apply to jobs to see your weekly activity</p>
              </div>
            ) : (
              <div className="flex items-end gap-3 h-28">
                {data.weekly.map((day, i) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '80px' }}>
                      {day.applications > 0 ? (
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${(day.applications / maxWeekly) * 72}px` }}
                          transition={{ duration: 0.6, delay: i * 0.06 }}
                          className="w-full bg-gradient-to-t from-[#FF4500] to-orange-300 rounded-t-md relative group min-h-[4px]">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.applications}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-full h-1 bg-gray-100 rounded-t-md" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{day.day}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Match Score Distribution */}
        {data.matchScores.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-[#FF4500]" />
                <h2 className="font-semibold text-gray-900">Match Score Distribution</h2>
                <span className="ml-auto text-xs text-gray-400">{data.matchScores.length} jobs analyzed</span>
              </div>
              <div className="flex items-end gap-1 h-24">
                {data.matchScores.slice(0, 20).map((score, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(score / 100) * 80}px` }}
                      transition={{ duration: 0.5, delay: i * 0.03 }}
                      className={cn('w-full rounded-t-sm',
                        score >= 70 ? 'bg-green-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-300')}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3">
                {[
                  { label: 'High (70%+)', color: 'bg-green-400', count: data.matchScores.filter(s => s >= 70).length },
                  { label: 'Medium (40–69%)', color: 'bg-amber-400', count: data.matchScores.filter(s => s >= 40 && s < 70).length },
                  { label: 'Low (<40%)', color: 'bg-red-300', count: data.matchScores.filter(s => s < 40).length },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={cn('w-2.5 h-2.5 rounded-sm', l.color)} />
                    <span className="text-xs text-gray-500">{l.label} <span className="font-semibold text-gray-700">({l.count})</span></span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
