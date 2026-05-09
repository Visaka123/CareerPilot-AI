import { motion } from 'framer-motion'
import { cn, getScoreColor } from '../../utils'

export function ScoreRing({ score, size = 120, strokeWidth = 8, label }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      {label && <p className="text-sm text-slate-400 font-medium">{label}</p>}
    </div>
  )
}

export function ProgressBar({ value, max = 100, label, color = '#6366f1', showValue = true }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-300">{label}</span>}
          {showValue && <span className="text-sm font-semibold" style={{ color }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function Badge({ children, variant = 'info', className }) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  )
}

export function Tag({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-white ml-0.5">×</button>
      )}
    </span>
  )
}
