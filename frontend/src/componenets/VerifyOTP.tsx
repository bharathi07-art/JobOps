import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'


export default function VerifyOTP(){
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as { username?: string; email?: string; password?: string }
  const [otp, setOtp] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!state.email || !state.password || !state.username){
      alert('Missing registration details. Please start registration again.')
      navigate('/register')
      return
    }
    setLoading(true)
    try{
      const res = await fetch('/api/auth/verify-otp',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: state.username, email: state.email, password: state.password, otp })
      })
      const data = await res.json()
      if(res.ok){
        localStorage.setItem('userInfo', JSON.stringify(data))
          { /* ignore */ }
        navigate('/dashboard')
      } else {
        alert(data?.message || 'OTP verification failed')
      }
    }catch{
      alert('Network error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
        <p className="text-sm text-gray-500 mb-6">Enter the 6-digit code we sent to <strong className="text-gray-700">{state.email}</strong></p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">OTP Code</label>
            <input value={otp} onChange={e=> setOtp(e.target.value)} maxLength={6} inputMode="numeric"
              className="w-full h-10 pl-3 pr-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 transition-colors bg-white" />
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">Verify & Create Account</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Didn't receive the code? <button onClick={async ()=>{
            setLoading(true)
            await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: state.email }) })
            setLoading(false)
            alert('If the email exists, a new OTP was sent')
          }} className="text-[#FF4500] font-medium hover:underline">Resend</button>
        </p>
      </div>
    </div>
  )
}
