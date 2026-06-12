import { useState, useEffect, useRef } from 'react';

import { UpgradeBanner } from '../../utils/UpgradeBanner';
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MapPin, Briefcase, Sparkles, TrendingUp, AlertCircle, ExternalLink, Bookmark, BookmarkCheck, X, CheckCircle2, Clock, BookmarkPlus } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'


import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { cn } from '../../utils/utils';
import { formatRelative, formatAbsolute } from '../../utils/timeUtils';
import type { Application } from '../../types';
import axios from 'axios';
axios.defaults.withCredentials = true

interface MatchedJob {
  title: string
  company: string
  location?: string
  match_percentage: number
  category: 'high' | 'medium' | 'low'
  career_url?: string
  job_url?: string
  search_url?: string
}

interface AIResult {
  matched_jobs?: MatchedJob[]
  missing_skills?: string[]
  recommendations?: string[]
  resume_score?: number
  ats_score?: number
}

const matchFilters = ['All', 'High', 'Medium', 'Low']

export default function JobsPage() {
  const location = useLocation();
  const querySearch = new URLSearchParams(location.search).get('search') ?? '';
  const initialSearch = location.state?.searchTerm ?? querySearch;
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('All');
  useEffect(() => {
    // Update search when URL or state changes (e.g., after navigation)
    const newSearch = location.state?.searchTerm ?? new URLSearchParams(location.search).get('search') ?? '';
    setSearch(newSearch);
  }, [location]);
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [loading, setLoading] = useState(true);
  const [upgradeInfo, setUpgradeInfo] = useState<{ message: string; requiredPlans: string[]; upgradeUrl: string } | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [timestampMode, setTimestampMode] = useState<'relative' | 'absolute'>('relative');
  const jobs = aiResult?.matched_jobs ?? [];

  useEffect(() => {
    const ts = localStorage.getItem('aiResumeTimestamp');
    if (ts) setTimestamp(ts);
    const saved = localStorage.getItem('savedJobKeys');
    if (saved) setSavedKeys(new Set(JSON.parse(saved)));
    const cached = localStorage.getItem('aiMatchedJobs');
    if (cached) setAiResult({ matched_jobs: JSON.parse(cached) });
    
    const handler = (e: StorageEvent) => {
      if (e.key === 'aiResumeTimestamp') setTimestamp(e.newValue);
      if (e.key === 'aiMatchedJobs' && e.newValue) setAiResult({ matched_jobs: JSON.parse(e.newValue) });
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    const fetchLatest = async () => {
      try {
        const { data } = await axios.get('/api/jobresult/matched-jobs');
        if (data?.matched_jobs) {
          setAiResult({ matched_jobs: data.matched_jobs });
          localStorage.setItem('aiMatchedJobs', JSON.stringify(data.matched_jobs));
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setUpgradeInfo({
            message: err.response?.data?.message || 'Upgrade required',
            requiredPlans: err.response?.data?.requiredPlans || [],
            upgradeUrl: err.response?.data?.upgradeUrl || '/dashboard/pricing',
          });
        }
      }
      setLoading(false);
    };

    // Initial fetch
    fetchLatest();

    // Poll every 5 seconds until we have at least one job
    pollInterval = setInterval(() => {
      if (!aiResult?.matched_jobs?.length) {
        fetchLatest();
      } else if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }, 5000);

    // Refetch when tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLatest();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Cleanup
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Loading spinner for free-plan or data fetch
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4500]"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Upgrade prompt for free plan users
  if (upgradeInfo) {
    return (
      <DashboardLayout>
        <UpgradeBanner
          message={upgradeInfo.message}
          requiredPlans={upgradeInfo.requiredPlans}
          upgradeUrl={upgradeInfo.upgradeUrl}
        />
      </DashboardLayout>
    );
  }

  const filtered = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'All' || job.category === categoryFilter.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const highCount = jobs.filter(j => j.category === 'high').length
  const medCount  = jobs.filter(j => j.category === 'medium').length
  const lowCount  = jobs.filter(j => j.category === 'low').length

  const jobKey = (job: MatchedJob) => `${job.title}__${job.company}`

  const handleSave = async (job: MatchedJob) => {
    const key = jobKey(job)
    if (savedKeys.has(key)) return   // already saved

    try {
      await axios.post('/api/jobresult/save-job', job)
      const next = new Set(savedKeys).add(key)
      setSavedKeys(next)
      localStorage.setItem('savedJobKeys', JSON.stringify([...next]))
    } catch {
      alert('Failed to save job. Please try again.')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Job Matches</h1>
            <p className="text-gray-500 mt-1">
              {jobs.length > 0
                ? `${filtered.length} of ${jobs.length} jobs matched to your resume`
                : 'Upload your resume to see AI-matched jobs'}
            </p>
          {timestamp && (
            <p className="text-sm text-gray-500 cursor-pointer hover:text-[#FF4500]" onClick={() => setTimestampMode(prev => prev === 'relative' ? 'absolute' : 'relative')}>
              Results last updated: {timestampMode === 'relative' ? formatRelative(timestamp) : formatAbsolute(timestamp)}
            </p>
          )}
          </div>
          {jobs.length > 0 && (
            <div className="flex gap-2 text-xs shrink-0">
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">{highCount} High</span>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full font-medium">{medCount} Medium</span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full font-medium">{lowCount} Low</span>
            </div>
          )}
        </div>

        {/* Empty state */}
        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#FF4500]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No AI results yet</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Upload your resume on the Resume page to get AI-matched job opportunities.
            </p>
            <Link to="/dashboard/resume"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4500] text-white text-sm font-medium rounded-lg hover:bg-[#e03e00] transition-colors">
              <Sparkles className="w-4 h-4" /> Analyze Resume
            </Link>
          </div>
        )}

        {/* Filters */}
        {jobs.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search jobs or companies..."
                className="w-full pl-9 pr-4 h-10 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#FF4500] transition-colors" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {matchFilters.map(f => (
                <button key={f} onClick={() => setCategoryFilter(f)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    categoryFilter === f ? 'bg-[#FF4500] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF4500]')}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Job Cards */}
        {filtered.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((job, i) => (
              <JobCard key={i} job={job} index={i}
                saved={savedKeys.has(jobKey(job))}
                onSave={() => handleSave(job)} />
            ))}
          </div>
        )}

        {jobs.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

// ── Apply flow modals ──────────────────────────────────────────────────────────
function ApplyConfirmModal({ job, onConfirm, onCancel, linkType }: {
  job: MatchedJob; onConfirm: () => void; onCancel: () => void; linkType: 'direct' | 'search' | 'careers'
}) {
  const badge = linkType === 'direct'
    ? { label: '🎯 Direct Job Link', color: 'bg-green-100 text-green-700 border-green-200' }
    : linkType === 'search'
    ? { label: '🔍 Pre-filled Search', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    : { label: '🏢 Careers Page', color: 'bg-gray-100 text-gray-600 border-gray-200' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-[#FF4500]" />
          </div>
          <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">Apply for this Job</h3>
        <p className="text-sm text-gray-500 mb-2">
          You'll be taken to the company's official portal for:
        </p>
        <div className="bg-orange-50 rounded-xl px-4 py-3 mb-3">
          <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
          <p className="text-xs text-gray-500">{job.company}</p>
        </div>
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border mb-5 ${badge.color}`}>
          {badge.label}
        </span>
        {linkType !== 'direct' && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
            ⚠️ You may need to search for <span className="font-semibold">"{job.title}"</span> on the company portal.
          </p>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-[#FF4500] text-white text-sm font-medium rounded-xl hover:bg-[#e03e00] transition-colors flex items-center justify-center gap-2">
            Go Apply <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function FollowUpModal({ job, onApplied, onNotYet, onSave }: {
  job: MatchedJob; onApplied: () => void; onNotYet: () => void; onSave: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-[#FF4500]" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg text-center mb-1">Did you apply?</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          <span className="font-medium text-gray-700">{job.title}</span> at {job.company}
        </p>
        <div className="space-y-2">
          <button onClick={onApplied}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl hover:bg-green-100 transition-colors">
            <CheckCircle2 className="w-4 h-4" /> Yes, I Applied!
          </button>
          <button onClick={onNotYet}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors">
            <Clock className="w-4 h-4" /> Not Yet
          </button>
          <button onClick={onSave}
            className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 text-[#FF4500] text-sm font-medium rounded-xl hover:bg-orange-100 transition-colors">
            <BookmarkPlus className="w-4 h-4" /> Save for Later
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Job Card ───────────────────────────────────────────────────────────────────
function JobCard({ job, index, saved, onSave }: {
  job: MatchedJob; index: number; saved: boolean; onSave: () => void
}) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const windowRef = useRef<Window | null>(null)

  const handleSave = async () => {
    if (saved) return
    setSaving(true)
    await onSave()
    setSaving(false)
  }

  // Priority: direct job listing > pre-filled search > general careers page
  const applyUrl = job.job_url || job.search_url || job.career_url
  const applyLinkType = job.job_url ? 'direct' : job.search_url ? 'search' : 'careers'

  const handleApplyConfirm = () => {
    setShowConfirm(false)
    if (applyUrl) {
      windowRef.current = window.open(applyUrl, '_blank', 'noopener,noreferrer')
    }
    setTimeout(() => setShowFollowUp(true), 1500)
  }

  const handleApplied = () => {
    setShowFollowUp(false)
    // Write to localStorage so ApplicationsPage picks it up immediately
    const LS_KEY = 'trackedApplications'
    try {
      const existing: Application[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
      const isDuplicate = existing.some(
        a => a.jobTitle === job.title && a.company === job.company
      )
      if (!isDuplicate) {
        const newApp: Application = {
          id: `${Date.now()}`,
          jobTitle: job.title,
          company: job.company,
          companyLogo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(job.company)}&backgroundColor=FF4500`,
          status: 'Applied',
          appliedAt: new Date().toLocaleDateString(),
          salary: '',
          location: job.location,
          matchPercentage: job.match_percentage,
          careerUrl: job.job_url || job.search_url || job.career_url,
        }
        localStorage.setItem(LS_KEY, JSON.stringify([...existing, newApp]))
        window.dispatchEvent(new Event('applicationsUpdated'))
      }
    } catch { /* ignore */ }
    navigate('/dashboard/applications')
  }

  const matchColor =
    job.match_percentage >= 70 ? 'text-green-600 bg-green-100' :
    job.match_percentage >= 40 ? 'text-amber-600 bg-amber-100' :
    'text-red-600 bg-red-100'

  const categoryBadge =
    job.category === 'high'   ? 'bg-green-50 text-green-700 border-green-200' :
    job.category === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
    'bg-gray-50 text-gray-600 border-gray-200'

  return (
    <>
      <AnimatePresence>
        {showConfirm && (
          <ApplyConfirmModal job={job}
            onConfirm={handleApplyConfirm}
            onCancel={() => setShowConfirm(false)}
            linkType={applyLinkType} />
        )}
        {showFollowUp && (
          <FollowUpModal job={job}
            onApplied={handleApplied}
            onNotYet={() => setShowFollowUp(false)}
            onSave={() => { handleSave(); setShowFollowUp(false) }} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#FF4500]/20 transition-all group"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-[#FF4500]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#FF4500] transition-colors leading-tight">
                {job.title}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleSave} disabled={saved || saving}
              title={saved ? 'Saved' : 'Save job'}
              className={cn('p-1.5 rounded-lg transition-all',
                saved ? 'text-[#FF4500] bg-orange-50 cursor-default' : 'text-gray-400 hover:text-[#FF4500] hover:bg-orange-50')}>
              {saved
                ? <BookmarkCheck className="w-4 h-4" />
                : saving
                  ? <span className="w-4 h-4 border-2 border-gray-300 border-t-[#FF4500] rounded-full animate-spin block" />
                  : <Bookmark className="w-4 h-4" />}
            </button>
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', matchColor)}>
              {job.match_percentage}%
            </span>
          </div>
        </div>

        {/* Location & Category */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {job.location && (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" />{job.location}
            </span>
          )}
          <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', categoryBadge)}>
            {job.category === 'high' ? '🔥 High Match' : job.category === 'medium' ? '⚡ Medium Match' : 'Low Match'}
          </span>
        </div>

        {/* Match bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Match Score</span>
            <span className="font-medium text-gray-700">{job.match_percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${job.match_percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.04 }}
              className={cn('h-full rounded-full',
                job.match_percentage >= 70 ? 'bg-green-500' :
                job.match_percentage >= 40 ? 'bg-amber-500' : 'bg-red-400')} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <AlertCircle className="w-3 h-3" />
            <span>AI Matched</span>
          </div>
          {applyUrl ? (
            <button onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4500] hover:bg-[#e03e00] text-white text-xs font-medium rounded-lg transition-colors">
              Apply <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <button disabled className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed">
              No Link
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
}
