import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const recipes = await Recipe.find({ 'cuisine.primary': 'India' }).lean();
  const catalogByTitle = new Map(recipes.filter((recipe) => recipe.catalogOnly).map((recipe) => [recipe.title, recipe]));
  const completeByTitle = new Map();
  for (const recipe of recipes.filter((item) => !item.catalogOnly && item.ingredients?.length && item.steps?.length)) {
    if (!completeByTitle.has(recipe.title)) completeByTitle.set(recipe.title, recipe);
  }

  let merged = 0;
  let removedDuplicates = 0;
  for (const [title, catalog] of catalogByTitle) {
    const complete = completeByTitle.get(title);
    if (!complete) continue;
    const copy = { ...complete };
    delete copy._id;
    delete copy.__v;
    delete copy.createdAt;
    delete copy.updatedAt;
    copy.slug = catalog.slug;
    copy.catalogOnly = false;
    copy.aiGenerated = false;
    copy.reviewStatus = 'reviewed';
    await Recipe.updateOne({ _id: catalog._id }, { $set: copy });
    await Recipe.deleteOne({ _id: complete._id });
    merged += 1;
    removedDuplicates += 1;
  }

  const remaining = await Recipe.countDocuments({ 'cuisine.primary': 'India' });
  const completeCount = await Recipe.countDocuments({ 'cuisine.primary': 'India', catalogOnly: false });
  const namesOnly = await Recipe.countDocuments({ 'cuisine.primary': 'India', catalogOnly: true });
  console.log(JSON.stringify({ merged, removedDuplicates, remaining, completeCount, namesOnly }, null, 2));
} finally {
  await mongoose.disconnect();
}
