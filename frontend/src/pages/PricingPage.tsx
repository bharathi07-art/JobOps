import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Star,Sparkles, Loader2, X, Menu } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';


const PLANS = [
  {
    id: 'Free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic job matching',
    badge: null,
    highlight: false,
    features: [
      '4 AI searches/month',
      'Resume-based job recommendations',
      'Up to 10 matched jobs',
      'Basic dashboard access',
      '1 resume upload',
      '10 saved jobs',
    ],
  },
  {
    id: 'Monthly',
    name: 'Monthly',
    price: 25,
    period: 'month',
    description: 'Full AI power, billed monthly',
    badge: 'MOST POPULAR',
    highlight: true,
    features: [
      '2 AI searches per day',
      'Unlimited monthly usage',
      'Resume Analysis',
      'Job Matching',
      'AI Insights',
      'ATS optimization',
      'Priority support',
      'Unlimited saved jobs',
      'Unlimited resume uploads',
      'Advanced analytics',
    ],
  },
  {
    id: 'Yearly',
    name: 'Yearly',
    price: 250,
    period: 'year',
    description: 'Best value — save $50 vs monthly',
    badge: 'BEST VALUE',
    highlight: false,
    features: [
      '2 AI searches per day',
      'Unlimited yearly usage',
      'Resume Analysis',
      'Job Matching',
      'AI Insights',
      'ATS optimization',
      'Priority support',
      'Unlimited saved jobs',
      'Unlimited resume uploads',
      'Advanced analytics',
      'AI career roadmap',
      'Early access features',
      'Save $50 annually (16.7% off)',
    ],
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>('Free');
  const subscribing: string | null = null;
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userInfo');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const token = parsed?.token;
      if (!token) return;
      fetch('/api/subscription/current', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => { if (d?.subscriptionPlan) setCurrentPlan(d.subscriptionPlan); })
        .catch(() => {});
    } catch { /* ignore */ }
  }, []);

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) return;
    
    const raw = localStorage.getItem('userInfo');
    const token = raw ? JSON.parse(raw)?.token : null;
    if (!token) {
      setMessage({ text: 'Please log in to upgrade your plan.', type: 'error' });
      return;
    }

    navigate(`/dashboard/billing?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F4] to-white">
      {/* NAVE*/}
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-20 pb-12 px-4"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600">
          Choose the perfect plan for your job search journey
        </p>
      </motion.div>

      {/* Toast / Status message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-xl mx-auto px-4 mb-6`}
        >
          <div className={`rounded-xl px-5 py-4 text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.text}
          </div>
        </motion.div>
      )}

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isLoading = subscribing === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border-2 transition-all duration-300 ${
                  plan.highlight
                    ? 'border-[#FF4500] bg-gradient-to-br from-[#FFCBA4]/10 to-white shadow-xl'
                    : 'border-gray-200 bg-white shadow-lg'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-[#FF4500] to-orange-400 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3" /> {plan.badge}
                    </div>
                  </div>
                )}

                {/* Current Plan */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Current Plan
                  </div>
                )}

                <div className="p-8">
                  {/* Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    {plan.id !== 'Free' && <Crown className="w-5 h-5 text-[#FF4500]" />}
                  </div>
                  <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <div>
                        <span className="text-5xl font-bold text-gray-900">$0</span>
                        <span className="text-gray-500 ml-2">/ forever</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-500 ml-1">/ {plan.period}</span>
                        </div>
                        {plan.id === 'Yearly' && (
                          <div className="mt-2 space-y-0.5">
                            <p className="text-sm text-green-600 font-medium">Save $50 per year</p>
                            <p className="text-xs text-green-500">16.7% off vs paying monthly</p>
                          </div>
                        )}
                        {plan.id === 'Monthly' && (
                          <p className="text-sm text-gray-400 mt-2">Billed monthly, cancel anytime</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {plan.id === 'Free' ? (
                    <Link to="/register" className="block mb-8">
                      <Button variant={isCurrentPlan ? 'secondary' : 'primary'} size="lg" className="w-full" disabled={isCurrentPlan}>
                        {isCurrentPlan ? 'Current Plan' : 'Get Started Free'}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      id={`upgrade-btn-${plan.id.toLowerCase()}`}
                      onClick={() => handleUpgrade(plan.id)}
                      variant={isCurrentPlan ? 'secondary' : 'primary'}
                      size="lg"
                      className={`w-full mb-8 flex items-center justify-center gap-2 ${
                        isCurrentPlan ? '' : 'bg-[#FF4500] hover:bg-[#e03e00] text-white'
                      }`}
                      disabled={isCurrentPlan || !!subscribing}
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Upgrading...</>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        'Upgrade Now'
                      )}
                    </Button>
                  )}

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          feature.includes('Save') ? 'text-green-500' : 'text-[#FF4500]'
                        }`} />
                        <span className={`text-sm ${
                          feature.includes('Save') ? 'text-green-600 font-medium' : 'text-gray-700'
                        }`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center p-4 bg-green-50 rounded-xl border border-green-200 max-w-md mx-auto"
        >
          <p className="text-sm text-green-700 font-medium">
            💡 Monthly plan: <span className="font-bold">$25 × 12 = $300/year</span>
          </p>
          <p className="text-sm text-green-700 font-medium mt-1">
            Yearly plan: <span className="font-bold">$250/year — you save $50 (16.7%)</span>
          </p>
        </motion.div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: 'Can I switch plans anytime?', a: 'Yes! You can upgrade or downgrade at any time. Changes take effect immediately.' },
            { q: 'What payment methods do you accept?', a: 'We support credit cards, debit cards, and digital wallets through Stripe.' },
            { q: 'Is there a free trial?', a: 'Start with our Free plan — no credit card required. Upgrade anytime to unlock premium features.' },
            { q: 'Can I cancel my subscription?', a: 'Absolutely! Cancel anytime from your dashboard. No questions asked, no cancellation fees.' },
            { q: 'Do you offer refunds?', a: 'If you cancel within 14 days of purchase, we offer a full refund. Contact support for details.' },
          ].map((faq, idx) => (
            <motion.div key={idx} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#FF4500] to-orange-400 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to level up your job search?</h2>
        <p className="text-xl mb-8 opacity-90">Start free or go premium today</p>
        <Link to="/register">
          <Button variant="secondary" size="lg" className="bg-white text-[#FF4500] hover:bg-gray-100">
            Get Started Now
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
