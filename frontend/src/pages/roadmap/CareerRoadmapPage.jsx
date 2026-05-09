import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Target, CheckCircle, Circle, ChevronRight, Zap, Brain, TrendingUp, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ProgressBar, Badge } from '../../components/ui/Progress'
import { roadmapService } from '../../services'
import toast from 'react-hot-toast'

const CAREER_PATHS = [
  { id: 'fullstack', label: 'Full Stack Development', icon: '⚡', color: '#6366f1' },
  { id: 'aiml', label: 'AI / Machine Learning', icon: '🧠', color: '#8b5cf6' },
  { id: 'cloud', label: 'Cloud & DevOps', icon: '☁️', color: '#a78bfa' },
  { id: 'data', label: 'Data Science', icon: '📊', color: '#c084fc' },
  { id: 'security', label: 'Cybersecurity', icon: '🔒', color: '#6366f1' },
  { id: 'product', label: 'Product Engineering', icon: '🚀', color: '#8b5cf6' },
]

const MOCK_ROADMAP = {
  title: 'Full Stack Development',
  progress: 45,
  estimatedTime: '8 months',
  phases: [
    {
      id: 1,
      title: 'Foundation',
      duration: '2 months',
      completed: true,
      skills: [
        { name: 'HTML & CSS Mastery', completed: true, level: 'beginner' },
        { name: 'JavaScript ES6+', completed: true, level: 'intermediate' },
        { name: 'Git & Version Control', completed: true, level: 'beginner' },
        { name: 'Command Line Basics', completed: true, level: 'beginner' },
      ],
    },
    {
      id: 2,
      title: 'Frontend Development',
      duration: '2 months',
      completed: false,
      current: true,
      skills: [
        { name: 'React.js', completed: true, level: 'intermediate' },
        { name: 'TypeScript', completed: false, level: 'intermediate' },
        { name: 'State Management (Redux/Zustand)', completed: false, level: 'intermediate' },
        { name: 'Testing (Jest, RTL)', completed: false, level: 'intermediate' },
      ],
    },
    {
      id: 3,
      title: 'Backend Development',
      duration: '2 months',
      completed: false,
      skills: [
        { name: 'Node.js & Express', completed: false, level: 'intermediate' },
        { name: 'REST API Design', completed: false, level: 'intermediate' },
        { name: 'Database Design (SQL/NoSQL)', completed: false, level: 'intermediate' },
        { name: 'Authentication & Security', completed: false, level: 'advanced' },
      ],
    },
    {
      id: 4,
      title: 'Advanced & Deployment',
      duration: '2 months',
      completed: false,
      skills: [
        { name: 'Docker & Containerization', completed: false, level: 'advanced' },
        { name: 'CI/CD Pipelines', completed: false, level: 'advanced' },
        { name: 'AWS/Cloud Deployment', completed: false, level: 'advanced' },
        { name: 'System Design', completed: false, level: 'advanced' },
      ],
    },
  ],
}

const levelColors = { beginner: '#4ade80', intermediate: '#facc15', advanced: '#f87171' }

export default function CareerRoadmapPage() {
  const [phase, setPhase] = useState('select') // select | roadmap
  const [selectedPath, setSelectedPath] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState(2)

  const generateRoadmap = async () => {
    if (!selectedPath) return
    setGenerating(true)
    try {
      const res = await roadmapService.generate({ careerPath: selectedPath })
      setRoadmap(res.data)
    } catch {
      await new Promise(r => setTimeout(r, 1500))
      setRoadmap(MOCK_ROADMAP)
    } finally {
      setGenerating(false)
      setPhase('roadmap')
    }
  }

  const toggleSkill = (phaseId, skillName) => {
    setRoadmap(prev => ({
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId
          ? { ...p, skills: p.skills.map(s => s.name === skillName ? { ...s, completed: !s.completed } : s) }
          : p
      ),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">AI Career Roadmap</h2>
          <p className="text-slate-400 text-sm mt-1">Personalized learning path to your dream career</p>
        </div>
        {phase === 'roadmap' && (
          <Button variant="secondary" size="sm" onClick={() => setPhase('select')}>
            <Plus size={14} /> New Roadmap
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="font-semibold text-white mb-4">Choose Your Career Path</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {CAREER_PATHS.map((path) => (
                  <motion.div
                    key={path.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedPath(path.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedPath === path.id
                        ? 'border-primary-500/50 bg-primary-500/10'
                        : 'border-white/8 bg-white/3 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{path.icon}</span>
                      <div>
                        <p className="font-medium text-white text-sm">{path.label}</p>
                      </div>
                      {selectedPath === path.id && (
                        <CheckCircle size={16} className="text-primary-400 ml-auto" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Button
              onClick={generateRoadmap}
              disabled={!selectedPath}
              loading={generating}
              className="w-full py-3"
            >
              <Brain size={16} /> {generating ? 'Generating Your Roadmap...' : 'Generate AI Roadmap'}
            </Button>
          </motion.div>
        )}

        {phase === 'roadmap' && roadmap && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white">{roadmap.title}</h3>
                    <p className="text-sm text-slate-400">Estimated: {roadmap.estimatedTime}</p>
                  </div>
                  <span className="badge badge-info">{roadmap.progress}% Complete</span>
                </div>
                <ProgressBar value={roadmap.progress} />
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">{roadmap.progress}%</p>
                  <p className="text-slate-400 text-sm mt-1">Overall Progress</p>
                  <p className="text-xs text-slate-500 mt-2">{roadmap.estimatedTime} remaining</p>
                </div>
              </Card>
            </div>

            {/* Phases */}
            <div className="space-y-3">
              {roadmap.phases.map((phase, i) => {
                const completedSkills = phase.skills.filter(s => s.completed).length
                const phaseProgress = (completedSkills / phase.skills.length) * 100

                return (
                  <Card key={phase.id} className={phase.current ? 'border-primary-500/30' : ''}>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          phase.completed ? 'bg-green-500/20 text-green-400' :
                          phase.current ? 'bg-primary-500/20 text-primary-400' :
                          'bg-white/5 text-slate-500'
                        }`}>
                          {phase.completed ? <CheckCircle size={16} /> : i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-sm">{phase.title}</p>
                            {phase.current && <span className="badge badge-info">Current</span>}
                          </div>
                          <p className="text-xs text-slate-400">{phase.duration} • {completedSkills}/{phase.skills.length} skills</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 hidden md:block">
                          <ProgressBar value={phaseProgress} showValue={false} />
                        </div>
                        <ChevronRight
                          size={16}
                          className={`text-slate-500 transition-transform ${expandedPhase === phase.id ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedPhase === phase.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/5 grid md:grid-cols-2 gap-2">
                            {phase.skills.map((skill) => (
                              <div
                                key={skill.name}
                                onClick={() => toggleSkill(phase.id, skill.name)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 cursor-pointer hover:bg-white/5 transition-all"
                              >
                                {skill.completed
                                  ? <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                                  : <Circle size={16} className="text-slate-600 flex-shrink-0" />
                                }
                                <span className={`text-sm flex-1 ${skill.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                  {skill.name}
                                </span>
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{
                                    background: `${levelColors[skill.level]}15`,
                                    color: levelColors[skill.level],
                                  }}
                                >
                                  {skill.level}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
