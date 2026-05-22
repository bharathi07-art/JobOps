import { Request, Response } from 'express'
import prisma from '../config/prisma'
import AIResultModel from '../models/AIResult'
import LogModel from '../models/Log'
import AnalyticsModel from '../models/Analytics'
import ResumeModel from '../models/ResumeModel'

async function isRequesterAdmin(req: Request) {
  try {
    const userId = (req as any).user?.id
    if (!userId) return false
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } })
    return !!user && !!user.isAdmin
  } catch {
    return false
  }
}

export const getOverview = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  try {
    const totalUsers = await prisma.user.count()
    const totalSubscriptions = await prisma.planSubscription.count()

    const totalResumes = await ResumeModel.countDocuments()
    const totalAIResults = await AIResultModel.countDocuments()

    // total high matches across all AI results
    const aiResults = await AIResultModel.find().select('matched_jobs')
    let totalHighMatches = 0
    let totalJobsMatched = 0
    aiResults.forEach(r => {
      const mj = (r as any).matched_jobs || []
      totalJobsMatched += mj.length
      totalHighMatches += mj.filter((j: any) => j.category === 'high').length
    })

    res.json({
      success: true,
      overview: {
        totalUsers,
        totalSubscriptions,
        totalResumes,
        totalAIResults,
        totalJobsMatched,
        totalHighMatches,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch overview' })
  }
}

export const getAiMonitor = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const totalRequests = await LogModel.countDocuments({ action: 'ai_analyze' })
    const successCount = await LogModel.countDocuments({ action: 'ai_analyze', status: 'success' })
    const errorCount = await LogModel.countDocuments({ action: 'ai_analyze', status: 'error' })
    const recentLogs = await LogModel.find({ action: 'ai_analyze' }).sort({ createdAt: -1 }).limit(50)

    res.json({ success: true, stats: { totalRequests, successCount, errorCount }, recentLogs })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch AI monitor data' })
  }
}

export const getUsers = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, isAdmin: true, createdAt: true } , orderBy: { id: 'desc' }})
    res.json({ success: true, users })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' })
  }
}

export const getSubscriptions = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const subs = await prisma.planSubscription.findMany({ orderBy: { id: 'desc' } })
    res.json({ success: true, subscriptions: subs })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch subscriptions' })
  }
}


export const getLogs = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const logs = await LogModel.find().sort({ createdAt: -1 }).limit(200)
    res.json({ success: true, logs })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch logs' })
  }
}
