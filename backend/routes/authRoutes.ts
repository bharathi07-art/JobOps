import express from 'express';
import { authMiddleware} from '../middleware/authMiddleware'
import { getProfile, subscribePlan, googleAuthCallback, githubAuthCallback, otpSend, verifyOTP } from '../controller/authController'
const router = express.Router();

//auth routes
import passport from 'passport';

router.get("/profile", authMiddleware, getProfile)
router.post("/subscribe", authMiddleware, subscribePlan)


//OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google"),
  googleAuthCallback
);


// GitHub OAuth

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get(
  "/github/callback",
  passport.authenticate("github"),
  githubAuthCallback
);

//send OTP (public)
router.post("/send-otp", otpSend);
router.post("/verify-otp", verifyOTP)

export default router;
