import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CreditCard, BarChart3, MessageSquare,
  Activity, Cpu, Settings, LogOut, Menu, X, Sparkles,
  Bell, ChevronDown, Shield
} from 'lucide-react'
import { cn } from '../../utils/utils'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/admin/revenue', label: 'Revenue', icon: Activity },
  { to: '/admin/users', label: 'User Activity', icon: Users },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare, badge: 4 },
  { to: '/admin/ai-monitor', label: 'AI Monitor', icon: Cpu },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        )}
      </AnimatePresence>
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1a2e] flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#FF4500] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">JobOps</span>
              <span className="block text-[10px] text-white/40 -mt-0.5 font-medium tracking-widest uppercase">Admin</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.to
            return (
              <Link key={item.to} to={item.to} onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                  active
                    ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.badge && !active && (
                  <span className="ml-auto w-5 h-5 bg-[#FF4500] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin badge */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
            <div className="w-8 h-8 bg-[#FF4500]/20 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#FF4500]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin Panel</p>
              <p className="text-[10px] text-white/40">Full access</p>
            </div>
          </div>
          <Link to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </aside>
    </>
  )
}

function AdminTopbar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const label = navItems.find(n => n.to === pathname)?.label ?? 'Admin'
  const [showNotif, setShowNotif] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 lg:px-6 py-3">
      <div className="flex items-center gap-4">
        <button onClick={onMenu} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{label}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">JobOps Admin Console</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4500] rounded-full" />
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Admin Alerts</p>
                  {[
                    { msg: '4 new feedback submissions', time: '5 min ago', dot: 'bg-[#FF4500]' },
                    { msg: 'AI failure rate spike detected', time: '12 min ago', dot: 'bg-amber-500' },
                    { msg: 'New billing issue reported', time: '1 hr ago', dot: 'bg-red-500' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', n.dot)} />
                      <div>
                        <p className="text-xs text-gray-800 font-medium">{n.msg}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Admin avatar */}
          <button onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group">
            <div className="w-7 h-7 bg-[#FF4500] rounded-full flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-[#FF4500] transition-colors">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen bg-[#FFF8F4] overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
