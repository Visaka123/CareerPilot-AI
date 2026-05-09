import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store'
import { authService } from '../../services'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      // After interceptor unwrap: res.data = { user, token }
      const res = await authService.login(form)
      setAuth(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (role = 'user') => {
    const creds = role === 'admin'
      ? { email: 'admin@careerpilot.ai', password: 'demo123' }
      : { email: 'demo@careerpilot.ai', password: 'demo123' }
    setLoading(true)
    try {
      const res = await authService.login(creds)
      setAuth(res.data.user, res.data.token)
      toast.success('Welcome to the demo!')
      navigate('/dashboard')
    } catch {
      // Offline fallback for demo without backend
      setAuth(
        { id: 1, name: 'Alex Morgan', email: creds.email, role: role === 'admin' ? 'ADMIN' : 'USER', plan: 'PRO' },
        'demo-offline-token'
      )
      toast.success('Demo mode (offline)')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your CareerPilot AI account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-field pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/8" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-surface-700 text-slate-500 text-xs">or try demo</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => demoLogin('user')} className="btn-secondary py-2.5 rounded-xl text-sm">
            Demo User
          </button>
          <button onClick={() => demoLogin('admin')} className="btn-secondary py-2.5 rounded-xl text-sm">
            Demo Admin
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
