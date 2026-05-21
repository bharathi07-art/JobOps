import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, CheckCircle2, Clock, AlertCircle, Reply } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/Button'
import axios from 'axios'

interface Feedback {
  id: number
  subject: string
  message: string
  type: string
  status: string
  priority: string
  reply?: string
  createdAt: string
}

export default function FeedbackPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('Feedback')
  const [priority, setPriority] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false)

  // Load user's feedbacks
  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true)
    try {
      const raw = localStorage.getItem('userInfo')
      const token = raw ? JSON.parse(raw).token : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.get('/api/feedback/mine', { headers })
      if (res.data && res.data.feedbacks) setFeedbacks(res.data.feedbacks)
    } catch (err) {
      console.error('Failed to load feedbacks', err)
    } finally {
      setLoadingFeedbacks(false)
    }
  }

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const raw = localStorage.getItem('userInfo')
      const token = raw ? JSON.parse(raw).token : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.post('/api/feedback/submit', { subject, message, type, priority }, { headers })
      if (res.data && res.data.success) {
        setSuccess('Feedback submitted successfully! Thank you for your input.')
        setSubject('')
        setMessage('')
        setType('Feedback')
        setPriority('Medium')
        await loadFeedbacks()
      } else {
        setError(res.data?.message || 'Failed to submit')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Server error')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(null), 4000)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-50 border-green-200'
      case 'Pending':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700'
      case 'Medium':
        return 'bg-orange-100 text-orange-700'
      case 'Low':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#FF4500]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Send Feedback</h1>
              <p className="text-gray-500 text-sm mt-0.5">Share your suggestions and issues with us</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Submit Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">New Feedback</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief title"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your feedback in detail..."
                    required
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#FF4500]"
                  >
                    <option>Feedback</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Billing Issue</option>
                    <option>Account Problem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#FF4500]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  <Send className="w-4 h-4" /> Send Feedback
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Feedback List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submissions</h2>

              {loadingFeedbacks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin">
                    <MessageSquare className="w-6 h-6 text-[#FF4500]" />
                  </div>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No feedback submitted yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your submissions will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {feedbacks.map((f, i) => (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border rounded-xl p-4 transition-all ${getStatusColor(f.status)}`}
                      >
                        {/* Header with status */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(f.status)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{f.subject}</h3>
                              <p className="text-xs text-gray-500 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(f.priority)}`}>
                              {f.priority}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {f.type}
                            </span>
                          </div>
                        </div>

                        {/* Message */}
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{f.message}</p>

                        {/* Status badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-block px-2 py-1 bg-white bg-opacity-60 rounded text-xs font-medium text-gray-600">
                            Status: {f.status}
                          </span>
                        </div>

                        {/* Admin Reply */}
                        {f.reply && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-current border-opacity-20"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-white bg-opacity-60 rounded-full flex items-center justify-center shrink-0">
                                <Reply className="w-4 h-4 text-[#FF4500]" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Admin Reply:</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{f.reply}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
