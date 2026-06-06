import { Router, Request, Response } from 'express';

const router = Router();

// Logout endpoint - clears session and passport authentication
router.get('/logout', (req: Request, res: Response) => {
  // If using passport, logout the user
  if (typeof req.logout === 'function') {
    req.logout();
  }

  // Destroy session if exists
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      // Clear cookie (default name for express-session)
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  } else {
    return res.json({ message: 'Logged out successfully' });
  }
});

export default router;
