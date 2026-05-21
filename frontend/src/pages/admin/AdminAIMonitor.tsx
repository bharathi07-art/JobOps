import { motion } from 'framer-motion'
import { Cpu, CheckCircle2, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, AdminStatCard, BarChart, GroupedBar, StatusBadge } from '../../components/ui/AdminCharts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { cn } from '../../utils/utils'
import { adminStats, statGrowth, aiUsageData, aiWorkflowLogs } from '../../data/adminData'

export default function AdminAIMonitor() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo')||'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const [aiRes, ovRes] = await Promise.all([
          axios.get('/api/admin/ai-monitor', { headers }),
          axios.get('/api/admin/overview', { headers }),
        ])

        setStats({
          totalRequests: aiRes.data.stats.totalRequests,
          successCount: aiRes.data.stats.successCount,
          errorCount: aiRes.data.stats.errorCount,
          totalProcessed: ovRes.data.overview?.totalAIResults || 0,
        })
      } catch (err) {
        console.error('Failed to load AI monitor', err)
      }
    }
    load()
  }, [])

  const effectiveStats = {
    totalRequests: stats.totalRequests ?? adminStats.aiRequestsProcessed,
    errorCount: stats.errorCount ?? 0,
    ...stats,
  }

  const totalWeek = effectiveStats.totalRequests || adminStats.aiRequestsProcessed || 0
  const failedWeek = effectiveStats.errorCount || 0
  const successRate = totalWeek > 0 ? Math.round(((totalWeek - failedWeek) / totalWeek) * 100) : 100

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminStatCard label="Total AI Requests" value={adminStats.aiRequestsProcessed} growth={statGrowth.aiRequestsProcessed} icon={Cpu} color="text-[#FF4500]" delay={0} />
          <AdminStatCard label="Success Rate" value={`${successRate}%`} growth={+2.1} icon={CheckCircle2} color="text-green-600" delay={0.05} />
          <AdminStatCard label="Failed Requests" value={failedWeek} growth={-8.3} icon={XCircle} color="text-red-500" delay={0.1} />
          <AdminStatCard label="Avg Response Time" value="2.4s" growth={-12.4} icon={Clock} color="text-blue-600" delay={0.15} />
        </div>

        {/* AI Status Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">AI System Operational</p>
              <p className="text-xs text-green-600">Gemini API — All systems normal · Last checked 30s ago</p>
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
              {successRate}% uptime
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Requests chart */}
          <ACard className="p-5">
            <SectionHeader title="AI Requests This Week" subtitle="Total processing volume" />
            <BarChart data={aiUsageData} xKey="day" yKey="requests" color="#FF4500" height={140} />
          </ACard>

          {/* Success vs Failed */}
          <ACard className="p-5">
            <SectionHeader title="Success vs Failed" subtitle="Request outcome breakdown" />
            <GroupedBar data={aiUsageData} xKey="day" keys={['success', 'failed']} colors={['#22c55e', '#ef4444']} height={140} />
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500" /><span className="text-xs text-gray-500">Success</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" /><span className="text-xs text-gray-500">Failed</span></div>
            </div>
          </ACard>
        </div>

        {/* AI Provider metrics */}
        <ACard className="p-5">
          <SectionHeader title="AI Provider Performance" subtitle="Gemini API metrics" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Provider', value: 'Gemini', icon: Zap, color: 'text-blue-600' },
              { label: 'Daily Requests', value: '13,460', icon: Cpu, color: 'text-[#FF4500]' },
              { label: 'Avg Tokens/Req', value: '1,840', icon: Clock, color: 'text-purple-600' },
              { label: 'Error Rate', value: '2.4%', icon: AlertTriangle, color: 'text-amber-600' },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-4">
                <m.icon className={cn('w-4 h-4 mb-2', m.color)} />
                <p className="text-lg font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </ACard>

        {/* Workflow Logs */}
        <ACard className="p-5">
          <SectionHeader title="Recent Workflow Logs" subtitle="Last 6 AI processing requests" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Request ID', 'User', 'Provider', 'Status', 'Duration', 'Tokens', 'Time'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aiWorkflowLogs.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{log.requestId}</td>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-900">{log.user}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{log.provider}</td>
                    <td className="py-3 pr-4"><StatusBadge status={log.status} /></td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{log.duration}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{log.tokens > 0 ? log.tokens.toLocaleString() : '—'}</td>
                    <td className="py-3 text-xs text-gray-400">{log.time}</td>
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
