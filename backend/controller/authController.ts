import prisma from "../config/prisma";
import {Request, Response} from 'express'
import bcrypt from 'bcrypt';
import generateOTP from '../utils/generateOTP';
import transporter from '../utils/sendEmail';
import jwt from 'jsonwebtoken'
import { getUserSubscription, updateSubscription } from '../services/subscriptionService';
import dotenv from 'dotenv';
import { json } from "node:stream/consumers";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Helper to set authentication cookies securely
const setAuthCookie = (res: Response, token: string, isAdmin: boolean) => {
  const cookieName = isAdmin ? 'admin_token' : 'token';
  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
  res.cookie(cookieName, token, options);
};

export const validatePasswordChangePayload = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, message: 'All password fields are required' };
  }

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return { ok: false, message: 'Invalid password payload' };
  }

  if (newPassword.length < 6) {
    return { ok: false, message: 'New password must be at least 6 characters' };
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, message: 'New password and confirmation do not match' };
  }

  return { ok: true };
};

export const validatePasswordResetPayload = (
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (!email || !otp || !newPassword || !confirmPassword) {
    return { ok: false, message: 'Email, reset code, and new password are required' };
  }

  if (typeof email !== 'string' || typeof otp !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return { ok: false, message: 'Invalid reset payload' };
  }

  if (newPassword.length < 6) {
    return { ok: false, message: 'New password must be at least 6 characters' };
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, message: 'New password and confirmation do not match' };
  }

  return { ok: true };
};

export const register = async (req:Request, res:Response):Promise<void>=>{
    try{
        const {username, email, password} = req.body;

        // check all fields are must be filled
        if(!username||!email||!password ){
            res.status(401).json({message:"All the fields are must have to be filled"})
            return;
        }

        // Check if user exists
        const existUser = await prisma.user.findUnique({where : {email}});

        if(existUser){
             res.status(400).json({
                message: "User Already exist, please login"
            })
            return;
        }
        

        
        //Hash password
        const hashPassword =await bcrypt.hash(password, 10);

        //create a user
        const user = await prisma.user.create({
            data: {
                name: username,
                email: email,
                password: hashPassword,
                avatar: "",
            }
        });

        //create JWT
        const payload = { id: user.id, isAdmin: !!user.isAdmin };
        const token = jwt.sign(
          payload,
          JWT_SECRET,
          { expiresIn: "30d" },
        );

         const sub = await getUserSubscription(user.id);

         res.status(201).json({
            message: "Registered sucessfully",
              token,
              isAdmin: user.isAdmin,
              plan: sub.subscriptionPlan,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                plan: sub.subscriptionPlan,
                avatar: user.avatar,
              }
        });
    }
    catch(err:unknown)
    {   const Err = err as Error
        res.status(500).json({
         message: Err.message
    });
    }
}


/*=================================
        Login
===============================*/

export const protectAdminRoute = (req: Request, res: Response, next: Function) => {
  const token = req.cookies?.admin_token ?? req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    // attach user info to request for downstream handlers
    (req as any).user = { id: payload.id, isAdmin: payload.isAdmin };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {email, password } = req.body;

    const user = await prisma.user.findUnique({where: {email}});

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.isDeletionScheduled) {
      return res.status(403).json({
        message: "This account is scheduled for deletion. Please contact support to recover it."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

        const payload = { id: user.id, isAdmin: !!user.isAdmin };
        const token = jwt.sign(
          payload,
          JWT_SECRET,
          { expiresIn: "30d" },
        );
    //store in cookies
      setAuthCookie(res, token, user.isAdmin);

    const sub = await getUserSubscription(user.id);

    return res.status(200).json({
      success:true,
      message: "Login successful",
      token,
      isAdmin: user.isAdmin,
      plan: sub.subscriptionPlan,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: sub.subscriptionPlan,
        avatar: user.avatar,
      }
    });

  } catch (err: any) {
    return res.status(500).json({
      message: err.message
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  // Destroy session if present
  if ((req as any).session) {
    (req as any).session.destroy(() => {});
  }
  // Clear user token cookie
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
  });
  return res.json({ message: 'Logged out successfully' });
};

export const logoutAdmin = async (req: Request, res: Response) => {
  if ((req as any).session) {
    (req as any).session.destroy(() => {});
  }
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
  });
  return res.json({ message: 'Admin logged out successfully' });
};

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, name: true, email: true, plan: true, isAdmin: true, avatar: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const sub = await getUserSubscription(user.id);
    (user as any).plan = sub.subscriptionPlan; // override with canonical plan

    return res.status(200).json({ success: true, user })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}

export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: !!user.isAdmin },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    //use cookies
    setAuthCookie(res, token, user.isAdmin);

    // Redirect to frontend with token and user info
    const hasPassword = user.password !== '';
    const sub = await getUserSubscription(user.id);
    const frontendRedirectUrl = `http://localhost:5173/oauth-callback?token=${encodeURIComponent(token)}&id=${encodeURIComponent(user.id)}&isAdmin=${encodeURIComponent(user.isAdmin)}&plan=${encodeURIComponent(sub.subscriptionPlan)}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar || '')}&hasPassword=${encodeURIComponent(hasPassword)}`;
    res.redirect(frontendRedirectUrl);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export const githubAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: !!user.isAdmin },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

      //use cookies
      setAuthCookie(res, token, user.isAdmin);

    // Redirect to frontend with token and user info
    const hasPassword = user.password !== '';
    const sub = await getUserSubscription(user.id);
    const frontendRedirectUrl = `http://localhost:5173/oauth-callback?token=${encodeURIComponent(token)}&id=${encodeURIComponent(user.id)}&isAdmin=${encodeURIComponent(user.isAdmin)}&plan=${encodeURIComponent(sub.subscriptionPlan)}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar || '')}&hasPassword=${encodeURIComponent(hasPassword)}`;
    res.redirect(frontendRedirectUrl);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export const setOAuthPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { password } = req.body;
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== '') {
      return res.status(400).json({ message: 'Password is already set' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashed },
    });

    return res.status(200).json({ message: 'Password set successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    const validation = validatePasswordChangePayload(currentPassword, newPassword, confirmPassword);

    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'No password is set for this account. Please set one first.' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const requestPasswordResetOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for that email, a password reset code has been sent.',
      });
    }

    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.otp.create({
      data: {
        email: normalizedEmail,
        otp,
        expiresAt,
        userId: user.id,
      },
    });

    const canSendEmail = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    if (canSendEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: 'JobOps Password Reset Code',
        html: `
          <h2>Password reset request</h2>
          <p>Your password reset code is:</p>
          <h1>${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        `,
      });
    } else {
      console.warn('Password reset email not sent because EMAIL_USER or EMAIL_PASS is not configured.');
    }

    const responsePayload: any = {
      message: 'If an account exists for that email, a password reset code has been sent.',
    };

    if (!canSendEmail && process.env.NODE_ENV !== 'production') {
      responsePayload.otp = otp;
    }

    return res.status(200).json(responsePayload);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const resetPasswordWithOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body || {};
    const validation = validatePasswordResetPayload(email, otp, newPassword, confirmPassword);

    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedOtp = String(otp).trim();
    const otpRecord = await prisma.otp.findFirst({
      where: { email: normalizedEmail, otp: normalizedOtp },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const subscribePlan = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user?.id;
    const { plan } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!plan || typeof plan !== 'string') {
      return res.status(400).json({ message: 'Plan is required' })
    }

    const allowedPlans = ['Free', 'Monthly', 'Yearly',]
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected' })
    }

    // Properly update the canonical subscription fields, status, and usage limits
    const planKeyMap: Record<string, 'Monthly' | 'Yearly' | 'Free'> = {
      Monthly: 'Monthly',
      Yearly: 'Yearly',
      Free: 'Free',
    };
    
    const canonicalPlan = planKeyMap[plan];
    const billingCycle = plan === 'Yearly' ? 'Yearly' : 'Monthly';

    if (canonicalPlan !== 'Free') {
      await updateSubscription(Number(userId), canonicalPlan as any, billingCycle);
    } else {
      // If downgraded to free
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { 
          plan,
          subscriptionPlan: 'Free',
          subscriptionStatus: 'inactive',
          subscriptionEndDate: new Date()
        }
      })
    }

    const sub = await getUserSubscription(Number(userId));
    const updatedUser = await prisma.user.findUnique({ where: { id: Number(userId) } });

    return res.status(200).json({
      success: true,
      message: `Plan updated to ${plan}`,
      plan: sub.subscriptionPlan,
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        plan: sub.subscriptionPlan,
        isAdmin: updatedUser?.isAdmin,
      }
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}

/*====================
    //OTP router
=====================
 */
export const otpSend=async(req:Request, res:Response)=>{
  try{
    const {email} = req.body;
    if(!email){
      return res.status(400).json({message: 'Email is required'});
    }

    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // attach userId when user exists (optional relation)
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    await prisma.otp.create({
      data:{
        email: normalizedEmail,
        otp,
        expiresAt,
        userId: user ? user.id : undefined,
      },
    });
  
    //generate the body of the EMAL
    
    const canSendEmail = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    if (canSendEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "JobOps OTP Verification",
        html: `
          <h2>Your OTP Code</h2>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        `
      });
    } else {
      console.warn('OTP email not sent because EMAIL_USER or EMAIL_PASS is not configured.')
    }

    const responsePayload: any = { message: "OTP Send Successfully" };
    if (!canSendEmail && process.env.NODE_ENV !== 'production') {
      responsePayload.otp = otp;
    }

    res.json(responsePayload);



  }catch(error){
    console.error('OTP send failed:', error)
    const message = error instanceof Error ? error.message : 'Failed to send OTP'
    res.status(500).json({ message })
  }
};

/*====================
  //verify the OTP
==================== */

export const verifyOTP=async (req:Request, res:Response)=>{
  try{
    const {name, email, password, otp} = req.body;
    
    //check all fields are filled
    if(!name || !email || !password || !otp){
      return res.status(400).json({ message: "Please fill all the fields" })
    }

    // Normalize email and OTP to lowercase and trim whitespace
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    const otpRecord = await prisma.otp.findFirst({
      where:{
        email: normalizedEmail,
        otp: normalizedOtp,
      },
    });

    if(!otpRecord){
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if(otpRecord.expiresAt < new Date()){
      return res.status(400).json({
        message: "OTP expired",
      })
    }
    const existingUser = await prisma.user.findUnique({
      where:{email: normalizedEmail,}
    })

    if(existingUser){
      return res.status(400).json({
        message: " user Already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data:{
        name, email: normalizedEmail, password: hashPassword,
      }
    });

    const token = jwt.sign(
      {id: user.id},
      process.env.JWT_SECRET as string,
      {expiresIn: "30d"}
    );

    await prisma.otp.delete({
      where:{
        id: otpRecord.id
      },
    });

    res.json({
      message: "user resister sucessfully",
      token,
      user,
    })
    
  }
  catch(error)
    {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
    }
};

/*================
    autoEmail
  ================ 

export const autoemail  = async(req:Request, res:Response)=>{
  try{
    const {email} = req.body;

    if(!email){
      res.status(400).json({message:"Email is needed"});
      alert("Email is requeired");
    }

    //check the user plan activation
    const userEmail = await prisma.user.findUnique({
      where:{email}
    })

    

  }
  catch(error)
  {}
}
  */