import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trash2, CheckCheck, Star, Archive, MessageSquare } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, StatusBadge } from '../../components/ui/AdminCharts'
import { useEffect } from 'react'
import axios from 'axios'
import { cn } from '../../utils/utils'

type Feedback = {
  id: string
  name: string
  email: string
  avatar: string
  category: string
  message: string
  date: string
  priority: string
  read: boolean
  archived?: boolean
  important?: boolean
  reply?: string
  raw?: any
}

const catColors: Record<string, string> = {
  'Bug Report': 'bg-red-100 text-red-700',
  'Feature Request': 'bg-blue-100 text-blue-700',
  'UI Feedback': 'bg-purple-100 text-purple-700',
  'AI Matching Issue': 'bg-orange-100 text-orange-700',
  'Billing Issue': 'bg-red-100 text-red-700',
  'General Suggestion': 'bg-gray-100 text-gray-600',
}

const categories = ['All', 'Bug Report', 'Feature Request', 'UI Feedback', 'AI Matching Issue', 'Billing Issue', 'General Suggestion']

export default function AdminFeedback() {
  const [items, setItems] = useState<Feedback[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [replyId, setReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replyLoading, setReplyLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo')||'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get('/api/feedback', { headers })
        const feedbacks = (res.data.feedbacks || []).map((f:any) => ({
          id: String(f.id),
          name: f.user?.name || 'User',
          email: f.user?.email || '',
          avatar: (f.user?.name || 'U').slice(0,1).toUpperCase(),
          category: f.type || 'Feedback',
          message: f.message || '',
          date: new Date(f.createdAt).toLocaleString(),
          priority: f.priority || 'Medium',
          read: f.status === 'Resolved' ? true : false,
          raw: f,
        }))
        setItems(feedbacks)
      } catch (err) {
        console.error('Failed to load feedbacks', err)
      }
    }
    load()
  }, [])

  const filtered = items.filter(f => {
    if (f.archived) return false
    const matchSearch = !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || f.category === catFilter
    return matchSearch && matchCat
  })

  const unread = items.filter(f => !f.read && !f.archived).length

  const markRead = (id: string) => setItems(prev => prev.map(f => f.id === id ? { ...f, read: true } : f))
  const toggleImportant = (id: string) => setItems(prev => prev.map(f => f.id === id ? { ...f, important: !f.important } : f))
  const archive = (id: string) => setItems(prev => prev.map(f => f.id === id ? { ...f, archived: true } : f))
  const remove = (id: string) => setItems(prev => prev.filter(f => f.id !== id))

  const sendReply = async (id: string, text: string) => {
    setReplyLoading(true)
    setReplyError(null)
    try {
      const userInfo = localStorage.getItem('userInfo')
      if (!userInfo) {
        setReplyError('Not authenticated')
        setReplyLoading(false)
        return
      }
      const parsed = JSON.parse(userInfo)
      const token = parsed?.token
      if (!token) {
        setReplyError('No auth token found')
        setReplyLoading(false)
        return
      }
      const headers = { Authorization: `Bearer ${token}` }
      const numericId = Number(id)
      const res = await axios.patch(`/api/feedback/${numericId}`, { reply: text, status: 'Resolved' }, { headers })
      if (res.data && res.data.success !== false) {
        setItems(prev => prev.map(f => f.id === id ? { ...f, read: true, reply: text, raw: { ...f.raw, reply: text, status: 'Resolved' } } : f))
        setReplyId(null)
        setReplyText('')
        setReplyError(null)
      } else {
        setReplyError(res.data?.message || 'Failed to send reply')
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to send reply'
      setReplyError(errMsg)
      console.error('Reply failed:', err)
    } finally {
      setReplyLoading(false)
    }
  }

  const stats = [
    { label: 'Total', value: items.filter(f => !f.archived).length, color: 'text-gray-900' },
    { label: 'Unread', value: unread, color: 'text-[#FF4500]' },
    { label: 'Critical', value: items.filter(f => f.priority === 'Critical').length, color: 'text-red-600' },
    { label: 'High', value: items.filter(f => f.priority === 'High').length, color: 'text-orange-600' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <ACard key={s.label} className="p-4">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label} Feedback</p>
            </ACard>
          ))}
        </div>

        <ACard className="p-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF4500]" />
              <h2 className="font-bold text-gray-900">User Feedback</h2>
              {unread > 0 && (
                <span className="w-5 h-5 bg-[#FF4500] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search feedback..."
                className="pl-8 pr-3 h-8 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#FF4500] w-48" />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap mb-5">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all',
                  catFilter === c ? 'bg-[#FF4500] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {c}
              </button>
            ))}
          </div>

          {/* Feedback cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn('rounded-xl border p-4 transition-all',
                    !f.read ? 'border-[#FF4500]/20 bg-orange-50/30' : 'border-gray-100 bg-white',
                    f.important && 'ring-1 ring-amber-300')}>
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-[#FF4500] shrink-0">
                      {f.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-400">{f.email}</p>
                        {!f.read && <span className="w-1.5 h-1.5 bg-[#FF4500] rounded-full" />}
                      </div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', catColors[f.category] ?? 'bg-gray-100 text-gray-600')}>
                          {f.category}
                        </span>
                        <StatusBadge status={f.priority} />
                        <span className="text-[10px] text-gray-400">{f.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{f.message}</p>
                      {(f.raw?.reply || f.reply) && (
                        <div className="mt-3 p-3 bg-white border rounded text-sm text-gray-700">
                          <div className="text-xs text-gray-500 mb-1">Reply:</div>
                          {f.raw?.reply || f.reply}
                        </div>
                      )}

                      {/* Reply box */}
                      <AnimatePresence>
                        {replyId === f.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                              rows={2} placeholder="Type your reply..."
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#FF4500] resize-none" />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => sendReply(f.id, replyText)}
                                disabled={!replyText.trim() || replyLoading}
                                className="px-3 py-1.5 bg-[#FF4500] text-white text-xs font-medium rounded-lg hover:bg-[#e03e00] disabled:opacity-50">
                                {replyLoading ? 'Sending...' : 'Send Reply'}
                              </button>
                              <button onClick={() => { setReplyId(null); setReplyError(null) }}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                                Cancel
                              </button>
                            </div>
                            {replyError && <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">{replyError}</div>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => markRead(f.id)} title="Mark read"
                        className="p-1.5 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleImportant(f.id)} title="Mark important"
                        className={cn('p-1.5 rounded-lg transition-colors',
                          f.important ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50')}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setReplyId(replyId === f.id ? null : f.id)} title="Reply"
                        className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => archive(f.id)} title="Archive"
                        className="p-1.5 text-gray-300 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(f.id)} title="Delete"
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No feedback found</p>
              </div>
            )}
          </div>
        </ACard>
      </div>
    </AdminLayout>
  )
}
