import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import AuditLog from '../models/AuditLog.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import { withTransaction } from '../config/db.js';
import { AuthError } from './authService.js';
import { getPlanPrice } from './planService.js';
import logger from '../utils/logger.js';

function providerConfigured() {
  return Boolean(process.env.PAYMENT_PROVIDER_KEY && process.env.PAYMENT_PROVIDER_SECRET);
}

function safeEqualHex(left, right) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  const leftBytes = Buffer.from(left, 'hex');
  const rightBytes = Buffer.from(right, 'hex');
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function paymentSignature(orderId, paymentId) {
  return createHmac('sha256', process.env.PAYMENT_PROVIDER_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function addPlanInterval(date, interval) {
  const end = new Date(date);
  if (interval === 'yearly') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

export async function createPaymentOrder(userId, interval) {
  if (!providerConfigured()) {
    throw new AuthError(503, 'PAYMENT_UNAVAILABLE', 'Premium checkout is not configured yet. Please try again later.');
  }
  const { amountPaise, currency } = await getPlanPrice(interval);
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYMENT_PROVIDER_KEY}:${process.env.PAYMENT_PROVIDER_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amountPaise, currency, receipt: randomUUID(), notes: { userId: String(userId), planInterval: interval } }),
  });
  const order = await response.json().catch(() => null);
  if (!response.ok || !order?.id) {
    logger.error({ status: response.status }, 'Razorpay order creation failed');
    throw new AuthError(502, 'PAYMENT_PROVIDER_ERROR', 'We could not start checkout. Please try again.');
  }
  await Payment.create({
    userId,
    provider: 'razorpay',
    providerOrderId: order.id,
    planInterval: interval,
    amountPaise,
    currency,
  });
  return {
    orderId: order.id,
    amount: amountPaise,
    currency,
    keyId: process.env.PAYMENT_PROVIDER_KEY,
  };
}

async function activatePayment(payment, providerPaymentId) {
  if (payment.status === 'paid') return;
  await withTransaction(async (session) => {
    const updated = await Payment.findOneAndUpdate(
      { _id: payment._id, status: 'created', providerOrderId: payment.providerOrderId },
      { $set: { status: 'paid', providerPaymentId, paidAt: new Date() } },
      { new: true, session },
    );
    if (!updated) {
      const existing = await Payment.findOne({ providerPaymentId }).session(session);
      if (existing?.status === 'paid') return;
      throw new AuthError(409, 'PAYMENT_ALREADY_PROCESSED', 'This payment could not be applied. Contact support.');
    }

    const now = new Date();
    const currentSubscription = await Subscription.findOne({ userId: payment.userId }).session(session);
    const startDate = currentSubscription?.plan === 'premium' && currentSubscription.endDate > now
      ? currentSubscription.endDate
      : now;
    const endDate = addPlanInterval(startDate, payment.planInterval);
    await Subscription.updateOne(
      { userId: payment.userId },
      { $set: { plan: 'premium', status: 'active', startDate, endDate, paymentId: payment._id, autoRenew: true, cancelledAt: null } },
      { upsert: true, session },
    );
    await AuditLog.create([{
      actorId: payment.userId,
      action: 'subscription.activated',
      entityType: 'subscription',
      entityId: String(payment.userId),
      after: { plan: 'premium', planInterval: payment.planInterval, startDate, endDate, paymentId: String(payment._id) },
    }], { session });
  });
}

export async function verifyPayment(userId, { orderId, paymentId, signature }) {
  const payment = await Payment.findOne({ userId, providerOrderId: orderId, provider: 'razorpay' });
  if (!payment) throw new AuthError(404, 'PAYMENT_NOT_FOUND', 'We could not find that checkout. Start again from Pricing.');
  if (payment.status === 'paid' && payment.providerPaymentId === paymentId) return;
  if (!safeEqualHex(paymentSignature(orderId, paymentId), signature)) {
    throw new AuthError(400, 'PAYMENT_SIGNATURE_INVALID', 'We could not verify that payment. Please contact support.');
  }
  await activatePayment(payment, paymentId);
}

export async function handlePaymentWebhook(rawBody, signature) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !rawBody || !signature) throw new AuthError(503, 'WEBHOOK_UNAVAILABLE', 'Payment notifications are not configured.');
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (!safeEqualHex(expected, signature)) throw new AuthError(400, 'WEBHOOK_SIGNATURE_INVALID', 'Payment notification could not be verified.');

  const event = JSON.parse(rawBody.toString('utf8'));
  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id || !entity?.id) return;
  if (event.event === 'payment.captured') {
    const payment = await Payment.findOne({ providerOrderId: entity.order_id });
    if (payment) await activatePayment(payment, entity.id);
  } else if (event.event === 'payment.failed') {
    await Payment.updateOne({ providerOrderId: entity.order_id, status: 'created' }, { $set: { status: 'failed' } });
  } else if (event.event === 'refund.processed') {
    await Payment.updateOne({ providerPaymentId: entity.id }, { $set: { status: 'refunded' } });
  }
}

export async function cancelSubscription(userId, ip) {
  const subscription = await Subscription.findOne({ userId, plan: 'premium', status: 'active' });
  if (!subscription) throw new AuthError(404, 'SUBSCRIPTION_NOT_FOUND', 'There is no active Premium subscription to cancel.');
  subscription.status = 'cancelled';
  subscription.autoRenew = false;
  subscription.cancelledAt = new Date();
  await subscription.save();
  await AuditLog.create({ actorId: userId, action: 'subscription.cancelled', entityType: 'subscription', entityId: String(userId), ip: String(ip || '').slice(0, 64) });
  return { status: subscription.status, endDate: subscription.endDate };
}

export async function listPayments(userId, page = 1, limit = 20) {
  const safeLimit = Math.min(limit, 50);
  const [data, total] = await Promise.all([
    Payment.find({ userId }).select('planInterval amountPaise currency status paidAt createdAt').sort({ createdAt: -1 }).skip((page - 1) * safeLimit).limit(safeLimit).lean(),
    Payment.countDocuments({ userId }),
  ]);
  return { data, pagination: { page, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } };
}