import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Activity, PieChart } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, BarChart, LineChart, DonutChart, GroupedBar } from '../../components/ui/AdminCharts'
import { cn } from '../../utils/utils'
import axios from 'axios'

type ChartType = 'bar' | 'line' | 'area' | 'donut'

const chartTypes: { id: ChartType; label: string; icon: React.ElementType }[] = [
  { id: 'bar',   label: 'Bar',   icon: BarChart2 },
  { id: 'line',  label: 'Line',  icon: TrendingUp },
  { id: 'area',  label: 'Area',  icon: Activity },
  { id: 'donut', label: 'Donut', icon: PieChart },
]

export default function AdminAnalytics() {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [weeklyVisits, setWeeklyVisits] = useState<any[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [aiUsageData, setAiUsageData] = useState<any[]>([])
  const [subscriptionPieData, setSubscriptionPieData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || 'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const [ovRes, aiRes] = await Promise.all([
          axios.get('/api/admin/overview', { headers }),
          axios.get('/api/admin/ai-monitor', { headers }),
        ])
        setWeeklyVisits(ovRes.data.weeklyVisits || [])
        setMonthlyRevenue(ovRes.data.monthlyRevenue || [])
        setSubscriptionPieData(ovRes.data.subscriptionPieData || [])
        setAiUsageData(aiRes.data.aiUsageData || [])
      } catch (err) {
        console.error('AdminAnalytics load error', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function renderChart(data: any[], xKey: string, yKey: string, color: string) {
    if (loading) return <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
    if (chartType === 'donut') return <DonutChart data={subscriptionPieData} size={130} />
    if (chartType === 'line' || chartType === 'area') return <LineChart data={data} xKey={xKey} yKey={yKey} color={color} height={150} />
    return <BarChart data={data} xKey={xKey} yKey={yKey} color={color} height={150} />
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Platform Analytics</h2>
            <p className="text-xs text-gray-400 mt-0.5">Real data from your database</p>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {chartTypes.map(ct => (
              <button key={ct.id} onClick={() => setChartType(ct.id)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  chartType === ct.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                <ct.icon className="w-3.5 h-3.5" />{ct.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <motion.div key={`visits-${chartType}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ACard className="p-5">
              <SectionHeader title="Weekly Platform Activity" subtitle="Log events this week" />
              {renderChart(weeklyVisits, 'day', 'users', '#FF4500')}
            </ACard>
          </motion.div>

          <motion.div key={`revenue-${chartType}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <ACard className="p-5">
              <SectionHeader title="Monthly Revenue" subtitle="Subscription revenue ($)" />
              {loading
                ? <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
                : chartType === 'donut'
                  ? <DonutChart data={subscriptionPieData} size={130} />
                  : chartType === 'line' || chartType === 'area'
                    ? <LineChart data={monthlyRevenue} xKey="month" yKey="revenue" color="#22c55e" height={150} />
                    : <BarChart data={monthlyRevenue} xKey="month" yKey="revenue" color="#22c55e" height={150} />
              }
            </ACard>
          </motion.div>

          <motion.div key={`ai-${chartType}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ACard className="p-5">
              <SectionHeader title="AI Usage Activity" subtitle="Requests processed" />
              {loading
                ? <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
                : chartType === 'donut'
                  ? <DonutChart data={[
                      { label: 'Success', value: aiUsageData.reduce((s, d) => s + d.success, 0), color: '#22c55e' },
                      { label: 'Failed', value: aiUsageData.reduce((s, d) => s + d.failed, 0), color: '#ef4444' },
                    ]} size={130} />
                  : <GroupedBar data={aiUsageData} xKey="day" keys={['success', 'failed']} colors={['#22c55e', '#ef4444']} height={150} />
              }
            </ACard>
          </motion.div>

          <motion.div key={`subs-${chartType}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <ACard className="p-5">
              <SectionHeader title="Subscription Distribution" subtitle="Plan breakdown" />
              {loading
                ? <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
                : <DonutChart data={subscriptionPieData} size={130} />
              }
            </ACard>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}
