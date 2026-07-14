import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Cpu, CreditCard, Bell, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard } from '../../components/ui/AdminCharts'
import { cn } from '../../utils/utils'

const tabs = [
  { id: 'platform', label: 'Platform', icon: Settings },
  { id: 'ai', label: 'AI Provider', icon: Cpu },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
]

interface Settings {
  platformName: string
  supportEmail: string
  maxFreeAIRequestsPerMonth: number
  maxProAIRequestsPerDay: number
  maintenanceMode: boolean
  newUserRegistrationsEnabled: boolean
  aiMatchingFeatureEnabled: boolean
  pwaSupport: boolean
  activeAIProvider: string
  aiModelName: string
  aiApiKey: string
  maxTokensPerRequest: number
  requestTimeout: number
  retryAttempts: number
  fallbackToOpenAI: boolean
  requestLogging: boolean
  rateLimiting: boolean
  freePlanPrice: number
  freePlanFeatures: string
  monthlyPlanPrice: number
  monthlyPlanFeatures: string
  yearlyPlanPrice: number
  yearlyPlanFeatures: string
  notifyNewUsers: boolean
  notifyBillingIssues: boolean
  notifyAIFailures: boolean
  notifyFeedback: boolean
  weeklyAnalyticsReport: boolean
  notifySubscriptionRenewals: boolean
  twoFactorAuthRequired: boolean
  sessionTimeout: boolean
  ipAllowlist: boolean
  auditLogging: boolean
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)}
        className={cn('relative w-11 h-6 rounded-full transition-colors shrink-0', value ? 'bg-[#FF4500]' : 'bg-gray-200')}>
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', value && 'translate-x-5')} />
      </button>
    </div>
  )
}

function FieldRow({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (val: any) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input type={type} value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 bg-white" />
    </div>
  )
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('platform')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSavingState] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    platformName: 'JobOps',
    supportEmail: 'support@jobops.ai',
    maxFreeAIRequestsPerMonth: 4,
    maxProAIRequestsPerDay: 1,
    maintenanceMode: false,
    newUserRegistrationsEnabled: true,
    aiMatchingFeatureEnabled: true,
    pwaSupport: true,
    activeAIProvider: 'Gemini',
    aiModelName: 'gemini-1.5-flash',
    aiApiKey: '',
    maxTokensPerRequest: 2048,
    requestTimeout: 30,
    retryAttempts: 3,
    fallbackToOpenAI: false,
    requestLogging: true,
    rateLimiting: true,
    freePlanPrice: 0,
    freePlanFeatures: '4 AI searches/month, 10 job matches',
    monthlyPlanPrice: 20,
    monthlyPlanFeatures: 'Unlimited matches, 1 AI search/day',
    yearlyPlanPrice: 220,
    yearlyPlanFeatures: 'Everything in Pro, save $20/year',
    notifyNewUsers: true,
    notifyBillingIssues: true,
    notifyAIFailures: true,
    notifyFeedback: true,
    weeklyAnalyticsReport: false,
    notifySubscriptionRenewals: false,
    twoFactorAuthRequired: true,
    sessionTimeout: true,
    ipAllowlist: false,
    auditLogging: true,
  })

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }))
      }
      setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSavingState(true)
      setError('')
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save settings')
      }
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSavingState(false)
    }
  }

  if (loading) {
    return <AdminLayout><div className="p-6 text-center">Loading settings...</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'platform' && (
            <ACard className="p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Platform Settings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Platform Name" value={settings.platformName} onChange={(val) => setSettings({ ...settings, platformName: val })} />
                <FieldRow label="Support Email" value={settings.supportEmail} onChange={(val) => setSettings({ ...settings, supportEmail: val })} />
                <FieldRow label="Max Free AI Requests/Month" value={settings.maxFreeAIRequestsPerMonth} onChange={(val) => setSettings({ ...settings, maxFreeAIRequestsPerMonth: val })} type="number" />
                <FieldRow label="Max Pro AI Requests/Day" value={settings.maxProAIRequestsPerDay} onChange={(val) => setSettings({ ...settings, maxProAIRequestsPerDay: val })} type="number" />
              </div>
              <div className="space-y-1">
                <Toggle label="Maintenance Mode" desc="Temporarily disable user access" value={settings.maintenanceMode} onChange={(val) => setSettings({ ...settings, maintenanceMode: val })} />
                <Toggle label="New User Registrations" desc="Allow new users to sign up" value={settings.newUserRegistrationsEnabled} onChange={(val) => setSettings({ ...settings, newUserRegistrationsEnabled: val })} />
                <Toggle label="AI Matching Feature" desc="Enable AI job matching for all users" value={settings.aiMatchingFeatureEnabled} onChange={(val) => setSettings({ ...settings, aiMatchingFeatureEnabled: val })} />
                <Toggle label="PWA Support" desc="Enable progressive web app features" value={settings.pwaSupport} onChange={(val) => setSettings({ ...settings, pwaSupport: val })} />
              </div>
            </ACard>
          )}

          {activeTab === 'ai' && (
            <ACard className="p-6 space-y-5">
              <h2 className="font-bold text-gray-900">AI Provider Settings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Active Provider" value={settings.activeAIProvider} onChange={(val) => setSettings({ ...settings, activeAIProvider: val })} />
                <FieldRow label="Model" value={settings.aiModelName} onChange={(val) => setSettings({ ...settings, aiModelName: val })} />
                <FieldRow label="API Key" value={settings.aiApiKey} onChange={(val) => setSettings({ ...settings, aiApiKey: val })} type="password" />
                <FieldRow label="Max Tokens per Request" value={settings.maxTokensPerRequest} onChange={(val) => setSettings({ ...settings, maxTokensPerRequest: val })} type="number" />
                <FieldRow label="Request Timeout (s)" value={settings.requestTimeout} onChange={(val) => setSettings({ ...settings, requestTimeout: val })} type="number" />
                <FieldRow label="Retry Attempts" value={settings.retryAttempts} onChange={(val) => setSettings({ ...settings, retryAttempts: val })} type="number" />
              </div>
              <div className="space-y-1">
                <Toggle label="Fallback to OpenAI" desc="Use OpenAI if Gemini fails" value={settings.fallbackToOpenAI} onChange={(val) => setSettings({ ...settings, fallbackToOpenAI: val })} />
                <Toggle label="Request Logging" desc="Log all AI requests for monitoring" value={settings.requestLogging} onChange={(val) => setSettings({ ...settings, requestLogging: val })} />
                <Toggle label="Rate Limiting" desc="Enforce per-user request limits" value={settings.rateLimiting} onChange={(val) => setSettings({ ...settings, rateLimiting: val })} />
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-green-700 font-medium">Gemini API connected and operational</p>
              </div>
            </ACard>
          )}

          {activeTab === 'pricing' && (
            <ACard className="p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Subscription Pricing</h2>
              <div className="space-y-4">
                {[
                  { key: 'free', plan: 'Free Plan', priceKey: 'freePlanPrice', featuresKey: 'freePlanFeatures' },
                  { key: 'monthly', plan: 'Pro Monthly', priceKey: 'monthlyPlanPrice', featuresKey: 'monthlyPlanFeatures' },
                  { key: 'yearly', plan: 'Pro Yearly', priceKey: 'yearlyPlanPrice', featuresKey: 'yearlyPlanFeatures' },
                ].map(p => (
                  <div key={p.key} className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <p className="text-sm font-semibold text-gray-900">{p.plan}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Price ($)</label>
                        <input value={String(settings[p.priceKey as keyof Settings] ?? '')} onChange={(e) => setSettings({ ...settings, [p.priceKey]: Number(e.target.value) })} type="number"
                          className="w-full h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] bg-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Features</label>
                        <input value={String(settings[p.featuresKey as keyof Settings] ?? '')} onChange={(e) => setSettings({ ...settings, [p.featuresKey]: e.target.value })}
                          className="w-full h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] bg-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ACard>
          )}

          {activeTab === 'notifications' && (
            <ACard className="p-6 space-y-1">
              <h2 className="font-bold text-gray-900 mb-4">Admin Notification Settings</h2>
              <Toggle label="New User Registrations" desc="Alert when new users sign up" value={settings.notifyNewUsers} onChange={(val) => setSettings({ ...settings, notifyNewUsers: val })} />
              <Toggle label="Billing Issues" desc="Alert on payment failures or disputes" value={settings.notifyBillingIssues} onChange={(val) => setSettings({ ...settings, notifyBillingIssues: val })} />
              <Toggle label="AI Failure Alerts" desc="Alert when AI error rate exceeds 5%" value={settings.notifyAIFailures} onChange={(val) => setSettings({ ...settings, notifyAIFailures: val })} />
              <Toggle label="New Feedback Submissions" desc="Alert on new user feedback" value={settings.notifyFeedback} onChange={(val) => setSettings({ ...settings, notifyFeedback: val })} />
              <Toggle label="Weekly Analytics Report" desc="Receive weekly platform summary" value={settings.weeklyAnalyticsReport} onChange={(val) => setSettings({ ...settings, weeklyAnalyticsReport: val })} />
              <Toggle label="Subscription Renewals" desc="Alert on subscription events" value={settings.notifySubscriptionRenewals} onChange={(val) => setSettings({ ...settings, notifySubscriptionRenewals: val })} />
            </ACard>
          )}

          {activeTab === 'security' && (
            <ACard className="p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Security Settings</h2>
              <div className="space-y-1">
                <Toggle label="Two-Factor Authentication" desc="Require 2FA for admin login" value={settings.twoFactorAuthRequired} onChange={(val) => setSettings({ ...settings, twoFactorAuthRequired: val })} />
                <Toggle label="Session Timeout" desc="Auto-logout after 30 minutes of inactivity" value={settings.sessionTimeout} onChange={(val) => setSettings({ ...settings, sessionTimeout: val })} />
                <Toggle label="IP Allowlist" desc="Restrict admin access to specific IPs" value={settings.ipAllowlist} onChange={(val) => setSettings({ ...settings, ipAllowlist: val })} />
                <Toggle label="Audit Logging" desc="Log all admin actions" value={settings.auditLogging} onChange={(val) => setSettings({ ...settings, auditLogging: val })} />
              </div>
            </ACard>
          )}
        </motion.div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4500] text-white text-sm font-medium rounded-xl hover:bg-[#e03e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
          {saved && <p className="text-xs text-green-600 font-medium">Settings updated successfully.</p>}
        </div>
      </div>
    </AdminLayout>
  )
}
