import { motion } from "framer-motion"
import { Briefcase, TrendingUp, Activity, Sparkles } from "lucide-react"

const stats = [
  { label: "Jobs Matched Today", value: "24", change: "+12 from yesterday", icon: Briefcase, color: "bg-blue-100 text-blue-600" },
  { label: "Highest Match", value: "94%", change: "Frontend Developer at TechCorp", icon: TrendingUp, color: "bg-green-100 text-green-600" },
  { label: "Workflow Status", value: "Active", change: "Next run in 2 hours", icon: Activity, color: "bg-amber-100 text-amber-600" },
  { label: "AI Processing", value: "Complete", change: "Last analyzed 30 min ago", icon: Sparkles, color: "bg-orange-100 text-[#FF4500]" },
]

function StartCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default StartCards
