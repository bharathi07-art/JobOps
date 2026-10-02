import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, Shield, Lock, Brain, TrendingUp,
  FileText, Bookmark, Activity, Target, Sparkles, MessageCircle, CheckCircle2
} from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { cn } from '../../utils/utils'
import FeedbackForm from '../../components/FeedbackForm'

interface FAQ {
  id: string
  category: string
  icon: React.ElementType
  question: string
  answer: string
  tags: string[]
}

const faqs: FAQ[] = [
  {
    id: '1', category: 'Privacy & Security', icon: Shield,
    question: 'Is my resume data secure?',
    answer: 'Yes. Your resume is encrypted at rest and in transit using AES-256 and TLS 1.3. Only you and the AI processing pipeline can access it. We never share your resume with third parties or employers without your explicit action.',
    tags: ['resume', 'security', 'privacy'],
  },
  {
    id: '2', category: 'Privacy & Security', icon: Lock,
    question: 'Is my profile photo secure?',
    answer: 'Your profile photo is stored in a private, access-controlled cloud bucket. It is never shared publicly or used for AI training. You can delete it at any time from Settings → Profile.',
    tags: ['photo', 'avatar', 'privacy'],
  },
  {
    id: '3', category: 'Privacy & Security', icon: Shield,
    question: 'How is my data stored?',
    answer: 'Structured data (profile, settings, saved jobs) is stored in a secure SQL database. AI results and resume analysis are stored in MongoDB with field-level encryption. All data is backed up daily and you can request full deletion at any time.',
    tags: ['data', 'storage', 'database'],
  },
  {
    id: '4', category: 'AI Matching', icon: Brain,
    question: 'How does AI job matching work?',
    answer: 'JobOps extracts skills, experience, and keywords from your resume using NLP. It then compares your profile against thousands of job listings using semantic similarity scoring. The match percentage reflects how well your background aligns with each role\'s requirements.',
    tags: ['ai', 'matching', 'how it works'],
  },
  {
    id: '5', category: 'AI Matching', icon: TrendingUp,
    question: 'How can I improve my match scores?',
    answer: 'Upload an updated resume with clear skill keywords. Add a custom prompt describing your target role and preferences. The AI uses both to refine results. Adding missing skills (shown on each job card) can boost your score significantly.',
    tags: ['score', 'improve', 'tips'],
  },
  {
    id: '6', category: 'AI Matching', icon: Target,
    question: 'How does resume probability scoring work?',
    answer: 'The ATS score measures how well your resume passes automated screening systems. It checks keyword density, formatting, section completeness, and skill alignment. A score above 85 means your resume is highly likely to pass initial screening.',
    tags: ['ats', 'score', 'resume'],
  },
  {
    id: '7', category: 'Using JobOps', icon: Sparkles,
    question: 'How do I use prompts effectively?',
    answer: 'Prompts let you guide the AI. Be specific: instead of "find me jobs", try "find senior React developer roles at startups in Europe, remote preferred, $120k+". The more context you give, the more targeted your results will be.',
    tags: ['prompts', 'tips', 'ai'],
  },
  {
    id: '8', category: 'Using JobOps', icon: Activity,
    question: 'How do I track job applications?',
    answer: 'When you click Apply on a job card, JobOps will ask if you applied after you return. Confirming adds it to your Application Tracker. You can then update the status (Under Review, Interview Scheduled, etc.), add notes, and monitor your pipeline.',
    tags: ['tracking', 'applications', 'workflow'],
  },
  {
    id: '9', category: 'Using JobOps', icon: Bookmark,
    question: 'How do I save jobs?',
    answer: 'Click the bookmark icon on any job card in AI Job Matches. Saved jobs appear in the Saved Jobs section where you can review them later, compare match scores, and apply when ready.',
    tags: ['save', 'bookmark', 'jobs'],
  },
  {
    id: '10', category: 'Using JobOps', icon: FileText,
    question: 'How does application tracking work?',
    answer: 'The Application Tracker is your career workflow manager. It shows all jobs you\'ve applied to with their current status, match percentage, applied date, and your personal notes. Use the Timeline view for a progress overview or Kanban view to drag-and-drop status updates.',
    tags: ['tracker', 'kanban', 'timeline'],
  },
]

const categories = ['All', 'Privacy & Security', 'AI Matching', 'Using JobOps']

const quickTips = [
  { icon: '🎯', text: 'Upload a tailored resume for each job type to get better matches' },
  { icon: '✍️', text: 'Use specific prompts — mention role, seniority, location, and salary' },
  { icon: '📊', text: 'Check your ATS score after each resume update' },
  { icon: '🔔', text: 'Enable notifications to get alerted on new high-match jobs' },
]

export default function HelpCenterPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Hi! I'm your JobOps assistant. Ask me anything about the platform, your data privacy, or how to get the best results. 👋" }
  ])

  const filtered = faqs.filter(f => {
    const matchCat = category === 'All' || f.category === category
    const matchSearch = !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some(t => t.includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const sendChat = (text: string) => {
    if (!text.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', text }])
    setChatInput('')
    const lower = text.toLowerCase()
    let reply = "Great question! Check the FAQ below for detailed answers, or browse by category. If you need more help, our support team is always here."
    if (lower.includes('secure') || lower.includes('privacy') || lower.includes('data'))
      reply = "Your data is fully encrypted and never shared. Resume data uses AES-256 encryption, and your profile photo is stored in a private access-controlled bucket. You can delete everything from Settings anytime."
    else if (lower.includes('match') || lower.includes('score') || lower.includes('ai'))
      reply = "AI matching uses NLP to compare your resume skills against job requirements. To improve your score, add missing skills to your resume and use specific prompts describing your target role."
    else if (lower.includes('apply') || lower.includes('track') || lower.includes('application'))
      reply = "When you click Apply, JobOps opens the company portal and asks if you applied when you return. Confirming adds it to your Application Tracker where you can manage status, notes, and follow-ups."
    else if (lower.includes('prompt'))
      reply = "Prompts guide the AI. Be specific — mention role title, seniority, location, salary range, and company type. Example: 'Senior React developer at a Series B startup, remote, $130k+'"
    setTimeout(() => setChatMessages(prev => [...prev, { role: 'ai', text: reply }]), 700)
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-7 h-7 text-[#FF4500]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-500 mt-1 text-sm">Everything you need to get the most out of JobOps</p>
        </div>

        {/* AI Chat */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#FF4500]">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Ask JobOps AI</span>
            <span className="w-2 h-2 bg-green-400 rounded-full ml-auto" />
          </div>
          <div className="h-44 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={cn('max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed',
                  msg.role === 'user' ? 'bg-[#FF4500] text-white' : 'bg-white text-gray-700 border border-gray-200 shadow-sm')}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat(chatInput)}
              placeholder="Ask about privacy, AI matching, how to use prompts..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400" />
            <button onClick={() => sendChat(chatInput)}
              className="px-3 py-1.5 bg-[#FF4500] text-white text-xs font-medium rounded-lg hover:bg-[#e03e00] transition-colors">
              Ask
            </button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="grid grid-cols-2 gap-3">
          {quickTips.map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-3 flex items-start gap-3">
              <span className="text-xl shrink-0">{tip.icon}</span>
              <p className="text-xs text-gray-600 leading-relaxed">{tip.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Feedback form */}
        <div>
          <FeedbackForm />
        </div>

        {/* Search + Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-9 pr-4 h-10 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF4500] transition-colors" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  category === cat ? 'bg-[#FF4500] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF4500]')}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
          <AnimatePresence>
            {filtered.map((faq, i) => (
              <motion.div key={faq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#FF4500]/30 transition-colors">
                <button onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <faq.icon className="w-4 h-4 text-[#FF4500]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{faq.category}</p>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform shrink-0',
                    expanded === faq.id && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {expanded === faq.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-100">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#FF4500] shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Privacy trust banner */}
        <div className="bg-gradient-to-r from-orange-50 to-[#FFF8F4] rounded-2xl border border-orange-100 p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Shield className="w-5 h-5 text-[#FF4500]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Your privacy is our priority</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              JobOps never sells your data. Your resume, profile, and job activity are private by default.
              All AI processing happens in isolated, encrypted environments. You are always in control.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
