import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/index'

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Unable to send reset code')
      }

      if (data.otp) {
        setMessage(`Development mode: use OTP ${data.otp}`)
      }

      setStep('reset')
      setMessage(data.message || 'Reset code sent successfully')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Unable to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Unable to reset password')
      }

      setStep('done')
      setMessage(data.message || 'Password reset successfully')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F4] flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl p-8">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-[#FF4500] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">JobOps</span>
          </Link>

          {step === 'done' ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Password updated</h1>
              <p className="text-gray-500 mt-2 text-sm">Your password has been reset successfully. You can sign in now.</p>
              <Link to="/login" className="mt-6 inline-block">
                <Button variant="secondary" className="w-full"><ArrowLeft className="w-4 h-4" /> Back to Sign In</Button>
              </Link>
            </>
          ) : step === 'reset' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
              <p className="text-gray-500 mt-1 text-sm">Enter the reset code we sent to your email and choose a new password.</p>
              <form onSubmit={handleReset} className="mt-6 space-y-4 text-left">
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" icon={<Mail className="w-4 h-4" />} required />
                <Input label="Reset Code" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" icon={<KeyRound className="w-4 h-4" />} required />
                <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required />
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                {message && <p className="text-sm text-gray-600">{message}</p>}
                <Button type="submit" loading={loading} className="w-full" size="lg">Reset Password</Button>
              </form>
              <button type="button" onClick={() => setStep('request')} className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Change email
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
              <p className="text-gray-500 mt-1 text-sm">Enter your email and we'll send you a reset code.</p>
              <form onSubmit={handleRequest} className="mt-6 space-y-4 text-left">
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" icon={<Mail className="w-4 h-4" />} required />
                {message && <p className="text-sm text-gray-600">{message}</p>}
                <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Code</Button>
              </form>
              <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
