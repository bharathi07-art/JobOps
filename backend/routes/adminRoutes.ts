import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getOverview, getAiMonitor, getUsers, getSubscriptions, getLogs } from '../controller/adminController'

const router = express.Router()

router.get('/overview', authMiddleware, getOverview)
router.get('/ai-monitor', authMiddleware, getAiMonitor)
router.get('/users', authMiddleware, getUsers)
router.get('/subscriptions', authMiddleware, getSubscriptions)
router.get('/logs', authMiddleware, getLogs)

export default router
