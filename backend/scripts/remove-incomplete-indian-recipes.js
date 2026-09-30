import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';
import Cuisine from '../src/models/Cuisine.js';

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const incomplete = await Recipe.find({ 'cuisine.primary': 'India', $or: [{ catalogOnly: true }, { ingredients: { $size: 0 } }, { steps: { $size: 0 } }] }).select('_id title slug cuisine').lean();
  const result = await Recipe.deleteMany({ _id: { $in: incomplete.map(({ _id }) => _id) } });

  const cuisines = await Cuisine.find({ status: 'active' }).select('_id name slug level parentCuisine').lean();
  const retainedRecipes = await Recipe.find({ 'cuisine.primary': 'India' }).select('cuisine.primary cuisine.regional').lean();
  const usedNames = new Set(retainedRecipes.flatMap((recipe) => [recipe.cuisine?.primary, recipe.cuisine?.regional]).filter(Boolean));
  const byId = new Map(cuisines.map((cuisine) => [String(cuisine._id), cuisine]));
  const byName = new Map(cuisines.map((cuisine) => [cuisine.name, cuisine]));
  const keepIds = new Set();
  for (const name of usedNames) {
    let cuisine = byName.get(name);
    while (cuisine) {
      const id = String(cuisine._id);
      if (keepIds.has(id)) break;
      keepIds.add(id);
      cuisine = cuisine.parentCuisine ? byId.get(String(cuisine.parentCuisine)) : null;
    }
  }
  const cuisineResult = await Cuisine.deleteMany({ _id: { $nin: [...keepIds] }, level: { $in: ['country', 'region', 'subregion', 'tag'] } });
  const completeCount = await Recipe.countDocuments({ 'cuisine.primary': 'India' });
  console.log(JSON.stringify({ deletedIncompleteRecipes: result.deletedCount, deletedUnusedCuisineNodes: cuisineResult.deletedCount, remainingCompleteRecipes: completeCount, removedTitles: incomplete.map(({ title }) => title) }, null, 2));
} finally {
  await mongoose.disconnect();
}
