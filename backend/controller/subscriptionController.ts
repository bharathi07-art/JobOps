import { Request, Response } from 'express';
import {
  getUserSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionHistory,
  getUserUsageAnalytics,
  SUBSCRIPTION_PLANS,
  incrementUsage,
} from '../services/subscriptionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Get current subscription status
 */
export const getCurrentSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const subscription = await getUserSubscription(req.user.id);
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Error fetching subscription' });
  }
};

/**
 * Get all available plans
 */
export const getAvailablePlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, config]) => ({
      id: key,
      ...config,
      features: getFeaturesList(key as keyof typeof SUBSCRIPTION_PLANS),
    }));

    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

/**
 * Get plan features
 */
const getFeaturesList = (planName: keyof typeof SUBSCRIPTION_PLANS): string[] => {
  const baseFeatures = [
    'Dashboard access',
    'Job search',
    'Resume upload',
  ];

  const features: Record<keyof typeof SUBSCRIPTION_PLANS, string[]> = {
    Free: [
      ...baseFeatures,
      '4 AI searches/month',
      '10 saved jobs',
      '1 resume upload',
      'Basic analytics',
    ],
    ProMonthly: [
      ...baseFeatures,
      'Unlimited AI searches (1 per day)',
      'Daily email notifications',
      'Unlimited saved jobs',
      'Unlimited resume uploads',
      'Advanced AI analysis',
      'ATS scoring',
      'Skill-gap analysis',
      'AI recommendations',
      'Advanced analytics',
      'Priority support',
      'Application insights',
    ],
    ProYearly: [
      ...baseFeatures,
      'Unlimited AI searches (1 per day)',
      'Daily email notifications',
      'Unlimited saved jobs',
      'Unlimited resume uploads',
      'Advanced AI analysis',
      'ATS scoring',
      'Skill-gap analysis',
      'AI recommendations',
      'Advanced analytics',
      'Priority support',
      'Application insights',
      'Early access features',
      'Personalized AI career roadmap',
      'Enhanced recommendations',
      'Future premium integrations',
    ],
  };

  return features[planName] || [];
};

/**
 * Upgrade/Downgrade subscription
 */
export const updateUserSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { planName, billingCycle } = req.body;

    if (!planName || !['monthly', 'yearly'].includes(billingCycle)) {
      res.status(400).json({ message: 'Invalid plan or billing cycle' });
      return;
    }

    const validPlans = Object.keys(SUBSCRIPTION_PLANS);
    if (!validPlans.includes(planName)) {
      res.status(400).json({ message: 'Invalid subscription plan' });
      return;
    }

    const updatedSubscription = await updateSubscription(
      req.user.id,
      planName as keyof typeof SUBSCRIPTION_PLANS,
      billingCycle as 'monthly' | 'yearly'
    );

    res.status(200).json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
};

/**
 * Cancel subscription
 */
export const cancelUserSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const updatedUser = await cancelSubscription(req.user.id);

    res.status(200).json({
      message: 'Subscription cancelled successfully',
      subscription: updatedUser,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
};

/**
 * Get subscription history
 */
export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { limit = 10 } = req.query;
    const history = await getSubscriptionHistory(req.user.id, parseInt(limit as string));

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    res.status(500).json({ message: 'Error fetching subscription history' });
  }
};

/**
 * Get usage analytics
 */
export const getUsageAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { days = 30 } = req.query;
    const analytics = await getUserUsageAnalytics(req.user.id, parseInt(days as string));

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    res.status(500).json({ message: 'Error fetching usage analytics' });
  }
};

/**
 * Get admin subscription analytics
 */
export const getAdminSubscriptionAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    // Monthly revenue
    const monthlyRevenue = await prisma.subscriptionHistory.groupBy({
      by: ['createdAt'],
      where: {
        status: 'completed',
        action: { in: ['purchase', 'renew', 'upgrade'] },
      },
      _sum: {
        amount: true,
      },
    });

    // Subscription counts
    const subscriptionCounts = await prisma.user.groupBy({
      by: ['subscriptionPlan'],
      _count: true,
    });

    // Total subscriptions by status
    const subscriptionsByStatus = await prisma.user.groupBy({
      by: ['subscriptionStatus'],
      _count: true,
    });

    // Revenue summary
    const totalRevenue = await prisma.subscriptionHistory.aggregate({
      where: {
        status: 'completed',
        action: { in: ['purchase', 'renew', 'upgrade'] },
      },
      _sum: {
        amount: true,
      },
    });

    // Yearly vs Monthly breakdown
    const yearlyVsMonthly = await prisma.user.groupBy({
      by: ['billingCycle'],
      where: {
        subscriptionPlan: { in: ['ProMonthly', 'ProYearly'] },
      },
      _count: true,
    });

    // Active subscriptions count
    const activeSubscriptions = await prisma.user.count({
      where: {
        subscriptionStatus: 'active',
      },
    });

    // Free users count
    const freeUsers = await prisma.user.count({
      where: {
        subscriptionPlan: 'Free',
      },
    });

    res.status(200).json({
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscriptions,
        freeUsers,
        totalUsers: activeSubscriptions + freeUsers,
      },
      subscriptionCounts,
      subscriptionsByStatus,
      yearlyVsMonthly,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

/**
 * Record manual payment/subscription (for admin)
 */
export const recordSubscriptionPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { userId, planName, billingCycle, amount, paymentId, status } = req.body;

    if (!userId || !planName) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const updatedSubscription = await updateSubscription(
      userId,
      planName as keyof typeof SUBSCRIPTION_PLANS,
      billingCycle as 'monthly' | 'yearly'
    );

    res.status(200).json({
      message: 'Subscription recorded successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error recording subscription:', error);
    res.status(500).json({ message: 'Error recording subscription' });
  }
};
