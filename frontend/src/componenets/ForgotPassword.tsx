import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/index'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1500)
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

          {sent ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="text-gray-500 mt-2 text-sm">We sent a password reset link to your email address.</p>
              <Link to="/login" className="mt-6 inline-block">
                <Button variant="secondary" className="w-full"><ArrowLeft className="w-4 h-4" /> Back to Sign In</Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
              <p className="text-gray-500 mt-1 text-sm">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
                <Input label="Email" type="email" placeholder="alex@example.com" icon={<Mail className="w-4 h-4" />} required />
                <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Link</Button>
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
