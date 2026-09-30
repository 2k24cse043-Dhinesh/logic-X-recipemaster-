import AppSetting from '../models/AppSetting.js';
import AuditLog from '../models/AuditLog.js';
import { z } from 'zod';
import { getPublicPlans, getUsage } from '../services/planService.js';

const limitValue = z.union([z.number().int().nonnegative(), z.null()]);
const planLimitsSchema = z.object({
  recipeSearchesPerDay: limitValue,
  aiRecommendationsPerDay: limitValue,
  ingredientScansPerMonth: limitValue,
  aiAssistantMessagesPerDay: limitValue,
  pantryItemsMax: z.number().int().positive(),
  collectionsMax: z.number().int().nonnegative(),
  mealPlanDaysAhead: z.number().int().nonnegative(),
  wasteAnalyticsRangeDays: z.number().int().nonnegative(),
});

export async function publicPlans(req, res, next) {
  try {
    res.json({ success: true, data: await getPublicPlans() });
  } catch (error) {
    next(error);
  }
}

export async function usage(req, res, next) {
  try {
    res.json({ success: true, data: await getUsage(req.auth.userId) });
  } catch (error) {
    next(error);
  }
}

const planSchema = z.object({
  timezone: z.string().min(1).max(80),
  plans: z.object({
    free: z.object({
      priceMonthly: z.number().nonnegative(),
      currency: z.string().length(3).default('INR'),
      limits: planLimitsSchema,
    }),
    premium: z.object({
      priceMonthly: z.number().nonnegative(),
      priceYearly: z.number().nonnegative(),
      currency: z.string().length(3),
      limits: planLimitsSchema,
    }),
  }),
});

export async function updatePlans(req, res, next) {
  try {
    const value = planSchema.parse(req.body);
    const current = await AppSetting.findOne({ key: 'plans' }).select('value').lean();
    await AppSetting.updateOne(
      { key: 'plans' },
      { $set: { value, updatedBy: req.auth.userId } },
      { upsert: true },
    );
    await AuditLog.create({
      actorId: req.auth.userId,
      action: 'plans.updated',
      entityType: 'appSettings',
      entityId: 'plans',
      before: current?.value || null,
      after: value,
      ip: String(req.ip || '').slice(0, 64),
    });
    res.json({ success: true, data: await getPublicPlans(), message: 'Plan settings updated.' });
  } catch (error) {
    next(error);
  }
}