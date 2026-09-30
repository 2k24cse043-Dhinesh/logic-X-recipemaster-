import { z } from 'zod';
import { recognizePantryImage } from '../ai/geminiService.js';
import { consumeQuota } from '../services/planService.js';

const imageSchema = z.object({
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  data: z.string().min(1).max(950_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
});

export async function recognize(req, res, next) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: { code: 'AI_NOT_CONFIGURED', message: 'Photo recognition needs GEMINI_API_KEY configured in backend/.env.' },
      });
    }

    const image = imageSchema.parse(req.body);
    const quota = await consumeQuota(req.auth.userId, 'ingredientScansPerMonth');
    if (!quota.allowed) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          feature: 'ingredientScansPerMonth',
          limit: quota.limit,
          timezone: quota.timezone,
          resetsAt: quota.resetsAt,
          upgradeUrl: '/pricing',
          message: `You have used your ${quota.limit} ingredient scans for this month.`,
        },
      });
    }

    const items = await recognizePantryImage(image);
    return res.json({ success: true, data: { items, usage: { used: quota.used, limit: quota.limit, remaining: quota.remaining } } });
  } catch (error) {
    return next(error);
  }
}
