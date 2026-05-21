import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Calendar, MapPin, TrendingUp, ChevronDown,
  FileText, CheckCircle2, Clock, XCircle, Star,
  X, StickyNote, Bell, Trash2, Sparkles, ClipboardList
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import type { Application } from '../../types'
import { cn } from '../../utils/utils'

type Status = Application['status']

const STATUSES: { value: Status; label: string; color: string; bg: string; icon: React.ElementType }[] = [
  { value: 'Applied',             label: 'Applied',             color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',    icon: FileText },
  { value: 'Under Review',        label: 'Under Review',        color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',  icon: Clock },
  { value: 'Interview Scheduled', label: 'Interview Scheduled', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200',icon: Calendar },
  { value: 'Shortlisted',         label: 'Shortlisted',         color: 'text-cyan-600',   bg: 'bg-cyan-50 border-cyan-200',    icon: Star },
  { value: 'Offer Received',      label: 'Offer Received',      color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle2 },
  { value: 'Rejected',            label: 'Rejected',            color: 'text-red-500',    bg: 'bg-red-50 border-red-200',      icon: XCircle },
]

const statusBadge: Record<Status, string> = {
  'Applied':             'bg-blue-100 text-blue-700',
  'Under Review':        'bg-amber-100 text-amber-700',
  'Interview Scheduled': 'bg-purple-100 text-purple-700',
  'Shortlisted':         'bg-cyan-100 text-cyan-700',
  'Offer Received':      'bg-green-100 text-green-700',
  'Rejected':            'bg-red-100 text-red-500',
}

const timelineOrder: Status[] = ['Applied', 'Under Review', 'Interview Scheduled', 'Shortlisted', 'Offer Received']

const LS_KEY = 'trackedApplications'

function loadApps(): Application[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveApps(apps: Application[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(apps))
  window.dispatchEvent(new Event('applicationsUpdated'))
}

// ── Toast ──────────────────────────────────────────────────────────────────────
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

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
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
        <h3 className="font-bold text-gray-900 text-base mb-1">Remove Application</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to remove this application from your tracker? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(loadApps)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [view, setView] = useState<'timeline' | 'kanban'>('timeline')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Re-sync when JobsPage writes a new application
  useEffect(() => {
    const refresh = () => setApps(loadApps())
    window.addEventListener('applicationsUpdated', refresh)
    return () => window.removeEventListener('applicationsUpdated', refresh)
  }, [])

  const persist = useCallback((next: Application[]) => {
    setApps(next)
    saveApps(next)
  }, [])

  const updateStatus = (id: string, status: Status) =>
    persist(apps.map(a => a.id === id ? { ...a, status } : a))

  const saveNote = (id: string) => {
    persist(apps.map(a => a.id === id ? { ...a, notes: noteText } : a))
    setEditingNote(null)
  }

  const handleDelete = () => {
    if (!confirmId) return
    persist(apps.filter(a => a.id !== confirmId))
    setConfirmId(null)
    setExpanded(null)
    setToast('Application removed from tracker.')
  }

  const stats = {
    total: apps.length,
    active: apps.filter(a => a.status !== 'Rejected').length,
    interviews: apps.filter(a => a.status === 'Interview Scheduled').length,
    offers: apps.filter(a => a.status === 'Offer Received').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Modals & Toast */}
        <AnimatePresence>
          {confirmId && <ConfirmModal onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
            <p className="text-gray-500 mt-1">AI-powered career workflow manager</p>
          </div>
          <div className="flex gap-2">
            {(['timeline', 'kanban'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                  view === v ? 'bg-[#FF4500] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF4500]')}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Applied', value: stats.total, color: 'text-gray-900' },
            { label: 'Active', value: stats.active, color: 'text-blue-600' },
            { label: 'Interviews', value: stats.interviews, color: 'text-purple-600' },
            { label: 'Offers', value: stats.offers, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {apps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-[#FF4500]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No applications tracked yet</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              When you click Apply on a job and confirm "Yes, I Applied", it will appear here automatically.
            </p>
            <Link to="/dashboard/jobs"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4500] text-white text-sm font-medium rounded-lg hover:bg-[#e03e00] transition-colors">
              <Sparkles className="w-4 h-4" /> Browse AI Matches
            </Link>
          </div>
        )}

        {/* Timeline View */}
        {apps.length > 0 && view === 'timeline' && (
          <div className="space-y-3">
            <AnimatePresence>
              {apps.map((app, i) => (
                <TimelineCard key={app.id} app={app} index={i}
                  expanded={expanded === app.id}
                  onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
                  onStatusChange={s => updateStatus(app.id, s)}
                  onDelete={() => setConfirmId(app.id)}
                  editingNote={editingNote === app.id}
                  noteText={noteText}
                  onEditNote={() => { setEditingNote(app.id); setNoteText(app.notes ?? '') }}
                  onNoteChange={setNoteText}
                  onSaveNote={() => saveNote(app.id)}
                  onCancelNote={() => setEditingNote(null)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Kanban View */}
        {apps.length > 0 && view === 'kanban' && (
          <KanbanView apps={apps} onStatusChange={updateStatus} onDelete={id => setConfirmId(id)} />
        )}
      </div>
    </DashboardLayout>
  )
}

// ── Timeline Card ──────────────────────────────────────────────────────────────
function TimelineCard({ app, index, expanded, onToggle, onStatusChange, onDelete, editingNote, noteText, onEditNote, onNoteChange, onSaveNote, onCancelNote }: {
  app: Application; index: number; expanded: boolean
  onToggle: () => void; onStatusChange: (s: Status) => void; onDelete: () => void
  editingNote: boolean; noteText: string
  onEditNote: () => void; onNoteChange: (v: string) => void
  onSaveNote: () => void; onCancelNote: () => void
}) {
  const timelineIdx = timelineOrder.indexOf(app.status)
  const isRejected = app.status === 'Rejected'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.97 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm">{app.jobTitle}</p>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusBadge[app.status])}>
              {app.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Building2 className="w-3 h-3" />{app.company}
            </span>
            {app.location && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />{app.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />{app.appliedAt}
            </span>
            {app.matchPercentage && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3" />{app.matchPercentage}% match
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onDelete}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove application">
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronDown onClick={onToggle}
            className={cn('w-4 h-4 text-gray-400 transition-transform cursor-pointer', expanded && 'rotate-180')} />
        </div>
      </div>

      {/* Progress timeline */}
      {!isRejected && (
        <div className="px-4 pb-3">
          <div className="flex items-center">
            {timelineOrder.map((step, idx) => {
              const reached = timelineIdx >= idx
              const isLast = idx === timelineOrder.length - 1
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 transition-colors',
                    reached ? 'bg-[#FF4500]' : 'bg-gray-200')} />
                  {!isLast && (
                    <div className={cn('h-0.5 flex-1 transition-colors',
                      timelineIdx > idx ? 'bg-[#FF4500]' : 'bg-gray-200')} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            {timelineOrder.map(step => (
              <p key={step} className="text-[9px] text-gray-400 text-center" style={{ width: `${100 / timelineOrder.length}%` }}>
                {step.split(' ')[0]}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden">
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s.value} onClick={() => onStatusChange(s.value)}
                      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        app.status === s.value
                          ? `${s.bg} ${s.color} border-current`
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300')}>
                      <s.icon className="w-3 h-3" />{s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
                  {!editingNote && (
                    <button onClick={onEditNote} className="flex items-center gap-1 text-xs text-[#FF4500] hover:underline">
                      <StickyNote className="w-3 h-3" />{app.notes ? 'Edit' : 'Add note'}
                    </button>
                  )}
                </div>
                {editingNote ? (
                  <div className="space-y-2">
                    <textarea value={noteText} onChange={e => onNoteChange(e.target.value)} rows={3}
                      placeholder="Add notes, interview details, follow-up reminders..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={onSaveNote}
                        className="px-3 py-1.5 bg-[#FF4500] text-white text-xs font-medium rounded-lg hover:bg-[#e03e00]">Save</button>
                      <button onClick={onCancelNote}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 min-h-[40px]">
                    {app.notes || <span className="text-gray-300 italic">No notes yet</span>}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Bell className="w-4 h-4 text-[#FF4500] shrink-0" />
                <p className="text-xs text-gray-600">Stay proactive — follow up if you haven't heard back in 5–7 days.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Kanban View ────────────────────────────────────────────────────────────────
function KanbanView({ apps, onStatusChange, onDelete }: {
  apps: Application[]
  onStatusChange: (id: string, s: Status) => void
  onDelete: (id: string) => void
}) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Status | null>(null)

  const handleDrop = (status: Status) => {
    if (dragging) onStatusChange(dragging, status)
    setDragging(null); setDragOver(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map(col => {
        const colApps = apps.filter(a => a.status === col.value)
        return (
          <div key={col.value}
            onDragOver={e => { e.preventDefault(); setDragOver(col.value) }}
            onDrop={() => handleDrop(col.value)}
            onDragLeave={() => setDragOver(null)}
            className={cn('flex-shrink-0 w-60 rounded-xl border-2 transition-all',
              dragOver === col.value ? col.bg : 'border-gray-100 bg-gray-50')}>
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <span className={cn('text-xs font-semibold flex items-center gap-1.5', col.color)}>
                <col.icon className="w-3.5 h-3.5" />{col.label}
              </span>
              <span className="w-5 h-5 bg-white rounded-full text-xs font-bold text-gray-600 flex items-center justify-center shadow-sm">
                {colApps.length}
              </span>
            </div>
            <div className="p-2 space-y-2 min-h-28">
              {colApps.map((app, i) => (
                <motion.div key={app.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }} draggable
                  onDragStart={() => setDragging(app.id)} onDragEnd={() => { setDragging(null); setDragOver(null) }}
                  className={cn('bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow',
                    dragging === app.id && 'opacity-50 scale-95')}>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{app.jobTitle}</p>
                      <p className="text-xs text-gray-400 truncate">{app.company}</p>
                    </div>
                    <button onClick={() => onDelete(app.id)}
                      className="p-0.5 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />{app.appliedAt}
                  </div>
                  {app.matchPercentage && (
                    <div className="mt-1.5 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF4500] rounded-full" style={{ width: `${app.matchPercentage}%` }} />
                    </div>
                  )}
                </motion.div>
              ))}
              {colApps.length === 0 && (
                <div className="flex items-center justify-center h-16 text-xs text-gray-300">Drop here</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
