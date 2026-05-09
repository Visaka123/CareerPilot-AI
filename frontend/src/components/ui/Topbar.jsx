import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, Sun, Moon, LogOut, User, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useThemeStore, useNotificationStore } from '../../store'
import { formatRelativeTime } from '../../utils'

export default function Topbar({ title }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { notifications, unreadCount, markAllRead } = useNotificationStore()
  const navigate = useNavigate()

  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-slate-500" />
          <input
            placeholder="Search anything..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all relative"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 glass-card z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <span className="font-semibold text-white text-sm">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-8">No notifications</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/3 transition-colors ${!n.read ? 'bg-primary-500/5' : ''}`}>
                        <p className="text-sm text-slate-200">{n.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold"
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-12 w-52 glass-card z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-white/5">
                  <p className="font-semibold text-white text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                    <Settings size={14} /> Settings
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/login') }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
