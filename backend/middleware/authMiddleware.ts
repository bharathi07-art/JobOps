import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request{
    user?: any;
}

export const authMiddleware=(
    req: AuthRequest,
    res: Response,
    next: NextFunction
):void=>{

    try{
        const token = req.cookies.admin_token
          || req.cookies.token
          || (req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null);

        if (!token) {
            res.status(401).json({ success: false, message: "Authorization required" });
            return;
        }
        
        // Use fallback secret for test environment if JWT_SECRET is not set
        const secret = process.env.JWT_SECRET || "test_secret";
        const decode = jwt.verify(
            token,
            secret as string
        );

        (req as AuthRequest).user = decode;

        next()

   } catch (error) {
    // Log error only in development/debug mode to avoid noisy test output
    if (process.env.DEBUG_AUTH === "true") {
        console.error("JWT Verification Error:", error);
    }
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}