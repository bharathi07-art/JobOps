import { Request, Response } from 'express';
import prisma from '../config/prisma';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const getUserId = (req: Request): number | null => {
  const userId = (req as any).user?.id;
  if (!userId) return null;
  return Number(userId);
};

const isProActive = (subscriptionStatus: string, subscriptionPlan: string) => {
  const isPremiumPlan = subscriptionPlan === 'Monthly' || subscriptionPlan === 'Yearly';
  return (subscriptionStatus === 'active' || subscriptionStatus === 'inactive') && isPremiumPlan;
};

export const getEmailAutomationSettings = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        emailAutomationEnabled: true,
        emailAutomationMaxResults: true,
        emailAutomationSearchTime: true,
        emailAutomationFrequency: true,
        // @ts-ignore
        emailAutomationResumeText: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      email: user.email,
      emailAutomationEnabled: user.emailAutomationEnabled,
      emailAutomationMaxResults: user.emailAutomationMaxResults,
      emailAutomationSearchTime: user.emailAutomationSearchTime,
      emailAutomationFrequency: user.emailAutomationFrequency,
      hasAutomationResume: !!(user as any).emailAutomationResumeText,
      canEnableEmailAutomation: isProActive(user.subscriptionStatus, user.subscriptionPlan),
    });
  } catch (error) {
    console.error('getEmailAutomationSettings error:', error);
    res.status(500).json({ message: 'Failed to load email automation settings' });
  }
};

export const updateEmailAutomationSettings = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      emailAutomationEnabled,
      emailAutomationMaxResults,
      emailAutomationSearchTime,
      emailAutomationFrequency,
    } = req.body || {};

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Hard gate: FREE users must not be able to enable automation.
    const canEnable = isProActive(user.subscriptionStatus, user.subscriptionPlan);

    if (emailAutomationEnabled === true && !canEnable) {
      res.status(403).json({
        message: 'Email automation requires an active Monthly or Yearly subscription',
        currentPlan: user.subscriptionPlan,
      });
      return;
    }

    // Validate simple fields
    const maxResultsNum = typeof emailAutomationMaxResults === 'number' ? emailAutomationMaxResults : undefined;
    const searchTimeStr = typeof emailAutomationSearchTime === 'string' ? emailAutomationSearchTime : undefined;
    const freqStr = typeof emailAutomationFrequency === 'string' ? emailAutomationFrequency : undefined;

    if (maxResultsNum !== undefined && (Number.isNaN(maxResultsNum) || maxResultsNum < 1 || maxResultsNum > 50)) {
      res.status(400).json({ message: 'emailAutomationMaxResults must be between 1 and 50' });
      return;
    }

    if (searchTimeStr !== undefined && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(searchTimeStr)) {
      res.status(400).json({ message: 'emailAutomationSearchTime must be in HH:mm format' });
      return;
    }

    // Frequency is stored but currently informational; runner can infer.
    if (freqStr !== undefined && !['monthly', 'yearly', 'inferred'].includes(freqStr)) {
      res.status(400).json({ message: 'emailAutomationFrequency must be monthly, yearly, or inferred' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(typeof emailAutomationEnabled === 'boolean'
          ? { emailAutomationEnabled }
          : {}),
        ...(maxResultsNum !== undefined ? { emailAutomationMaxResults: maxResultsNum } : {}),
        ...(searchTimeStr !== undefined ? { emailAutomationSearchTime: searchTimeStr } : {}),
        ...(freqStr !== undefined ? { emailAutomationFrequency: freqStr } : {}),
      },
      select: {
        emailAutomationEnabled: true,
        emailAutomationMaxResults: true,
        emailAutomationSearchTime: true,
        emailAutomationFrequency: true,
      },
    });


    res.status(200).json({ success: true, ...updated });
  } catch (error) {
    console.error('updateEmailAutomationSettings error:', error);
    res.status(500).json({ message: 'Failed to update email automation settings' });
  }
};

export const uploadAutomationResume = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Resume file is required' });
      return;
    }

    let resumeText = '';

    if (file.mimetype === 'application/pdf') {
      const parsed = await pdfParse(file.buffer);
      resumeText = parsed.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = parsed.value;
    } else {
      res.status(400).json({ message: 'Unsupported file type. Only PDF and DOCX are allowed.' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        // @ts-ignore
        emailAutomationResumeText: resumeText,
      },
    });

    res.status(200).json({ success: true, message: 'Automation resume uploaded successfully' });
  } catch (error) {
    console.error('uploadAutomationResume error:', error);
    res.status(500).json({ message: 'Failed to upload automation resume' });
  }
};
