import express from 'express';
const router = express.Router();
import {register, login} from  '../controller/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import prisma from "../config/prisma";

router.post('/register', register);
router.post('/login', login);

export default router;