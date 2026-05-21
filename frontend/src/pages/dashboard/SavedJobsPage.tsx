import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookmarkCheck, MapPin, Briefcase, ExternalLink, Trash2, TrendingUp, Sparkles, X, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { cn } from '../../utils/utils'
import axios from 'axios'

interface SavedJob {
  _id: string
  title: string
  company: string
  location?: string
  match_percentage: number
  category: 'high' | 'medium' | 'low'
  career_url?: string
  savedAt: string
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-xl">
      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
      {message}
    </motion.div>
  )
}

function ConfirmModal({ title, message, onConfirm, onCancel, loading }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    axios.get('/api/jobresult/saved-jobs')
      .then(res => setJobs(res.data.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await axios.delete(`/api/jobresult/saved-jobs/${confirmId}`)
      const deleted = jobs.find(j => j._id === confirmId)
      setJobs(prev => prev.filter(j => j._id !== confirmId))
      // sync localStorage savedJobKeys
      if (deleted) {
        const stored = localStorage.getItem('savedJobKeys')
        if (stored) {
          const keys: string[] = JSON.parse(stored)
          localStorage.setItem('savedJobKeys', JSON.stringify(
            keys.filter(k => k !== `${deleted.title}__${deleted.company}`)
          ))
        }
      }
      setToast('Job removed successfully.')
    } catch {
      setToast('Failed to remove job.')
    } finally {
      setDeleting(false)
      setConfirmId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading...' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          {jobs.length > 0 && (
            <div className="flex gap-2 text-xs">
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">
                {jobs.filter(j => j.category === 'high').length} High
              </span>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                {jobs.filter(j => j.category === 'medium').length} Medium
              </span>
            </div>
          )}
        </div>

        {/* Confirm modal */}
        <AnimatePresence>
          {confirmId && (
            <ConfirmModal
              title="Remove Saved Job"
              message="Are you sure you want to remove this saved job? This action cannot be undone."
              onConfirm={handleDelete}
              onCancel={() => setConfirmId(null)}
              loading={deleting}
            />
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </AnimatePresence>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded-full w-24" />
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <BookmarkCheck className="w-8 h-8 text-[#FF4500]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Click the bookmark icon on any job card in AI Job Matches to save it here.
            </p>
            <Link to="/dashboard/jobs"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4500] text-white text-sm font-medium rounded-lg hover:bg-[#e03e00] transition-colors">
              <Sparkles className="w-4 h-4" /> View AI Matches
            </Link>
          </div>
        )}

        {/* Job Cards */}
        {!loading && jobs.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {jobs.map((job, i) => (
                <motion.div key={job._id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-[#FF4500]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{job.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold',
                        job.match_percentage >= 70 ? 'text-green-600 bg-green-100' :
                        job.match_percentage >= 40 ? 'text-amber-600 bg-amber-100' :
                        'text-red-600 bg-red-100')}>
                        {job.match_percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />{job.location}
                      </span>
                    )}
                    <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium',
                      job.category === 'high'   ? 'bg-green-50 text-green-700 border-green-200' :
                      job.category === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-gray-50 text-gray-600 border-gray-200')}>
                      {job.category === 'high' ? '🔥 High Match' : job.category === 'medium' ? '⚡ Medium Match' : 'Low Match'}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                      Saved {new Date(job.savedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Match Score</span>
                      <span className="font-medium text-gray-700">{job.match_percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${job.match_percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className={cn('h-full rounded-full',
                          job.match_percentage >= 70 ? 'bg-green-500' :
                          job.match_percentage >= 40 ? 'bg-amber-500' : 'bg-red-400')} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setConfirmId(job._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                    {job.career_url ? (
                      <a href={job.career_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4500] hover:bg-[#e03e00] text-white text-xs font-medium rounded-lg transition-colors">
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button disabled className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed">
                        No Link
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
