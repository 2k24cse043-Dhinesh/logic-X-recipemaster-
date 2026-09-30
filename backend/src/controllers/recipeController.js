import { z } from 'zod';
import Recipe from '../models/Recipe.js';
import { generateRecipeDraft } from '../ai/geminiService.js';
import { getOpenLicenseRecipePhoto } from '../services/openverseService.js';
import { getRecipeByShareToken, getRecipeBySlug, listRecipes } from '../services/recipeService.js';
import { consumeQuota } from '../services/planService.js';

const querySchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  cuisine: z.string().trim().max(60).optional(),
  diet: z.string().trim().max(40).optional(),
  dishCategory: z.enum(['starter', 'main', 'side', 'dessert', 'snack', 'beverage', 'bread']).optional(),
  maxTime: z.coerce.number().int().min(1).max(1440).optional(),
  sort: z.enum(['newest', 'shortest', 'saved']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export async function list(req, res, next) {
  try {
    const query = querySchema.parse(req.query);
    const result = await listRecipes(query);
    if (req.auth) {
      const quota = await consumeQuota(req.auth.userId, 'recipeSearchesPerDay');
      if (!quota.allowed) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            feature: 'recipeSearchesPerDay',
            limit: quota.limit,
            timezone: quota.timezone,
            resetsAt: quota.resetsAt,
            upgradeUrl: '/pricing',
            message: `You have used your ${quota.limit} recipe searches for today.`,
          },
        });
      }
    }
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const recipe = await getRecipeBySlug(req.params.slug);
    if (!recipe) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recipe not found.' } });
    }
    return res.json({ success: true, data: recipe });
  } catch (error) {
    return next(error);
  }
}

export async function getByShareToken(req, res, next) {
  try {
    const recipe = await getRecipeByShareToken(req.params.shareToken);
    if (!recipe) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recipe not found.' } });
    }
    return res.json({ success: true, data: recipe });
  } catch (error) {
    return next(error);
  }
}

export async function getPhotoBySlug(req, res, next) {
  try {
    const photo = await getOpenLicenseRecipePhoto(req.params.slug);
    if (!photo) {
      return res.status(404).json({ success: false, error: { code: 'PHOTO_NOT_FOUND', message: 'No suitable open-license photo was found for this dish.' } });
    }
    return res.json({ success: true, data: photo });
  } catch (error) {
    return next(error);
  }
}


export async function generateDraft(req, res, next) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: { code: 'AI_NOT_CONFIGURED', message: 'Recipe drafting needs GEMINI_API_KEY configured in backend/.env.' },
      });
    }

    const recipe = await getRecipeBySlug(req.params.slug);
    if (!recipe) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recipe not found.' } });
    }
    if (!recipe.catalogOnly) {
      return res.status(409).json({ success: false, error: { code: 'RECIPE_ALREADY_COMPLETE', message: 'This recipe already has cooking instructions.' } });
    }

    const quota = await consumeQuota(req.auth.userId, 'aiRecommendationsPerDay');
    if (!quota.allowed) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          feature: 'aiRecommendationsPerDay',
          limit: quota.limit,
          timezone: quota.timezone,
          resetsAt: quota.resetsAt,
          upgradeUrl: '/pricing',
          message: `You have used your ${quota.limit} AI requests for today.`,
        },
      });
    }

    const draft = await generateRecipeDraft({
      title: recipe.title,
      cuisine: [recipe.cuisine?.regional, recipe.cuisine?.primary].filter(Boolean).join(', '),
      category: recipe.dishCategory,
    });

    await Recipe.updateOne(
      { _id: recipe._id, catalogOnly: true },
      {
        $set: {
          ...draft,
          totalTimeMinutes: draft.prepTimeMinutes + draft.cookTimeMinutes,
          catalogOnly: false,
          aiGenerated: true,
          reviewStatus: 'draft',
          source: 'external_api',
          stepDataOrigin: 'sourced',
          stepSchemaVersion: 2,
          completenessScore: 70,
        },
      },
    );

    const updatedRecipe = await getRecipeBySlug(req.params.slug);
    return res.json({ success: true, data: updatedRecipe, meta: { generated: true, reviewed: false } });
  } catch (error) {
    return next(error);
  }
}