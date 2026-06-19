import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/index'
import { useSubscription } from '../contexts/SubscriptionContext'

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription()

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try{
      const res =await fetch("http://localhost:5000/api/user/login",{
        method: "POST",
        headers:{"Content-type": "application/json"},
        body: JSON.stringify({email: email, password:password}),
      });

      const data = await res.json();
      if(res.ok){
        localStorage.setItem("userInfo", JSON.stringify(data));
        if(data.isAdmin){
          navigate('/admin/overview')
        }else{
          try { await refreshSubscription() } catch(e) { /* ignore */ }
          navigate('/dashboard');
        }
      }
      else{
        alert(data.message)
      }

    }
    catch{
      alert("Failed to fetch data, so pleace try again later")

    }
    finally{
      setTimeout(() => setLoading(false), 1500)
    }
    

  }

  return (
    <div className="min-h-screen bg-[#FFF8F4] flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-50 rounded-full blur-3xl" />
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { name: 'Google', color: 'bg-white border-gray-200', logo: 'G', url: 'http://localhost:5000/api/auth/google' },
            { name: 'GitHub', color: 'bg-gray-900 border-gray-900 text-white', logo: '⌥', url: 'http://localhost:5000/api/auth/github' },
          ].map(s => (
            <button key={s.name} 
              onClick={() => { window.location.href = s.url }}
              className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-all hover:opacity-80 ${s.color}`}>
              <span className="font-bold">{s.logo}</span>
              {s.name}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" 
              id="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alex@example.com" 
              icon={<Mail className="w-4 h-4" />} 
              required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type={showPass ? 'text' : 'password'} 
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 transition-colors bg-white" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 pointer-events-auto">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 accent-[#FF4500]" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-[#FF4500] hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FF4500] font-medium hover:underline">Sign up free</Link>
        </p>
      </motion.div>
    </div>
  )
}
