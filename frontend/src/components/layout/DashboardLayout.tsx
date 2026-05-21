import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Sparkles, Send, Bookmark,
  BarChart2, Settings, User, LogOut, Menu, X, Bell, Search, ChevronDown
  , MessageCircle
} from 'lucide-react'
import { cn } from '../../utils/utils'
import { mockNotifications } from '../../data/mockData'

function parseUser() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return { name: '', email: '', avatar: '' }
    const parsed = JSON.parse(raw)
    const u = parsed?.user ?? parsed?.User ?? parsed
    return {
      name:   u?.name   ?? '',
      email:  u?.email  ?? '',
      avatar: u?.avatar ?? '',
    }
  } catch { return { name: '', email: '', avatar: '' } }
}

function useUser() {
  const [user, setUser] = useState(parseUser)
  useEffect(() => {
    const refresh = () => setUser(parseUser())
    window.addEventListener('userInfoUpdated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('userInfoUpdated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return user
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/resume', label: 'Resume Analysis', icon: FileText },
  { to: '/dashboard/jobs', label: 'AI Job Matches', icon: Sparkles },
  { to: '/dashboard/applications', label: 'Applications', icon: Send },
  { to: '/dashboard/saved', label: 'Saved Jobs', icon: Bookmark },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/dashboard/feedback', label: 'Send Feedback', icon: MessageCircle },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  { to: '/dashboard/help', label: 'Help Center', icon: LayoutDashboard },
]

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  const user = useUser()

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">JobOps</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.to
            return (
              <Link key={item.to} to={item.to} onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active ? 'bg-[#FF4500] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            to="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 ring-2 ring-transparent group-hover:ring-[#FF4500]/30 transition-all">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <User className="w-4 h-4 text-gray-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FF4500] transition-colors">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#FF4500] transition-colors shrink-0" />
          </Link>
          <Link to="/login" className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  )
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const navigate = useNavigate()
  const user = useUser()
  const unread = mockNotifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 lg:px-6 py-3">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 hover:text-gray-900">
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Search jobs, companies..." className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#FF4500] focus:bg-white transition-colors" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4500] rounded-full" />}
            </button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                    <span className="text-xs text-[#FF4500] cursor-pointer">Mark all read</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {mockNotifications.map(n => (
                      <div key={n.id} className={cn('px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0', !n.read && 'bg-orange-50/50')}>
                        <div className="flex items-start gap-3">
                          <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', !n.read ? 'bg-[#FF4500]' : 'bg-gray-300')} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile — click to go to settings */}
          <button
            onClick={() => navigate('/dashboard/settings')}
            className="flex items-center gap-2 pl-2 rounded-lg hover:bg-orange-50 px-2 py-1.5 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 ring-2 ring-transparent group-hover:ring-[#FF4500]/30 transition-all">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <User className="w-4 h-4 text-gray-500" />}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-[#FF4500] transition-colors">
              {user.name ? user.name.split(' ')[0] : 'Account'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
