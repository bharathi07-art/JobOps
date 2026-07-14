import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

/**
 * adminMiddleware
 *
 * Always performs a fresh Prisma (MySQL) lookup for isAdmin on every request.
 * Never trusts the JWT payload's isAdmin claim — that value is baked in at
 * token-issue time and becomes stale the moment isAdmin is changed in the DB
 * without the user re-authenticating.
 *
 * MySQL (Prisma) is the single source of truth for isAdmin.
 * MongoDB holds no role data and is not consulted here.
 *
 * Removed: NODE_ENV === 'development' bypass — it allowed any authenticated
 * user to reach admin routes in dev, masking real permission failures.
 */
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Always fetch fresh from MySQL — never trust the JWT isAdmin claim.
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  } catch (err) {
    console.error('[adminMiddleware] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
