import express from 'express';
import upload from '../middleware/uploadMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  analyzeResume,
  saveJob,
  getSavedJobs,
  deleteSavedJob,
  getHistory,
  getAnalytics,
  getLogs,
} from '../controller/aiController';

const router = express.Router();

router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume);
router.post('/save-job', authMiddleware, saveJob);
router.get('/saved-jobs', authMiddleware, getSavedJobs);
router.delete('/saved-jobs/:id', authMiddleware, deleteSavedJob);
router.get('/history', authMiddleware, getHistory);
router.get('/analytics', authMiddleware, getAnalytics);
router.get('/logs', authMiddleware, getLogs);

export default router;
