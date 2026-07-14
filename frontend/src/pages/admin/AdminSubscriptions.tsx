
import { motion } from 'framer-motion'
import { Search, Download, CreditCard, Users, TrendingUp, DollarSign } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { ACard, SectionHeader, AdminStatCard, DonutChart, StatusBadge } from '../../components/ui/AdminCharts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { cn } from '../../utils/utils'

// plan filters will be computed from live subscription data

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subscriptionPieData, setSubscriptionPieData] = useState<any[]>([])
  const [adminStats, setAdminStats] = useState<any>({})
  const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, monthlyRevenue: 0 })
  const statGrowth = { totalSubscribers: 0, monthlySubscribers: 0, yearlySubscribers: 0 }
  const [planFilters, setPlanFilters] = useState<string[]>(['All'])
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        const token = (() => { try { return JSON.parse(localStorage.getItem('userInfo')||'null')?.token } catch { return null } })()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const subsRes = await axios.get('/api/admin/subscriptions', { headers })

        const subs = subsRes.data.subscriptions || []
        setSubscriptions(subs)
        setAdminStats({ totalSubscribers: subs.filter((s: any) => s.plan === 'Yearly' || s.plan === 'Monthly').length, monthlySubscribers: subs.filter((s:any)=>s.plan==='Monthly').length, yearlySubscribers: subs.filter((s:any)=>s.plan==='Yearly').length })
        setRevenueStats({ totalRevenue: subsRes.data.totalRevenue ?? 0, monthlyRevenue: subsRes.data.monthlyRevenue ?? 0 })
        setSubscriptionPieData(Object.entries(subs.reduce((acc:any, s:any) => { acc[s.plan] = (acc[s.plan]||0) + 1; return acc }, {})).map(([label, value])=>({ label, value, color: '#94a3b8' })))
        setPlanFilters(['All', ...(Array.from(new Set(subs.map((s: any) => s.plan).filter(Boolean))) as string[])])
      } catch (err) {
        console.error('Failed to load subscriptions', err)
      }
    }
    load()
  }, [])

  const filtered = subscriptions.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'All' || s.plan === planFilter || s.status === planFilter
    return matchSearch && matchPlan
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Revenue stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminStatCard label="Total Subscribers" value={adminStats.totalSubscribers ?? 0} growth={statGrowth.totalSubscribers ?? 0} icon={Users} color="text-[#FF4500]" delay={0} />
          <AdminStatCard label="Monthly Revenue" value={`$${revenueStats.monthlyRevenue.toLocaleString()}`} growth={0} icon={DollarSign} color="text-green-600" delay={0.05} />
          <AdminStatCard label="Yearly Subscribers" value={adminStats.yearlySubscribers ?? 0} growth={statGrowth.yearlySubscribers ?? 0} icon={TrendingUp} color="text-purple-600" delay={0.1} />
          <AdminStatCard label="Monthly Subscribers" value={adminStats.monthlySubscribers ?? 0} growth={statGrowth.monthlySubscribers ?? 0} icon={CreditCard} color="text-blue-600" delay={0.15} />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Donut */}
          <ACard className="p-5">
            <SectionHeader title="Plan Distribution" />
            <DonutChart data={subscriptionPieData} size={120} />
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Free', value: '81.8%', color: 'text-gray-500' },
                { label: 'Monthly', value: '14.6%', color: 'text-[#FF4500]' },
                { label: 'Yearly', value: '3.6%', color: 'text-amber-500' },
              ].map(s => (
                <div key={s.label}>
                  <p className={cn('text-base font-bold', s.color)}>{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </ACard>

          {/* Revenue breakdown */}
          <ACard className="p-5 lg:col-span-2">
            <SectionHeader title="Revenue Breakdown" subtitle="Estimated metrics" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Revenue', value: `$${revenueStats.totalRevenue.toLocaleString()}`, change: '', positive: true },
                { label: 'Monthly Revenue', value: `$${revenueStats.monthlyRevenue.toLocaleString()}`, change: '', positive: true },
                { label: 'Monthly Subscribers', value: String(adminStats.monthlySubscribers ?? 0), change: '', positive: true },
                { label: 'Yearly Subscribers', value: String(adminStats.yearlySubscribers ?? 0), change: '', positive: true },
                { label: 'Total Paid', value: String(adminStats.totalSubscribers ?? 0), change: '', positive: true },
                { label: 'Free Users', value: String(subscriptions.filter((s:any) => s.plan === 'Free').length), change: '', positive: true },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{m.value}</p>
                  <p className={cn('text-xs font-medium mt-0.5', m.positive ? 'text-green-600' : 'text-red-500')}>{m.change}</p>
                </div>
              ))}
            </div>
          </ACard>
        </div>

        {/* Subscriber Table */}
        <ACard className="p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-5">
            <SectionHeader title="Subscriber Management" subtitle={`${filtered.length} subscribers`} />
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="pl-8 pr-3 h-8 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#FF4500] w-44" />
              </div>
              <button className="flex items-center gap-1.5 px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-[#FF4500] transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mb-4">
                {planFilters.map(f => (
              <button key={f} onClick={() => setPlanFilter(f)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all',
                  planFilter === f ? 'bg-[#FF4500] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Plan', 'Billing', 'Start Date', 'Expiry', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-[#FF4500] shrink-0">
                          {s.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{s.name}</p>
                          <p className="text-[10px] text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-700">{s.plan}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{s.billing}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{s.startDate}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{s.expiry}</td>
                    <td className="py-3 pr-4 text-xs font-semibold text-gray-900">
                      {s.amount > 0 ? `$${s.amount}` : '—'}
                    </td>
                    <td className="py-3"><StatusBadge status={s.status} /></td>
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
