import { motion } from 'framer-motion'
import { Cpu, CheckCircle2, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, AdminStatCard, GroupedBar, StatusBadge } from '../../components/ui/AdminCharts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { cn } from '../../utils/utils'

export default function AdminAIMonitor() {
  const [stats, setStats] = useState<any>({})
  const [aiUsageData, setAiUsageData] = useState<any[]>([])
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || 'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get('/api/admin/ai-monitor', { headers })
        setStats(res.data.stats || {})
        setAiUsageData(res.data.aiUsageData || [])
        setRecentLogs(res.data.recentLogs || [])
      } catch (err) {
        console.error('Failed to load AI monitor', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const total = stats.totalRequests ?? 0
  const failed = stats.errorCount ?? 0
  const successRate = total > 0 ? Math.round(((total - failed) / total) * 100) : 100

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminStatCard label="Total AI Requests" value={total} growth={0} icon={Cpu} color="text-[#FF4500]" delay={0} />
          <AdminStatCard label="Success Rate" value={`${successRate}%`} growth={0} icon={CheckCircle2} color="text-green-600" delay={0.05} />
          <AdminStatCard label="Failed Requests" value={failed} growth={0} icon={XCircle} color="text-red-500" delay={0.1} />
          <AdminStatCard label="Successful" value={stats.successCount ?? 0} growth={0} icon={Clock} color="text-blue-600" delay={0.15} />
        </div>

        {/* AI Status Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">AI System Operational</p>
              <p className="text-xs text-green-600">Gemini API · {successRate}% success rate</p>
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
              {successRate}% uptime
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Success vs Failed chart */}
          <ACard className="p-5">
            <SectionHeader title="Success vs Failed This Week" subtitle="Request outcome breakdown" />
            {loading
              ? <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
              : aiUsageData.length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No AI requests yet</p>
                : <GroupedBar data={aiUsageData} xKey="day" keys={['success', 'failed']} colors={['#22c55e', '#ef4444']} height={140} />
            }
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500" /><span className="text-xs text-gray-500">Success</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" /><span className="text-xs text-gray-500">Failed</span></div>
            </div>
          </ACard>

          {/* AI Provider metrics */}
          <ACard className="p-5">
            <SectionHeader title="AI Provider Performance" subtitle="Gemini API metrics" />
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: 'Provider', value: 'Gemini', icon: Zap, color: 'text-blue-600' },
                { label: 'Total Requests', value: total, icon: Cpu, color: 'text-[#FF4500]' },
                { label: 'Success Count', value: stats.successCount ?? 0, icon: CheckCircle2, color: 'text-green-600' },
                { label: 'Error Rate', value: total > 0 ? `${Math.round((failed / total) * 100)}%` : '0%', icon: AlertTriangle, color: 'text-amber-600' },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-4">
                  <m.icon className={cn('w-4 h-4 mb-2', m.color)} />
                  <p className="text-lg font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </ACard>
        </div>

        {/* Workflow Logs */}
        <ACard className="p-5">
          <SectionHeader title="Recent AI Logs" subtitle="Latest AI processing requests" />
          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : recentLogs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No AI logs yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Request ID', 'User', 'Provider', 'Status', 'Time'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log, i) => (
                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-gray-500">{log.requestId}</td>
                      <td className="py-3 pr-4 text-xs font-medium text-gray-900">{log.user}</td>
                      <td className="py-3 pr-4 text-xs text-gray-600">{log.provider}</td>
                      <td className="py-3 pr-4"><StatusBadge status={log.status} /></td>
                      <td className="py-3 text-xs text-gray-400">{log.time}</td>
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
