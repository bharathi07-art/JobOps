
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';

import { UpgradeModal } from './UpgradeModal';
import { Button } from './ui/Button';

interface PremiumBadgeProps {
  plan: string;
  className?: string;
}

export function PremiumBadge({ plan, className = '' }: PremiumBadgeProps) {
  if (plan === 'Free') {
    return null;
  }

  const isYearly = plan.includes('Yearly');

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        isYearly
          ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
          : 'bg-[#FFCBA4] text-[#FF4500]'
      } ${className}`}
    >
      <Crown className="w-3.5 h-3.5" />
      <span>{isYearly ? 'Pro Yearly' : 'Pro Monthly'}</span>
    </motion.div>
  );
}

export function SubscriptionStatusBar({
  plan,
  endDate,
}: {
  plan: string;
  endDate?: Date;
  billingCycle?: string;
}) {
  if (plan === 'Free') {
    return null;
  }

  const daysRemaining = endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-[#FF4500] to-orange-400 text-white px-4 py-3 rounded-lg text-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" />
          <span className="font-semibold">
            {plan === 'Yearly' ? 'Pro Yearly' : 'Pro Monthly'} Plan
          </span>
        </div>
        <span className="text-white/90">
          {daysRemaining > 0
            ? `Renews in ${daysRemaining} days`
            : 'Renews soon'}
        </span>
      </div>
    </motion.div>
  );
}

export function UsageLimitIndicator({
  used,
  limit,
  label,
  compact = false,
}: {
  used: number;
  limit: number;
  label: string;
  compact?: boolean;
}) {
  const percentage = limit === 0 ? 0 : (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">{label}</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            className={`h-full rounded-full ${
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-[#FF4500]'
            }`}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600">
          {used}/{limit === 0 ? '∞' : limit}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <span className={`text-sm font-bold ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'
        }`}>
          {used}/{limit === 0 ? '∞' : limit}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full rounded-full transition-colors ${
            isAtLimit
              ? 'bg-red-500'
              : isNearLimit
                ? 'bg-yellow-500'
                : 'bg-gradient-to-r from-[#FF4500] to-orange-400'
          }`}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-2 font-medium">
          Limit reached. Upgrade to continue.
        </p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-yellow-600 mt-2 font-medium">
          You're using {Math.round(percentage)}% of your limit
        </p>
      )}
    </motion.div>
  );
}

export function LockedFeatureIndicator({
  featureName,
}: {
  featureName: string;
  requiredPlan?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center border border-gray-100">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{featureName}</p>
            <p className="text-xs text-gray-600">Premium feature</p>
          </div>
          <div className="mt-3">
            <Button onClick={() => setIsOpen(true)} size="sm">Upgrade</Button>
          </div>
        </div>
      </motion.div>

      <UpgradeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        reason="feature-locked"
        featureName={featureName}
        message={`Unlock ${featureName} by upgrading to a premium plan.`}
      />
    </>
  );
}

export function PricingBadge({
  text,
  variant = 'primary',
}: {
  text: string;
  variant?: 'primary' | 'success' | 'warning';
}) {
  const variants = {
    primary: 'bg-[#FFCBA4] text-[#FF4500]',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {text}
    </span>
  );
}
