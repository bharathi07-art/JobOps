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
const JWT_SECRET = process.env.JWT_SECRET as string


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

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {email, password } = req.body;

    const user = await prisma.user.findUnique({where: {email}});

    if (!user) {
      return res.status(404).json({
        message: "User not found"
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
    res.cookie("token",token,{
      httpOnly:true,
      secure:false,
      sameSite:"lax",
      maxAge:30 * 24 * 60 * 60 * 1000
    });
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
      }
    });

  } catch (err: any) {
    return res.status(500).json({
      message: err.message
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, name: true, email: true, plan: true, isAdmin: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const sub = await getUserSubscription(user.id);
    user.plan = sub.subscriptionPlan; // override with canonical plan

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
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    //use cookies
    res.cookie("token", token, {
      httpOnly:true,
      secure:false,
      sameSite:"lax"
    })

    // Redirect to frontend with token and user info
    const hasPassword = user.password !== '';
    const sub = await getUserSubscription(user.id);
    const frontendRedirectUrl = `http://localhost:5173/dashboard?token=${encodeURIComponent(token)}&id=${encodeURIComponent(user.id)}&isAdmin=${encodeURIComponent(user.isAdmin)}&plan=${encodeURIComponent(sub.subscriptionPlan)}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar || '')}&hasPassword=${encodeURIComponent(hasPassword)}`;
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
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

     //use cookies
    res.cookie("token", token, {
      httpOnly:true,
      secure:false,
      sameSite:"lax"
    })

    // Redirect to frontend with token and user info
    const hasPassword = user.password !== '';
    const sub = await getUserSubscription(user.id);
    const frontendRedirectUrl = `http://localhost:5173/dashboard?token=${encodeURIComponent(token)}&id=${encodeURIComponent(user.id)}&isAdmin=${encodeURIComponent(user.isAdmin)}&plan=${encodeURIComponent(sub.subscriptionPlan)}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar || '')}&hasPassword=${encodeURIComponent(hasPassword)}`;
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

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // attach userId when user exists (optional relation)
    const user = await prisma.user.findUnique({ where: { email } });

    await prisma.oTP.create({
      data:{
        email,
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
    const otpRecord = await prisma.oTP.findFirst({
      where:{
        email,
        otp,
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
      where:{email,}
    })

    if(existingUser){
      return res.status(400).json({
        message: " user Already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data:{
        name, email, password: hashPassword,
      }
    });

    const token = jwt.sign(
      {id: user.id},
      process.env.JWT_SECRET as string,
      {expiresIn: "30d"}
    );

    await prisma.oTP.delete({
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