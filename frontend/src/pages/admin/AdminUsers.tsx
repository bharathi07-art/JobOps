import { motion } from 'framer-motion'
import { Users, Upload, Cpu, Bookmark, ClipboardList, LogIn, UserPlus, TrendingUp } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, AdminStatCard, BarChart } from '../../components/ui/AdminCharts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { cn } from '../../utils/utils'
import { weeklyVisits, recentActivity } from '../../data/adminData'

const activityMeta: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  upload:   { icon: Upload,       color: 'text-blue-600',   bg: 'bg-blue-50' },
  ai:       { icon: Cpu,          color: 'text-[#FF4500]',  bg: 'bg-orange-50' },
  apply:    { icon: ClipboardList,color: 'text-green-600',  bg: 'bg-green-50' },
  save:     { icon: Bookmark,     color: 'text-purple-600', bg: 'bg-purple-50' },
  login:    { icon: LogIn,        color: 'text-gray-600',   bg: 'bg-gray-50' },
  upgrade:  { icon: TrendingUp,   color: 'text-amber-600',  bg: 'bg-amber-50' },
  register: { icon: UserPlus,     color: 'text-cyan-600',   bg: 'bg-cyan-50' },
}

const topUsersMock = [
  { name: 'Bharathi', email: 'bharathi@example.com', actions: 48, uploads: 6, aiRequests: 12, apps: 18 },
  { name: 'Sarah Chen',     email: 'sarah@example.com',    actions: 41, uploads: 4, aiRequests: 10, apps: 15 },
  { name: 'Marcus Williams',email: 'marcus@example.com',   actions: 37, uploads: 5, aiRequests: 9,  apps: 12 },
  { name: 'Priya Patel',    email: 'priya@example.com',    actions: 33, uploads: 3, aiRequests: 8,  apps: 14 },
  { name: 'Jordan Lee',     email: 'jordan@example.com',   actions: 29, uploads: 4, aiRequests: 7,  apps: 10 },
]

export default function AdminUsers() {
  const [stats, setStats] = useState<any>({})
  const [topUsers, setTopUsers] = useState<any[]>(topUsersMock)

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo')||'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const [ovRes, usersRes] = await Promise.all([
          axios.get('/api/admin/overview', { headers }),
          axios.get('/api/admin/users', { headers }),
        ])

        setStats(ovRes.data.overview || {})
        setTopUsers((usersRes.data.users || []).slice(0, 5))
      } catch (err) {
        console.error('Failed to load admin users data', err)
      }
    }
    load()
  }, [])

  const adminStats = {
    totalUsers: stats.totalUsers || 0,
    activeUsers: 0,
    newUsersWeek: 0,
    aiRequestsProcessed: stats.totalAIResults || 0,
  }

  const statGrowth = { totalUsers: 0, activeUsers: 0, newUsersWeek: 0, aiRequestsProcessed: 0 }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminStatCard label="Total Users" value={adminStats.totalUsers} growth={statGrowth.totalUsers} icon={Users} color="text-[#FF4500]" delay={0} />
          <AdminStatCard label="Active Users" value={adminStats.activeUsers} growth={statGrowth.activeUsers} icon={UserPlus} color="text-green-600" delay={0.05} />
          <AdminStatCard label="New This Week" value={adminStats.newUsersWeek} growth={statGrowth.newUsersWeek} icon={TrendingUp} color="text-blue-600" delay={0.1} />
          <AdminStatCard label="AI Requests" value={adminStats.aiRequestsProcessed} growth={statGrowth.aiRequestsProcessed} icon={Cpu} color="text-purple-600" delay={0.15} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Daily Active Users chart */}
          <ACard className="p-5">
            <SectionHeader title="Daily Active Users" subtitle="This week" />
            <BarChart data={weeklyVisits} xKey="day" yKey="users" color="#FF4500" height={140} />
          </ACard>

          {/* Activity breakdown */}
          <ACard className="p-5">
            <SectionHeader title="Activity Breakdown" subtitle="Actions by type this week" />
            <div className="space-y-3">
              {[
                { label: 'AI Matching Requests', value: 2840, max: 3000, color: 'bg-[#FF4500]' },
                { label: 'Resume Uploads', value: 1240, max: 3000, color: 'bg-blue-500' },
                { label: 'Applications Tracked', value: 1890, max: 3000, color: 'bg-green-500' },
                { label: 'Jobs Saved', value: 2100, max: 3000, color: 'bg-purple-500' },
                { label: 'Logins', value: 5420, max: 6000, color: 'bg-amber-500' },
              ].map(a => (
                <div key={a.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{a.label}</span>
                    <span className="font-semibold text-gray-900">{a.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(a.value / a.max) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn('h-full rounded-full', a.color)} />
                  </div>
                </div>
              ))}
            </div>
          </ACard>
        </div>

        {/* Live Activity Feed */}
        <ACard className="p-5">
          <SectionHeader title="Live Activity Timeline" subtitle="Real-time platform events" />
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-1">
              {recentActivity.map((a, i) => {
                const meta = activityMeta[a.type] ?? { icon: Users, color: 'text-gray-500', bg: 'bg-gray-50' }
                const Icon = meta.icon
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 pl-2 py-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10', meta.bg)}>
                      <Icon className={cn('w-3.5 h-3.5', meta.color)} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{a.user}</span>
                        <span className="text-gray-500"> — {a.action}</span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 pt-0.5">{a.time}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </ACard>

        {/* Most Active Users */}
        <ACard className="p-5">
          <SectionHeader title="Most Active Users" subtitle="Top engagement this week" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Total Actions', 'Uploads', 'AI Requests', 'Applications'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <motion.tr key={u.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-[#FF4500] shrink-0">
                          {u.name.split(' ').map((n: any) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{u.name}</p>
                          <p className="text-[10px] text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4"><span className="font-bold text-[#FF4500] text-sm">{u.actions}</span></td>
                    <td className="py-3 pr-4 text-xs text-gray-700">{u.uploads}</td>
                    <td className="py-3 pr-4 text-xs text-gray-700">{u.aiRequests}</td>
                    <td className="py-3 text-xs text-gray-700">{u.apps}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ACard>
      </div>
    </AdminLayout>
  )
}
