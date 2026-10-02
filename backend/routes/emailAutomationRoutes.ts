import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';
import {
  getEmailAutomationSettings,
  updateEmailAutomationSettings,
  uploadAutomationResume
} from '../controller/emailAutomationController';

const router = express.Router();

router.get('/current', authMiddleware, getEmailAutomationSettings);
router.put('/settings', authMiddleware, updateEmailAutomationSettings);
router.post('/upload-resume', authMiddleware, upload.single('resume'), uploadAutomationResume);

export default router;

