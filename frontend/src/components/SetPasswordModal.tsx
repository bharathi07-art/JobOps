import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, X, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react'

interface Props {
  onClose: () => void
  /** When true: backdrop click is disabled, X is hidden, skip is de-emphasised */
  required?: boolean
}

export default function SetPasswordModal({ onClose, required = false }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const token = userInfo?.token
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok) {
        // Update localStorage to mark that password is now set
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        userInfo.hasPassword = true
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        
        setSuccess(true)
        setTimeout(() => onClose(), 1800)
      } else {
        setError(data.message || 'Failed to set password')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop — click-to-close only when not required */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={required ? undefined : onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#FF4500] to-orange-400" />

          <div className="p-8">
            {/* Close button — hidden when required */}
            {!required && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF4500] to-orange-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Set Your Password</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  One last step to complete your account
                </p>
              </div>
            </div>

            {/* Info banner */}
            {required && !success && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  You signed in with <span className="font-semibold">Google / GitHub</span>. Set a password so you can also log in with your <span className="font-semibold">email and password</span> anytime.
                </p>
              </div>
            )}

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-900">Password Set! 🎉</p>
                <p className="text-sm text-gray-500 mt-1">You can now log in with email + password too.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 transition-colors bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 transition-colors bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength hint */}
                {password.length > 0 && (
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(level => {
                      const strength =
                        password.length >= 12 ? 4 :
                        password.length >= 8 ? 3 :
                        password.length >= 6 ? 2 : 1
                      return (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= strength
                              ? strength === 4 ? 'bg-green-500'
                              : strength === 3 ? 'bg-blue-500'
                              : strength === 2 ? 'bg-amber-400'
                              : 'bg-red-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      )
                    })}
                    <span className="text-xs text-gray-400 ml-1">
                      {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : password.length >= 6 ? 'Weak' : 'Too short'}
                    </span>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-colors ${
                      required
                        ? 'border-gray-200 text-gray-400 hover:bg-gray-50 text-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {required ? 'Skip for now ⚠️' : 'Skip'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-11 rounded-xl bg-[#FF4500] text-white text-sm font-semibold hover:bg-[#e03e00] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-orange-200"
                  >
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                      : <><Sparkles className="w-4 h-4" /> Set Password</>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
