import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, Shield, Link2, Moon, Sun, Save, Camera, Check, Upload, X, CreditCard } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/ui/index'
import { Input } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { UpgradeModal } from '../../components/UpgradeModal';
import { cn } from '../../utils/utils'
import { Link } from 'react-router-dom';
import UsageBanner from '../../components/UsageBanner';
import SearchUsageVisualizer from '../../components/SearchUsageVisualizer';
import DeleteAccountSection from '../../components/DeleteAccountSection';

// Read real user from localStorage — never fall back to mockUser
function getStoredUser() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return { name: '', email: '', role: '', avatar: '', plan: 'Free' }
    const parsed = JSON.parse(raw)
    const u = parsed?.user ?? parsed?.User ?? parsed
    let plan = u?.plan || u?.subscription || parsed?.plan || parsed?.subscription || 'Free'
    
    // Map canonical DB plans back to UI names
    if (plan === 'Monthly') plan = 'Monthly'
    if (plan === 'Yearly') plan = 'Yearly'

    return {
      name:   u?.name  ?? '',
      email:  u?.email ?? '',
      role:   u?.role  ?? '',
      avatar: u?.avatar ?? '',
      plan,
    }
  } catch { return { name: '', email: '', role: '', avatar: '', plan: 'Free' } }
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'automation', label: 'Automation', icon: Check },
  { id: 'connected', label: 'Connected', icon: Link2 },
]

const subscriptionPlans = [
  { name: 'Free', price: '0', description: 'Start with the basic JobOps experience.', benefits: ['4 AI searches/month', '10 job matches', 'Weekly summary'] },
  { name: 'Monthly', price: '20', description: 'Unlock premium AI matching every month.', benefits: ['Unlimited AI matches', 'Resume score boosts', 'Priority job alerts'] },
  { name: 'Yearly', price: '220', description: 'Best value with full premium access all year.', benefits: ['Everything in Monthly', 'Save $20 annually', 'Early access to referrals'] },
]

// Friendly, confident, modern avatar options
const defaultAvatars = [
  // Male — professional
  { id: 'male-1',   label: 'Alex',    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4&clothingColor=3c4f5c&facialHairType=BeardLight&hairColor=Auburn' },
  { id: 'male-2',   label: 'Marcus',  url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=c0aede&clothingColor=5c3317&hairColor=Black' },
  { id: 'male-3',   label: 'Jordan',  url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=d1f4cc&clothingColor=262e33&hairColor=Brown' },
  // Female — professional
  { id: 'female-1', label: 'Priya',   url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc&hairColor=Black&clothingColor=ff4500' },
  { id: 'female-2', label: 'Sarah',   url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4&hairColor=Blonde&clothingColor=3c4f5c' },
  { id: 'female-3', label: 'Maya',    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&backgroundColor=c0aede&hairColor=Auburn&clothingColor=262e33' },
  // Minimal / illustrated
  { id: 'min-1',    label: 'Pixel',   url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel&backgroundColor=b6e3f4' },
  { id: 'min-2',    label: 'Sketch',  url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sketch&backgroundColor=ffd5dc' },
  // Tech / gradient
  { id: 'tech-1',   label: 'Nova',    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=b6e3f4' },
  { id: 'tech-2',   label: 'Orion',   url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Orion&backgroundColor=c0aede' },
  { id: 'tech-3',   label: 'Zara',    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zara&backgroundColor=d1f4cc' },
  // Initials gradient
  { id: 'init-1',   label: 'Bold',    url: 'https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=FF4500&fontColor=ffffff' },
  { id: 'init-2',   label: 'Slate',   url: 'https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=1e293b&fontColor=ffffff' },
  { id: 'init-3',   label: 'Violet',  url: 'https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=7c3aed&fontColor=ffffff' },
]

export default function SettingsPage() {
  const storedUser = getStoredUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark')
  })
  const [saved, setSaved] = useState(false)
  const [name, setName]   = useState(storedUser.name)
  const [email, setEmail] = useState(storedUser.email)
  const [role, setRole]   = useState(storedUser.role)
  const [location, setLocation] = useState('')
  const [bio, setBio]     = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(
    storedUser.avatar || defaultAvatars[0].url
  )
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const currentAvatar = uploadedAvatar ?? selectedAvatar
  const [currentPlan, setCurrentPlan] = useState(storedUser.plan || 'Free')
  const [selectedPlan, setSelectedPlan] = useState(storedUser.plan || 'Free')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')

  // Security settings state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' })

  // Automation settings state
  const [automationEnabled, setAutomationEnabled] = useState(false)
  const [automationMaxResults, setAutomationMaxResults] = useState(7)
  const [automationSearchTime, setAutomationSearchTime] = useState('09:00')
  const [automationFrequency, setAutomationFrequency] = useState('inferred')
  const [canEnableAutomation, setCanEnableAutomation] = useState(false)
  const [isSavingAutomation, setIsSavingAutomation] = useState(false)
  const [automationMessage, setAutomationMessage] = useState({ text: '', type: '' })
  const [hasAutomationResume, setHasAutomationResume] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const automationResumeRef = useRef<HTMLInputElement>(null)

  // Fetch automation settings on mount
  useState(() => {
    const raw = localStorage.getItem('userInfo')
    const token = raw ? JSON.parse(raw)?.token : null
    if (token) {
      fetch('/api/email-automation/current', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.email) {
          setAutomationEnabled(data.emailAutomationEnabled)
          setAutomationMaxResults(data.emailAutomationMaxResults)
          setAutomationSearchTime(data.emailAutomationSearchTime)
          setAutomationFrequency(data.emailAutomationFrequency)
          setCanEnableAutomation(data.canEnableEmailAutomation)
          setHasAutomationResume(data.hasAutomationResume)
        }
      })
      .catch(err => console.error('Failed to load automation settings:', err))
    }
  })

  const handleSaveAutomation = async () => {
    setIsSavingAutomation(true)
    setAutomationMessage({ text: '', type: '' })
    try {
      const raw = localStorage.getItem('userInfo')
      const token = raw ? JSON.parse(raw)?.token : null
      
      const res = await fetch('/api/email-automation/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          emailAutomationEnabled: automationEnabled,
          emailAutomationMaxResults: automationMaxResults,
          emailAutomationSearchTime: automationSearchTime,
          emailAutomationFrequency: automationFrequency
        }),
      })
      
      const data = await res.json()
      if (!res.ok) {
        setAutomationMessage({ text: data.message || 'Could not update settings.', type: 'error' })
        // Revert enabled state if blocked
        if (res.status === 403) setAutomationEnabled(false)
        return
      }
      
      setAutomationMessage({ text: 'Automation settings updated successfully!', type: 'success' })
      setTimeout(() => setAutomationMessage({ text: '', type: '' }), 3000)
    } catch (error) {
      setAutomationMessage({ text: 'Unable to update settings. Please try again.', type: 'error' })
    } finally {
      setIsSavingAutomation(false)
    }
  }

  const handleAutomationResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingResume(true)
    setAutomationMessage({ text: '', type: '' })
    try {
      const raw = localStorage.getItem('userInfo')
      const token = raw ? JSON.parse(raw)?.token : null
      
      const formData = new FormData()
      formData.append('resume', file)

      const res = await fetch('/api/email-automation/upload-resume', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setAutomationMessage({ text: data.message || 'Failed to upload resume.', type: 'error' })
        return
      }

      setHasAutomationResume(true)
      setAutomationMessage({ text: 'Automation resume uploaded successfully!', type: 'success' })
      setTimeout(() => setAutomationMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setAutomationMessage({ text: 'Unable to upload resume.', type: 'error' })
    } finally {
      setIsUploadingResume(false)
    }
  }

  const handleChangePassword = async () => {
    setIsChangingPassword(true)
    setPasswordMessage({ text: '', type: '' })

    try {
      const raw = localStorage.getItem('userInfo')
      const token = raw ? JSON.parse(raw)?.token : null

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Unable to change password')
      }

      setPasswordMessage({ text: 'Password updated successfully.', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setPasswordMessage({ text: error.message || 'Unable to change password.', type: 'error' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSave = () => {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const parsed = JSON.parse(raw)
      const key = parsed?.user ? 'user' : parsed?.User ? 'User' : null
      if (key) {
        parsed[key] = { ...parsed[key], name, email, role, avatar: currentAvatar }
      } else {
        parsed.name = name; parsed.email = email; parsed.role = role; parsed.avatar = currentAvatar
      }
      localStorage.setItem('userInfo', JSON.stringify(parsed))
    }
    // Notify Sidebar (same tab) to re-read localStorage immediately
    window.dispatchEvent(new Event('userInfoUpdated'))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      setUploadedAvatar(ev.target?.result as string)
      setShowAvatarPicker(false)
    }
    reader.readAsDataURL(file)
  }

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalPlan, setModalPlan] = useState<string>('');

  const handleSubscribe = async (plan: string) => {
    if (plan === currentPlan) {
      setSubscriptionMessage('You already have this plan active.')
      return
    }
    // For free plan downgrade, allow direct update
    if (plan === 'Free') {
      // existing downgrade flow (no payment)
      setIsSubscribing(true);
      setSubscriptionMessage('');
      try {
        const raw = localStorage.getItem('userInfo')
        const token = raw ? JSON.parse(raw)?.token : null
        const res = await fetch('/api/auth/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ plan }),
        })
        const data = await res.json()
        if (!res.ok) {
          setSubscriptionMessage(data.message || 'Could not update plan.')
          return
        }
        const rawStorage = localStorage.getItem('userInfo')
        if (rawStorage) {
          const parsed = JSON.parse(rawStorage)
          parsed.plan = data.plan
          if (parsed.user) parsed.user.plan = data.plan
          localStorage.setItem('userInfo', JSON.stringify(parsed))
        }
        setCurrentPlan(plan)
        setSelectedPlan(plan)
        setSubscriptionMessage('Your plan has been updated successfully.')
        window.dispatchEvent(new Event('userInfoUpdated'))
      } catch (error) {
        setSubscriptionMessage('Unable to update plan. Please try again.')
      } finally {
        setIsSubscribing(false)
      }
      return
    }
    // For paid plans, open UpgradeModal to handle PayPal flow
    setModalPlan(plan)
    setShowUpgradeModal(true)
  }

  const handleModalClose = () => {
    setShowUpgradeModal(false)
    // after successful upgrade, refresh current plan from backend
    // optionally fetch updated user info here
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const parsed = JSON.parse(raw)
      const token = parsed?.token ?? parsed?.Token ?? null
      if (token) {
        fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(data => {
            if (data?.user?.plan) {
              setCurrentPlan(data.user.plan)
              setSelectedPlan(data.user.plan)
            }
          })
          .catch(console.error)
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'profile' && (
            <Card className="p-6 space-y-6">
              {/* Avatar section */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 ring-2 ring-[#FF4500]/20 ring-offset-2 transition-all group-hover:ring-[#FF4500]/50">
                    <img src={currentAvatar} alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = defaultAvatars[0].url }} />
                  </div>
                  <button onClick={() => setShowAvatarPicker(true)}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FF4500] rounded-full flex items-center justify-center shadow-md hover:bg-[#e03e00] transition-colors">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{name || 'Your Name'}</p>
                  <p className="text-sm text-muted-foreground">{role || 'Your Role'}</p>
                  <button onClick={() => setShowAvatarPicker(true)}
                    className="text-xs text-[#FF4500] hover:underline mt-1 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Change avatar
                  </button>
                </div>
              </div>

              {/* Avatar Picker Modal */}
              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Choose Your Avatar</h3>
                        <button onClick={() => setShowAvatarPicker(false)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Upload option */}
                      <button onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-[#FF4500]/30 rounded-xl hover:border-[#FF4500] hover:bg-orange-50 transition-all mb-4 group">
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100">
                          <Upload className="w-4 h-4 text-[#FF4500]" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Upload your photo</p>
                          <p className="text-xs text-gray-400">JPG, PNG or GIF · Max 5MB</p>
                        </div>
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

                      {/* Default avatars grid */}
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Default Avatars</p>
                      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                        {defaultAvatars.map(av => (
                          <button key={av.id} onClick={() => { setSelectedAvatar(av.url); setUploadedAvatar(null); setShowAvatarPicker(false) }}
                            title={av.label}
                            className={cn('relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105',
                              selectedAvatar === av.url && !uploadedAvatar
                                ? 'border-[#FF4500] ring-2 ring-[#FF4500]/20'
                                : 'border-gray-200 hover:border-[#FF4500]/50')}>
                            <img src={av.url} alt={av.label} className="w-full h-full object-cover bg-gray-50" />
                            {selectedAvatar === av.url && !uploadedAvatar && (
                              <div className="absolute inset-0 bg-[#FF4500]/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-[#FF4500]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {uploadedAvatar && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                          <img src={uploadedAvatar} alt="Uploaded" className="w-10 h-10 rounded-xl object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-700">Custom photo active</p>
                            <button onClick={() => setUploadedAvatar(null)}
                              className="text-xs text-red-500 hover:underline">Remove</button>
                          </div>
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name"  value={name}     onChange={e => setName(e.target.value)} />
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input label="Job Title"  value={role}     onChange={e => setRole(e.target.value)} />
                <Input label="Location"   value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80">Bio</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell employers about yourself..."
                  className="mt-1.5 w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 resize-none" />
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">Theme</p>
                    <p className="text-xs text-muted-foreground">{darkMode ? 'Dark mode' : 'Light mode'}</p>
                  </div>
                </div>
                <button onClick={() => {
                  const nextDark = !darkMode
                  setDarkMode(nextDark)
                  localStorage.setItem('theme', nextDark ? 'dark' : 'light')
                  document.documentElement.classList.toggle('dark', nextDark)
                }}
                  className={cn('relative w-11 h-6 rounded-full transition-colors', darkMode ? 'bg-[#FF4500]' : 'bg-gray-200')}>
                  <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', darkMode && 'translate-x-5')} />
                </button>
              </div>

              <Button onClick={handleSave} loading={saved} className="w-full sm:w-auto">
                <Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Changes'}
              </Button>

              <DeleteAccountSection currentPlan={currentPlan} />
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
              {[
                { label: 'New Job Matches', desc: 'Get notified when AI finds new matches', defaultOn: true },
                { label: 'Application Updates', desc: 'Status changes on your applications', defaultOn: true },
                { label: 'Weekly Summary', desc: 'Weekly digest of your job search activity', defaultOn: false },
                { label: 'Resume Tips', desc: 'AI-powered resume improvement suggestions', defaultOn: true },
                { label: 'Marketing Emails', desc: 'Product updates and announcements', defaultOn: false },
              ].map(item => (
                <NotificationToggle key={item.label} {...item} />
              ))}
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Security Settings</h2>
              <Input label="Current Password" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <Input label="New Password" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              {passwordMessage.text && (
                <div className={cn('rounded-xl p-3 text-sm', passwordMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700')}>
                  {passwordMessage.text}
                </div>
              )}
              <Button onClick={handleChangePassword} loading={isChangingPassword}>Update Password</Button>
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Authenticator App</p>
                    <p className="text-xs text-gray-400">Use an authenticator app for 2FA</p>
                  </div>
                  <Button variant="secondary" size="sm">Enable</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'subscription' && (
            <Card className="p-6 space-y-6">
              <UsageBanner />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900">Subscription Plans</h2>
                  <p className="text-sm text-gray-500">Activate a plan to unlock premium AI features and faster job matching.</p>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <span className="text-sm text-gray-600">Current plan: <span className="font-semibold text-gray-900">{currentPlan}</span></span>
                  <Link to="/pricing" className="text-sm text-[#FF4500] hover:underline font-medium">View Pricing Details</Link>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {subscriptionPlans.map(plan => {
                  const isActive = plan.name === currentPlan
                  const isSelected = plan.name === selectedPlan
                  return (
                    <button key={plan.name} type="button" onClick={() => setSelectedPlan(plan.name)}
                      className={cn('rounded-3xl border p-5 text-left transition-all focus:outline-none',
                        isSelected ? 'border-[#FF4500] bg-[#FFF4EC]' : 'border-gray-200 bg-white hover:border-gray-300')}>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-xs text-gray-500">{plan.description}</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">${plan.price}</span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-500">
                        {plan.benefits.map(benefit => (
                          <div key={benefit} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#FF4500]" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      {isActive && (
                        <span className="mt-4 inline-flex rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">Active</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {subscriptionMessage && (
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-700">{subscriptionMessage}</div>
              )}

              <Button onClick={() => handleSubscribe(selectedPlan)} loading={isSubscribing} disabled={selectedPlan === currentPlan} className="w-full">
                {selectedPlan === currentPlan ? 'Current plan active' : `Subscribe to ${selectedPlan}`}
              </Button>
            </Card>
          )}

          {activeTab === 'automation' && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900">Email Automation</h2>
                 <p className="text-sm text-gray-500 mt-1">Configure automated AI job searches sent directly to your inbox.</p>
                 <SearchUsageVisualizer />
              </div>

              {!canEnableAutomation && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                  <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Pro Feature
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Email automation requires an active Monthly or Yearly subscription. Upgrade your plan to enable this feature.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Automation</p>
                  <p className="text-xs text-gray-400">Receive automated job matches via email</p>
                </div>
                <button 
                  onClick={() => canEnableAutomation && setAutomationEnabled(!automationEnabled)} 
                  disabled={!canEnableAutomation}
                  className={cn('relative w-11 h-6 rounded-full transition-colors', automationEnabled ? 'bg-[#FF4500]' : 'bg-gray-200', !canEnableAutomation && 'opacity-50 cursor-not-allowed')}>
                  <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', automationEnabled && 'translate-x-5')} />
                </button>
              </div>

              <div className={cn("space-y-4 transition-opacity", !automationEnabled && "opacity-50 pointer-events-none")}>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">Automation Resume</p>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Upload a resume to dynamically match jobs for your automated emails.</p>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => automationResumeRef.current?.click()} loading={isUploadingResume}>
                      <Upload className="w-4 h-4" /> Upload Resume (PDF/DOCX)
                    </Button>
                    <input ref={automationResumeRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleAutomationResumeUpload} />
                    {hasAutomationResume && (
                      <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-lg">
                        <Check className="w-4 h-4" /> Resume Uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Results per Email</label>
                    <input 
                      type="number" 
                      min="1" max="50"
                      value={automationMaxResults} 
                      onChange={e => setAutomationMaxResults(Number(e.target.value))}
                      className="mt-1.5 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Between 1 and 50 matches</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Delivery Time</label>
                    <input 
                      type="time" 
                      value={automationSearchTime} 
                      onChange={e => setAutomationSearchTime(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Time of day to send the email</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Frequency</label>
                  <select 
                    value={automationFrequency} 
                    onChange={e => setAutomationFrequency(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10"
                  >
                    <option value="inferred">Inferred (Based on activity)</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {automationMessage.text && (
                <div className={cn("rounded-xl p-4 text-sm font-medium", 
                  automationMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100')}>
                  {automationMessage.text}
                </div>
              )}

              <Button onClick={handleSaveAutomation} loading={isSavingAutomation} className="w-full sm:w-auto mt-4">
                <Save className="w-4 h-4" /> Save Automation Settings
              </Button>
            </Card>
          )}

          {activeTab === 'connected' && (
            <Card className="p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Connected Accounts</h2>
              {[
                { name: 'Google', desc: 'Sign in with Google', connected: true, color: 'bg-red-50 text-red-600' },
                { name: 'GitHub', desc: 'Connect your GitHub profile', connected: false, color: 'bg-gray-900 text-white' },
                { name: 'LinkedIn', desc: 'Import your LinkedIn profile', connected: false, color: 'bg-blue-50 text-blue-600' },
              ].map(acc => (
                <div key={acc.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold', acc.color)}>{acc.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                      <p className="text-xs text-gray-400">{acc.desc}</p>
                    </div>
                  </div>
                  <Button variant={acc.connected ? 'danger' : 'secondary'} size="sm">{acc.connected ? 'Disconnect' : 'Connect'}</Button>
                </div>
              ))}
            </Card>
          )}
        </motion.div>
      </div>
        {showUpgradeModal && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={handleModalClose}
            title={`Upgrade to ${modalPlan} Plan`}
          />
        )}
    </DashboardLayout>
  )
}

function NotificationToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button onClick={() => setOn(!on)} className={cn('relative w-11 h-6 rounded-full transition-colors', on ? 'bg-[#FF4500]' : 'bg-gray-200')}>
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', on && 'translate-x-5')} />
      </button>
    </div>
  )
}
