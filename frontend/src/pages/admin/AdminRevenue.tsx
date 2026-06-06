import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Zap, Target } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, BarChart, LineChart, AdminStatCard } from '../../components/ui/AdminCharts'
import { cn } from '../../utils/utils'
import axios from 'axios'

type Period = 'weekly' | 'monthly'

export default function AdminRevenue() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [overview, setOverview] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || 'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get('/api/admin/overview', { headers })
        setMonthlyRevenue(res.data.monthlyRevenue || [])
        setOverview(res.data.overview || {})
      } catch (err) {
        console.error('AdminRevenue load error', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalRevenue = overview.totalRevenue ?? 0
  const monthlyRevTotal = monthlyRevenue.reduce((s: number, m: any) => s + (m.revenue || 0), 0)

  const kpis = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, growth: 0, icon: DollarSign, color: 'text-[#FF4500]' },
    { label: 'Monthly Subscribers', value: overview.monthlySubscribers ?? 0, growth: 0, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Yearly Subscribers', value: overview.yearlySubscribers ?? 0, growth: 0, icon: Zap, color: 'text-purple-600' },
    { label: 'Premium Total', value: overview.premiumSubscribers ?? 0, growth: 0, icon: Target, color: 'text-blue-600' },
  ]

  const chartData = period === 'monthly' ? monthlyRevenue : monthlyRevenue.slice(-4)
  const xKey = 'month'

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <AdminStatCard key={k.label} label={k.label} value={k.value} growth={k.growth}
              icon={k.icon} color={k.color} delay={i * 0.06} />
          ))}
        </div>

        {/* Period switcher + main chart */}
        <ACard className="p-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <SectionHeader title="Revenue Trend" subtitle="Platform earnings over time" />
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(['monthly', 'weekly'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                    period === p ? 'bg-[#FF4500] text-white' : 'text-gray-500 hover:text-gray-700')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {loading
            ? <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
            : (
              <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <LineChart data={chartData} xKey={xKey} yKey="revenue" color="#FF4500" height={180} />
              </motion.div>
            )
          }
        </ACard>

        <div className="grid lg:grid-cols-2 gap-5">
          <ACard className="p-5">
            <SectionHeader title="Revenue by Month" subtitle="Bar view" />
            {loading
              ? <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
              : <BarChart data={monthlyRevenue} xKey="month" yKey="revenue" color="#FF4500" height={140} />
            }
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-green-700">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">This Period</p>
                <p className="text-lg font-bold text-blue-700">${monthlyRevTotal.toLocaleString()}</p>
              </div>
            </div>
          </ACard>

          <ACard className="p-5">
            <SectionHeader title="Subscription Revenue Split" subtitle="Monthly vs Yearly" />
            <div className="space-y-4 mt-4">
              {[
                { label: 'Monthly Plan Revenue', value: (overview.monthlySubscribers ?? 0) * 25, color: 'bg-[#FF4500]', max: totalRevenue || 1 },
                { label: 'Yearly Plan Revenue', value: (overview.yearlySubscribers ?? 0) * 250, color: 'bg-amber-500', max: totalRevenue || 1 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{m.label}</span>
                    <span className="font-semibold text-gray-900">${m.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn('h-full rounded-full', m.color)} />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {[
                  { label: 'Monthly Plan', value: '$25/mo', sub: `${overview.monthlySubscribers ?? 0} subscribers` },
                  { label: 'Yearly Plan', value: '$250/yr', sub: `${overview.yearlySubscribers ?? 0} subscribers` },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{r.label}</p>
                      <p className="text-xs text-gray-400">{r.sub}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ACard>
        </div>
      </div>
    </AdminLayout>
  )
}
