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
  maxApplications?: number;
  applicationsCount?: number;
  maxAssistantQuestions?: number;
  assistantQuestionsCount?: number;
  // Usage metrics from DB (all plans)
  dailySearchesUsed?: number;
  weeklySearchesUsed?: number;
  monthlySearchesUsed?: number;
  dailySearchesRemaining?: number;
  weeklySearchesRemaining?: number;
  monthlySearchesRemaining?: number;
}


interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canPerformAction: (
    action: 'aiSearch' | 'saveJob' | 'uploadResume' | 'askQuestion' | 'application'
  ) => { allowed: boolean; remaining: number };
  showUpgradeModal: (feature: string) => void;
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
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | null>(null);

  const showUpgradeModal = (feature: string) => {
    setUpgradeModalFeature(feature);
  };

  const refreshSubscription = async () => {
    try {
      const rawUser = localStorage.getItem('userInfo');
      let token = null;
      let isAdmin = false;
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          token = parsed.token;
          isAdmin = Boolean(parsed.isAdmin);
        } catch { /* ignore */ }
      }

      // Admin users don't have a subscription — skip the fetch entirely
      // to avoid the 401 response that was blanking the admin page
      if (!token || isAdmin) {
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
    window.addEventListener('userInfoUpdated', refreshSubscription);
    return () => window.removeEventListener('userInfoUpdated', refreshSubscription);
  }, []);

  useEffect(() => {
    if (!loading && subscription && !subscription.subscriptionPlan) {
      const wasShown = localStorage.getItem('firstTimeSubscriptionShown');
      if (!wasShown) {
        localStorage.setItem('firstTimeSubscriptionShown', '1');
        setShowFirstTimeModal(true);
      }
    }
  }, [loading, subscription]);

  const canPerformAction = (
    action: 'aiSearch' | 'saveJob' | 'uploadResume' | 'askQuestion' | 'application'
  ): { allowed: boolean; remaining: number } => {
    if (!subscription) {
      return { allowed: false, remaining: 0 };
    }

    switch (action) {
      case 'aiSearch': {
        const planName = String(subscription.subscriptionPlan || '').toLowerCase();
        if (planName === 'free') {
          const weeklyRemaining = subscription.weeklySearchesRemaining ?? 0;
          const monthlyRemaining = subscription.monthlySearchesRemaining ?? 0;
          const remaining = Math.min(weeklyRemaining, monthlyRemaining);
          return {
            allowed: remaining > 0,
            remaining,
          };
        }

        const dailyRemaining = subscription.dailySearchesRemaining ?? 0;
        return {
          allowed: dailyRemaining > 0,
          remaining: dailyRemaining,
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
      case 'askQuestion': {
        const limit = subscription.maxAssistantQuestions ?? (subscription.subscriptionPlan === 'Free' ? 20 : 0);
        const used = subscription.assistantQuestionsCount ?? 0;
        const remaining = Math.max(0, limit === 0 ? Infinity : limit - used);
        return {
          allowed: limit === 0 || used < limit,
          remaining: remaining === Infinity ? 999 : remaining,
        };
      }
      case 'application': {
        const limit = subscription.maxApplications ?? (subscription.subscriptionPlan === 'Free' ? 3 : 0);
        const used = subscription.applicationsCount ?? 0;
        const remaining = Math.max(0, limit === 0 ? Infinity : limit - used);
        return {
          allowed: limit === 0 || used < limit,
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
    showUpgradeModal,
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

      {/* Upgrade Modal triggered globally */}
      {upgradeModalFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUpgradeModalFeature(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100 mx-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Upgrade to Pro</h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              You've reached the limit for <span className="font-semibold text-gray-900">{upgradeModalFeature}</span>. 
              Upgrade to our Pro plan for unlimited access, advanced AI features, and more.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button 
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => setUpgradeModalFeature(null)}
              >
                Maybe Later
              </button>
              <a 
                href="/pricing"
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-[#FF4500] hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg text-center"
              >
                View Pro Plans
              </a>
            </div>
          </div>
        </div>
      )}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
export { SubscriptionContext };
