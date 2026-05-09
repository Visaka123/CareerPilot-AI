import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase, FileText, MessageSquare, Target, Zap,
  ArrowRight, Clock, CheckCircle, AlertCircle, Star, Brain, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card, StatCard, SkeletonCard } from '../../components/ui/Card'
import { ProgressBar, ScoreRing } from '../../components/ui/Progress'
import { useAuthStore } from '../../store'
import { dashboardService, applicationService, interviewService } from '../../services'
import { formatRelativeTime } from '../../utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [weeklyChart, setWeeklyChart] = useState([])
  const [activity, setActivity] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [appStats, setAppStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [statsRes, chartRes, activityRes, recsRes, appStatsRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getWeeklyChart(),
        dashboardService.getActivity(),
        dashboardService.getRecommendations(),
        applicationService.getStats(),
      ])

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
      if (chartRes.status === 'fulfilled') setWeeklyChart(chartRes.value.data || [])
      if (activityRes.status === 'fulfilled') setActivity(activityRes.value.data || [])
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data || [])
      if (appStatsRes.status === 'fulfilled') setAppStats(appStatsRes.value.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const statCards = [
    { title: 'Career Score', value: stats?.careerScore ?? '—', icon: Star, color: '#6366f1', change: stats?.careerScoreChange },
    { title: 'Applications', value: appStats?.total ?? stats?.applications ?? '—', icon: Briefcase, color: '#8b5cf6', change: stats?.applicationsChange },
    { title: 'Interviews', value: stats?.interviews ?? '—', icon: MessageSquare, color: '#a78bfa', change: stats?.interviewsChange },
    { title: 'ATS Score', value: stats?.atsScore ? `${stats.atsScore}%` : '—', icon: FileText, color: '#4ade80', change: stats?.atsScoreChange },
  ]

  const skillData = stats?.topSkills || []

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Here's your career intelligence overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <Link to="/resume" className="btn-primary flex items-center gap-2 text-sm">
            <Zap size={15} /> Analyze Resume
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)
          : statCards.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
      </div>

      {/* Application funnel */}
      {appStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Applied', value: appStats.applied, color: '#6366f1' },
            { label: 'Interview', value: appStats.interview, color: '#facc15' },
            { label: 'Offer', value: appStats.offer, color: '#4ade80' },
            { label: 'Rejected', value: appStats.rejected, color: '#f87171' },
          ].map((item) => (
            <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Weekly Activity</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />Applications</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-400 inline-block" />Interviews</span>
              </div>
            </div>
            {loading ? (
              <div className="skeleton h-48 rounded-xl" />
            ) : weeklyChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyChart}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="applications" stroke="#6366f1" fill="url(#appGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="interviews" stroke="#a78bfa" fill="url(#intGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Briefcase size={32} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Start applying to see your activity chart</p>
                  <Link to="/jobs" className="text-primary-400 text-xs mt-1 inline-block hover:text-primary-300">Browse jobs</Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h3 className="font-semibold text-white mb-6">Career Readiness</h3>
          {loading ? (
            <div className="flex justify-center mb-6"><div className="skeleton w-28 h-28 rounded-full" /></div>
          ) : (
            <div className="flex justify-center mb-6">
              <ScoreRing score={stats?.careerScore || 0} label="Overall Score" />
            </div>
          )}
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-4 rounded" />)
              : skillData.length > 0
                ? skillData.slice(0, 4).map((s) => (
                  <ProgressBar key={s.skill} label={s.skill} value={s.value} />
                ))
                : (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm">Upload your resume to see skill scores</p>
                    <Link to="/resume" className="text-primary-400 text-xs mt-1 inline-block">Analyze Resume</Link>
                  </div>
                )
            }
          </div>
        </Card>
      </div>

      {/* AI Recommendations + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-primary-400" />
            <h3 className="font-semibold text-white">AI Recommendations</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    rec.priority === 'high' ? 'bg-red-400' : rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <p className="text-sm text-slate-300 leading-relaxed">{rec.text}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Brain size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Complete your profile to get AI recommendations</p>
              <Link to="/settings" className="text-primary-400 text-xs mt-1 inline-block">Update Profile</Link>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <Link to="/tracker" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : activity.length > 0 ? (
            <div className="space-y-2">
              {activity.slice(0, 6).map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'offer' ? 'bg-green-500/10' :
                    item.type === 'interview' ? 'bg-yellow-500/10' :
                    item.type === 'application' ? 'bg-primary-500/10' : 'bg-accent-500/10'
                  }`}>
                    {item.type === 'offer' ? <CheckCircle size={14} className="text-green-400" /> :
                     item.type === 'interview' ? <MessageSquare size={14} className="text-yellow-400" /> :
                     item.type === 'application' ? <Briefcase size={14} className="text-primary-400" /> :
                     <AlertCircle size={14} className="text-accent-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{item.text}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {formatRelativeTime(item.createdAt || item.time)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No activity yet. Start your job search!</p>
              <Link to="/jobs" className="text-primary-400 text-xs mt-1 inline-block">Browse Jobs</Link>
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/resume', icon: FileText, label: 'Analyze Resume', color: '#6366f1' },
          { to: '/jobs', icon: Briefcase, label: 'Find Jobs', color: '#8b5cf6' },
          { to: '/interview', icon: MessageSquare, label: 'Mock Interview', color: '#a78bfa' },
          { to: '/roadmap', icon: Target, label: 'Career Roadmap', color: '#c084fc' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}>
            <motion.div whileHover={{ y: -3 }} className="glass-card p-4 flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-sm font-medium text-slate-200">{label}</span>
              <ArrowRight size={14} className="text-slate-500 ml-auto" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
