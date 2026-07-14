import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../services/userService';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If JWT payload already indicates admin, bypass DB lookup
    const userFromToken = (req as any).user;
    if (userFromToken && userFromToken.isAdmin) {
      return next();
    }
    // In development, allow any authenticated user as admin
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await getUserById(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
