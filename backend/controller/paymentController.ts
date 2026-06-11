import { Request, Response } from 'express';
import { paypalClient } from "../services/paypalClient";
import { PrismaClient } from '@prisma/client';
import { updateSubscription } from '../services/subscriptionService';

// typeof bill{

// }

class SubscriptionsCreateRequest {
    path: string;
    verb: string;
    headers: Record<string, string>;
    body: any;

    constructor() {
        this.path = '/v1/billing/subscriptions';
        this.verb = 'POST';
        this.headers = {
            'Content-Type': 'application/json',
        };
    }

    requestBody(body: any) {
        this.body = body;
        return this;
    }
}

const prisma = new PrismaClient();

const normalizePlanName = (plan: string | undefined): 'Monthly' | 'Yearly' | null => {
    if (typeof plan !== 'string') {
        return null;
    }

    const normalizedPlan = plan.trim().toLowerCase();
    if (normalizedPlan === 'monthly' || normalizedPlan === 'month') {
        return 'Monthly';
    }

    if (normalizedPlan === 'yearly' || normalizedPlan === 'year') {
        return 'Yearly';
    }

    return null;
};

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const userID = (req as any).user?.id;

        if (!userID) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { plan } = req.body;
        const normalizedPlan = normalizePlanName(plan);

        if (!normalizedPlan) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const planID = normalizedPlan === 'Monthly'
            ? process.env.PAYPAL_MONTHLY_PLAN_ID
            : process.env.PAYPAL_YEARLY_PLAN_ID;

        if (!planID) {
            return res.status(500).json({ message: 'PayPal plan is not configured' });
        }

        const request = new SubscriptionsCreateRequest();

        request.requestBody({
            plan_id: planID,
            custom_id: String(userID),
            application_context: {
                brand_name: 'JobOps',
                user_action: 'SUBSCRIBE',
                return_URL: 'http://localhost:5173/payment/success',
                cancel_url: 'http://localhost:5173/payment/cancel',
            },
        });

        const response = await paypalClient.execute(request);

        return res.status(200).json({ id: response.result?.id ?? null, status: response.result?.status ?? 'created' });
    } catch (error) {
        console.error('PayPal subscription creation failed:', error);
        return res.status(500).json({ message: 'Payment creation failed' });
    }
};

export const paymentSuccess = async (req: Request, res: Response) => {
    try {
        const userID = (req as any).user?.id;

        if (!userID) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { subscriptionId, plan, billingCycle } = req.body;
        const normalizedPlan = normalizePlanName(plan);

        if (!normalizedPlan) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const normalizedBillingCycle = typeof billingCycle === 'string' && ['Monthly', 'Yearly'].includes(billingCycle)
            ? (billingCycle as 'Monthly' | 'Yearly')
            : normalizedPlan;

        const updatedSubscription = await updateSubscription(userID, normalizedPlan, normalizedBillingCycle);

        return res.status(200).json({
            success: true,
            subscriptionId,
            subscription: updatedSubscription,
        });
    } catch (error) {
        console.error('Payment success handling failed:', error);
        return res.status(500).json({ message: 'Payment confirmation failed' });
    }
};

export const paypalWebhook = async (req: Request, res: Response) => {
    try {
        const event = req.body;
        const eventType = event?.event_type;

        console.log('PAYPAL EVENT', eventType);

        if (!eventType) {
            return res.status(400).json({ message: 'Invalid webhook payload' });
        }

        const resource = event.resource ?? {};
        const userId = Number(resource.custom_id || 0);
        const planId = resource.plan_id;
        const normalizedPlan = planId === process.env.PAYPAL_YEARLY_PLAN_ID
            ? 'Yearly'
            : planId === process.env.PAYPAL_MONTHLY_PLAN_ID
                ? 'Monthly'
                : null;

        if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' && userId) {
            const billingCycle = normalizedPlan ?? 'Monthly';
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionPlan: normalizedPlan ?? 'Monthly',
                    subscriptionStatus: 'active',
                    billingCycle,
                    autoRenew: true,
                },
            });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' && userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: 'cancelled',
                    subscriptionPlan: 'Free',
                    autoRenew: false,
                },
            });
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('PayPal webhook failed:', error);
        return res.status(500).json({ message: 'Webhook processing failed' });
    }
};