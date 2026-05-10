import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Bookmark, BookmarkCheck, MapPin, Clock,
  DollarSign, Building, Zap, RefreshCw, ExternalLink, X, ChevronDown
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { jobService, applicationService } from '../../services'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

const FILTER_OPTIONS = {
  type: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
  experience: ['Entry Level', 'Mid Level', 'Senior', 'Staff', 'Lead'],
}

function getMatchColor(match) {
  if (!match) return '#64748b'
  if (match >= 85) return '#4ade80'
  if (match >= 70) return '#facc15'
  return '#fb923c'
}

function JobSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex gap-3">
        <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

export default function JobMatchingPage() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ type: '', experience: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applying, setApplying] = useState(false)
  const [autoApplying, setAutoApplying] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const searchTimer = useRef(null)

  const fetchJobs = useCallback(async (reset = false) => {
    if (reset) setLoading(true)
    try {
      const params = {
        page: reset ? 0 : page,
        size: 20,
        ...(search && { q: search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.experience && { experience: filters.experience }),
      }
      const res = search
        ? await jobService.search(params)
        : await jobService.getRecommended(params)

      const data = Array.isArray(res.data) ? res.data : res.data?.content || []
      if (reset) {
        setJobs(data)
        setPage(0)
      } else {
        setJobs((prev) => [...prev, ...data])
      }
      setHasMore(data.length === 20)
    } catch {
      if (reset) setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, filters, page])

  // Load saved jobs
  useEffect(() => {
    jobService.getSaved().then((res) => {
      const ids = new Set((res.data || []).map((j) => j.id || j.jobId))
      setSavedIds(ids)
    }).catch(() => {})
  }, [])

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchJobs(true), 400)
    return () => clearTimeout(searchTimer.current)
  }, [search, filters])

  const syncJobs = async () => {
    setSyncing(true)
    try {
      await jobService.syncExternal()
      toast.success('Jobs synced from external sources')
      fetchJobs(true)
    } catch {
      toast.error('Sync failed — showing cached jobs')
    } finally {
      setSyncing(false)
    }
  }

  const toggleSave = async (e, job) => {
    e.stopPropagation()
    const isSaved = savedIds.has(job.id)
    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev)
      isSaved ? next.delete(job.id) : next.add(job.id)
      return next
    })
    try {
      isSaved ? await jobService.unsave(job.id) : await jobService.save(job.id)
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved')
    } catch {
      // Revert
      setSavedIds((prev) => {
        const next = new Set(prev)
        isSaved ? next.add(job.id) : next.delete(job.id)
        return next
      })
      toast.error('Failed to update saved jobs')
    }
  }

  const applyToJob = async (job) => {
    setApplying(true)
    try {
      await applicationService.create({
        company: job.company,
        role: job.title,
        salary: job.salaryRange,
        jobUrl: job.applyUrl || '',
        notes: `Applied via CareerPilot AI. Source: ${job.source || 'Platform'}`,
      })
      toast.success(`Applied to ${job.title} at ${job.company}!`)
      // Open apply URL if available
      if (job.applyUrl) window.open(job.applyUrl, '_blank', 'noopener')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to track application')
    } finally {
      setApplying(false)
    }
  }

  const startAutoApply = async () => {
    setAutoApplying(true)
    try {
      const result = await applicationService.applyAllJobs()
      toast.success(`Auto-applied to ${result.length} jobs!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start auto-apply')
    } finally {
      setAutoApplying(false)
    }
  }

  const getSkillTags = (job) => {
    try {
      if (Array.isArray(job.requiredSkills)) return job.requiredSkills
      if (typeof job.requiredSkills === 'string') return JSON.parse(job.requiredSkills)
    } catch {}
    return []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">AI Job Matching</h2>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Loading jobs...' : `${jobs.length} jobs found`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
            size="sm"
            onClick={startAutoApply}
            loading={autoApplying}
          >
            <Zap size={14} /> Start Auto Apply
          </Button>
          <Button variant="secondary" size="sm" onClick={syncJobs} loading={syncing}>
            <RefreshCw size={14} /> Sync Jobs
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-slate-500 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies, skills..."
            className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={15} /> Filters
          {(filters.type || filters.experience) && (
            <span className="w-2 h-2 bg-primary-400 rounded-full" />
          )}
        </Button>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 capitalize">
                      {key}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilters((f) => ({ ...f, [key]: '' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          !filters[key] ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/4 text-slate-400 border border-white/8'
                        }`}
                      >
                        All
                      </button>
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFilters((f) => ({ ...f, [key]: f[key] === opt ? '' : opt }))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            filters[key] === opt ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/4 text-slate-400 border border-white/8 hover:text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {(filters.type || filters.experience) && (
                <button
                  onClick={() => setFilters({ type: '', experience: '' })}
                  className="mt-3 text-xs text-red-400 hover:text-red-300"
                >
                  Clear all filters
                </button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Job list */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <JobSkeleton key={i} />)
          ) : jobs.length === 0 ? (
            <Card className="text-center py-12">
              <Search size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No jobs found</p>
              <p className="text-slate-500 text-sm mt-1">Try different search terms or sync jobs</p>
              <Button className="mt-4" onClick={syncJobs} loading={syncing}>
                <RefreshCw size={14} /> Sync from External Sources
              </Button>
            </Card>
          ) : (
            <>
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  onClick={() => setSelectedJob(job)}
                  className={`glass-card p-5 cursor-pointer transition-all hover:border-primary-500/30 ${
                    selectedJob?.id === job.id ? 'border-primary-500/40 bg-primary-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {job.company?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm">{job.title}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{job.company}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                          {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                          {job.salaryRange && <span className="flex items-center gap-1"><DollarSign size={11} />{job.salaryRange}</span>}
                          {job.postedDate && <span className="flex items-center gap-1"><Clock size={11} />{job.postedDate}</span>}
                          {job.source && <span className="text-primary-500/60">{job.source}</span>}
                        </div>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {getSkillTags(job).slice(0, 4).map((tag) => (
                            <span key={tag} className="badge badge-info">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {job.matchScore != null && (
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: getMatchColor(job.matchScore) }}>
                            {job.matchScore}%
                          </p>
                          <p className="text-xs text-slate-500">match</p>
                        </div>
                      )}
                      <button
                        onClick={(e) => toggleSave(e, job)}
                        className="text-slate-500 hover:text-primary-400 transition-colors"
                      >
                        {savedIds.has(job.id)
                          ? <BookmarkCheck size={16} className="text-primary-400" />
                          : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {hasMore && (
                <button
                  onClick={() => { setPage((p) => p + 1); fetchJobs(false) }}
                  className="w-full py-3 text-sm text-slate-400 hover:text-white border border-white/8 rounded-xl hover:border-white/15 transition-all"
                >
                  Load more jobs
                </button>
              )}
            </>
          )}
        </div>

        {/* Job detail */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <motion.div key={selectedJob.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{selectedJob.title}</h3>
                    <p className="text-slate-400 text-sm">{selectedJob.company}</p>
                  </div>
                  {selectedJob.matchScore != null && (
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-2xl font-bold" style={{ color: getMatchColor(selectedJob.matchScore) }}>
                        {selectedJob.matchScore}%
                      </p>
                      <p className="text-xs text-slate-500">AI Match</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4 text-sm text-slate-400">
                  {selectedJob.location && <div className="flex items-center gap-2"><MapPin size={14} />{selectedJob.location}</div>}
                  {selectedJob.salaryRange && <div className="flex items-center gap-2"><DollarSign size={14} />{selectedJob.salaryRange}</div>}
                  {selectedJob.type && <div className="flex items-center gap-2"><Building size={14} />{selectedJob.type}</div>}
                  {selectedJob.experienceLevel && <div className="flex items-center gap-2"><Zap size={14} />{selectedJob.experienceLevel}</div>}
                </div>

                {selectedJob.description && (
                  <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-4">{selectedJob.description}</p>
                )}

                {getSkillTags(selectedJob).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getSkillTags(selectedJob).map((tag) => (
                        <span key={tag} className="badge badge-info">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => applyToJob(selectedJob)} loading={applying}>
                    <Zap size={15} /> Manual Apply
                  </Button>
                  {selectedJob.applyUrl && (
                    <Button variant="secondary" onClick={() => window.open(selectedJob.applyUrl, '_blank', 'noopener')}>
                      <ExternalLink size={15} />
                    </Button>
                  )}
                  <Button variant="secondary" onClick={(e) => toggleSave(e, selectedJob)}>
                    {savedIds.has(selectedJob.id) ? <BookmarkCheck size={15} className="text-primary-400" /> : <Bookmark size={15} />}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="text-center py-12">
              <Zap size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Select a job to view details and apply</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
