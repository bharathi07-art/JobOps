import * as React from 'react'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../utils/utils'

// ── Stat Card ──────────────────────────────────────────────────────────────────
export function AdminStatCard({
  label, value, growth, icon: Icon, color = 'text-[#FF4500]', delay = 0
}: {
  label: string; value: string | number; growth: number
  icon: React.ElementType; color?: string; delay?: number
}) {
  const positive = growth >= 0
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      className="bg-white rounded-2xl border border-gray-100 p-5 cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50', color === 'text-blue-600' && 'bg-blue-50', color === 'text-green-600' && 'bg-green-50', color === 'text-purple-600' && 'bg-purple-50', color === 'text-amber-600' && 'bg-amber-50')}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <span className={cn('flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
          positive ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50')}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(growth)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </motion.div>
  )
}

// ── Bar Chart ──────────────────────────────────────────────────────────────────
export function BarChart({
  data, xKey, yKey, color = '#FF4500', label, height = 140
}: {
  data: Array<Record<string, number | string>>
  xKey: string; yKey: string; color?: string; label?: string; height?: number
}) {
  const max = Math.max(...data.map(d => Number(d[yKey] ?? 0)), 1)
  return (
    <div>
      {label && <p className="text-xs text-gray-400 mb-3">{label}</p>}
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end" style={{ height: height - 20 }}>
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${(Number(d[yKey]) / max) * (height - 20)}px` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                style={{ backgroundColor: color }}
                className="w-full rounded-t-md relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {typeof d[yKey] === 'number' ? d[yKey].toLocaleString() : d[yKey]}
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] text-gray-400">{d[xKey]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Line Chart (SVG) ───────────────────────────────────────────────────────────
export function LineChart({
  data, xKey, yKey, color = '#FF4500', height = 120
}: {
  data: Record<string, number | string>[]; xKey: string; yKey: string; color?: string; height?: number
}) {
  const numericValues = data.map(d => Number(d[yKey] ?? 0))
  const max = Math.max(...data.map(d => Number(d[yKey] ?? 0)), 1)
  const min = Math.min(...numericValues)
  const w = 100 / (data.length - 1)
  const pts = numericValues.map((v, i) => `${i * w},${height - ((v - min) / (max - min || 1)) * (height - 10) - 5}`)
  const polyline = pts.join(' ')
  const area = `0,${height} ${polyline} ${(data.length - 1) * w},${height}`

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polygon points={area} fill={`url(#grad-${yKey})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-gray-400">{d[xKey]}</span>
        ))}
      </div>
    </div>
  )
}

// ── Donut Chart ────────────────────────────────────────────────────────────────
export function DonutChart({ data, size = 120 }: {
  data: { label: string; value: number; color: string }[]; size?: number
}) {
  const total = data.reduce((a, b) => a + b.value, 0)

  // Guard: no data or all zeros — show empty state
  if (!data.length || total === 0) {
    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="shrink-0">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="18" />
          <circle cx="50" cy="50" r="28" fill="white" />
          <text x="50" y="46" textAnchor="middle" fontSize="8" fill="#94a3b8">No</text>
          <text x="50" y="57" textAnchor="middle" fontSize="8" fill="#94a3b8">data</text>
        </svg>
        <p className="text-xs text-gray-400">No subscription data yet</p>
      </div>
    )
  }

  const r = 40; const cx = 50; const cy = 50
  const circ = 2 * Math.PI * r

  const segments = data.map((seg, i) => {
    const pct = seg.value / total
    const dash = pct * circ
    const gap = circ - dash
    const rotate = (data.slice(0, i).reduce((acc, s) => acc + s.value / total, 0)) * 360 - 90
    return { seg, dash, gap, rotate, i }
  })

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="shrink-0">
        {segments.map(({ seg, dash, gap, rotate, i }) => (
            <motion.circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              transform={`rotate(${rotate} ${cx} ${cy})`}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${dash} ${gap}` }}
              transition={{ duration: 0.8, delay: i * 0.15 }} />
          ))}
        <circle cx={cx} cy={cy} r={28} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E1E1E">
          {total.toLocaleString()}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="5" fill="#94a3b8">Total</text>
      </svg>
      <div className="space-y-2">
        {data.map(seg => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-600">{seg.label}</span>
            <span className="text-xs font-semibold text-gray-900 ml-auto pl-4">{seg.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Grouped Bar ────────────────────────────────────────────────────────────────
export function GroupedBar({
  data, xKey, keys, colors, height = 140
}: {
  data: Record<string, number | string>[]; xKey: string
  keys: string[]; colors: string[]; height?: number
}) {
  const max = Math.max(...data.flatMap(d => keys.map(k => Number(d[k] ?? 0))), 1)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 w-full" style={{ height: height - 20 }}>
            {keys.map((k, ki) => (
              <motion.div key={k}
                initial={{ height: 0 }} animate={{ height: `${(Number(d[k]) / max) * (height - 20)}px` }}
                transition={{ duration: 0.6, delay: i * 0.04 + ki * 0.05 }}
                style={{ backgroundColor: colors[ki] }}
                className="flex-1 rounded-t-sm" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">{d[xKey]}</span>
        </div>
      ))}
    </div>
  )
}

// ── Admin Card wrapper ─────────────────────────────────────────────────────────
export function ACard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm', className)}>
      {children}
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Status Badge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    Expired: 'bg-red-100 text-red-600',
    Trial: 'bg-blue-100 text-blue-700',
    Free: 'bg-gray-100 text-gray-600',
    Success: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-600',
    Timeout: 'bg-amber-100 text-amber-700',
    Critical: 'bg-red-100 text-red-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', map[status] ?? 'bg-gray-100 text-gray-600')}>
      {status}
    </span>
  )
}
