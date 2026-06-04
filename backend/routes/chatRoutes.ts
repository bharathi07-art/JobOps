import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  requireSubscription,
  checkUsageLimit,
} from '../middleware/subscriptionMiddleware';
import { sendChat, upsertChatKnowledge, getKnowledge } from '../controller/aiChatController';

const router = express.Router();

router.post('/chat', authMiddleware, checkUsageLimit('askQuestion'), sendChat);

router.post('/knowledge', authMiddleware, upsertChatKnowledge);
router.get('/knowledge', authMiddleware, getKnowledge);

export default router;
