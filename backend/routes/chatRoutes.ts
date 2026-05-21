import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { sendChat, upsertChatKnowledge, getKnowledge } from '../controller/aiChatController';

const router = express.Router();

router.post('/chat', sendChat);
router.post('/knowledge', authMiddleware, upsertChatKnowledge);
router.get('/knowledge', authMiddleware, getKnowledge);

export default router;
