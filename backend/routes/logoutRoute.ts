import { Router, Request, Response } from 'express';
import { logoutUser, logoutAdmin } from '../controller/authController';

const router = Router();

// Logout user - clears session and token cookie
router.post('/logout/user', async (req: Request, res: Response) => {
  await logoutUser(req, res);
});

// Logout admin - clears admin token cookie
router.post('/logout/admin', async (req: Request, res: Response) => {
  await logoutAdmin(req, res);
});

export default router;
