import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Zap, Target } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, BarChart, LineChart, AdminStatCard } from '../../components/ui/AdminCharts'
import { monthlyRevenue } from '../../data/adminData'
import { cn } from '../../utils/utils'

type Period = 'weekly' | 'monthly' | 'yearly'

const weeklyRev = [
  { day: 'Mon', revenue: 9200, cost: 1800 },
  { day: 'Tue', revenue: 11400, cost: 2100 },
  { day: 'Wed', revenue: 10100, cost: 1950 },
  { day: 'Thu', revenue: 13600, cost: 2400 },
  { day: 'Fri', revenue: 12200, cost: 2200 },
  { day: 'Sat', revenue: 7800, cost: 1400 },
  { day: 'Sun', revenue: 6100, cost: 1100 },
]

const yearlyRev = [
  { year: '2020', revenue: 12400 }, { year: '2021', revenue: 18400 },
  { year: '2022', revenue: 26800 }, { year: '2023', revenue: 38200 },
  { year: '2024', revenue: 48320 },
]

export default function AdminRevenue() {
  const [period, setPeriod] = useState<Period>('monthly')

  const chartData = period === 'weekly' ? weeklyRev
    : period === 'monthly' ? monthlyRevenue
    : yearlyRev
  const xKey = period === 'weekly' ? 'day' : period === 'monthly' ? 'month' : 'year'

  const kpis = [
    { label: 'Weekly Revenue', value: '$70,400', growth: +8.4, icon: DollarSign, color: 'text-[#FF4500]' },
    { label: 'Monthly Revenue', value: '$48,320', growth: +18.9, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Yearly Revenue', value: '$421,800', growth: +22.3, icon: Zap, color: 'text-purple-600' },
    { label: 'Conversion Rate', value: '18.2%', growth: +2.1, icon: Target, color: 'text-blue-600' },
  ]

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
              {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                    period === p ? 'bg-[#FF4500] text-white' : 'text-gray-500 hover:text-gray-700')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <LineChart data={chartData} xKey={xKey} yKey="revenue" color="#FF4500" height={180} />
          </motion.div>
        </ACard>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Revenue vs Cost */}
          <ACard className="p-5">
            <SectionHeader title="Revenue vs AI Cost" subtitle="Weekly comparison" />
            <BarChart data={weeklyRev} xKey="day" yKey="revenue" color="#FF4500" height={140} />
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-green-700">$70,400</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">AI Processing Cost</p>
                <p className="text-lg font-bold text-red-600">$12,950</p>
              </div>
            </div>
          </ACard>

          {/* Metrics grid */}
          <ACard className="p-5">
            <SectionHeader title="Revenue Intelligence" subtitle="Key financial metrics" />
            <div className="space-y-3">
              {[
                { label: 'Gross Profit Margin', value: '81.6%', trend: +3.2, positive: true },
                { label: 'Monthly Recurring Revenue', value: '$37,520', trend: +11.2, positive: true },
                { label: 'Annual Recurring Revenue', value: '$102,300', trend: +28.6, positive: true },
                { label: 'Churn Rate', value: '3.2%', trend: -0.8, positive: true },
                { label: 'Customer Lifetime Value', value: '$184', trend: +6.4, positive: true },
                { label: 'AI Cost per Request', value: '$0.014', trend: -12.3, positive: true },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-600">{m.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{m.value}</span>
                    <span className={cn('flex items-center gap-0.5 text-xs font-medium',
                      m.positive ? 'text-green-600' : 'text-red-500')}>
                      {m.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(m.trend)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ACard>
        </div>
      </div>
    </AdminLayout>
  )
}
