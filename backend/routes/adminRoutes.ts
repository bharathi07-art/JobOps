import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { adminMiddleware } from '../middleware/adminMiddleware'
import { getOverview, getAiMonitor, getUsers, getSubscriptions, getLogs, getSettings, updateSettings } from '../controller/adminController'

const router = express.Router()

router.get('/overview', authMiddleware, adminMiddleware, getOverview)
router.get('/ai-monitor', authMiddleware, adminMiddleware, getAiMonitor)
router.get('/users', authMiddleware, adminMiddleware, getUsers)
router.get('/subscriptions', authMiddleware, adminMiddleware, getSubscriptions)
router.get('/logs', authMiddleware, adminMiddleware, getLogs)
router.get('/settings', authMiddleware, adminMiddleware, getSettings)
router.post('/settings', authMiddleware, adminMiddleware, updateSettings)

export default router
