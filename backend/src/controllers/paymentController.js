import { z } from 'zod';
import { cancelSubscription, createPaymentOrder, handlePaymentWebhook, listPayments, verifyPayment } from '../services/paymentService.js';

const orderSchema = z.object({ interval: z.enum(['monthly', 'yearly']) });
const verifySchema = z.object({
  orderId: z.string().min(5).max(100),
  paymentId: z.string().min(5).max(100),
  signature: z.string().regex(/^[a-f0-9]{64}$/i),
});

export async function createOrder(req, res, next) {
  try {
    const { interval } = orderSchema.parse(req.body);
    const order = await createPaymentOrder(req.auth.userId, interval);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function verifyOrder(req, res, next) {
  try {
    const input = verifySchema.parse(req.body);
    await verifyPayment(req.auth.userId, input);
    res.json({ success: true, message: 'Premium is active on your account.' });
  } catch (error) {
    next(error);
  }
}

export async function webhook(req, res, next) {
  try {
    await handlePaymentWebhook(req.rawBody, req.get('x-razorpay-signature'));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function paymentHistory(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    res.json({ success: true, ...(await listPayments(req.auth.userId, page, limit)) });
  } catch (error) {
    next(error);
  }
}

export async function cancel(req, res, next) {
  try {
    const result = await cancelSubscription(req.auth.userId, req.ip);
    res.json({ success: true, data: result, message: 'Auto-renewal is off. Premium remains active until its end date.' });
  } catch (error) {
    next(error);
  }
}