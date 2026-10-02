import { motion } from 'framer-motion'
import { Users, Cpu, UserPlus, TrendingUp, Upload, Bookmark, ClipboardList, LogIn } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, AdminStatCard, BarChart } from '../../components/ui/AdminCharts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { cn } from '../../utils/utils'

const activityMeta: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  upload:   { icon: Upload,        color: 'text-blue-600',   bg: 'bg-blue-50' },
  ai:       { icon: Cpu,           color: 'text-[#FF4500]',  bg: 'bg-orange-50' },
  apply:    { icon: ClipboardList, color: 'text-green-600',  bg: 'bg-green-50' },
  save:     { icon: Bookmark,      color: 'text-purple-600', bg: 'bg-purple-50' },
  login:    { icon: LogIn,         color: 'text-gray-600',   bg: 'bg-gray-50' },
  upgrade:  { icon: TrendingUp,    color: 'text-amber-600',  bg: 'bg-amber-50' },
  register: { icon: UserPlus,      color: 'text-cyan-600',   bg: 'bg-cyan-50' },
}

export default function AdminUsers() {
  const [stats, setStats] = useState<any>({})
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [weeklyVisits, setWeeklyVisits] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || 'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const [ovRes, usersRes, logsRes] = await Promise.all([
          axios.get('/api/admin/overview', { headers }),
          axios.get('/api/admin/users', { headers }),
          axios.get('/api/admin/logs', { headers }),
        ])
        setStats(ovRes.data.overview || {})
        setWeeklyVisits(ovRes.data.weeklyVisits || [])
        setTopUsers((usersRes.data.users || []).slice(0, 10))
        setRecentActivity((logsRes.data.logs || []).slice(0, 8).map((l: any) => ({
          id: l._id,
          user: String(l.userId),
          action: l.detail || l.action,
          time: new Date(l.createdAt).toLocaleString(),
          type: l.action === 'ai_analyze' ? 'ai' : l.action === 'save_job' ? 'save' : 'login',
        })))
      } catch (err) {
        console.error('Failed to load admin users data', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminStatCard label="Total Users" value={stats.totalUsers ?? 0} growth={0} icon={Users} color="text-[#FF4500]" delay={0} />
          <AdminStatCard label="Premium Users" value={stats.premiumSubscribers ?? 0} growth={0} icon={UserPlus} color="text-green-600" delay={0.05} />
          <AdminStatCard label="New This Week" value={stats.newUsersWeek ?? 0} growth={0} icon={TrendingUp} color="text-blue-600" delay={0.1} />
          <AdminStatCard label="AI Requests" value={stats.aiRequestsProcessed ?? 0} growth={0} icon={Cpu} color="text-purple-600" delay={0.15} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Daily Activity chart */}
          <ACard className="p-5">
            <SectionHeader title="Daily Activity" subtitle="Log events this week" />
            {loading
              ? <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
              : <BarChart data={weeklyVisits} xKey="day" yKey="users" color="#FF4500" height={140} />
            }
          </ACard>

          {/* Live Activity Feed */}
          <ACard className="p-5">
            <SectionHeader title="Live Activity Feed" subtitle="Recent platform events" />
            {loading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((a, i) => {
                  const meta = activityMeta[a.type] ?? { icon: Users, color: 'text-gray-500', bg: 'bg-gray-50' }
                  const Icon = meta.icon
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', meta.bg)}>
                        <Icon className={cn('w-3.5 h-3.5', meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 truncate">
                          <span className="font-semibold">{a.user}</span> — {a.action}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{a.time}</span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </ACard>
        </div>

        {/* Users Table */}
        <ACard className="p-5">
          <SectionHeader title="Registered Users" subtitle={`${topUsers.length} users`} />
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4500]" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : topUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['User', 'Email', 'Plan', 'Status', 'Joined'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-[#FF4500] shrink-0">
                            {(u.name || 'U')[0].toUpperCase()}
                          </div>
                          <p className="font-medium text-gray-900 text-xs">{u.name}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500">{u.email}</td>
                      <td className="py-3 pr-4 text-xs text-gray-700">{u.subscriptionPlan || 'Free'}</td>
                      <td className="py-3 pr-4 text-xs text-gray-500">{u.subscriptionStatus || 'inactive'}</td>
                      <td className="py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ACard>
      </div>
    </AdminLayout>
  )
}
