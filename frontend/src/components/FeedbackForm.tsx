import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from './ui/Button'

export default function FeedbackForm() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('Feedback')
  const [priority, setPriority] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const raw = localStorage.getItem('userInfo')
      const token = raw ? JSON.parse(raw).token : null

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.post('/api/feedback/submit', { subject, message, type, priority }, { headers })
      if (res.data && res.data.success) {
        setSuccess('Feedback submitted successfully')
        setSubject('')
        setMessage('')
        setType('Feedback')
        setPriority('Medium')
        await loadMyFeedbacks()
      } else {
        setError(res.data?.message || 'Failed to submit')
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setError(e.response?.data?.message || e.message || 'Server error')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(null), 4000)
    }
  }

  const [myFeedbacks, setMyFeedbacks] = useState<{ id: number; subject: string; message: string; type: string; priority: string; status: string; reply?: string; createdAt: string }[]>([])

  const loadMyFeedbacks = async () => {
    try {
      const raw = localStorage.getItem('userInfo')
      const token = raw ? JSON.parse(raw).token : null
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.get('/api/feedback/mine', { headers })
      if (res.data && res.data.feedbacks) setMyFeedbacks(res.data.feedbacks)
    } catch {
      // ignore
    }
  }

  useEffect(() => { loadMyFeedbacks() }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Send Feedback to Admin</h3>
      <p className="text-xs text-gray-500 mb-4">Have suggestions or issues? Let us know and the admin will review.</p>
      <form onSubmit={submit} className="space-y-3">
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" required
          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500]" />

        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue or suggestion" required rows={4}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500]" />

        <div className="flex gap-2">
          <select value={type} onChange={e => setType(e.target.value)} className="flex-1 h-10 rounded-lg border border-gray-200 px-2 text-sm">
            <option>Feedback</option>
            <option>Bug Report</option>
            <option>Feature Request</option>
            <option>Billing Issue</option>
            <option>Account Problem</option>
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="w-36 h-10 rounded-lg border border-gray-200 px-2 text-sm">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading}>Send</Button>
          {success && <div className="text-sm text-green-600">{success}</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </form>

      {/* My feedbacks & admin replies */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">My Submissions</h4>
        {myFeedbacks.length === 0 && <div className="text-xs text-gray-400">No feedback submitted yet.</div>}
        <div className="space-y-3">
          {myFeedbacks.map(f => (
            <div key={f.id} className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium">{f.subject}</div>
                <div className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-700 mb-2">{f.message}</div>
              <div className="text-xs text-gray-500">Type: {f.type} • Priority: {f.priority} • Status: {f.status}</div>
              {f.reply && (
                <div className="mt-2 p-2 bg-white border rounded text-sm text-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Admin reply:</div>
                  {f.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
