import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './componenets/Login'
import Register from './componenets/Register'
import ForgotPassword from './componenets/ForgotPassword'
import VerifyOTP from './componenets/VerifyOTP'
import Dashboard from './pages/dashboard/Dashboard'
import ResumePage from './pages/dashboard/ResumePage'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import JobsPage from './pages/dashboard/JobsPage'
import ApplicationsPage from './pages/dashboard/ApplicationsPage'
import SavedJobsPage from './pages/dashboard/SavedJobsPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import HelpCenterPage from './pages/dashboard/HelpCenterPage'
import FeedbackPage from './pages/dashboard/FeedbackPage'
import AIChatbot from './components/ui/AIChatbot'
// Admin
import AdminOverview from './pages/admin/AdminOverview'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'
import AdminRevenue from './pages/admin/AdminRevenue'
import AdminFeedback from './pages/admin/AdminFeedback'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAIMonitor from './pages/admin/AdminAIMonitor'
import AdminSettings from './pages/admin/AdminSettings'

function parseUserInfo() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function RequireAuth({ children, adminRequired = false }: { children: React.ReactNode; adminRequired?: boolean }) {
  const userInfo = parseUserInfo()
  if (!userInfo) return <Navigate to="/login" replace />
  if (adminRequired && !userInfo.isAdmin) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <SubscriptionProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* User Dashboard */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/resume" element={<RequireAuth><ResumePage /></RequireAuth>} />
          <Route path="/dashboard/jobs" element={<RequireAuth><JobsPage /></RequireAuth>} />
          <Route path="/dashboard/applications" element={<RequireAuth><ApplicationsPage /></RequireAuth>} />
          <Route path="/dashboard/saved" element={<RequireAuth><SavedJobsPage /></RequireAuth>} />
          <Route path="/dashboard/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
          <Route path="/dashboard/feedback" element={<RequireAuth><FeedbackPage /></RequireAuth>} />
          <Route path="/dashboard/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/dashboard/help" element={<RequireAuth><HelpCenterPage /></RequireAuth>} />
          {/* Admin */}
          <Route path="/admin" element={<RequireAuth adminRequired><AdminOverview /></RequireAuth>} />
          <Route path="/admin/analytics" element={<RequireAuth adminRequired><AdminAnalytics /></RequireAuth>} />
          <Route path="/admin/subscriptions" element={<RequireAuth adminRequired><AdminSubscriptions /></RequireAuth>} />
          <Route path="/admin/revenue" element={<RequireAuth adminRequired><AdminRevenue /></RequireAuth>} />
          <Route path="/admin/feedback" element={<RequireAuth adminRequired><AdminFeedback /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth adminRequired><AdminUsers /></RequireAuth>} />
          <Route path="/admin/ai-monitor" element={<RequireAuth adminRequired><AdminAIMonitor /></RequireAuth>} />
          <Route path="/admin/settings" element={<RequireAuth adminRequired><AdminSettings /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </SubscriptionProvider>
  )
}

export default App
