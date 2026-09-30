import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';
import { generateRecipeDraft } from '../src/ai/geminiService.js';
import { getOpenLicenseRecipePhoto } from '../src/services/openverseService.js';

if (process.env.GENERATE_ALL_INDIAN_DRAFTS !== 'true') {
  console.error('No data changed. Set GENERATE_ALL_INDIAN_DRAFTS=true after configuring GEMINI_API_KEY. This makes one AI request for every remaining dish.');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before generating recipes.');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is required. No recipes were changed.');
  process.exit(1);
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const requestedLimit = Number.parseInt(process.env.GENERATE_DRAFT_LIMIT || '', 10);
  const pendingQuery = Recipe.find({ catalogOnly: true, 'cuisine.primary': 'India' })
    .select('_id title slug cuisine dishCategory')
    .sort({ title: 1 });
  if (Number.isInteger(requestedLimit) && requestedLimit > 0) pendingQuery.limit(requestedLimit);
  const pending = await pendingQuery.lean();

  let completed = 0;
  let failed = 0;
  let photosFound = 0;
  const failures = [];

  console.log(`Preparing ${pending.length} Indian recipe drafts. They will be marked unreviewed.`);
  for (const recipe of pending) {
    try {
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
      completed += 1;

      try {
        const photo = await getOpenLicenseRecipePhoto(recipe.slug);
        if (photo?.url) photosFound += 1;
      } catch {
        // Keep the generated recipe when an image provider is unavailable.
      }

    } catch (error) {
      failed += 1;
      failures.push({ slug: recipe.slug, message: error.message });
    }
    if ((completed + failed) % 10 === 0) console.log(`Processed ${completed + failed}/${pending.length}`);
    await wait(800);
  }

  console.log(JSON.stringify({
    pendingAtStart: pending.length,
    generatedDrafts: completed,
    failed,
    licensedPhotosFound: photosFound,
    failures,
  }, null, 2));
} catch (error) {
  console.error('Indian recipe population failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
