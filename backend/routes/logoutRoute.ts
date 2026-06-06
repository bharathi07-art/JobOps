import { Router, Request, Response } from 'express';

const router = Router();

// Logout endpoint - clears session and passport authentication
router.get('/logout', (req: Request, res: Response) => {
  // If using passport, logout the user
  if (typeof req.logout === 'function') {
    req.logout((err: any) => {
      if (err) {
        console.error('Passport logout error:', err);
        // Still proceed with session destruction below
      }

      // Destroy session if exists
      if (req.session) {
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            console.error('Session destruction error:', destroyErr);
            return res.status(500).json({ message: 'Logout failed' });
          }

          res.clearCookie('connect.sid');
          return res.json({ message: 'Logged out successfully' });
        });
      } else {
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out successfully' });
      }
    });
    return;
  }

  // No passport logout available - destroy session anyway
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.json({ message: 'Logged out successfully' });
  }
});

export default router;

