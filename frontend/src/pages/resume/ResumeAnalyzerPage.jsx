import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileText, CheckCircle, AlertCircle, Zap, Target,
  TrendingUp, Brain, Download, RefreshCw, ChevronRight
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ScoreRing, ProgressBar, Badge } from '../../components/ui/Progress'
import { resumeService } from '../../services'
import toast from 'react-hot-toast'

const MOCK_ANALYSIS = {
  atsScore: 87,
  overallScore: 82,
  sections: {
    contact: 95,
    summary: 70,
    experience: 88,
    skills: 85,
    education: 90,
    formatting: 78,
  },
  missingKeywords: ['TypeScript', 'Docker', 'Kubernetes', 'GraphQL', 'CI/CD'],
  presentKeywords: ['React', 'Node.js', 'Python', 'SQL', 'REST APIs', 'Git', 'AWS'],
  suggestions: [
    { type: 'critical', text: 'Add quantifiable achievements to your experience section (e.g., "Increased performance by 40%")' },
    { type: 'critical', text: 'Include TypeScript — present in 78% of matched job descriptions' },
    { type: 'warning', text: 'Your summary section is too generic. Tailor it to your target role.' },
    { type: 'warning', text: 'Add Docker/containerization experience to improve ATS matching' },
    { type: 'info', text: 'Consider adding a projects section to showcase practical experience' },
    { type: 'info', text: 'LinkedIn profile URL is missing from contact information' },
  ],
  jobMatches: [
    { title: 'Senior Frontend Engineer', company: 'Stripe', match: 94 },
    { title: 'Full Stack Developer', company: 'Airbnb', match: 88 },
    { title: 'Software Engineer', company: 'Notion', match: 85 },
  ],
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'] },
    maxFiles: 1,
  })

  const analyze = async () => {
    if (!file) return
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await resumeService.upload(formData)
      const analysisRes = await resumeService.analyze(uploadRes.data.id)

      // Ensure all required fields have defaults
      const data = analysisRes.data || {}
      const processedAnalysis = {
        atsScore: data.atsScore || 0,
        overallScore: data.overallScore || 0,
        sections: data.sections || {
          contact: 0,
          summary: 0,
          experience: 0,
          skills: 0,
          education: 0,
          formatting: 0,
        },
        missingKeywords: data.missingKeywords || [],
        presentKeywords: data.presentKeywords || [],
        suggestions: data.suggestions || [],
        jobMatches: data.jobMatches || [],
        topSkills: data.topSkills || [],
      }

      console.log('Raw API response:', analysisRes.data)
      console.log('Processed analysis:', processedAnalysis)
      console.log('ATS Score:', processedAnalysis.atsScore)
      console.log('Overall Score:', processedAnalysis.overallScore)
      setAnalysis(processedAnalysis)
    } catch (error) {
      console.error('Resume analysis failed:', error)
      toast.error('Failed to analyze resume. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const tabs = ['overview', 'keywords', 'suggestions', 'job-matches']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">AI Resume Analyzer</h2>
          <p className="text-slate-400 text-sm mt-1">Upload your resume for instant ATS scoring and AI optimization</p>
        </div>
        {analysis && (
          <Button variant="secondary" size="sm" onClick={() => { setAnalysis(null); setFile(null) }}>
            <RefreshCw size={14} /> New Analysis
          </Button>
        )}
      </div>

      {!analysis ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Upload Resume</h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary-500 bg-primary-500/5'
                  : 'border-white/10 hover:border-primary-500/50 hover:bg-white/2'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-primary-400" />
              </div>
              {file ? (
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-200 font-medium mb-1">Drop your resume here</p>
                  <p className="text-slate-500 text-sm">PDF, DOC, DOCX supported</p>
                </div>
              )}
            </div>

            {file && (
              <Button
                onClick={analyze}
                loading={analyzing}
                className="w-full mt-4"
              >
                <Zap size={16} /> {analyzing ? 'Analyzing with AI...' : 'Analyze Resume'}
              </Button>
            )}

            {analyzing && (
              <div className="mt-4 space-y-2">
                {['Parsing document...', 'Running ATS check...', 'Analyzing keywords...', 'Generating insights...'].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                    {step}
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Tips */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Resume Best Practices</h3>
            <div className="space-y-3">
              {[
                'Use action verbs and quantify achievements',
                'Include relevant keywords from job descriptions',
                'Keep formatting clean and ATS-friendly',
                'Tailor your resume for each application',
                'Include a strong professional summary',
                'List skills that match target job requirements',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="col-span-2 md:col-span-1">
                <div className="flex justify-center">
                  <ScoreRing score={analysis.atsScore} label="ATS Score" />
                </div>
              </Card>
              <Card className="col-span-2 md:col-span-1">
                <div className="flex justify-center">
                  <ScoreRing score={analysis.overallScore} label="Overall Score" />
                </div>
              </Card>
              <Card className="col-span-2">
                <h4 className="text-sm font-semibold text-white mb-3">Section Scores</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.sections).map(([key, val]) => (
                    <ProgressBar
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={val}
                      color={val >= 80 ? '#4ade80' : val >= 60 ? '#facc15' : '#f87171'}
                    />
                  ))}
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Card>
              <div className="flex gap-1 mb-6 bg-white/4 rounded-xl p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Present Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.presentKeywords.map((kw) => (
                        <span key={kw} className="badge badge-success">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map((kw) => (
                        <span key={kw} className="badge badge-danger">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'keywords' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400 mb-4">
                    Your resume contains {analysis.presentKeywords.length} of the top keywords. 
                    Adding the missing {analysis.missingKeywords.length} keywords could increase your ATS score by up to 15 points.
                  </p>
                  {analysis.missingKeywords.map((kw) => (
                    <div key={kw} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <span className="text-sm text-slate-200">{kw}</span>
                      <span className="text-xs text-red-400">Missing</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="space-y-3">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
                      s.type === 'critical' ? 'bg-red-500/5 border-red-500/15' :
                      s.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/15' :
                      'bg-blue-500/5 border-blue-500/15'
                    }`}>
                      <AlertCircle size={16} className={
                        s.type === 'critical' ? 'text-red-400' :
                        s.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                      } />
                      <p className="text-sm text-slate-200">{s.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'job-matches' && (
                <div className="space-y-3">
                  {analysis.jobMatches.map((job) => (
                    <div key={job.title} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                      <div>
                        <p className="font-medium text-white text-sm">{job.title}</p>
                        <p className="text-xs text-slate-400">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-400">{job.match}%</p>
                          <p className="text-xs text-slate-500">match</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Apply <ChevronRight size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
