import prisma from '../config/prisma';
import { Request, Response } from 'express';
import transporter from '../utils/sendEmail';
import { calculateRecoveryDeadline } from '../utils/dateUtils';

// Constants
const RECOVERY_PERIOD_DAYS = 7;

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Soft delete a user account (7-day recovery period)
 */
export const softDeleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find the user
    const user = await (prisma as any).user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already scheduled for deletion
    if (user.isDeletionScheduled) {
      res.status(400).json({ 
        message: 'Your account is already scheduled for deletion. Check your email for recovery options.',
        recoveryDeadline: user.recoveryDeadlineDate 
      });
      return;
    }

    const now = new Date();
    const recoveryDeadline = new Date(now.getTime() + RECOVERY_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    // Mark account for deletion
    await (prisma as any).user.update({
      where: { id: userId },
      data: {
        isDeletionScheduled: true,
        deletionRequestedDate: now,
        deletionScheduledDate: recoveryDeadline,
        recoveryDeadlineDate: recoveryDeadline,
      },
    });

    // Send deletion notification email
    await transporter.sendMail({
      to: user.email,
      subject: 'Account Deletion Initiated',
      html: `
        <h2>Your JobOps Account Has Entered the Recovery Period</h2>
        <p>Your account is scheduled for permanent deletion on <strong>${recoveryDeadline.toLocaleDateString()}</strong>.</p>
        <p>During this 7-day period, you can:</p>
        <ul>
          <li>Request account recovery through the JobOps platform</li>
          <li>Contact our support team at support@jobops.com</li>
        </ul>
        <p><strong>After ${RECOVERY_PERIOD_DAYS} days, all your data will be permanently deleted and cannot be recovered.</strong></p>
        <p>Recovery requests are reviewed by administrators within 24 hours.</p>
        <a href="${process.env.FRONTEND_URL}/recover-account?email=${encodeURIComponent(user.email)}" style="background-color: #FF4500; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">
          Request Account Recovery
        </a>
      `,
    });

    res.status(200).json({
      message: 'Account deletion initiated. 7-day recovery period has started.',
      recoveryDeadline: recoveryDeadline,
      recoveryPeriodDays: RECOVERY_PERIOD_DAYS,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error soft deleting account:', err);
    res.status(500).json({ message: 'Failed to delete account. Please try again.' });
  }
};

/**
 * Submit an account recovery request
 */
export const submitRecoveryRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, reasonForDeletion, reasonForRecovery } = req.body;

    if (!email || !reasonForRecovery) {
      res.status(400).json({ message: 'Email and recovery reason are required' });
      return;
    }

    // Find deleted user account
    const user = await (prisma as any).user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    if (!user.isDeletionScheduled) {
      res.status(400).json({ message: 'This account has not been scheduled for deletion' });
      return;
    }

    const now = new Date();

    // Check if recovery deadline has passed
    if (now > new Date(user.recoveryDeadlineDate)) {
      res.status(400).json({ message: 'Recovery period has expired. Permanent deletion is complete.' });
      return;
    }

    // Check for duplicate requests
    const existingRequest = await (prisma as any).accountrecoveryrequest.findFirst({
      where: {
        userId: user.id,
        status: 'Pending',
      },
    });

    if (existingRequest) {
      res.status(400).json({ message: 'You already have a pending recovery request.' });
      return;
    }

    // Create recovery request
    const recoveryRequest = await (prisma as any).accountrecoveryrequest.create({
      data: {
        userId: user.id,
        email: email,
        reasonForDeletion: reasonForDeletion || null,
        reasonForRecovery: reasonForRecovery,
        status: 'Pending',
        deletedDate: user.deletionRequestedDate,
        recoveryDeadlineDate: user.recoveryDeadlineDate,
        cooldownEndDate: user.recoveryDeadlineDate,
      },
    });

    // Create admin notification
    await (prisma as any).adminNotification.create({
      data: {
        title: 'New Account Recovery Request',
        message: `User ${email} has requested account recovery. Review deadline: ${user.recoveryDeadlineDate.toLocaleDateString()}`,
        type: 'recovery_request',
        relatedUserId: user.id,
        relatedRequestId: recoveryRequest.id,
        isRead: false,
      },
    });

    // Send confirmation email to user
    await transporter.sendMail({
      to: email,
      subject: 'Account Recovery Request Submitted',
      html: `
        <h2>Recovery Request Received</h2>
        <p>Your account recovery request has been submitted for review.</p>
        <p><strong>Recovery Deadline:</strong> ${new Date(user.recoveryDeadlineDate).toLocaleDateString()}</p>
        <p>Our administrators will review your request within 24 hours.</p>
        <p>You will receive an email notification when your request is approved or rejected.</p>
      `,
    });

    res.status(201).json({
      message: 'Recovery request submitted successfully',
      recoveryRequestId: recoveryRequest.id,
      recoveryDeadline: user.recoveryDeadlineDate,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error submitting recovery request:', err);
    res.status(500).json({ message: 'Failed to submit recovery request. Please try again.' });
  }
};

/**
 * Check if email is in deletion period
 */
export const checkDeletionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await (prisma as any).user.findUnique({ where: { email: String(email) } });

    if (!user) {
      res.status(200).json({ isDeletionScheduled: false });
      return;
    }

    if (!user.isDeletionScheduled) {
      res.status(200).json({ isDeletionScheduled: false });
      return;
    }

    const now = new Date();
    const hasExpired = now > new Date(user.recoveryDeadlineDate);

    res.status(200).json({
      isDeletionScheduled: true,
      recoveryDeadlineDate: user.recoveryDeadlineDate,
      daysRemaining: Math.ceil(
        (new Date(user.recoveryDeadlineDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      ),
      hasExpired,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error checking deletion status:', err);
    res.status(500).json({ message: 'Error checking deletion status' });
  }
};

/**
 * Admin: Get all recovery requests
 */
export const getRecoveryRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let where: any = {};
    if (status) {
      where.status = String(status);
    }

    const requests = await (prisma as any).accountrecoveryrequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await (prisma as any).accountrecoveryrequest.count({ where });

    res.status(200).json({
      requests,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching recovery requests:', err);
    res.status(500).json({ message: 'Error fetching recovery requests' });
  }
};

/**
 * Admin: Approve recovery request
 */
export const approveRecoveryRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;
    const adminId = req.user?.id;

    if (!requestId || !adminId) {
      res.status(400).json({ message: 'Request ID and admin ID are required' });
      return;
    }

    const request = await (prisma as any).accountrecoveryrequest.findUnique({
      where: { id: Number(requestId) },
    });

    if (!request) {
      res.status(404).json({ message: 'Recovery request not found' });
      return;
    }

    if (request.status !== 'Pending') {
      res.status(400).json({ message: 'Request has already been processed' });
      return;
    }

    // Update request status
    await (prisma as any).accountrecoveryrequest.update({
      where: { id: Number(requestId) },
      data: {
        status: 'Approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Restore user account
    await (prisma as any).user.update({
      where: { id: request.userId },
      data: {
        isDeletionScheduled: false,
        deletionRequestedDate: null,
        deletionScheduledDate: null,
        recoveryDeadlineDate: null,
      },
    });

    // Send approval email
    await transporter.sendMail({
      to: request.email,
      subject: 'Account Recovery Approved',
      html: `
        <h2>Your JobOps Account Has Been Restored</h2>
        <p>Your account recovery request has been approved.</p>
        <p>Your account and all previously saved information have been restored.</p>
        <p>You can now sign in to your account using your existing email address and password.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="background-color: #FF4500; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">
          Sign In to Your Account
        </a>
      `,
    });

    // Update admin notification
    await (prisma as any).adminNotification.updateMany({
      where: { relatedRequestId: Number(requestId) },
      data: { isRead: true },
    });

    res.status(200).json({ message: 'Recovery request approved and account restored' });
  } catch (error) {
    const err = error as Error;
    console.error('Error approving recovery request:', err);
    res.status(500).json({ message: 'Error approving recovery request' });
  }
};

/**
 * Admin: Reject recovery request
 */
export const rejectRecoveryRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;
    const adminId = req.user?.id;

    if (!requestId || !adminId) {
      res.status(400).json({ message: 'Request ID and admin ID are required' });
      return;
    }

    const request = await (prisma as any).accountrecoveryrequest.findUnique({
      where: { id: Number(requestId) },
    });

    if (!request) {
      res.status(404).json({ message: 'Recovery request not found' });
      return;
    }

    if (request.status !== 'Pending') {
      res.status(400).json({ message: 'Request has already been processed' });
      return;
    }

    // Update request status
    await (prisma as any).accountrecoveryrequest.update({
      where: { id: Number(requestId) },
      data: {
        status: 'Rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Keep user account in deletion state
    // Send rejection email
    await transporter.sendMail({
      to: request.email,
      subject: 'Account Recovery Request Update',
      html: `
        <h2>Account Recovery Request Decision</h2>
        <p>Your account recovery request has been reviewed and was not approved at this time.</p>
        <p>Your account will be permanently deleted after the recovery period ends.</p>
        <p>You may register again with your email address after the recovery period expires.</p>
      `,
    });

    // Update admin notification
    await (prisma as any).adminNotification.updateMany({
      where: { relatedRequestId: Number(requestId) },
      data: { isRead: true },
    });

    res.status(200).json({ message: 'Recovery request rejected' });
  } catch (error) {
    const err = error as Error;
    console.error('Error rejecting recovery request:', err);
    res.status(500).json({ message: 'Error rejecting recovery request' });
  }
};

/**
 * Permanently delete account (called by a scheduled job after 7 days)
 */
export const permanentlyDeleteAccount = async (userId: number): Promise<void> => {
  try {
    const user = await (prisma as any).user.findUnique({ where: { id: userId } });

    if (!user || !user.isDeletionScheduled) {
      return;
    }

    const now = new Date();

    // Check if recovery period has expired
    if (now <= new Date(user.recoveryDeadlineDate)) {
      return;
    }

    // Delete related data
    await (prisma as any).resume.deleteMany({ where: { userId } });
    await (prisma as any).savedJob.deleteMany({ where: { userId } });
    await (prisma as any).profile.deleteMany({ where: { userId } });
    await (prisma as any).workflow.deleteMany({ where: { userId } });

    // Finally delete user
    await (prisma as any).user.delete({ where: { id: userId } });

    console.log(`Permanently deleted user account: ${user.email}`);
  } catch (error) {
    const err = error as Error;
    console.error('Error permanently deleting account:', err);
  }
};

/**
 * Utility: Run permanent deletion job for all expired accounts
 */
export const runPermanentDeletionJob = async (): Promise<void> => {
  try {
    const expiredUsers = await (prisma as any).user.findMany({
      where: {
        isDeletionScheduled: true,
        recoveryDeadlineDate: {
          lt: new Date(),
        },
      },
    });

    for (const user of expiredUsers) {
      await permanentlyDeleteAccount(user.id);
    }

    console.log(`Permanent deletion job completed: ${expiredUsers.length} accounts deleted`);
  } catch (error) {
    const err = error as Error;
    console.error('Error running permanent deletion job:', err);
  }
};
