import { forwardRef } from 'react'
import { cn } from '../../utils'

export const Input = forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Icon size={16} />
        </div>
      )}
      <input
        ref={ref}
        className={cn('input-field', Icon && 'pl-10', error && 'border-red-500/50', className)}
        {...props}
      />
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
))

export const Textarea = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
    <textarea
      ref={ref}
      className={cn('input-field resize-none', error && 'border-red-500/50', className)}
      {...props}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
))

export function Select({ label, error, options = [], className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <select
        className={cn('input-field', error && 'border-red-500/50', className)}
        style={{ background: '#13131f' }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
