import { Search, Bell, Settings } from "lucide-react"
import { Link } from "react-router-dom"

interface HeaderProps {
  title?: string
  subtitle?: string
}

function Header({ title = "Dashboard", subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search jobs, skills, companies..."
              className="w-full pl-10 h-10 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#FF4500]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4500] rounded-full" />
          </button>
          <Link to="/dashboard/profile" className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 text-gray-500" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
