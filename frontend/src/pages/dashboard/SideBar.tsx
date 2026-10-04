import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Upload, Sparkles, Bookmark, Activity, Settings, User, LogOut, Menu, X, MessageSquare, ClipboardList, HelpCircle, Lock } from "lucide-react"

import { cn } from "../../utils/utils"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/upload", label: "Upload Resume", icon: Upload },
  { to: "/dashboard/jobs", label: "Job Matches", icon: Sparkles },
  { to: "/dashboard/saved", label: "Saved Jobs", icon: Bookmark },
  { to: "/dashboard/applications", label: "Applications", icon: ClipboardList },
  { to: "/dashboard/activity", label: "Activity", icon: Activity },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/help", label: "Help Center", icon: HelpCircle },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
]

function parseUser() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return { name: '', email: '', avatar: '' }
    const parsed = JSON.parse(raw)
    const u = parsed?.user ?? parsed?.User ?? parsed
    return { name: u?.name ?? '', email: u?.email ?? '', avatar: u?.avatar ?? '' }
  } catch { return { name: '', email: '', avatar: '' } }
}

function SideBar() {
  const { pathname } = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [user, setUser] = useState(parseUser)


  // Re-read whenever Settings saves to localStorage
  useEffect(() => {
    const onStorage = () => setUser(parseUser())
    window.addEventListener('storage', onStorage)
    // Also listen to a custom event fired from SettingsPage on same tab
    window.addEventListener('userInfoUpdated', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('userInfoUpdated', onStorage)
    }
  }, [])

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF4500] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JobOps</span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-gray-500"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                      {navItems.map((item) => {
                        const isActive = pathname === item.to
                        const premiumRoutes = ["/dashboard/upload", "/dashboard/jobs", "/dashboard/saved", "/dashboard/applications"]
                        const isPremiumRoute = premiumRoutes.includes(item.to)

                        if (isPremiumRoute) {
                          return (
                            <button
                              key={item.to}
                              
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                isActive ? "bg-orange-50 text-[#FF4500]" : ''
                              )}
                            >
                              <item.icon className={cn("w-5 h-5 text-gray-400")} />
                              <span className="flex-1 text-left">{item.label}</span>
                              <Lock className="w-4 h-4 text-gray-400" />
                            </button>
                          )
                        }

                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-orange-50 text-[#FF4500]"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            <item.icon className={cn("w-5 h-5", isActive && "text-[#FF4500]")} />
                            {item.label}
                          </Link>
                        )
                      })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/dashboard/settings"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-orange-50 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 ring-2 ring-transparent group-hover:ring-[#FF4500]/30 transition-all">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <User className="w-5 h-5 text-gray-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FF4500] transition-colors">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Settings className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#FF4500] transition-colors shrink-0" />
            </Link>
            <Link
              to="/login" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

export default SideBar
