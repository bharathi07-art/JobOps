import {Request, Response, NextFunction} from 'express'
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
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ message: "Invalid token format" });
            return;
        }
        
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        (req as AuthRequest).user = decode;

        next()

   } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}