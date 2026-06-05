import express from 'express';
import axios from 'axios';
import upload from '../middleware/uploadMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkUsageLimit } from '../middleware/subscriptionMiddleware';
import {
  analyzeResume,
  saveJob,
  getSavedJobs,
  deleteSavedJob,
  getHistory,
  getMatchedJobs,
  getLogs,
  getLatestResult,
  getAnalytics,
} from '../controller/aiController';

const router = express.Router();

import { proPlanOnly } from '../middleware/proPlanMiddleware';

router.post(
  '/analyze',
  authMiddleware,
  checkUsageLimit('uploadResume'),
  checkUsageLimit('aiSearch'),
  upload.single('resume'),
  analyzeResume
);

router.post('/save-job', authMiddleware, checkUsageLimit('saveJob'), saveJob);
router.get('/saved-jobs', authMiddleware, getSavedJobs);
router.delete('/saved-jobs/:id', authMiddleware, deleteSavedJob);
router.get('/history', authMiddleware, getHistory);
router.get('/latest', authMiddleware, getLatestResult);
router.get('/analytics', authMiddleware, proPlanOnly, getAnalytics);
router.get('/logs', authMiddleware, getLogs);


router.get('/matched-jobs', authMiddleware, getMatchedJobs);
export default router;
