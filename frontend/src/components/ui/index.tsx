import { cn } from '../../utils/utils'
export { Button } from './Button'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-card rounded-xl border border-border shadow-sm text-foreground', className)} {...props}>
      {children}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground/80">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          className={cn(
            'w-full h-10 px-3 rounded-lg border border-border text-sm outline-none transition-colors bg-card text-foreground',
            'focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10',
            'placeholder:text-muted-foreground/60',
            icon && 'pl-10',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function SkeletonLoader({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)} />
}

export function StatCard({ label, value, change, positive, icon }: { label: string; value: string; change: string; positive: boolean; icon: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className={cn('text-xs mt-1', positive ? 'text-green-600' : 'text-red-500')}>{change}</p>
        </div>
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF4500]">
          {icon}
        </div>
      </div>
    </Card>
  )
}
