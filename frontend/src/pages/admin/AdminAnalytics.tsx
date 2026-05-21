import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Activity, PieChart } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, BarChart, LineChart, DonutChart, GroupedBar } from '../../components/ui/AdminCharts'
import { weeklyVisits, monthlyRevenue, aiUsageData, subscriptionPieData } from '../../data/adminData'
import { cn } from '../../utils/utils'

type ChartType = 'bar' | 'line' | 'area' | 'donut'
type Range = 'weekly' | 'monthly' | 'yearly'

const chartTypes: { id: ChartType; label: string; icon: React.ElementType }[] = [
  { id: 'bar',   label: 'Bar',   icon: BarChart2 },
  { id: 'line',  label: 'Line',  icon: TrendingUp },
  { id: 'area',  label: 'Area',  icon: Activity },
  { id: 'donut', label: 'Donut', icon: PieChart },
]

const yearlyRevenue = [
  { year: '2021', revenue: 18400 }, { year: '2022', revenue: 26800 },
  { year: '2023', revenue: 38200 }, { year: '2024', revenue: 48320 },
]

export default function AdminAnalytics() {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [range, setRange] = useState<Range>('weekly')

  const visitData = range === 'weekly' ? weeklyVisits
    : range === 'monthly' ? monthlyRevenue.map(m => ({ ...m, users: Math.round(m.subscriptions * 4.2) }))
    : yearlyRevenue.map(y => ({ ...y, users: Math.round(y.revenue / 4) }))

  const xKey = range === 'weekly' ? 'day' : range === 'monthly' ? 'month' : 'year'

  function renderChart(yKey: string, color: string) {
    if (chartType === 'donut') return <DonutChart data={subscriptionPieData} size={130} />
    if (chartType === 'line' || chartType === 'area')
      return <LineChart data={visitData} xKey={xKey} yKey={yKey} color={color} height={150} />
    return <BarChart data={visitData} xKey={xKey} yKey={yKey} color={color} height={150} />
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Platform Analytics</h2>
            <p className="text-xs text-gray-400 mt-0.5">Switch chart types and time ranges</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Chart type switcher */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {chartTypes.map(ct => (
                <button key={ct.id} onClick={() => setChartType(ct.id)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    chartType === ct.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                  <ct.icon className="w-3.5 h-3.5" />{ct.label}
                </button>
              ))}
            </div>
            {/* Range switcher */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(['weekly', 'monthly', 'yearly'] as Range[]).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                    range === r ? 'bg-[#FF4500] text-white' : 'text-gray-500 hover:text-gray-700')}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <motion.div key={`visits-${chartType}-${range}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ACard className="p-5">
              <SectionHeader title="User Visits" subtitle={`${range} active users`} />
              {renderChart('users', '#FF4500')}
            </ACard>
          </motion.div>

          <motion.div key={`revenue-${chartType}-${range}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <ACard className="p-5">
              <SectionHeader title="Revenue" subtitle={`${range} revenue ($)`} />
              {chartType === 'donut'
                ? <DonutChart data={subscriptionPieData} size={130} />
                : chartType === 'line' || chartType === 'area'
                  ? <LineChart data={monthlyRevenue} xKey="month" yKey="revenue" color="#22c55e" height={150} />
                  : <BarChart data={monthlyRevenue} xKey="month" yKey="revenue" color="#22c55e" height={150} />
              }
            </ACard>
          </motion.div>

          <motion.div key={`ai-${chartType}-${range}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ACard className="p-5">
              <SectionHeader title="AI Usage Activity" subtitle="Requests processed" />
              {chartType === 'donut'
                ? <DonutChart data={[
                    { label: 'Success', value: 91600, color: '#22c55e' },
                    { label: 'Failed', value: 1600, color: '#ef4444' },
                    { label: 'Timeout', value: 1010, color: '#f59e0b' },
                  ]} size={130} />
                : <GroupedBar data={aiUsageData} xKey="day" keys={['success', 'failed']} colors={['#22c55e', '#ef4444']} height={150} />
              }
            </ACard>
          </motion.div>

          <motion.div key={`subs-${chartType}-${range}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <ACard className="p-5">
              <SectionHeader title="Subscription Growth" subtitle="New subscribers" />
              {chartType === 'donut'
                ? <DonutChart data={subscriptionPieData} size={130} />
                : chartType === 'line' || chartType === 'area'
                  ? <LineChart data={monthlyRevenue} xKey="month" yKey="subscriptions" color="#a855f7" height={150} />
                  : <BarChart data={monthlyRevenue} xKey="month" yKey="subscriptions" color="#a855f7" height={150} />
              }
            </ACard>
          </motion.div>
        </div>

        {/* Resume & Application Activity */}
        <div className="grid lg:grid-cols-2 gap-5">
          <ACard className="p-5">
            <SectionHeader title="Resume Upload Activity" subtitle="Uploads per day this week" />
            <BarChart
              data={weeklyVisits.map(d => ({ ...d, uploads: Math.round(d.users * 0.18) }))}
              xKey="day" yKey="uploads" color="#3b82f6" height={130}
            />
          </ACard>
          <ACard className="p-5">
            <SectionHeader title="Job Application Tracking" subtitle="Applications tracked per day" />
            <BarChart
              data={weeklyVisits.map(d => ({ ...d, apps: Math.round(d.users * 0.31) }))}
              xKey="day" yKey="apps" color="#8b5cf6" height={130}
            />
          </ACard>
        </div>
      </div>
    </AdminLayout>
  )
}
