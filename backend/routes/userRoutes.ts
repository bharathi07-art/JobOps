import express from 'express';
const router = express.Router();
import {register, login} from  '../controller/authController';

router.post('/register', register);
router.post('/login', login);

export default router;