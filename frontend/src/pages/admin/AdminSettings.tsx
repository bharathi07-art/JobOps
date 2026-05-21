import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Cpu, CreditCard, Bell, Shield, Save, CheckCircle2 } from 'lucide-react'
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

function Toggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => setOn(!on)}
        className={cn('relative w-11 h-6 rounded-full transition-colors shrink-0', on ? 'bg-[#FF4500]' : 'bg-gray-200')}>
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', on && 'translate-x-5')} />
      </button>
    </div>
  )
}

function FieldRow({ label, defaultValue, type = 'text' }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input type={type} defaultValue={defaultValue}
        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 bg-white" />
    </div>
  )
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('platform')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
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
                <FieldRow label="Platform Name" defaultValue="JobOps" />
                <FieldRow label="Support Email" defaultValue="support@jobops.ai" />
                <FieldRow label="Max Free AI Requests/Month" defaultValue="4" />
                <FieldRow label="Max Pro AI Requests/Day" defaultValue="1" />
              </div>
              <div className="space-y-1">
                <Toggle label="Maintenance Mode" desc="Temporarily disable user access" defaultOn={false} />
                <Toggle label="New User Registrations" desc="Allow new users to sign up" defaultOn={true} />
                <Toggle label="AI Matching Feature" desc="Enable AI job matching for all users" defaultOn={true} />
                <Toggle label="PWA Support" desc="Enable progressive web app features" defaultOn={true} />
              </div>
            </ACard>
          )}

          {activeTab === 'ai' && (
            <ACard className="p-6 space-y-5">
              <h2 className="font-bold text-gray-900">AI Provider Settings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Active Provider" defaultValue="Gemini" />
                <FieldRow label="Model" defaultValue="gemini-1.5-flash" />
                <FieldRow label="API Key" defaultValue="••••••••••••••••••••" type="password" />
                <FieldRow label="Max Tokens per Request" defaultValue="2048" />
                <FieldRow label="Request Timeout (s)" defaultValue="30" />
                <FieldRow label="Retry Attempts" defaultValue="3" />
              </div>
              <div className="space-y-1">
                <Toggle label="Fallback to OpenAI" desc="Use OpenAI if Gemini fails" defaultOn={false} />
                <Toggle label="Request Logging" desc="Log all AI requests for monitoring" defaultOn={true} />
                <Toggle label="Rate Limiting" desc="Enforce per-user request limits" defaultOn={true} />
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
                  { plan: 'Free Plan', price: '0', features: '4 AI searches/month, 10 job matches' },
                  { plan: 'Pro Monthly', price: '20', features: 'Unlimited matches, 1 AI search/day' },
                  { plan: 'Pro Yearly', price: '220', features: 'Everything in Pro, save $20/year' },
                ].map(p => (
                  <div key={p.plan} className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <p className="text-sm font-semibold text-gray-900">{p.plan}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Price ($)</label>
                        <input defaultValue={p.price} type="number"
                          className="w-full h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] bg-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Features</label>
                        <input defaultValue={p.features}
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
              <Toggle label="New User Registrations" desc="Alert when new users sign up" defaultOn={true} />
              <Toggle label="Billing Issues" desc="Alert on payment failures or disputes" defaultOn={true} />
              <Toggle label="AI Failure Alerts" desc="Alert when AI error rate exceeds 5%" defaultOn={true} />
              <Toggle label="New Feedback Submissions" desc="Alert on new user feedback" defaultOn={true} />
              <Toggle label="Weekly Analytics Report" desc="Receive weekly platform summary" defaultOn={false} />
              <Toggle label="Subscription Renewals" desc="Alert on subscription events" defaultOn={false} />
            </ACard>
          )}

          {activeTab === 'security' && (
            <ACard className="p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Security Settings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Admin Email" defaultValue="admin@jobops.ai" />
                <FieldRow label="Current Password" defaultValue="" type="password" />
                <FieldRow label="New Password" defaultValue="" type="password" />
                <FieldRow label="Confirm Password" defaultValue="" type="password" />
              </div>
              <div className="space-y-1">
                <Toggle label="Two-Factor Authentication" desc="Require 2FA for admin login" defaultOn={true} />
                <Toggle label="Session Timeout" desc="Auto-logout after 30 minutes of inactivity" defaultOn={true} />
                <Toggle label="IP Allowlist" desc="Restrict admin access to specific IPs" defaultOn={false} />
                <Toggle label="Audit Logging" desc="Log all admin actions" defaultOn={true} />
              </div>
            </ACard>
          )}
        </motion.div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4500] text-white text-sm font-medium rounded-xl hover:bg-[#e03e00] transition-colors">
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
          {saved && <p className="text-xs text-green-600 font-medium">Settings updated successfully.</p>}
        </div>
      </div>
    </AdminLayout>
  )
}
