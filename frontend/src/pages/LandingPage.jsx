import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Brain, ArrowRight, CheckCircle, Star, Zap, Target, TrendingUp,
  FileText, MessageSquare, Map, BarChart3, Shield, Globe, ChevronDown,
  Play, Sparkles, Users, Award, Briefcase
} from 'lucide-react'

const STATS = [
  { value: '50K+', label: 'Active Users' },
  { value: '94%', label: 'Interview Success Rate' },
  { value: '3.2x', label: 'Faster Job Placement' },
  { value: '180+', label: 'Partner Companies' },
]

const FEATURES = [
  {
    icon: FileText,
    title: 'AI Resume Analyzer',
    desc: 'Get ATS scores, skill gap analysis, and AI-powered optimization suggestions in seconds.',
    color: '#6366f1',
  },
  {
    icon: Target,
    title: 'Smart Job Matching',
    desc: 'AI matches you to jobs with precision scoring based on your skills and career goals.',
    color: '#8b5cf6',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interview Engine',
    desc: 'Practice with AI-generated questions across technical, HR, and behavioral rounds.',
    color: '#a78bfa',
  },
  {
    icon: Map,
    title: 'Career Roadmap AI',
    desc: 'Personalized learning paths and milestone tracking toward your dream role.',
    color: '#c084fc',
  },
  {
    icon: TrendingUp,
    title: 'Salary Intelligence',
    desc: 'Predict your market value and get AI-powered negotiation strategies.',
    color: '#6366f1',
  },
  {
    icon: Brain,
    title: 'AI Career Agent',
    desc: '24/7 intelligent assistant for career guidance, resume tips, and interview prep.',
    color: '#8b5cf6',
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    features: ['5 Resume Analyses/month', 'Basic Job Matching', '3 Mock Interviews', 'Career Roadmap', 'AI Chat (limited)'],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    features: ['Unlimited Resume Analyses', 'Advanced Job Matching', 'Unlimited Mock Interviews', 'LinkedIn AI Assistant', 'Salary Prediction', 'Priority AI Support', 'Application Tracker'],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    features: ['Everything in Pro', 'Team Management', 'Custom AI Training', 'API Access', 'Dedicated Account Manager', 'White-label Options', 'Advanced Analytics'],
    cta: 'Contact Sales',
    popular: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    content: 'CareerPilot AI transformed my job search. The resume analyzer identified gaps I never noticed, and the mock interviews prepared me perfectly for Google\'s technical rounds.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager at Stripe',
    content: 'The AI career roadmap was incredibly accurate. It predicted exactly what skills I needed and helped me land a PM role 6 months ahead of schedule.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Data Scientist at Meta',
    content: 'The salary prediction feature alone saved me $15K in negotiations. The AI knew exactly what I was worth in the market.',
    rating: 5,
  },
]

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const num = parseFloat(target)
    const step = num / 60
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= num) { setCount(num); clearInterval(timer) }
      else setCount(Math.floor(current * 10) / 10)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count}{suffix}</span>
}

export default function LandingPage() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="min-h-screen bg-surface-900 text-white overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">CareerPilot</span>
            <span className="gradient-text font-bold">AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Testimonials'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-3xl" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            Powered by Advanced AI — Your Personal Career Operating System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Land Your Dream Job
            <br />
            <span className="gradient-text">10x Faster with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The most advanced AI career platform. Resume analysis, smart job matching, mock interviews, 
            career roadmaps, and salary intelligence — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5 rounded-xl">
              Start for Free <ArrowRight size={18} />
            </Link>
            <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-base">
              <div className="w-10 h-10 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                <Play size={14} className="ml-0.5" />
              </div>
              Watch Demo
            </button>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 relative"
          >
            <div className="glass-card p-1 max-w-4xl mx-auto glow-primary">
              <div className="bg-surface-800 rounded-xl overflow-hidden">
                {/* Mock dashboard preview */}
                <div className="flex">
                  <div className="w-48 bg-surface-900 p-4 hidden md:block">
                    <div className="space-y-2">
                      {['Dashboard', 'Resume', 'Jobs', 'Interview', 'Roadmap'].map((item, i) => (
                        <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 0 ? 'bg-primary-500/15 text-primary-400' : 'text-slate-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary-400' : 'bg-slate-600'}`} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'Career Score', value: '87', color: '#6366f1' },
                        { label: 'Applications', value: '24', color: '#8b5cf6' },
                        { label: 'Interviews', value: '8', color: '#a78bfa' },
                        { label: 'ATS Score', value: '92%', color: '#4ade80' },
                      ].map((stat) => (
                        <div key={stat.label} className="glass rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                          <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-2">Skill Match</p>
                        <div className="space-y-1.5">
                          {[['React', 92], ['Node.js', 78], ['Python', 65]].map(([skill, val]) => (
                            <div key={skill}>
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-slate-400">{skill}</span>
                                <span className="text-primary-400">{val}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full">
                                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-2">AI Recommendations</p>
                        <div className="space-y-1.5">
                          {['Add TypeScript skills', 'Update LinkedIn profile', 'Practice system design'].map((rec) => (
                            <div key={rec} className="flex items-start gap-1.5">
                              <div className="w-1 h-1 bg-primary-400 rounded-full mt-1.5 flex-shrink-0" />
                              <p className="text-xs text-slate-400">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-3">Platform Features</p>
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A complete AI-powered career intelligence platform built for the modern job seeker.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="glass-card p-6 group cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}25` }}
                >
                  <feature.icon size={22} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-surface-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">Start free, upgrade when you're ready.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card p-8 relative ${plan.popular ? 'border-primary-500/40 glow-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-slate-400">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={15} className="text-primary-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'btn-primary'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/8'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Career Professionals</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join 50,000+ professionals using CareerPilot AI to land their dream jobs faster.
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4 rounded-xl">
              Start for Free Today <ArrowRight size={18} />
            </Link>
            <p className="text-slate-600 text-sm mt-4">No credit card required. Free forever plan available.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Brain size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">CareerPilot AI</span>
            </div>
            <p className="text-slate-600 text-sm">© 2025 CareerPilot AI. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map((item) => (
                <a key={item} href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
