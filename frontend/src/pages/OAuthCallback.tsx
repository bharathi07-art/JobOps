import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      // Extract all params from URL
      const token = searchParams.get('token')
      const id = searchParams.get('id')
      const isAdmin = searchParams.get('isAdmin')
      const plan = searchParams.get('plan')
      const name = searchParams.get('name')
      const email = searchParams.get('email')
      const avatar = searchParams.get('avatar')
      const hasPassword = searchParams.get('hasPassword')

      if (!token || !id) {
        console.error('Missing required OAuth parameters')
        navigate('/login')
        return
      }

      // Store in localStorage
      const userInfo = {
        token,
        id: Number(id),
        isAdmin: isAdmin === 'true',
        plan: plan || 'Free',
        name: name || 'User',
        email: email || '',
        avatar: avatar || '',
        hasPassword: hasPassword !== 'false', // true if not 'false', false if 'false'
      }

      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      // Redirect to appropriate dashboard with hasPassword param if user needs to set password
      if (userInfo.isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        // Pass hasPassword as URL param so Dashboard can detect it
        navigate(`/dashboard?hasPassword=${hasPassword}`, { replace: true })
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F4]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-[#FF4500] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Completing authentication...</p>
      </div>
    </div>
  )
}
