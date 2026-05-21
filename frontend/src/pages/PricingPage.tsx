import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  aiSearches: number;
  savedJobs: number;
  resumeUploads: number;
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('Free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/subscription/current', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCurrentPlan(data.subscriptionPlan);
    } catch (error) {
      console.error('Error fetching current plan:', error);
    }
  };

  const handleUpgrade = (planId: string) => {
    // Will integrate with payment modal in next component
    console.log('Upgrading to:', planId, billingCycle);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Zap className="w-8 h-8 text-[#FF4500]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F4] to-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-20 pb-12 px-4"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose the perfect plan for your job search journey
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-[#FF4500]' : 'bg-gray-300'
            }`}
          >
            <motion.div
              layout
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: billingCycle === 'yearly' ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              Save 17%
            </span>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const isCurrentPlan = plan.id === currentPlan;
            const isPro = plan.id.includes('Pro');

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={isPro ? { y: -8 } : undefined}
                className={`relative rounded-2xl border-2 transition-all duration-300 ${
                  isPro
                    ? 'border-[#FF4500] bg-gradient-to-br from-[#FFCBA4]/10 to-white shadow-xl'
                    : 'border-gray-200 bg-white shadow-lg'
                }`}
              >
                {/* Best Value Badge */}
                {plan.id === 'ProYearly' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-4 py-1 bg-gradient-to-r from-[#FF4500] to-orange-400 text-white text-sm font-bold rounded-full shadow-lg"
                    >
                      ⭐ Best Value
                    </motion.div>
                  </div>
                )}

                {/* Current Plan Indicator */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Current Plan
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    {isPro && <Crown className="w-5 h-5 text-[#FF4500]" />}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {price === 0 ? (
                      <div>
                        <span className="text-5xl font-bold text-gray-900">Free</span>
                        <p className="text-sm text-gray-600 mt-2">Forever free plan</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-5xl font-bold text-gray-900">${price}</span>
                          <span className="text-gray-600 ml-2">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-sm text-green-600 mt-2">
                            ${(price / 12).toFixed(2)}/month billed annually
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    variant={isCurrentPlan ? 'secondary' : 'primary'}
                    size="lg"
                    className="w-full mb-8"
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.id === 'Free' ? 'Get Started' : 'Upgrade Now'}
                  </Button>

                  {/* Usage Limits Summary */}
                  <div className="border-t border-gray-200 pt-6 mb-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Limits</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#FF4500]" />
                        <span>
                          {plan.aiSearches === 0 ? 'Unlimited' : plan.aiSearches} AI searches
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#FF4500]" />
                        <span>
                          {plan.savedJobs === 0 ? 'Unlimited' : plan.savedJobs} saved jobs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#FF4500]" />
                        <span>
                          {plan.resumeUploads === 0 ? 'Unlimited' : plan.resumeUploads} resume uploads
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: 'Can I switch plans anytime?',
              a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We support credit cards, debit cards, and digital wallets through Stripe and Razorpay.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes! Start with our Free plan with no credit card required. Upgrade anytime to unlock premium features.',
            },
            {
              q: 'Can I cancel my subscription?',
              a: 'Absolutely! Cancel anytime from your dashboard. No questions asked, no cancellation fees.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'If you cancel within 14 days of purchase, we offer a full refund. Contact support for details.',
            },
          ].map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#FF4500] to-orange-400 text-white py-20 px-4 text-center"
      >
        <h2 className="text-4xl font-bold mb-4">Ready to level up your job search?</h2>
        <p className="text-xl mb-8 opacity-90">Start with our free plan or go premium today</p>
        <Button
          onClick={() => window.location.href = '/#pricing'}
          variant="secondary"
          size="lg"
          className="bg-white text-[#FF4500] hover:bg-gray-100"
        >
          Get Started Now
        </Button>
      </motion.div>
    </div>
  );
}
