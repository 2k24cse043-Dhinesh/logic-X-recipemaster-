import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before migrating recipe steps.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const recipes = await Recipe.find({ stepSchemaVersion: { $lt: 2 } }).select('_id source steps').lean();
  let migrated = 0;
  let needsEnrichment = 0;

  for (const recipe of recipes) {
    const steps = (recipe.steps || []).map((step) => ({
      stepNumber: step.stepNumber,
      phase: null,
      title: null,
      instruction: step.instruction,
      ingredientsUsed: [],
      equipmentUsed: [],
      techniqueId: null,
      heatLevel: null,
      temperature: null,
      durationMinutes: step.durationMinutes ?? null,
      timerEligible: Number.isFinite(step.durationMinutes) && step.durationMinutes > 0,
      visualCue: step.visualCue ?? null,
      sensoryCue: null,
      donenessCue: null,
      tip: null,
      commonMistake: null,
      ifThisHappens: [],
      safetyNote: null,
      canPauseHere: null,
    }));
    await Recipe.updateOne(
      { _id: recipe._id, stepSchemaVersion: { $lt: 2 } },
      { $set: { steps, stepSchemaVersion: 2, stepDataOrigin: ['original', 'user'].includes(recipe.source) ? 'authored' : 'sourced' } },
    );
    migrated += 1;
    if (steps.length < 8 || steps.some((step) => !step.durationMinutes || !step.visualCue)) needsEnrichment += 1;
  }

  console.log(`Migrated ${migrated} recipes; ${needsEnrichment} need detailed-step enrichment.`);
} finally {
  await mongoose.disconnect();
}