import express from 'express';
import prisma from '../config/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Submit feedback (authenticated users)
router.post('/submit', authMiddleware, async (req: any, res) => {
  try {
    const { subject, message, type, priority } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        subject,
        message,
        type: type || 'Feedback',
        priority: priority || 'Medium',
        userId: Number(userId),
      },
    });

    return res.status(201).json({ success: true, message: 'Feedback submitted', feedback });
  } catch (error: any) {
    console.error('Feedback submit error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all feedbacks (admin)
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden' });

    const feedbacks = await prisma.feedback.findMany({ include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, feedbacks });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get feedbacks for logged-in user
router.get('/mine', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const feedbacks = await prisma.feedback.findMany({ where: { userId: Number(userId) }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, feedbacks });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update status or reply (admin)
router.patch('/:id', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden' });

    const id = Number(req.params.id);
    const { status, reply, priority } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (reply) data.reply = reply;
    if (priority) data.priority = priority;

    const updated = await prisma.feedback.update({ where: { id }, data });
    return res.json({ success: true, feedback: updated });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete feedback (admin)
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden' });

    const id = Number(req.params.id);
    await prisma.feedback.delete({ where: { id } });
    return res.json({ success: true, message: 'Feedback deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
