import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Play, CheckCircle, Clock, Brain, ChevronRight,
  BarChart3, Star, RefreshCw, Mic, MicOff, Send
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ScoreRing, ProgressBar, Badge } from '../../components/ui/Progress'
import { interviewService } from '../../services'
import toast from 'react-hot-toast'

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical', desc: 'DSA, System Design, Coding', color: '#6366f1' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, soft skills', color: '#8b5cf6' },
  { id: 'hr', label: 'HR Round', desc: 'Culture fit, career goals', color: '#a78bfa' },
  { id: 'system-design', label: 'System Design', desc: 'Architecture, scalability', color: '#c084fc' },
]

const MOCK_QUESTIONS = {
  technical: [
    'Explain the difference between var, let, and const in JavaScript.',
    'What is the time complexity of quicksort in the worst case?',
    'How would you implement a debounce function?',
    'Explain the concept of closures in JavaScript.',
    'What are React hooks and why were they introduced?',
  ],
  behavioral: [
    'Tell me about a time you had to deal with a difficult team member.',
    'Describe a situation where you had to meet a tight deadline.',
    'Give an example of when you showed leadership.',
    'Tell me about your biggest professional failure and what you learned.',
    'How do you prioritize tasks when everything seems urgent?',
  ],
  hr: [
    'Tell me about yourself.',
    'Why do you want to work at this company?',
    'Where do you see yourself in 5 years?',
    'What are your salary expectations?',
    'Why are you leaving your current role?',
  ],
  'system-design': [
    'Design a URL shortener like bit.ly.',
    'How would you design Twitter\'s feed system?',
    'Design a distributed cache system.',
    'How would you build a real-time notification system?',
    'Design a ride-sharing application like Uber.',
  ],
}

const MOCK_FEEDBACK = {
  score: 82,
  communication: 78,
  technical: 85,
  confidence: 80,
  clarity: 84,
  strengths: ['Good technical depth', 'Clear communication', 'Structured answers'],
  improvements: ['Add more specific examples', 'Improve time management', 'Practice STAR format more'],
}

export default function MockInterviewPage() {
  const [phase, setPhase] = useState('setup') // setup | interview | feedback
  const [selectedType, setSelectedType] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [questions, setQuestions] = useState([])

  const startInterview = async () => {
    if (!selectedType) return
    setGenerating(true)
    try {
      const res = await interviewService.generate({ type: selectedType, count: 5 })
      setQuestions(res.data.questions)
    } catch {
      setQuestions(MOCK_QUESTIONS[selectedType])
    } finally {
      setGenerating(false)
      setPhase('interview')
      setCurrentQ(0)
      setAnswers([])
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return
    const newAnswers = [...answers, { question: questions[currentQ], answer }]
    setAnswers(newAnswers)
    setAnswer('')

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setLoading(true)
      try {
        const res = await interviewService.submitAnswer('session-1', { answers: newAnswers })
        setFeedback(res.data)
      } catch {
        setFeedback(MOCK_FEEDBACK)
      } finally {
        setLoading(false)
        setPhase('feedback')
      }
    }
  }

  const reset = () => {
    setPhase('setup')
    setSelectedType(null)
    setCurrentQ(0)
    setAnswers([])
    setAnswer('')
    setFeedback(null)
    setQuestions([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">AI Mock Interview</h2>
          <p className="text-slate-400 text-sm mt-1">Practice with AI-generated questions and get instant feedback</p>
        </div>
        {phase !== 'setup' && (
          <Button variant="secondary" size="sm" onClick={reset}>
            <RefreshCw size={14} /> New Session
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="font-semibold text-white mb-4">Select Interview Type</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((type) => (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedType === type.id
                        ? 'border-primary-500/50 bg-primary-500/10'
                        : 'border-white/8 bg-white/3 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${type.color}15` }}
                      >
                        <MessageSquare size={18} style={{ color: type.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{type.label}</p>
                        <p className="text-xs text-slate-400">{type.desc}</p>
                      </div>
                      {selectedType === type.id && (
                        <CheckCircle size={16} className="text-primary-400 ml-auto" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Button
              onClick={startInterview}
              disabled={!selectedType}
              loading={generating}
              className="w-full py-3"
            >
              <Play size={16} /> {generating ? 'Generating Questions...' : 'Start Interview'}
            </Button>
          </motion.div>
        )}

        {phase === 'interview' && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span className="capitalize">{selectedType?.replace('-', ' ')} Round</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <Card>
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                  <Brain size={18} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">AI Interviewer</p>
                  <p className="text-white font-medium leading-relaxed">{questions[currentQ]}</p>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here... Be specific and use examples where possible."
                  className="input-field resize-none"
                  rows={6}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{answer.length} characters</p>
                  <Button onClick={submitAnswer} disabled={!answer.trim() || loading} loading={loading}>
                    {currentQ < questions.length - 1 ? (
                      <>Next Question <ChevronRight size={15} /></>
                    ) : (
                      <>Submit & Get Feedback <Brain size={15} /></>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Previous answers */}
            {answers.length > 0 && (
              <Card>
                <h4 className="text-sm font-semibold text-white mb-3">Previous Answers</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {answers.map((a, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">Q{i + 1}: {a.question}</p>
                      <p className="text-sm text-slate-300">{a.answer}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {phase === 'feedback' && feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <div className="flex justify-center">
                  <ScoreRing score={feedback.score} label="Overall Score" />
                </div>
              </Card>
              <Card className="md:col-span-2">
                <h3 className="font-semibold text-white mb-4">Performance Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Technical Accuracy', value: feedback.technical },
                    { label: 'Communication', value: feedback.communication },
                    { label: 'Confidence', value: feedback.confidence },
                    { label: 'Clarity', value: feedback.clarity },
                  ].map((m) => (
                    <ProgressBar key={m.label} label={m.label} value={m.value} />
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" /> Strengths
                </h3>
                <div className="space-y-2">
                  {feedback.strengths.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {s}
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Brain size={16} className="text-primary-400" /> Areas to Improve
                </h3>
                <div className="space-y-2">
                  {feedback.improvements.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                      {s}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Button onClick={reset} className="w-full py-3">
              <RefreshCw size={16} /> Practice Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
