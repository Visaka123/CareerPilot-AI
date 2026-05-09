import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Briefcase, Clock, CheckCircle, XCircle, Calendar,
  MoreHorizontal, Filter, Search, Trash2, Edit3, X, Loader
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { applicationService } from '../../services'
import { formatDate, getStatusBadge } from '../../utils'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'APPLIED', label: 'Applied', color: '#6366f1' },
  { id: 'INTERVIEW', label: 'Interview', color: '#facc15' },
  { id: 'OFFER', label: 'Offer', color: '#4ade80' },
  { id: 'REJECTED', label: 'Rejected', color: '#f87171' },
]

const STATUS_OPTIONS = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'SAVED']

const EMPTY_FORM = { company: '', role: '', status: 'APPLIED', salary: '', notes: '', jobUrl: '' }

export default function ApplicationTrackerPage() {
  const [apps, setApps] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban')
  const [showAdd, setShowAdd] = useState(false)
  const [editApp, setEditApp] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)

  const loadApps = useCallback(async () => {
    try {
      const [appsRes, statsRes] = await Promise.allSettled([
        applicationService.getAll(),
        applicationService.getStats(),
      ])
      if (appsRes.status === 'fulfilled') setApps(appsRes.value.data || [])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadApps() }, [loadApps])

  const openAdd = () => { setForm(EMPTY_FORM); setEditApp(null); setShowAdd(true) }
  const openEdit = (app) => {
    setForm({
      company: app.company || '',
      role: app.role || '',
      status: app.status || 'APPLIED',
      salary: app.salary || '',
      notes: app.notes || '',
      jobUrl: app.jobUrl || '',
    })
    setEditApp(app)
    setShowAdd(true)
    setOpenMenu(null)
  }

  const saveApp = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error('Company and role are required')
      return
    }
    setSaving(true)
    try {
      if (editApp) {
        const res = await applicationService.update(editApp.id, form)
        setApps((prev) => prev.map((a) => a.id === editApp.id ? res.data : a))
        toast.success('Application updated')
      } else {
        const res = await applicationService.create(form)
        setApps((prev) => [res.data, ...prev])
        toast.success('Application added')
      }
      // Refresh stats
      applicationService.getStats().then((r) => setStats(r.data || {})).catch(() => {})
      setShowAdd(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save application')
    } finally {
      setSaving(false)
    }
  }

  const deleteApp = async (id) => {
    if (!confirm('Delete this application?')) return
    try {
      await applicationService.delete(id)
      setApps((prev) => prev.filter((a) => a.id !== id))
      applicationService.getStats().then((r) => setStats(r.data || {})).catch(() => {})
      toast.success('Application deleted')
    } catch {
      toast.error('Failed to delete')
    }
    setOpenMenu(null)
  }

  const updateStatus = async (id, status) => {
    // Optimistic update
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
    try {
      await applicationService.update(id, { status })
      applicationService.getStats().then((r) => setStats(r.data || {})).catch(() => {})
    } catch {
      toast.error('Failed to update status')
      loadApps()
    }
  }

  const filtered = apps.filter((a) =>
    !search ||
    a.company?.toLowerCase().includes(search.toLowerCase()) ||
    a.role?.toLowerCase().includes(search.toLowerCase())
  )

  const byStatus = (status) => filtered.filter((a) => a.status === status)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={24} className="animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Application Tracker</h2>
          <p className="text-slate-400 text-sm mt-1">{apps.length} total applications tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/4 border border-white/8 rounded-xl p-1">
            {['kanban', 'list'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  view === v ? 'bg-primary-500/20 text-primary-400' : 'text-slate-400'
                }`}>
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={openAdd}>
            <Plus size={15} /> Add Application
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {COLUMNS.map((col) => (
          <Card key={col.id} className="p-4">
            <p className="text-xs text-slate-400 mb-1">{col.label}</p>
            <p className="text-2xl font-bold" style={{ color: col.color }}>
              {stats[col.id.toLowerCase()] ?? byStatus(col.id).length}
            </p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 max-w-sm">
        <Search size={15} className="text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applications..."
          className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1"
        />
        {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-500" /></button>}
      </div>

      {apps.length === 0 ? (
        <Card className="text-center py-16">
          <Briefcase size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-300 font-semibold text-lg">No applications yet</p>
          <p className="text-slate-500 text-sm mt-2 mb-6">Start tracking your job applications to stay organized</p>
          <Button onClick={openAdd}><Plus size={15} /> Add Your First Application</Button>
        </Card>
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-semibold text-slate-300">{col.label}</span>
                <span className="text-xs text-slate-500 ml-auto bg-white/5 px-2 py-0.5 rounded-full">
                  {byStatus(col.id).length}
                </span>
              </div>
              <div className="space-y-2 min-h-24">
                <AnimatePresence>
                  {byStatus(col.id).map((app) => (
                    <motion.div key={app.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-card p-4 cursor-pointer hover:border-white/15 transition-all relative group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {app.company?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === app.id ? null : app.id)}
                            className="text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {openMenu === app.id && (
                            <div className="absolute right-0 top-6 w-36 glass-card py-1 z-10">
                              <button onClick={() => openEdit(app)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">
                                <Edit3 size={12} /> Edit
                              </button>
                              {STATUS_OPTIONS.filter((s) => s !== app.status).map((s) => (
                                <button key={s} onClick={() => { updateStatus(app.id, s); setOpenMenu(null) }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 capitalize">
                                  Move to {s.toLowerCase()}
                                </button>
                              ))}
                              <button onClick={() => deleteApp(app.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white leading-tight">{app.role}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{app.company}</p>
                      {app.salary && <p className="text-xs text-primary-400 mt-1">{app.salary}</p>}
                      <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(app.appliedDate)}
                      </p>
                      {app.notes && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{app.notes}</p>}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {byStatus(col.id).length === 0 && (
                  <div className="border-2 border-dashed border-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-600">No applications</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Company', 'Role', 'Status', 'Applied', 'Salary', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((app) => {
                  const badge = getStatusBadge(app.status?.toLowerCase())
                  return (
                    <tr key={app.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-white text-xs font-bold">
                            {app.company?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-medium text-white">{app.company}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-300">{app.role}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="text-xs bg-transparent border border-white/10 rounded-lg px-2 py-1 text-slate-300"
                          style={{ background: '#13131f' }}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{formatDate(app.appliedDate)}</td>
                      <td className="py-3 pr-4 text-sm text-primary-400">{app.salary || '—'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(app)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => deleteApp(app.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editApp ? 'Edit Application' : 'Add Application'}>
        <div className="space-y-4">
          {[
            { key: 'company', label: 'Company *', placeholder: 'e.g. Google' },
            { key: 'role', label: 'Role *', placeholder: 'e.g. Software Engineer' },
            { key: 'salary', label: 'Salary Range', placeholder: 'e.g. $120K - $160K' },
            { key: 'jobUrl', label: 'Job URL', placeholder: 'https://...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-field"
                placeholder={placeholder}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-field"
              style={{ background: '#13131f' }}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Any notes about this application..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveApp} loading={saving} className="flex-1">
              {editApp ? 'Save Changes' : 'Add Application'}
            </Button>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
