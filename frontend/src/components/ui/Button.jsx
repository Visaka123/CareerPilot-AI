import { motion } from 'framer-motion'
import { cn } from '../../utils'

export function Button({ children, variant = 'primary', size = 'md', loading = false, className, ...props }) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-base' }
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 border border-transparent',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}

export function IconButton({ icon: Icon, label, className, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      title={label}
      className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all',
        className
      )}
      {...props}
    >
      <Icon size={18} />
    </motion.button>
  )
}
