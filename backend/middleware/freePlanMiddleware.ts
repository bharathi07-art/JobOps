import { Request, Response, NextFunction } from 'express';
import { getUserSubscription } from '../services/subscriptionService';

interface AuthRequest extends Request {
  user?: any;
}

export const freePlanOnly = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const sub = await getUserSubscription(req.user.id);
    if (sub.subscriptionPlan !== 'Free') {
      res.status(403).json({ message: 'Feature limited to Free plan' });
      return;
    }
    next();
  } catch (error) {
    console.error('Error in freePlanOnly middleware:', error);
    res.status(500).json({ message: 'Error verifying plan' });
  }
};
