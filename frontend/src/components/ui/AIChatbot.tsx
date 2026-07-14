import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const suggestions = ['Find me React jobs', 'Improve my resume score', 'What skills am I missing?', 'Show top matches today']

interface Message { role: 'user' | 'ai'; text: string }

export default   function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm your AI job assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || loading) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()
      const reply = response.ok && data?.answer
        ? data.answer
        : data?.message || 'Sorry, I could not find an answer right now. Please try again.'

      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Oops! I could not reach the AI service right now. Please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#FF4500]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">JobOps AI</span>
                <span className="w-2 h-2 bg-green-400 rounded-full" />
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="h-56 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#FF4500] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1 mb-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => send(s)} className="px-2 py-1 bg-orange-50 text-[#FF4500] text-xs rounded-lg hover:bg-orange-100 transition-colors">{s}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Ask anything..." className="flex-1 text-xs outline-none text-gray-700 placeholder:text-gray-400" />
              <button onClick={() => send(input)} disabled={loading}
                className={`p-1.5 rounded-lg transition-colors ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FF4500] text-white hover:bg-[#e03e00]'}`}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-[#FF4500] rounded-full shadow-lg shadow-orange-200 flex items-center justify-center text-white hover:bg-[#e03e00] transition-colors">
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle className="w-6 h-6" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Need Help? floating button */}
      {!open && (
        <motion.button
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard/help')}
          className="absolute bottom-16 right-0 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full shadow-md text-xs font-medium text-gray-700 hover:border-[#FF4500] hover:text-[#FF4500] transition-colors whitespace-nowrap">
          <HelpCircle className="w-3.5 h-3.5" /> Need Help?
        </motion.button>
      )}
    </div>
  )
}
