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
        const authHeader = req.header("Authorization");
        if(!authHeader){
             res.status(401).json({ message: "No token provided" });
            return;
        }

        //Bear Token
        const token = authHeader.split(" ")[1];

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
    res.status(401).json({ message: "Unauthorized" });
  }
}