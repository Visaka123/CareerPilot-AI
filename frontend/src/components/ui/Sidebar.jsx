import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Briefcase, MessageSquare, Map, BarChart3,
  Settings, Bell, LogOut, ChevronLeft, ChevronRight, Users, Link2,
  Zap, Target, TrendingUp, Menu, X, Brain
} from 'lucide-react'
const Linkedin = Link2
import { useAuthStore, useNotificationStore } from '../../store'
import { cn } from '../../utils'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { path: '/jobs', icon: Briefcase, label: 'Job Matching' },
  { path: '/jobs/live-scan', icon: Zap, label: 'Live Market Scan' },
  { path: '/interview', icon: MessageSquare, label: 'Mock Interview' },
  { path: '/tracker', icon: Target, label: 'App Tracker' },
  { path: '/roadmap', icon: Map, label: 'Career Roadmap' },
  { path: '/linkedin', icon: Linkedin, label: 'LinkedIn AI' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

const adminItems = [
  { path: '/admin', icon: Users, label: 'Admin Panel' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/5', collapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
          <Brain size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-white text-sm">CareerPilot</span>
            <span className="gradient-text font-bold text-sm"> AI</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/')
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'active text-primary-400' : 'text-slate-400 hover:text-slate-200',
                collapsed && 'justify-center'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}

        {user?.role === 'ADMIN' && (
          <>
            <div className={cn('px-3 py-2 text-xs text-slate-600 font-semibold uppercase tracking-wider', collapsed && 'hidden')}>
              Admin
            </div>
            {adminItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  location.pathname === path ? 'active text-primary-400' : 'text-slate-400 hover:text-slate-200',
                  collapsed && 'justify-center'
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-white/5 p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 bg-surface-800 border-r border-white/5"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 bg-surface-800 border-r border-white/5 overflow-hidden"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-600 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>
    </>
  )
}
