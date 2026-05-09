import { motion } from 'framer-motion'
import { cn } from '../../utils'

export function Card({ children, className, hover = false, glow = false, ...props }) {
  return (
    <motion.div
      className={cn(
        'glass-card p-6',
        hover && 'card-hover cursor-pointer',
        glow && 'glow-primary',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ title, value, change, icon: Icon, color = '#6366f1', loading = false }) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
          {loading ? (
            <div className="skeleton h-8 w-24 mb-2" />
          ) : (
            <p className="text-2xl font-bold text-white">{value}</p>
          )}
          {change !== undefined && (
            <p className={cn('text-xs mt-1', change >= 0 ? 'text-green-400' : 'text-red-400')}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </Card>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <Card>
      <div className="skeleton h-4 w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-3 mb-2', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </Card>
  )
}
