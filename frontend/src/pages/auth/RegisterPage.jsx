import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../store'
import { authService } from '../../services'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      // After interceptor unwrap: res.data = { user, token }
      const res = await authService.register(payload)
      setAuth(res.data.user, res.data.token)
      toast.success('Account created! Welcome to CareerPilot AI')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      toast.error(msg)
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: 'This email is already registered' })
      }
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        {key === 'name' && <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
        {key === 'email' && <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
        {(key === 'password' || key === 'confirmPassword') && (
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        )}
        <input
          type={key === 'password' ? (showPass ? 'text' : 'password') : key === 'confirmPassword' ? 'password' : type}
          value={form[key]}
          onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }) }}
          placeholder={placeholder}
          className={`input-field pl-10 ${errors[key] ? 'border-red-500/50' : ''}`}
          autoComplete={key === 'email' ? 'email' : key === 'password' ? 'new-password' : 'off'}
        />
        {key === 'password' && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-slate-400 text-sm">Start your AI-powered career journey</p>
        </div>

        <div className="flex gap-3 mb-6">
          {['Free forever plan', 'AI-powered insights', 'No credit card'].map((p) => (
            <div key={p} className="flex items-center gap-1 text-xs text-slate-400">
              <CheckCircle size={11} className="text-green-400 flex-shrink-0" />{p}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'Full Name', 'text', 'Alex Morgan')}
          {field('email', 'Email', 'email', 'you@example.com')}
          {field('password', 'Password', 'password', 'Min. 8 characters')}
          {field('confirmPassword', 'Confirm Password', 'password', '••••••••')}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-4">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-400">Terms</a> and{' '}
          <a href="#" className="text-primary-400">Privacy Policy</a>
        </p>
        <p className="text-center text-sm text-slate-500 mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </motion.div>
  )
}
