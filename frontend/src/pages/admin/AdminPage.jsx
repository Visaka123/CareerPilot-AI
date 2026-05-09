import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, Users, TrendingUp, Activity, Briefcase, FileText,
  MessageSquare, Map, Shield, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Card, StatCard } from '../../components/ui/Card'
import { adminService } from '../../services'

const MOCK_STATS = {
  totalUsers: 12847,
  activeUsers: 3421,
  totalApplications: 48293,
  totalResumes: 15632,
  totalInterviews: 8941,
  totalRoadmaps: 6234,
}

const USER_GROWTH = [
  { month: 'Aug', users: 4200 },
  { month: 'Sep', users: 5800 },
  { month: 'Oct', users: 7200 },
  { month: 'Nov', users: 9100 },
  { month: 'Dec', users: 11000 },
  { month: 'Jan', users: 12847 },
]

const FEATURE_USAGE = [
  { name: 'Resume Analyzer', value: 35, color: '#6366f1' },
  { name: 'Job Matching', value: 28, color: '#8b5cf6' },
  { name: 'Mock Interview', value: 20, color: '#a78bfa' },
  { name: 'Career Roadmap', value: 17, color: '#c084fc' },
]

const RECENT_USERS = [
  { name: 'Alex Morgan', email: 'alex@example.com', plan: 'Pro', joined: '2h ago', status: 'active' },
  { name: 'Sarah Chen', email: 'sarah@example.com', plan: 'Free', joined: '5h ago', status: 'active' },
  { name: 'Marcus Johnson', email: 'marcus@example.com', plan: 'Pro', joined: '1d ago', status: 'active' },
  { name: 'Priya Sharma', email: 'priya@example.com', plan: 'Enterprise', joined: '2d ago', status: 'active' },
  { name: 'James Wilson', email: 'james@example.com', plan: 'Free', joined: '3d ago', status: 'inactive' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color || '#6366f1' }}>{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [loading, setLoading] = useState(false)

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: '#6366f1', change: 18 },
    { title: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Activity, color: '#8b5cf6', change: 12 },
    { title: 'Applications', value: stats.totalApplications.toLocaleString(), icon: Briefcase, color: '#a78bfa', change: 24 },
    { title: 'Resumes Analyzed', value: stats.totalResumes.toLocaleString(), icon: FileText, color: '#4ade80', change: 31 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Platform analytics and user management</p>
        </div>
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-white mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={USER_GROWTH}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#userGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold text-white mb-4">Feature Usage</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={FEATURE_USAGE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {FEATURE_USAGE.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {FEATURE_USAGE.map((f) => (
              <div key={f.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                  <span className="text-slate-400">{f.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{f.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Recent Users</h3>
          <button className="text-xs text-primary-400 hover:text-primary-300">View all users</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Email', 'Plan', 'Joined', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RECENT_USERS.map((user) => (
                <tr key={user.email} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-400">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${user.plan === 'Pro' ? 'badge-info' : user.plan === 'Enterprise' ? 'badge-purple' : 'badge-warning'}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-400">{user.joined}</td>
                  <td className="py-3">
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
