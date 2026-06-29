import { useState, useCallback, useRef } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useUpgradePrompt } from '../../hooks/useUpgradePrompt'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, CheckCircle, Sparkles, X,
  AlertCircle, Briefcase, Brain, Target, TrendingUp
} from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import axios from 'axios'

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface MatchedJob {
  title: string
  company: string
  match_percentage: number
  category: 'high' | 'medium' | 'low'
  location?: string
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

const LOADING_STEPS = [
  { icon: FileText, label: 'Parsing resume content...' },
  { icon: Brain, label: 'Extracting skills & experience...' },
  { icon: Target, label: 'Matching with job openings...' },
  { icon: TrendingUp, label: 'Calculating ATS score...' },
  { icon: Sparkles, label: 'Generating recommendations...' },
]

export default function ResumePage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loadingStep, setLoadingStep] = useState(0)
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startLoadingSteps = () => {
    setLoadingStep(0)
    let step = 0
    stepTimerRef.current = setInterval(() => {
      step += 1
      if (step < LOADING_STEPS.length) {
        setLoadingStep(step)
      } else {
        clearInterval(stepTimerRef.current!)
      }
    }, 3000)
  }

  const { isPremium, subscription, refreshSubscription } = useSubscription()
  const {
    checkAndPromptUpgrade,
  } = useUpgradePrompt({ featureName: 'Resume Analysis' })

  const analyzeFile = useCallback(async (file: File) => {
    // Only hard-block if we are certain the user is on Free AND the upgrade check fails
    // isPremium may still be false while the subscription context is loading, so
    // we skip the gate when subscription hasn't resolved yet (isPremium === false but
    // subscription object is null means still loading).
    if (!isPremium && subscription !== null) {
      // Check aiSearch limit only — not uploadResume (resume uploads are unlimited for the search feature)
      const allowed = checkAndPromptUpgrade('aiSearch')
      if (!allowed) return
    }

    setFileName(file.name)
    setStage('uploading')
    setUploadProgress(0)
    setAiResult(null)
    setErrorMsg('')

    // Simulate upload progress bar
    let prog = 0
    const uploadInterval = setInterval(() => {
      prog += 20
      setUploadProgress(prog)
      if (prog >= 100) {
        clearInterval(uploadInterval)
        setStage('processing')
        startLoadingSteps()
        sendToBackend(file)
      }
    }, 120)
  }, [isPremium, checkAndPromptUpgrade])

  const sendToBackend = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('resume', file)

      // Attach auth token from localStorage
      const rawUser = localStorage.getItem('userInfo')
      const token = rawUser ? (JSON.parse(rawUser) as any).token : null
      if (!token) {
        setErrorMsg('Please sign in to analyze your resume.')
        setStage('error')
        return
      }

      const res = await axios.post('/api/jobresult/analyze', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 120000,
      })

      if (stepTimerRef.current) clearInterval(stepTimerRef.current)

      if (res.data.success) {
        const raw: string = res.data.result
        console.log('RAW AI RESPONSE:', raw.substring(0, 500))

        let parsed: AIResult = {}
        try {
          // Strip any markdown code fences Gemini may add
          const cleaned = raw
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim()
          parsed = JSON.parse(cleaned)
          console.log('PARSED RESULT:', parsed)
        } catch (parseErr) {
          console.error('JSON parse error:', parseErr)
          console.log('Raw that failed to parse:', raw)
          parsed = { recommendations: [raw] }
        }

        setAiResult(parsed)
        localStorage.setItem('aiResumeResult', JSON.stringify(parsed))
        localStorage.setItem('aiResumeTimestamp', new Date().toISOString())
        // Save matched_jobs under the key that JobsPage reads from
        if (parsed.matched_jobs) {
          localStorage.setItem('aiMatchedJobs', JSON.stringify(parsed.matched_jobs))
        }
        // Refresh subscription so usage counters update from DB
        refreshSubscription().catch(() => {})
        setStage('done')
      } else {
        console.error('Backend returned success:false', res.data)
        setErrorMsg('Backend returned an error')
        setStage('error')
      }
    } catch (err: any) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current)
      console.error('Request error:', err?.response?.data || err.message)
      setErrorMsg(err?.response?.data?.message || 'Failed to analyze resume. Please try again.')
      setStage('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) analyzeFile(file)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) analyzeFile(file)
  }

  // Render UpgradeModal from hook
  
  

  const reset = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current)
    setStage('idle')
    setFileName('')
    setUploadProgress(0)
    setLoadingStep(0)
    setAiResult(null)
    setErrorMsg('')
  }

  const resumeScore = aiResult?.resume_score ?? 0
  const atsScore = aiResult?.ats_score ?? 0
  const highJobs = aiResult?.matched_jobs?.filter(j => j.category === 'high') ?? []
  const medJobs = aiResult?.matched_jobs?.filter(j => j.category === 'medium') ?? []
  const lowJobs = aiResult?.matched_jobs?.filter(j => j.category === 'low') ?? []

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
          <p className="text-gray-500 mt-1">Upload your resume and get AI-powered job matches instantly.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Card */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Upload Resume</h2>
            <AnimatePresence mode="wait">

              {/* IDLE */}
              {stage === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <label
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                      dragOver ? 'border-[#FF4500] bg-orange-50 scale-[1.01]' : 'border-gray-200 hover:border-[#FF4500] hover:bg-orange-50/40'
                    }`}
                  >
                    <motion.div animate={dragOver ? { scale: 1.2 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Upload className={`w-10 h-10 mb-3 transition-colors ${dragOver ? 'text-[#FF4500]' : 'text-gray-300'}`} />
                    </motion.div>
                    <p className="text-sm font-medium text-gray-700">Drag & drop your resume</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse — analysis starts automatically</p>
                    <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleInput} />
                  </label>
                  <div className="flex items-center gap-2 mt-4">
                    {['PDF', 'DOCX'].map(f => (
                      <span key={f} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">{f}</span>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto">Max 5MB</span>
                  </div>
                </motion.div>
              )}

              {/* UPLOADING */}
              {stage === 'uploading' && (
                <motion.div key="uploading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <div className="w-10 h-10 bg-[#FF4500]/10 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#FF4500]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Uploading to server...</p>
                    </div>
                    <button onClick={reset} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span className="font-medium">Uploading</span>
                      <span className="font-medium text-[#FF4500]">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#FF4500] to-orange-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PROCESSING */}
              {stage === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  {/* Spinner */}
                  <div className="flex flex-col items-center py-4">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 border-4 border-orange-100 border-t-[#FF4500] rounded-full animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#FF4500]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">AI is analyzing your resume</p>
                    <p className="text-xs text-gray-400 mt-1">This may take up to 60 seconds</p>
                  </div>

                  {/* Step indicators */}
                  <div className="space-y-2">
                    {LOADING_STEPS.map((step, i) => {
                      const Icon = step.icon
                      const isDone = i < loadingStep
                      const isActive = i === loadingStep
                      return (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: i <= loadingStep ? 1 : 0.3, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            isActive ? 'bg-orange-50 border border-orange-100' : ''
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isDone ? 'bg-green-100' : isActive ? 'bg-[#FF4500]/10' : 'bg-gray-100'
                          }`}>
                            {isDone
                              ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              : <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF4500]' : 'text-gray-400'}`} />
                            }
                          </div>
                          <span className={`text-xs ${isActive ? 'text-gray-900 font-medium' : isDone ? 'text-gray-500 line-through' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <span className="ml-auto flex gap-0.5">
                              {[0, 1, 2].map(d => (
                                <motion.span key={d} className="w-1 h-1 bg-[#FF4500] rounded-full"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                                />
                              ))}
                            </span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* DONE */}
              {stage === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 space-y-3">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900">Analysis Complete!</p>
                  <p className="text-xs text-gray-400 text-center">{fileName}</p>
                  <Button variant="secondary" size="sm" onClick={reset}>Upload Another</Button>
                </motion.div>
              )}

              {/* ERROR */}
              {stage === 'error' && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-red-600">Analysis Failed</p>
                  <p className="text-xs text-gray-500 text-center max-w-xs">{errorMsg}</p>
                  <Button variant="secondary" size="sm" onClick={reset}>Try Again</Button>
                </motion.div>
              )}

            </AnimatePresence>
          </Card>

          {/* Score Card */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Resume Score</h2>

            {stage === 'processing' ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
                <div className="w-full space-y-3 mt-2">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="w-28 h-2.5 bg-gray-100 rounded animate-pulse" />
                        <div className="w-8 h-2.5 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                      <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#FF4500" strokeWidth="10"
                        strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - resumeScore / 100) }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{resumeScore || '—'}</span>
                      {resumeScore > 0 && <span className="text-xs text-gray-400">/ 100</span>}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    {resumeScore >= 80 ? '🎉 Great Score' : resumeScore >= 60 ? '👍 Good Score' : resumeScore > 0 ? '⚠️ Needs Work' : 'Upload resume to see score'}
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'ATS Compatibility', score: atsScore, color: 'bg-green-500' },
                    { label: 'Resume Score', score: resumeScore, color: 'bg-[#FF4500]' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.score > 0 ? `${item.score}%` : '—'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* AI Results */}
        <AnimatePresence>
          {aiResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Matches', value: aiResult.matched_jobs?.length ?? 0, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
                  { label: 'High Match', value: highJobs.length, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                  { label: 'Missing Skills', value: aiResult.missing_skills?.length ?? 0, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Suggestions', value: aiResult.recommendations?.length ?? 0, icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
                ].map(stat => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.label} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Missing Skills & Recommendations */}
              {((aiResult.missing_skills?.length ?? 0) > 0 || (aiResult.recommendations?.length ?? 0) > 0) && (
                <Card className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">AI Insights</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {aiResult.missing_skills?.map((skill, i) => (
                      <motion.div key={`skill-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700">Missing: <span className="font-semibold text-amber-700">{skill}</span></p>
                      </motion.div>
                    ))}
                    {aiResult.recommendations?.map((rec, i) => (
                      <motion.div key={`rec-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Matched Jobs */}
              {aiResult.matched_jobs && aiResult.matched_jobs.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Matched Jobs</h2>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">{highJobs.length} High</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">{medJobs.length} Medium</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">{lowJobs.length} Low</span>
                    </div>
                  </div>

                  {/* High matches */}
                  {highJobs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">🔥 High Match</p>
                      <div className="space-y-2">
                        {highJobs.map((job, i) => <JobRow key={i} job={job} />)}
                      </div>
                    </div>
                  )}

                  {/* Medium matches */}
                  {medJobs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">⚡ Medium Match</p>
                      <div className="space-y-2">
                        {medJobs.map((job, i) => <JobRow key={i} job={job} />)}
                      </div>
                    </div>
                  )}

                  {/* Low matches */}
                  {lowJobs.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Low Match</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {lowJobs.map((job, i) => <JobRow key={i} job={job} />)}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </DashboardLayout>
  )
}

function JobRow({ job }: { job: MatchedJob }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
          <p className="text-xs text-gray-500 truncate">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          job.category === 'high' ? 'bg-green-100 text-green-700' :
          job.category === 'medium' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-600'
        }`}>{job.match_percentage}%</span>
      </div>
    </motion.div>
  )
}
