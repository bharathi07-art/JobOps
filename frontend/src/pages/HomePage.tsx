import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, Sparkles, ArrowRight, Check, Star, Zap, Target, Brain, Shield, Menu, X, ChevronRight } from 'lucide-react'
import { testimonials, pricingPlans } from '../data/mockData'
import { Button } from '../components/ui/Button'

const features = [
  { icon: Brain, title: 'AI Resume Analysis', desc: 'Our AI scans your resume and identifies strengths, gaps, and optimization opportunities instantly.' },
  { icon: Target, title: 'Smart Job Matching', desc: 'Get matched with jobs that align with your skills, experience, and career goals with 94% accuracy.' },
  { icon: Zap, title: 'ATS Optimization', desc: 'Ensure your resume passes Applicant Tracking Systems with our real-time ATS score checker.' },
  { icon: Shield, title: 'Privacy First', desc: 'Your resume data is encrypted and never shared. You control what employers see.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FFF8F4]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF4500] rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">JobOps</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How it Works', 'Pricing', 'Testimonials'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item}</a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {['Features', 'How it Works', 'Pricing', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 py-1">{item}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1"><Button variant="secondary" size="sm" className="w-full">Sign In</Button></Link>
              <Link to="/register" className="flex-1"><Button size="sm" className="w-full">Get Started</Button></Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-80" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#FF4500]" />
                <span className="text-sm font-medium text-[#FF4500]">AI-Powered Job Matching</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find Your Perfect<br />
                <span className="text-[#FF4500]">Developer Job</span><br />
                Using AI
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg">
                Upload your resume and let AI match you with the best global opportunities. Get intelligent matching scores, skill gap analysis, and personalized recommendations.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Upload className="w-5 h-5" /> Upload Resume
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Explore Dashboard <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-12 grid grid-cols-3 gap-6">
                {[['50K+', 'Jobs Daily'], ['94%', 'Match Accuracy'], ['10K+', 'Happy Users']].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-bold text-gray-900">{val}</div>
                    <div className="text-sm text-gray-500">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">AI Job Match</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">94% Match</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900">Senior Frontend Developer</h3>
                  <p className="text-sm text-gray-500 mt-1">Vercel • Remote • $140k–$180k</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Next.js'].map(s => (
                      <span key={s} className="px-2 py-0.5 bg-orange-100 text-[#FF4500] text-xs rounded-md">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Resume Match</span>
                    <span className="font-medium text-gray-900">94%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-[#FF4500] rounded-full" />
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-gray-700"><span className="font-semibold text-[#FF4500]">AI Insight: </span>Excellent match! Your React and TypeScript skills align perfectly with this role.</p>
                </div>
              </div>

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">New Match!</div>
                    <div className="text-xs text-gray-400">92% compatibility</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Everything you need to land your dream job</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Powered by advanced AI to give you the competitive edge in today's job market.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="p-6 rounded-2xl border border-gray-100 hover:border-[#FF4500]/20 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF4500] transition-colors">
                  <f.icon className="w-6 h-6 text-[#FF4500] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 bg-[#FFF8F4]">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How JobOps Works</h2>
            <p className="mt-4 text-lg text-gray-500">Three simple steps to your next opportunity</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Drag and drop your resume. Our AI instantly parses and analyzes your skills and experience.' },
              { step: '02', title: 'AI Matching', desc: 'Our AI scans thousands of jobs and finds the best matches based on your unique profile.' },
              { step: '03', title: 'Apply & Track', desc: 'Apply with one click and track all your applications in our smart Kanban board.' },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
                <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Loved by developers worldwide</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#FF4500] text-[#FF4500]" />)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full bg-gray-100" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-[#FFF8F4]">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-500">Start free, upgrade when you're ready</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`relative p-6 rounded-2xl border-2 transition-all ${plan.popular ? 'border-[#FF4500] shadow-xl shadow-orange-100' : 'border-gray-100 hover:border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FF4500] text-white text-xs font-semibold rounded-full">Most Popular</div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[#FF4500] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full">{plan.cta}</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#FF4500]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white">Ready to find your dream job?</h2>
          <p className="mt-4 text-lg text-orange-100">Join 10,000+ developers who found their perfect role using JobOps AI.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg">Get Started Free <ChevronRight className="w-5 h-5" /></Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#FF4500] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">JobOps</span>
              </div>
              <p className="text-sm leading-relaxed">AI-powered job matching for developers worldwide.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Dashboard', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 JobOps. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
