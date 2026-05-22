import { useState, useCallback } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface UseUpgradePromptOptions {
  featureName?: string;
  reason?: 'usage-limit' | 'feature-locked' | 'custom';
  customMessage?: string;
}

export function useUpgradePrompt(options: UseUpgradePromptOptions = {}) {
  const { canPerformAction, isPremium } = useSubscription();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState({
    reason: options.reason || 'feature-locked',
    featureName: options.featureName || 'Premium Feature',
    message: options.customMessage,
  });

  const showUpgradeModal = useCallback(
    (
      newReason: 'usage-limit' | 'feature-locked' | 'custom' = 'feature-locked',
      feature = 'Premium Feature'
    ) => {
      setUpgradeInfo({
        reason: newReason,
        featureName: feature,
        message: options.customMessage,
      });
      setIsUpgradeModalOpen(true);
    },
    [options.customMessage]
  );

  const checkAndPromptUpgrade = useCallback(
    (action: 'aiSearch' | 'saveJob' | 'uploadResume'): boolean => {
      if (isPremium) {
        return true; // Premium users can always perform actions
      }

      const { allowed, remaining } = canPerformAction(action);

      if (!allowed) {
        const actionNames: Record<string, string> = {
          aiSearch: 'AI searches',
          saveJob: 'saved jobs',
          uploadResume: 'resume uploads',
        };

        showUpgradeModal('usage-limit', actionNames[action]);
        return false;
      }

      if (remaining < 2) {
        console.warn(`Warning: Only ${remaining} ${action} left`);
      }

      return true;
    },
    [isPremium, canPerformAction, showUpgradeModal]
  );

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  return {
    isUpgradeModalOpen,
    upgradeInfo,
    showUpgradeModal,
    closeUpgradeModal,
    checkAndPromptUpgrade,
    isPremium,
    canPerformAction,
  };
}
