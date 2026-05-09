import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Card } from '../../components/ui/Card'
import { ScoreRing, ProgressBar } from '../../components/ui/Progress'

const MONTHLY_DATA = [
  { month: 'Aug', applications: 8, interviews: 2, offers: 0 },
  { month: 'Sep', applications: 12, interviews: 4, offers: 1 },
  { month: 'Oct', applications: 15, interviews: 5, offers: 1 },
  { month: 'Nov', applications: 10, interviews: 6, offers: 2 },
  { month: 'Dec', applications: 6, interviews: 3, offers: 1 },
  { month: 'Jan', applications: 18, interviews: 8, offers: 2 },
]

const SKILL_RADAR = [
  { skill: 'React', score: 88 },
  { skill: 'Node.js', score: 72 },
  { skill: 'Python', score: 65 },
  { skill: 'SQL', score: 80 },
  { skill: 'AWS', score: 55 },
  { skill: 'TypeScript', score: 70 },
]

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

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Career Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Deep insights into your career progress</p>
        </div>
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors border border-white/10 px-3 py-2 rounded-xl">
          <Download size={14} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Career Score', score: 87 },
          { label: 'Interview Score', score: 82 },
          { label: 'Resume Score', score: 92 },
          { label: 'Skill Score', score: 74 },
        ].map((item) => (
          <Card key={item.label} className="flex justify-center py-2">
            <ScoreRing score={item.score} size={100} label={item.label} />
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-white mb-4">Application Funnel</h3>
          <div className="space-y-3">
            {[
              { label: 'Applications Sent', value: 69, total: 69, color: '#6366f1' },
              { label: 'Responses Received', value: 28, total: 69, color: '#8b5cf6' },
              { label: 'Interviews Scheduled', value: 18, total: 69, color: '#a78bfa' },
              { label: 'Final Rounds', value: 8, total: 69, color: '#facc15' },
              { label: 'Offers Received', value: 3, total: 69, color: '#4ade80' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
                <ProgressBar value={(item.value / item.total) * 100} color={item.color} showValue={false} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interviews" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="offers" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-white mb-4">Skill Proficiency</h3>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={SKILL_RADAR}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {SKILL_RADAR.map((s) => (
              <ProgressBar
                key={s.skill}
                label={s.skill}
                value={s.score}
                color={s.score >= 80 ? '#4ade80' : s.score >= 65 ? '#facc15' : '#f87171'}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
