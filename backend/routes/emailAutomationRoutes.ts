import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getEmailAutomationSettings,
  updateEmailAutomationSettings,
} from '../controller/emailAutomationController';

const router = express.Router();

router.get('/current', authMiddleware, getEmailAutomationSettings);
router.put('/settings', authMiddleware, updateEmailAutomationSettings);

export default router;

