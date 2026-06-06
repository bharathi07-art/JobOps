import { motion } from 'framer-motion'
import {
  Users, UserCheck, UserPlus, CreditCard, TrendingUp,
  Cpu, ClipboardList, Briefcase, DollarSign
} from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { AdminStatCard, ACard, BarChart, DonutChart, SectionHeader, GroupedBar } from '../../components/ui/AdminCharts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { cn } from '../../utils/utils'

const statCards = [
  { label: 'Total Users',              key: 'totalUsers',              icon: Users,           color: 'text-[#FF4500]' },
  { label: 'Active Users',             key: 'activeUsers',             icon: UserCheck,       color: 'text-green-600' },
  { label: 'New Users This Week',      key: 'newUsersWeek',            icon: UserPlus,        color: 'text-blue-600' },
  { label: 'Premium Subscribers',      key: 'premiumSubscribers',      icon: CreditCard,      color: 'text-purple-600' },
  { label: 'Monthly Subscribers',      key: 'monthlySubscribers',      icon: CreditCard,      color: 'text-amber-600' },
  { label: 'Yearly Subscribers',       key: 'yearlySubscribers',       icon: TrendingUp,      color: 'text-cyan-600' },
  { label: 'Total Revenue',            key: 'totalRevenue',            icon: DollarSign,      color: 'text-green-600' },
  { label: 'AI Requests Processed',    key: 'aiRequestsProcessed',     icon: Cpu,             color: 'text-[#FF4500]' },
  { label: 'Applications Tracked',     key: 'totalApplicationsTracked',icon: ClipboardList,   color: 'text-blue-600' },
  { label: 'Total Jobs Matched',       key: 'totalJobsMatched',        icon: Briefcase,       color: 'text-purple-600' },
]

const activityIcons: Record<string, { icon: string; color: string }> = {
  upload:   { icon: '📄', color: 'bg-blue-50' },
  ai:       { icon: '🤖', color: 'bg-orange-50' },
  apply:    { icon: '✅', color: 'bg-green-50' },
  save:     { icon: '🔖', color: 'bg-purple-50' },
  login:    { icon: '🔐', color: 'bg-gray-50' },
  upgrade:  { icon: '⭐', color: 'bg-amber-50' },
  register: { icon: '👤', color: 'bg-cyan-50' },
}

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [weeklyVisits, setWeeklyVisits] = useState<any[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [subscriptionPieData, setSubscriptionPieData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo')||'null')?.token } catch { return null } })();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [ovRes, logsRes] = await Promise.all([
          axios.get('/api/admin/overview', { headers }),
          axios.get('/api/admin/logs', { headers }),
        ]);

        setStats(ovRes.data.overview);
        setWeeklyVisits(ovRes.data.weeklyVisits || []);
        setMonthlyRevenue(ovRes.data.monthlyRevenue || []);
        setSubscriptionPieData(ovRes.data.subscriptionPieData || []);
        setRecentActivity((logsRes.data.logs || []).slice(0, 20).map((l: any) => ({ id: l._id, user: l.userId, action: l.detail, time: new Date(l.createdAt).toLocaleString(), type: l.type || 'login' })));
        setLoading(false);
      } catch (err) {
        console.error('Failed to load admin overview', err);
        setError('Failed to load admin overview');
        setLoading(false);
      }
    }
    load();
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((s, i) => (
            <AdminStatCard key={s.key}
              label={s.label}
              value={s.key === 'totalRevenue'
                ? stats ? `$${(stats[s.key] ?? 0).toLocaleString()}` : '—'
                : stats ? (stats[s.key] ?? '—') : '—'}
              growth={0}
              icon={s.icon}
              color={s.color}
              delay={i * 0.04}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Weekly Visits */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <ACard className="p-5">
              <SectionHeader title="Weekly Platform Visits" subtitle="Users & sessions this week" />
              <GroupedBar
                data={weeklyVisits} xKey="day"
                keys={['users', 'sessions']}
                colors={['#FF4500', '#FFCBA4']}
                height={160}
              />
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#FF4500]" /><span className="text-xs text-gray-500">Users</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#FFCBA4]" /><span className="text-xs text-gray-500">Sessions</span></div>
              </div>
            </ACard>
          </motion.div>

          {/* Subscription Breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <ACard className="p-5 h-full">
              <SectionHeader title="Subscription Split" subtitle="Plan distribution" />
              <DonutChart data={subscriptionPieData} size={110} />
            </ACard>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Monthly Revenue */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <ACard className="p-5">
              <SectionHeader title="Monthly Revenue" subtitle="2024 revenue trend ($)" />
              <BarChart data={monthlyRevenue} xKey="month" yKey="revenue" color="#FF4500" height={150} />
            </ACard>
          </motion.div>

          {/* AI Usage */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <ACard className="p-5">
              <SectionHeader title="AI Requests This Week" subtitle="Success vs failed" />
              <GroupedBar
                data={[] as any} xKey="day"
                keys={['success', 'failed']}
                colors={['#22c55e', '#ef4444']}
                height={150}
              />
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500" /><span className="text-xs text-gray-500">Success</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" /><span className="text-xs text-gray-500">Failed</span></div>
              </div>
            </ACard>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <ACard className="p-5">
            <SectionHeader title="Live Activity Feed" subtitle="Real-time platform events" />
            <div className="space-y-2">
              {recentActivity.map((a, i) => {
                const meta = activityIcons[a.type] ?? { icon: '•', color: 'bg-gray-50' }
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0', meta.color)}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        <span className="font-semibold">{a.user}</span> — {a.action}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
                  </motion.div>
                )
              })}
            </div>
          </ACard>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
