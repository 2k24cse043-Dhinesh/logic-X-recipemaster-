import AppSetting from '../models/AppSetting.js';
import Subscription from '../models/Subscription.js';
import { AuthError } from './authService.js';
import { defaultPlans, implementedPlanFeatures } from '../config/defaultPlans.js';

const quotaFields = {
  recipeSearchesPerDay: { counter: 'usage.searchesToday', date: 'usage.searchDate', period: 'day' },
  aiRecommendationsPerDay: { counter: 'usage.aiRecsToday', date: 'usage.aiRecsDate', period: 'day' },
  ingredientScansPerMonth: { counter: 'usage.scansThisMonth', date: 'usage.scanMonth', period: 'month' },
  aiAssistantMessagesPerDay: { counter: 'usage.assistantToday', date: 'usage.assistantDate', period: 'day' },
};

export async function getPlansSettings() {
  const setting = await AppSetting.findOne({ key: 'plans' }).select('value').lean();
  return setting?.value || defaultPlans;
}

export async function getPublicPlans() {
  const settings = await getPlansSettings();
  return {
    timezone: settings.timezone,
    currency: settings.plans.premium.currency || 'INR',
    plans: {
      free: { priceMonthly: settings.plans.free.priceMonthly, limits: settings.plans.free.limits },
      premium: {
        priceMonthly: settings.plans.premium.priceMonthly,
        priceYearly: settings.plans.premium.priceYearly,
        currency: settings.plans.premium.currency || 'INR',
        limits: settings.plans.premium.limits,
      },
    },
    features: implementedPlanFeatures,
    paymentConfigured: Boolean(process.env.PAYMENT_PROVIDER_KEY && process.env.PAYMENT_PROVIDER_SECRET),
    fairUseNote: 'Unlimited searches remain subject to a technical fair-use rate limit.',
  };
}

function periodKey(date, timezone, period) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    ...(period === 'day' ? { day: '2-digit' } : {}),
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return period === 'month'
    ? `${values.year}-${values.month}`
    : `${values.year}-${values.month}-${values.day}`;
}

function nextReset(date, timezone, period) {
  const localParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const currentParts = Object.fromEntries(localParts.formatToParts(date).map(({ type, value }) => [type, value]));
  let year = Number(currentParts.year);
  let month = Number(currentParts.month);
  let day = Number(currentParts.day);
  if (period === 'month') {
    month += 1;
    if (month > 12) { month = 1; year += 1; }
    day = 1;
  } else {
    const nextLocalDay = new Date(Date.UTC(year, month - 1, day + 1));
    year = nextLocalDay.getUTCFullYear();
    month = nextLocalDay.getUTCMonth() + 1;
    day = nextLocalDay.getUTCDate();
  }

  const wallClockAsUtc = Date.UTC(year, month - 1, day);
  const offsetParts = Object.fromEntries(localParts.formatToParts(new Date(wallClockAsUtc)).map(({ type, value }) => [type, value]));
  const representedAsUtc = Date.UTC(
    Number(offsetParts.year), Number(offsetParts.month) - 1, Number(offsetParts.day),
    Number(offsetParts.hour), Number(offsetParts.minute), Number(offsetParts.second),
  );
  return new Date(wallClockAsUtc - (representedAsUtc - wallClockAsUtc)).toISOString();
}

export function effectivePlan(subscription, now = new Date()) {
  if (!subscription || subscription.plan !== 'premium') return 'free';
  const current = subscription.status === 'active'
    || (subscription.status === 'cancelled' && subscription.endDate && subscription.endDate > now);
  return current ? 'premium' : 'free';
}

export async function consumeQuota(userId, feature, now = new Date()) {
  const mapping = quotaFields[feature];
  if (!mapping) throw new Error(`Unsupported quota feature: ${feature}`);
  const settings = await getPlansSettings();
  const subscription = await Subscription.findOne({ userId }).lean();
  if (!subscription) throw new AuthError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Your plan could not be checked. Please try again.');

  const planName = effectivePlan(subscription, now);
  const limit = settings.plans[planName].limits[feature];
  if (limit === null) return { allowed: true, plan: planName, limit: null, remaining: null };
  const key = periodKey(now, settings.timezone, mapping.period);
  const filter = {
    userId,
    $or: [
      { [mapping.date]: key, [mapping.counter]: { $lt: limit } },
      { [mapping.date]: { $ne: key } },
    ],
  };
  const pipeline = [{
    $set: {
      [mapping.date]: key,
      [mapping.counter]: {
        $cond: [
          { $eq: [`$${mapping.date}`, key] },
          { $add: [{ $ifNull: [`$${mapping.counter}`, 0] }, 1] },
          1,
        ],
      },
    },
  }];
  const updated = await Subscription.findOneAndUpdate(filter, pipeline, { new: true, projection: { [mapping.counter]: 1 } }).lean();
  if (!updated) {
    return { allowed: false, plan: planName, limit, timezone: settings.timezone, resetsAt: nextReset(now, settings.timezone, mapping.period) };
  }
  const used = mapping.counter.split('.').reduce((value, keyPart) => value?.[keyPart], updated);
  return { allowed: true, plan: planName, limit, remaining: Math.max(0, limit - used), used };
}

export async function getUsage(userId, now = new Date()) {
  const settings = await getPlansSettings();
  const subscription = await Subscription.findOne({ userId }).lean();
  if (!subscription) throw new AuthError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Your plan could not be checked. Please try again.');

  const planName = effectivePlan(subscription, now);
  const limits = settings.plans[planName].limits;
  const searchToday = periodKey(now, settings.timezone, 'day');
  const scanMonth = periodKey(now, settings.timezone, 'month');
  const searchCount = subscription.usage?.searchDate === searchToday ? subscription.usage.searchesToday || 0 : 0;
  const scansCount = subscription.usage?.scanMonth === scanMonth ? subscription.usage.scansThisMonth || 0 : 0;
  return {
    plan: planName,
    status: subscription.status,
    endDate: subscription.endDate,
    autoRenew: subscription.autoRenew,
    timezone: settings.timezone,
    recipeSearchesPerDay: { used: searchCount, limit: limits.recipeSearchesPerDay, resetsAt: nextReset(now, settings.timezone, 'day') },
    ingredientScansPerMonth: { used: scansCount, limit: limits.ingredientScansPerMonth, resetsAt: nextReset(now, settings.timezone, 'month') },
  };
}

export async function getPlanPrice(interval) {
  const settings = await getPlansSettings();
  const price = interval === 'yearly' ? settings.plans.premium.priceYearly : settings.plans.premium.priceMonthly;
  if (!Number.isFinite(price) || price <= 0) throw new AuthError(400, 'INVALID_PLAN', 'That Premium plan is unavailable.');
  return { amountPaise: Math.round(price * 100), currency: settings.plans.premium.currency || 'INR' };
}

export { defaultPlans };