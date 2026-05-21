import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  Free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    aiSearches: 4,
    savedJobs: 10,
    resumeUploads: 1,
    emailNotifications: false,
    prioritySupport: false,
    advancedAnalytics: false,
    atsScoring: false,
    skillGapAnalysis: false,
    careerRoadmap: false,
  },
  ProMonthly: {
    name: 'ProMonthly',
    monthlyPrice: 9.99,
    yearlyPrice: 0,
    aiSearches: 30, // Daily searches
    savedJobs: 0, // unlimited
    resumeUploads: 0, // unlimited
    emailNotifications: true,
    prioritySupport: true,
    advancedAnalytics: true,
    atsScoring: true,
    skillGapAnalysis: true,
    careerRoadmap: false,
  },
  ProYearly: {
    name: 'ProYearly',
    monthlyPrice: 0,
    yearlyPrice: 99.99,
    aiSearches: 30, // Daily searches
    savedJobs: 0, // unlimited
    resumeUploads: 0, // unlimited
    emailNotifications: true,
    prioritySupport: true,
    advancedAnalytics: true,
    atsScoring: true,
    skillGapAnalysis: true,
    careerRoadmap: true,
  },
};

/**
 * Get user subscription status
 */
export const getUserSubscription = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        billingCycle: true,
        autoRenew: true,
        aiSearchesUsed: true,
        maxAISearches: true,
        savedJobsCount: true,
        maxSavedJobs: true,
        resumeUploadsCount: true,
        maxResumeUploads: true,
        lastResetDate: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if subscription has expired
    if (user.subscriptionEndDate && new Date() > user.subscriptionEndDate) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'expired',
          subscriptionPlan: 'Free',
        },
      });
      user.subscriptionStatus = 'expired';
      user.subscriptionPlan = 'Free';
    }

    return user;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
};

/**
 * Upgrade or change subscription plan
 */
export const updateSubscription = async (
  userId: number,
  newPlan: keyof typeof SUBSCRIPTION_PLANS,
  billingCycle: 'monthly' | 'yearly'
) => {
  try {
    const planConfig = SUBSCRIPTION_PLANS[newPlan];
    if (!planConfig) {
      throw new Error('Invalid subscription plan');
    }

    const currentDate = new Date();
    let endDate = new Date(currentDate);

    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true },
    });

    // Record in subscription history
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        planName: newPlan,
        action: user?.subscriptionPlan === 'Free' ? 'purchase' : 'upgrade',
        previousPlan: user?.subscriptionPlan || 'Free',
        newPlan,
        amount:
          billingCycle === 'yearly' ? planConfig.yearlyPrice : planConfig.monthlyPrice,
        currency: 'USD',
        status: 'completed',
        startDate: currentDate,
        endDate,
      },
    });

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: newPlan,
        subscriptionStatus: 'active',
        subscriptionStartDate: currentDate,
        subscriptionEndDate: endDate,
        billingCycle,
        autoRenew: true,
        // Reset usage limits based on new plan
        aiSearchesUsed: 0,
        maxAISearches: planConfig.aiSearches || 99999,
        maxSavedJobs: planConfig.savedJobs || 99999,
        maxResumeUploads: planConfig.resumeUploads || 99999,
        lastResetDate: currentDate,
      },
      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        billingCycle: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionEndDate: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Record cancellation
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        planName: user.subscriptionPlan,
        action: 'cancel',
        previousPlan: user.subscriptionPlan,
        newPlan: 'Free',
        status: 'completed',
        endDate: new Date(),
      },
    });

    // Downgrade to Free plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: 'Free',
        subscriptionStatus: 'cancelled',
        subscriptionEndDate: new Date(),
        autoRenew: false,
        maxAISearches: SUBSCRIPTION_PLANS.Free.aiSearches,
        maxSavedJobs: SUBSCRIPTION_PLANS.Free.savedJobs,
        maxResumeUploads: SUBSCRIPTION_PLANS.Free.resumeUploads,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Check if user can perform action based on usage limits
 */
export const canPerformAction = async (
  userId: number,
  actionType: 'aiSearch' | 'saveJob' | 'uploadResume' | 'askQuestion'
): Promise<{ allowed: boolean; message?: string; remainingUsage?: number }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionPlan: true,
        aiSearchesUsed: true,
        maxAISearches: true,
        savedJobsCount: true,
        maxSavedJobs: true,
        resumeUploadsCount: true,
        maxResumeUploads: true,
        lastResetDate: true,
      },
    });

    if (!user) {
      return { allowed: false, message: 'User not found' };
    }

    // Check if it's a new month for free plan
    const lastReset = new Date(user.lastResetDate);
    const now = new Date();
    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      // Reset monthly limits
      if (user.subscriptionPlan === 'Free') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            aiSearchesUsed: 0,
            lastResetDate: now,
          },
        });
        user.aiSearchesUsed = 0;
      }
    }

    switch (actionType) {
      case 'aiSearch':
        const canSearch =
          user.maxAISearches === 0 || user.aiSearchesUsed < user.maxAISearches;
        return {
          allowed: canSearch,
          message: canSearch ? undefined : 'AI search limit reached',
          remainingUsage: user.maxAISearches === 0 ? 0 : user.maxAISearches - user.aiSearchesUsed,
        };

      case 'saveJob':
        const canSave =
          user.maxSavedJobs === 0 || user.savedJobsCount < user.maxSavedJobs;
        return {
          allowed: canSave,
          message: canSave ? undefined : 'Saved jobs limit reached',
          remainingUsage: user.maxSavedJobs === 0 ? 0 : user.maxSavedJobs - user.savedJobsCount,
        };

      case 'uploadResume':
        const canUpload =
          user.maxResumeUploads === 0 || user.resumeUploadsCount < user.maxResumeUploads;
        return {
          allowed: canUpload,
          message: canUpload ? undefined : 'Resume upload limit reached',
          remainingUsage: user.maxResumeUploads === 0 ? 0 : user.maxResumeUploads - user.resumeUploadsCount,
        };

      default:
        return { allowed: true };
    }
  } catch (error) {
    console.error('Error checking action limit:', error);
    return { allowed: false, message: 'Error checking limits' };
  }
};

/**
 * Increment usage counter
 */
export const incrementUsage = async (
  userId: number,
  usageType: 'aiSearchesUsed' | 'savedJobsCount' | 'resumeUploadsCount'
) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        [usageType]: {
          increment: 1,
        },
      },
      select: {
        [usageType]: true,
      },
    });

    // Record in usage tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trackingData: any = {};
    if (usageType === 'aiSearchesUsed') {
      trackingData.aiSearchesUsed = { increment: 1 };
    } else if (usageType === 'savedJobsCount') {
      trackingData.jobsSaved = { increment: 1 };
    } else if (usageType === 'resumeUploadsCount') {
      trackingData.resumesUploaded = { increment: 1 };
    }

    await prisma.usageTracking.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: trackingData,
      create: {
        userId,
        date: today,
        ...trackingData,
      },
    });

    return user;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    throw error;
  }
};

/**
 * Get subscription history for user
 */
export const getSubscriptionHistory = async (userId: number, limit = 10) => {
  try {
    return await prisma.subscriptionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    throw error;
  }
};

/**
 * Get usage analytics for user
 */
export const getUserUsageAnalytics = async (userId: number, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usage = await prisma.usageTracking.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const summary = {
      totalAISearches: 0,
      totalJobsSaved: 0,
      totalResumesUploaded: 0,
      totalQuestionsAsked: 0,
      dailyData: usage,
    };

    usage.forEach((day) => {
      summary.totalAISearches += day.aiSearchesUsed;
      summary.totalJobsSaved += day.jobsSaved;
      summary.totalResumesUploaded += day.resumesUploaded;
      summary.totalQuestionsAsked += day.aiQuestionsAsked;
    });

    return summary;
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    throw error;
  }
};
