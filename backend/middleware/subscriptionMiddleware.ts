import { Request, Response, NextFunction } from 'express';
import { getUserSubscription, canPerformAction } from '../services/subscriptionService';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to verify user has active subscription
 */
export const requireSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const subscription = await getUserSubscription(req.user.id);

    if (
      subscription.subscriptionStatus !== 'active' ||
      (subscription.subscriptionEndDate && new Date() > subscription.subscriptionEndDate)
    ) {
      res.status(403).json({
        message: 'Premium subscription required',
        currentPlan: subscription.subscriptionPlan,
      });
      return;
    }

    req.user.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error in requireSubscription middleware:', error);
    res.status(500).json({ message: 'Error verifying subscription' });
  }
};

/**
 * Middleware to verify user has specific plan
 */
export const requirePlan = (allowedPlans: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const subscription = await getUserSubscription(req.user.id);

      if (!allowedPlans.includes(subscription.subscriptionPlan)) {
        res.status(403).json({
          message: 'This feature requires a premium plan',
          currentPlan: subscription.subscriptionPlan,
          requiredPlans: allowedPlans,
        });
        return;
      }

      req.user.subscription = subscription;
      next();
    } catch (error) {
      console.error('Error in requirePlan middleware:', error);
      res.status(500).json({ message: 'Error verifying plan' });
    }
  };
};

/**
 * Middleware to check usage limits before action
 */
export const checkUsageLimit = (actionType: 'aiSearch' | 'saveJob' | 'uploadResume' | 'askQuestion') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { allowed, message, remainingUsage } = await canPerformAction(req.user.id, actionType);

      if (!allowed) {
        res.status(429).json({
          message: message || `${actionType} limit reached`,
          remainingUsage,
          upgrade: true,
        });
        return;
      }

      req.user.remainingUsage = remainingUsage;
      next();
    } catch (error) {
      console.error('Error in checkUsageLimit middleware:', error);
      res.status(500).json({ message: 'Error checking usage limits' });
    }
  };
};

/**
 * Middleware to track usage (increments counters)
 */
export const trackUsage = (usageType: 'aiSearchesUsed' | 'savedJobsCount' | 'resumeUploadsCount') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        // Still proceed if not logged in, just don't track
        next();
        return;
      }

      // Track usage after the route completes
      const originalSend = res.send;

      res.send = function (data: any) {
        // Only track if response is successful (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const { incrementUsage } = require('../services/subscriptionService');
          incrementUsage(req.user.id, usageType).catch((err: any) => {
            console.error('Error tracking usage:', err);
          });
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Error in trackUsage middleware:', error);
      next();
    }
  };
};
