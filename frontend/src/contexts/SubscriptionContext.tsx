import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';


interface Subscription {
  // Legacy Prisma-backed fields
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

  // New plan-aware contract fields
  plan?: 'FREE' | 'PRO_MONTHLY' | 'PRO_YEARLY';
  canUsePremium?: boolean;
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
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);

  const refreshSubscription = async () => {
    try {
      const rawUser = localStorage.getItem('userInfo');
      let token = null;
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          token = parsed.token;
        } catch { /* ignore */ }
      }

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

    // Re-fetch subscription data when settings are updated
    window.addEventListener('userInfoUpdated', refreshSubscription);
    return () => window.removeEventListener('userInfoUpdated', refreshSubscription);
  }, []);

  // show first-time onboarding modal when a newly registered user lands (no subscription and just created)
  useEffect(() => {
    if (!loading && subscription && !subscription.subscriptionPlan) {
      // show modal only for first time (no plan stored)
      const wasShown = localStorage.getItem('firstTimeSubscriptionShown');
      if (!wasShown) {
        setShowFirstTimeModal(true);
        localStorage.setItem('firstTimeSubscriptionShown', '1');
      }
    }
  }, [loading, subscription]);

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

  const isPremium = subscription?.canUsePremium === true;
  const isYearly = subscription?.plan === 'PRO_YEARLY';



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
      {/* Lightweight first-time subscription modal - simple inline UI to show current plan and locked features */}
      {showFirstTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold">Welcome to JobOps</h3>
            <p className="mt-2 text-sm text-gray-600">You're on the <span className="font-semibold">{subscription?.subscriptionPlan || 'Free'}</span> plan. Upgrade to unlock premium features like unlimited AI matches and priority alerts.</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-lg bg-gray-100" onClick={() => setShowFirstTimeModal(false)}>Close</button>
              <a className="px-4 py-2 rounded-lg bg-[#FF4500] text-white" href="/dashboard/settings">View plans</a>
            </div>
          </div>
        </div>
      )}
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
