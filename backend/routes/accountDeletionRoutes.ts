import express, { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import {
  softDeleteAccount,
  submitRecoveryRequest,
  checkDeletionStatus,
  getRecoveryRequests,
  approveRecoveryRequest,
  rejectRecoveryRequest,
} from '../services/accountDeletionService';

const router: Router = express.Router();

// User Routes
/**
 * POST /api/account/delete
 * Initiate soft deletion of account (7-day recovery period)
 * @requires Authentication
 */
router.post('/delete', authMiddleware, softDeleteAccount as any);

/**
 * GET /api/account/deletion-status
 * Check if an account is scheduled for deletion
 * @query email - The email address to check
 */
router.get('/deletion-status', checkDeletionStatus);

/**
 * POST /api/account/recovery-request
 * Submit a recovery request for a deleted account
 */
router.post('/recovery-request', submitRecoveryRequest as any);

// Admin Routes
/**
 * GET /api/account/recovery-requests
 * Get all account recovery requests (Admin only)
 * @requires Admin Authentication
 * @query status - Filter by status (Pending, Approved, Rejected)
 * @query limit - Number of results (default: 20)
 * @query offset - Pagination offset (default: 0)
 */
router.get('/recovery-requests', authMiddleware, adminMiddleware, getRecoveryRequests as any);

/**
 * POST /api/account/recovery-request/:id/approve
 * Approve a recovery request (Admin only)
 * @requires Admin Authentication
 */
router.post('/recovery-request/approve', authMiddleware, adminMiddleware, approveRecoveryRequest as any);

/**
 * POST /api/account/recovery-request/:id/reject
 * Reject a recovery request (Admin only)
 * @requires Admin Authentication
 */
router.post('/recovery-request/reject', authMiddleware, adminMiddleware, rejectRecoveryRequest as any);

export default router;
