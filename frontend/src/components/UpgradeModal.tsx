import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'usage-limit' | 'feature-locked' | 'custom';
  title?: string;
  message?: string;
  featureName?: string;
}

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason = 'feature-locked',
  title,
  message,
  featureName,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      setPlans(data.filter((p: Plan) => p.id !== 'Free'));
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const billingCycle = selectedPlan === 'yearly' ? 'yearly' : 'monthly';

      const response = await fetch('/api/subscription/upgrade', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName: planId,
          billingCycle,
        }),
      });

      if (response.ok) {
        // Subscription updated successfully
        onClose();
        // Optionally refresh user data or show success message
        window.location.reload();
      } else {
        console.error('Error upgrading subscription');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTitle = () => {
    switch (reason) {
      case 'usage-limit':
        return 'Upgrade to Continue';
      case 'feature-locked':
        return `Unlock ${featureName}`;
      default:
        return 'Go Premium';
    }
  };

  const getDefaultMessage = () => {
    switch (reason) {
      case 'usage-limit':
        return 'You've reached your monthly limit. Upgrade to access unlimited features.';
      case 'feature-locked':
        return `${featureName} is a premium feature. Unlock it and more with a Pro plan.`;
      default:
        return 'Upgrade to a Pro plan to unlock premium features and accelerate your job search.';
    }
  };

  const modalTitle = title || getDefaultTitle();
  const modalMessage = message || getDefaultMessage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#FF4500] to-orange-400 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6" />
                <h2 className="text-2xl font-bold">{modalTitle}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Message */}
              <p className="text-gray-600 text-center mb-8 text-lg">{modalMessage}</p>

              {/* Benefits Preview */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  'Unlimited AI searches',
                  'Daily email notifications',
                  'Unlimited saved jobs',
                  'Unlimited resume uploads',
                  'Advanced analytics',
                  'ATS scoring & skill-gap analysis',
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Plan Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Choose Billing Cycle
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'monthly', label: 'Monthly', price: '$9.99/month' },
                    {
                      id: 'yearly',
                      label: 'Yearly (Save 17%)',
                      price: '$99.99/year',
                      badge: '⭐ Best Value',
                    },
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(option.id as 'monthly' | 'yearly')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPlan === option.id
                          ? 'border-[#FF4500] bg-[#FFCBA4]/10'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {option.badge && (
                        <span className="absolute -top-2 right-3 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                          {option.badge}
                        </span>
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        <p className="text-lg font-bold text-[#FF4500] mt-1">{option.price}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Plans to choose from */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Select Plan
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <motion.button
                      key={plan.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className={`relative p-6 rounded-xl border-2 transition-all text-left group ${
                        plan.id === 'ProYearly'
                          ? 'border-[#FF4500] bg-[#FFCBA4]/10 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {plan.id === 'ProYearly' && (
                        <span className="absolute -top-2 left-4 text-xs font-bold bg-[#FF4500] text-white px-3 py-1 rounded-full">
                          ⭐ Best Value
                        </span>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-2xl font-bold text-[#FF4500] mt-2">
                            $
                            {selectedPlan === 'yearly'
                              ? plan.yearlyPrice
                              : plan.monthlyPrice}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF4500] transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => handleUpgrade('ProMonthly')}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={loading}
                >
                  {loading ? 'Processing...' : 'Upgrade Now'}
                </Button>
              </div>

              {/* Trust Badge */}
              <p className="text-center text-xs text-gray-500 mt-6">
                🔒 Secure payment • 💳 Multiple payment methods • 📧 Cancel anytime
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
