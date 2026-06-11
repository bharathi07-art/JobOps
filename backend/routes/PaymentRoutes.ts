import express, {Router} from 'express';
import {createSubscription, paymentSuccess,paypalWebhook} from '../controller/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post("/create-subscription",authMiddleware,createSubscription);
router.post("/Success",authMiddleware ,paymentSuccess);

router.post("/webhook",authMiddleware,paypalWebhook)

export default router;
