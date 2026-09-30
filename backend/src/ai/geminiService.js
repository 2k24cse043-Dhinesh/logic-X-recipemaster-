import { z } from 'zod';

const phaseValues = ['prep', 'cook', 'finish', 'serve'];
const heatValues = ['low', 'medium-low', 'medium', 'medium-high', 'high', 'off'];

const pantryResultSchema = z.object({
  items: z.array(z.object({
    name: z.string().trim().min(1).max(80),
    confidence: z.number().min(0).max(1),
  })).max(40),
});

const recipeDraftSchema = z.object({
  description: z.string().trim().max(1000),
  servings: z.number().int().min(1).max(24),
  prepTimeMinutes: z.number().int().min(0).max(1440),
  cookTimeMinutes: z.number().int().min(0).max(1440),
  difficulty: z.enum(['easy', 'medium', 'advanced']),
  ingredients: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    quantity: z.number().min(0).optional(),
    unit: z.string().trim().max(30).default(''),
    preparation: z.string().trim().max(100).default(''),
    optional: z.boolean().default(false),
  })).min(1).max(60),
  steps: z.array(z.object({
    stepNumber: z.number().int().min(1),
    phase: z.enum(phaseValues),
    title: z.string().trim().max(120),
    instruction: z.string().trim().min(1).max(700),
    heatLevel: z.enum(heatValues).optional(),
    durationMinutes: z.number().int().min(0).max(1440).optional(),
    visualCue: z.string().trim().max(240).optional(),
    safetyNote: z.string().trim().max(240).optional(),
  })).min(1).max(30),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});

function serviceError(status, code, message) {
  return Object.assign(new Error(message), { status, code });
}

function requireApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw serviceError(503, 'AI_NOT_CONFIGURED', 'Photo recognition and recipe drafting need GEMINI_API_KEY in backend/.env.');
  }
}

async function generateStructured(prompt, image) {
  requireApiKey();
  const parts = [{ text: prompt }];
  if (image) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw serviceError(503, 'AI_UNAVAILABLE', 'The AI service could not be reached. Please try again.');
  }

  if (!response.ok) {
    if (response.status === 429) throw serviceError(429, 'AI_RATE_LIMITED', 'The AI service is busy. Please try again shortly.');
    if (response.status >= 500) throw serviceError(503, 'AI_UNAVAILABLE', 'The AI service is temporarily unavailable.');
    throw serviceError(502, 'AI_REQUEST_FAILED', 'The AI service could not process this request.');
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) throw serviceError(502, 'AI_EMPTY_RESPONSE', 'The AI service returned no usable result.');
  try {
    return JSON.parse(text);
  } catch {
    throw serviceError(502, 'AI_INVALID_RESPONSE', 'The AI service returned an unreadable result.');
  }
}

export async function recognizePantryImage(image) {
  const result = pantryResultSchema.safeParse(await generateStructured(
    'Identify visible edible ingredients in this kitchen or pantry photo. Return only items you can reasonably identify, not utensils, packaging brands, or dishes. Use common ingredient names. Include a confidence from 0 to 1. If nothing is clear, return an empty items array.',
    image,
  ));
  if (!result.success) throw serviceError(502, 'AI_INVALID_RESPONSE', 'The AI service returned an invalid ingredient list.');
  return result.data.items.filter((item) => item.confidence >= 0.35);
}

export async function generateRecipeDraft({ title, cuisine, category }) {
  const result = recipeDraftSchema.safeParse(await generateStructured(
    `Create a practical recipe draft for the dish "${title}". Cuisine/region: "${cuisine || 'unspecified'}". Category: "${category || 'main'}". Use plausible quantities and specific, sequential steps. Include heat, timing, visual cues, and food-safety notes only when appropriate. Do not claim the recipe is historically authoritative or verified. Return JSON with description, servings, prepTimeMinutes, cookTimeMinutes, difficulty, ingredients, steps, and tags.`,
  ));
  if (!result.success) throw serviceError(502, 'AI_INVALID_RESPONSE', 'The AI service returned an invalid recipe draft.');
  return result.data;
}
