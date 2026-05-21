import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Subscription {
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  billingCycle: string;
  autoRenew: boolean;
  aiSearchesUsed: number;
  maxAISearches: number;
  savedJobsCount: number;
  maxSavedJobs: number;
  resumeUploadsCount: number;
  maxResumeUploads: number;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canPerformAction: (
    action: 'aiSearch' | 'saveJob' | 'uploadResume'
  ) => { allowed: boolean; remaining: number };
  isPremium: boolean;
  isYearly: boolean;
  daysUntilRenewal: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/subscription/current', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        setError(null);
      } else if (response.status === 401) {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  const canPerformAction = (
    action: 'aiSearch' | 'saveJob' | 'uploadResume'
  ): { allowed: boolean; remaining: number } => {
    if (!subscription) {
      return { allowed: false, remaining: 0 };
    }

    switch (action) {
      case 'aiSearch': {
        const remaining = Math.max(
          0,
          subscription.maxAISearches === 0
            ? Infinity
            : subscription.maxAISearches - subscription.aiSearchesUsed
        );
        return {
          allowed: subscription.maxAISearches === 0 || subscription.aiSearchesUsed < subscription.maxAISearches,
          remaining: remaining === Infinity ? 999 : remaining,
        };
      }
      case 'saveJob': {
        const remaining = Math.max(
          0,
          subscription.maxSavedJobs === 0
            ? Infinity
            : subscription.maxSavedJobs - subscription.savedJobsCount
        );
        return {
          allowed: subscription.maxSavedJobs === 0 || subscription.savedJobsCount < subscription.maxSavedJobs,
          remaining: remaining === Infinity ? 999 : remaining,
        };
      }
      case 'uploadResume': {
        const remaining = Math.max(
          0,
          subscription.maxResumeUploads === 0
            ? Infinity
            : subscription.maxResumeUploads - subscription.resumeUploadsCount
        );
        return {
          allowed: subscription.maxResumeUploads === 0 || subscription.resumeUploadsCount < subscription.maxResumeUploads,
          remaining: remaining === Infinity ? 999 : remaining,
        };
      }
      default:
        return { allowed: true, remaining: 999 };
    }
  };

  const isPremium = subscription?.subscriptionPlan?.includes('Pro') ?? false;
  const isYearly = subscription?.subscriptionPlan === 'ProYearly' ?? false;

  const daysUntilRenewal = subscription?.subscriptionEndDate
    ? Math.ceil(
        (new Date(subscription.subscriptionEndDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    refreshSubscription,
    canPerformAction,
    isPremium,
    isYearly,
    daysUntilRenewal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
