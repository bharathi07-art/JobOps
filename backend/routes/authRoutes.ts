import express from 'express';
import { authMiddleware} from '../middleware/authMiddleware'
import { getProfile, subscribePlan, googleAuthCallback, githubAuthCallback, otpSend, verifyOTP, setOAuthPassword, changePassword, requestPasswordResetOTP, resetPasswordWithOTP, updateProfile, getProfileImage } from '../controller/authController'
const router = express.Router();

//auth routes
import passport from 'passport';

router.get("/profile", authMiddleware, getProfile)
router.put("/profile", authMiddleware, updateProfile)
router.get("/profile/image", getProfileImage)
router.post("/subscribe", authMiddleware, subscribePlan)
router.post("/set-password", authMiddleware, setOAuthPassword)
router.post("/change-password", authMiddleware, changePassword)
router.post("/forgot-password/request", requestPasswordResetOTP)
router.post("/forgot-password/reset", resetPasswordWithOTP)


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
