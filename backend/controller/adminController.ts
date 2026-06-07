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
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // ── Prisma (MySQL) counts ──────────────────────────────────────────────
    const [
      totalUsers,
      newUsersWeek,
      monthlySubscribers,
      yearlySubscribers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.user.count({ where: { subscriptionPlan: 'Monthly', subscriptionStatus: 'active' } }),
      prisma.user.count({ where: { subscriptionPlan: 'Yearly', subscriptionStatus: 'active' } }),
    ])

    const premiumSubscribers = monthlySubscribers + yearlySubscribers

    // Revenue from subscription history
    const revenueAgg = await prisma.subscriptionhistory.aggregate({
      where: { status: 'completed', action: { in: ['purchase', 'renew', 'upgrade'] } },
      _sum: { amount: true },
    })
    const totalRevenue = revenueAgg._sum.amount ?? 0

    // Monthly revenue for chart (last 12 months)
    const monthlyRevenueRaw = await prisma.subscriptionhistory.findMany({
      where: {
        status: 'completed',
        action: { in: ['purchase', 'renew', 'upgrade'] },
        createdAt: { gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) },
      },
      select: { amount: true, createdAt: true },
    })

    const monthMap: Record<string, number> = {}
    monthlyRevenueRaw.forEach((r: any) => {
      const key = r.createdAt.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      monthMap[key] = (monthMap[key] ?? 0) + (r.amount ?? 0)
    })
    const monthlyRevenue = Object.entries(monthMap)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))
      .slice(-12)

    // ── MongoDB counts ─────────────────────────────────────────────────────
    const [totalAIResults, totalResumes] = await Promise.all([
      AIResultModel.countDocuments(),
      ResumeModel.countDocuments(),
    ])

    const aiResults = await AIResultModel.find().select('matched_jobs')
    let totalJobsMatched = 0
    let totalHighMatches = 0
    aiResults.forEach(r => {
      const mj = (r as any).matched_jobs || []
      totalJobsMatched += mj.length
      totalHighMatches += mj.filter((j: any) => j.category === 'high').length
    })

    // Weekly visits — real logins per day from logs
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weeklyVisitsMap: Record<string, number> = {}
    days.forEach(d => { weeklyVisitsMap[d] = 0 })
    const recentLogs = await LogModel.find({ createdAt: { $gte: startOfWeek } }).select('createdAt')
    recentLogs.forEach(l => {
      const d = days[new Date(l.createdAt).getDay()]
      weeklyVisitsMap[d] = (weeklyVisitsMap[d] ?? 0) + 1
    })
    const weeklyVisits = days.map(day => ({ day, users: weeklyVisitsMap[day] ?? 0, sessions: Math.round((weeklyVisitsMap[day] ?? 0) * 1.4) }))

    // Subscription pie
    const freeUsers = totalUsers - premiumSubscribers
    const subscriptionPieData = [
      { label: 'Free', value: freeUsers, color: '#94a3b8' },
      { label: 'Monthly', value: monthlySubscribers, color: '#FF4500' },
      { label: 'Yearly', value: yearlySubscribers, color: '#FFCBA4' },
    ]

    res.json({
      success: true,
      overview: {
        totalUsers,
        activeUsers: premiumSubscribers,
        newUsersWeek,
        premiumSubscribers,
        monthlySubscribers,
        yearlySubscribers,
        totalRevenue,
        aiRequestsProcessed: totalAIResults,
        totalApplicationsTracked: 0,
        totalJobsMatched,
        totalResumes,
        totalAIResults,
        totalHighMatches,
      },
      weeklyVisits,
      monthlyRevenue: monthlyRevenue.length ? monthlyRevenue : [{ month: 'No data', revenue: 0 }],
      subscriptionPieData,
    })
  } catch (error: any) {
    console.error('Admin overview error:', error)
    res.status(500).json({ message: error.message || 'Failed to fetch overview' })
  }
}

export const getAiMonitor = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const [totalRequests, successCount, errorCount, recentLogs] = await Promise.all([
      LogModel.countDocuments({ action: 'ai_analyze' }),
      LogModel.countDocuments({ action: 'ai_analyze', status: 'success' }),
      LogModel.countDocuments({ action: 'ai_analyze', status: 'error' }),
      LogModel.find({ action: 'ai_analyze' }).sort({ createdAt: -1 }).limit(50).lean(),
    ])

    // Build daily success/failed for chart (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now = new Date()
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7)
    const weekLogs = await LogModel.find({ action: 'ai_analyze', createdAt: { $gte: startOfWeek } }).select('status createdAt').lean()
    const dayMap: Record<string, { success: number; failed: number }> = {}
    days.forEach(d => { dayMap[d] = { success: 0, failed: 0 } })
    weekLogs.forEach((l: any) => {
      const d = days[new Date(l.createdAt).getDay()]
      if (l.status === 'success') dayMap[d].success++
      else dayMap[d].failed++
    })
    const aiUsageData = days.map(day => ({ day, success: dayMap[day].success, failed: dayMap[day].failed, requests: dayMap[day].success + dayMap[day].failed }))

    // Format recent logs for table
    const formattedLogs = recentLogs.map((l: any) => ({
      id: String(l._id),
      requestId: `req_${String(l._id).slice(-6)}`,
      user: String(l.userId),
      provider: 'Gemini',
      status: l.status === 'success' ? 'Success' : 'Failed',
      duration: '—',
      time: new Date(l.createdAt).toLocaleString(),
      tokens: 0,
    }))

    res.json({ success: true, stats: { totalRequests, successCount, errorCount }, recentLogs: formattedLogs, aiUsageData })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch AI monitor data' })
  }
}

export const getUsers = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, isAdmin: true, createdAt: true, subscriptionPlan: true, subscriptionStatus: true },
      orderBy: { id: 'desc' },
    })
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
    // Return real user subscription data — not PlanSubscription table (which is empty)
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true,
        subscriptionPlan: true, subscriptionStatus: true,
        billingCycle: true, subscriptionStartDate: true,
        subscriptionEndDate: true,
      },
      orderBy: { subscriptionStartDate: 'desc' },
    })

    const subscriptions = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      plan: u.subscriptionPlan,
      status: u.subscriptionStatus === 'active' ? 'Active' : u.subscriptionStatus === 'cancelled' ? 'Cancelled' : u.subscriptionPlan === 'Free' ? 'Free' : u.subscriptionStatus,
      billing: u.billingCycle || '—',
      startDate: u.subscriptionStartDate ? new Date(u.subscriptionStartDate).toLocaleDateString() : '—',
      expiry: u.subscriptionEndDate ? new Date(u.subscriptionEndDate).toLocaleDateString() : '—',
      amount: u.subscriptionPlan === 'Monthly' ? 25 : u.subscriptionPlan === 'Yearly' ? 250 : 0,
    }))

    res.json({ success: true, subscriptions })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch subscriptions' })
  }
}

export const getLogs = async (req: Request, res: Response) => {
  if (!(await isRequesterAdmin(req))) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const logs = await LogModel.find().sort({ createdAt: -1 }).limit(200).lean()
    res.json({ success: true, logs })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch logs' })
  }
}
