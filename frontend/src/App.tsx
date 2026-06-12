import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './componenets/Login'
import Register from './componenets/Register'
import RecoverAccountPage from './pages/RecoverAccountPage'
import ForgotPassword from './componenets/ForgotPassword'
import VerifyOTP from './componenets/VerifyOTP'
import OAuthCallback from './pages/OAuthCallback'
import Dashboard from './pages/dashboard/Dashboard';
import PricingPage from './pages/PricingPage';
import ResumePage from './pages/dashboard/ResumePage'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { useSubscription } from './contexts/SubscriptionContext'
import JobsPage from './pages/dashboard/JobsPage'
import ApplicationsPage from './pages/dashboard/ApplicationsPage'
import SavedJobsPage from './pages/dashboard/SavedJobsPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import HelpCenterPage from './pages/dashboard/HelpCenterPage'
import FeedbackPage from './pages/dashboard/FeedbackPage'
import AIChatbot from './components/ui/AIChatbot'
import SubscriptionManagement from './pages/SubscriptionManagement';
import InvoicePage from './pages/dashboard/InvoicePage';
// Admin
import AdminOverview from './pages/admin/AdminOverview'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'
import AdminRevenue from './pages/admin/AdminRevenue'
import AdminFeedback from './pages/admin/AdminFeedback'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAIMonitor from './pages/admin/AdminAIMonitor'
import AdminSettings from './pages/admin/AdminSettings'
import AdminRecoveryRequests from './pages/admin/AdminRecoveryRequests'

function parseUserInfo() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Admin guard ───────────────────────────────────────────────────────────────
function AdminRequireAuth({ children }: { children: React.ReactNode }) {
  const userInfo = parseUserInfo()
  if (!userInfo) return <Navigate to="/login" replace />
  if (!userInfo.isAdmin) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ── User guard — blocks admin from accessing user dashboard ───────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading } = useSubscription()
  const userInfo = parseUserInfo()

  if (userInfo?.isAdmin) return <Navigate to="/admin" replace />

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F4]">
        <div className="w-8 h-8 border-4 border-orange-100 border-t-[#FF4500] rounded-full animate-spin" />
      </div>
    )
  }

  if (!userInfo) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  return (
    <SubscriptionProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover-account" element={<RecoverAccountPage />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {/* User Dashboard */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/resume" element={<RequireAuth><ResumePage /></RequireAuth>} />
          <Route path="/dashboard/jobs" element={<RequireAuth><JobsPage /></RequireAuth>} />
          <Route path="/dashboard/applications" element={<RequireAuth><ApplicationsPage /></RequireAuth>} />
          <Route path="/dashboard/saved" element={<RequireAuth><SavedJobsPage /></RequireAuth>} />
          <Route path="/dashboard/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
          <Route path="/dashboard/feedback" element={<RequireAuth><FeedbackPage /></RequireAuth>} />
          <Route path="/dashboard/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/dashboard/help" element={<RequireAuth><HelpCenterPage /></RequireAuth>} />
          <Route path="/dashboard/billing" element={<RequireAuth><SubscriptionManagement /></RequireAuth>} />
          <Route path="/dashboard/invoice/:id" element={<RequireAuth><InvoicePage /></RequireAuth>} />
          {/* Admin */}
          <Route path="/admin" element={<AdminRequireAuth><AdminOverview /></AdminRequireAuth>} />
          <Route path="/admin/analytics" element={<AdminRequireAuth><AdminAnalytics /></AdminRequireAuth>} />
          <Route path="/admin/subscriptions" element={<AdminRequireAuth><AdminSubscriptions /></AdminRequireAuth>} />
          <Route path="/admin/revenue" element={<AdminRequireAuth><AdminRevenue /></AdminRequireAuth>} />
          <Route path="/admin/feedback" element={<AdminRequireAuth><AdminFeedback /></AdminRequireAuth>} />
          <Route path="/admin/users" element={<AdminRequireAuth><AdminUsers /></AdminRequireAuth>} />
          <Route path="/admin/ai-monitor" element={<AdminRequireAuth><AdminAIMonitor /></AdminRequireAuth>} />
          <Route path="/admin/settings" element={<AdminRequireAuth><AdminSettings /></AdminRequireAuth>} />
          <Route path="/admin/recovery-requests" element={<AdminRequireAuth><AdminRecoveryRequests /></AdminRequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </SubscriptionProvider>
  )
}

export default App
