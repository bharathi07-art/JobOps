import { useCallback } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface UseUpgradePromptOptions {
  featureName?: string;
  reason?: 'usage-limit' | 'feature-locked' | 'custom';
  customMessage?: string;
}

export function useUpgradePrompt(_options: UseUpgradePromptOptions = {}) {
  const { canPerformAction, isPremium, showUpgradeModal: globalShowUpgradeModal } = useSubscription();

  const showUpgradeModal = useCallback(
    (
      _newReason: 'usage-limit' | 'feature-locked' | 'custom' = 'feature-locked',
      feature = 'Premium Feature'
    ) => {
      globalShowUpgradeModal(feature);
    },
    [globalShowUpgradeModal]
  );

  const checkAndPromptUpgrade = useCallback(
    (action: 'aiSearch' | 'saveJob' | 'uploadResume' | 'askQuestion' | 'application'): boolean => {
      if (isPremium) {
        return true; // Premium users can always perform actions
      }

      const { allowed, remaining } = canPerformAction(action);

      if (!allowed) {
        const actionNames: Record<string, string> = {
          aiSearch: 'AI searches',
          saveJob: 'saved jobs',
          uploadResume: 'resume uploads',
          askQuestion: 'assistant questions',
          application: 'applications',
        };

        showUpgradeModal('usage-limit', actionNames[action] || action);
        return false;
      }

      if (remaining < 2) {
        console.warn(`Warning: Only ${remaining} ${action} left`);
      }

      return true;
    },
    [isPremium, canPerformAction, showUpgradeModal]
  );

  return {
    showUpgradeModal,
    checkAndPromptUpgrade,
    isPremium,
    canPerformAction,
  };
}
