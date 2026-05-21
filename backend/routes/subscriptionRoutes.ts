import express, { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  requireSubscription,
  requirePlan,
  checkUsageLimit,
} from '../middleware/subscriptionMiddleware';
import {
  getCurrentSubscription,
  getAvailablePlans,
  updateUserSubscription,
  cancelUserSubscription,
  getHistory,
  getUsageAnalytics,
  getAdminSubscriptionAnalytics,
  recordSubscriptionPayment,
} from '../controller/subscriptionController';

const router: Router = express.Router();

// Public routes
router.get('/plans', getAvailablePlans);

// Protected routes (authenticated users)
router.get('/current', authMiddleware, getCurrentSubscription);
router.put('/upgrade', authMiddleware, updateUserSubscription);
router.post('/cancel', authMiddleware, cancelUserSubscription);
router.get('/history', authMiddleware, getHistory);
router.get('/analytics', authMiddleware, getUsageAnalytics);

// Admin routes
router.get('/admin/analytics', authMiddleware, getAdminSubscriptionAnalytics);
router.post('/admin/record-payment', authMiddleware, recordSubscriptionPayment);

export default router;
