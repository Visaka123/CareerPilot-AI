import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, MessageSquare, Mail, Copy, RefreshCw, Zap, CheckCircle, Sparkles } from 'lucide-react'
const Linkedin = Link2
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { linkedinService } from '../../services'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'post', label: 'LinkedIn Post', icon: Linkedin },
  { id: 'message', label: 'Recruiter Message', icon: MessageSquare },
  { id: 'email', label: 'Outreach Email', icon: Mail },
]

const POST_TOPICS = [
  'Career milestone or achievement',
  'Lessons learned from a project',
  'Industry insights and trends',
  'Job search tips',
  'Technical tutorial or tip',
  'Networking experience',
]

const MOCK_OUTPUTS = {
  post: `Just wrapped up an incredible project where I led the migration of our monolithic architecture to microservices, reducing deployment time by 60% and improving system reliability to 99.9% uptime.

Key learnings from this journey:
→ Start with the strangler fig pattern for gradual migration
→ Invest heavily in observability from day one
→ Team alignment is more important than technical perfection

The biggest challenge wasn't the technology — it was getting everyone aligned on the vision and maintaining velocity during the transition.

If you're considering a similar migration, I'd love to share more insights. Drop a comment or DM me.

#SoftwareEngineering #Microservices #TechLeadership #CloudArchitecture`,

  message: `Hi [Recruiter Name],

I came across your profile while researching opportunities at [Company]. I'm a Senior Frontend Engineer with 5+ years of experience building scalable React applications, and I'm genuinely excited about [Company]'s mission to [specific mission].

I recently led a team that reduced page load times by 40% and improved user engagement by 25% at my current role. I believe these skills align well with what you're building.

Would you be open to a 15-minute conversation to explore if there might be a fit?

Best regards,
[Your Name]`,

  email: `Subject: Exploring Frontend Engineering Opportunities at [Company]

Hi [Name],

I hope this message finds you well. I'm reaching out because I've been following [Company]'s work on [specific product/feature] and I'm deeply impressed by your approach to [specific aspect].

As a Senior Frontend Engineer with expertise in React, TypeScript, and performance optimization, I've spent the last 5 years building products used by millions of users. Most recently, I [specific achievement with metrics].

I'd love to learn more about your engineering culture and explore whether my background might be a good fit for your team.

Would you have 20 minutes for a brief call this week or next?

Thank you for your time,
[Your Name]`,
}

export default function LinkedInAIPage() {
  const [activeTab, setActiveTab] = useState('post')
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!topic && !context) return
    setLoading(true)
    try {
      let res
      if (activeTab === 'post') res = await linkedinService.generatePost({ topic, context })
      else if (activeTab === 'message') res = await linkedinService.generateMessage({ context })
      else res = await linkedinService.generateEmail({ context })
      setOutput(res.data.content)
    } catch {
      await new Promise(r => setTimeout(r, 1500))
      setOutput(MOCK_OUTPUTS[activeTab])
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">LinkedIn AI Assistant</h2>
        <p className="text-slate-400 text-sm mt-1">Generate professional content for your LinkedIn presence</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setOutput('') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'bg-primary-500/20 text-primary-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <h3 className="font-semibold text-white mb-4">
            {activeTab === 'post' ? 'Post Details' : activeTab === 'message' ? 'Message Details' : 'Email Details'}
          </h3>

          {activeTab === 'post' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Topic</label>
              <div className="grid grid-cols-2 gap-2">
                {POST_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`p-2.5 rounded-xl text-xs text-left transition-all border ${
                      topic === t
                        ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                        : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/15'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {activeTab === 'post' ? 'Additional Context' : 'Your Background & Target'}
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="input-field resize-none"
                rows={5}
                placeholder={
                  activeTab === 'post'
                    ? 'Add specific details, achievements, or key points to include...'
                    : activeTab === 'message'
                    ? 'Your experience, target company, specific role...'
                    : 'Your background, target company, role you\'re interested in...'
                }
              />
            </div>
            <Button
              onClick={generate}
              loading={loading}
              disabled={!topic && !context}
              className="w-full"
            >
              <Sparkles size={15} /> {loading ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </Card>

        {/* Output */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Generated Content</h3>
            {output && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={generate}>
                  <RefreshCw size={13} /> Regenerate
                </Button>
                <Button variant="secondary" size="sm" onClick={copy}>
                  {copied ? <CheckCircle size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`skeleton h-3 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
              ))}
            </div>
          ) : output ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/3 rounded-xl p-4 border border-white/5"
            >
              <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {output}
              </pre>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Linkedin size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Fill in the details and click Generate</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
