import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../src/models/Cuisine.js';
import Recipe from '../src/models/Recipe.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before removing cuisine groups.');
  process.exit(1);
}

const targetCuisineNames = new Set(['Andhra', 'Andhra Pradesh', 'Anglo-Indian', 'North Indian street food', 'Parsi']);
const deleteEnabled = process.env.DELETE_SELECTED_INDIAN_CUISINES === 'true';

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });

  const cuisines = await Cuisine.find({}).select('_id name slug level parentCuisine').lean();
  const childrenByParent = new Map();
  for (const cuisine of cuisines) {
    if (!cuisine.parentCuisine) continue;
    const parentId = String(cuisine.parentCuisine);
    const children = childrenByParent.get(parentId) || [];
    children.push(cuisine);
    childrenByParent.set(parentId, children);
  }

  const targetNodes = cuisines.filter((cuisine) => targetCuisineNames.has(cuisine.name));
  const removeIds = new Set();
  const removeCuisineNames = new Set(targetCuisineNames);
  const pending = [...targetNodes];
  while (pending.length) {
    const current = pending.pop();
    const currentId = String(current._id);
    if (removeIds.has(currentId)) continue;
    removeIds.add(currentId);
    removeCuisineNames.add(current.name);
    for (const child of childrenByParent.get(currentId) || []) pending.push(child);
  }

  const recipes = await Recipe.find({}).select('_id title slug cuisine.primary cuisine.regional').lean();
  const removeRecipes = recipes.filter((recipe) => (
    removeCuisineNames.has(recipe.cuisine?.primary)
    || removeCuisineNames.has(recipe.cuisine?.regional)
  ));

  const report = {
    dryRun: !deleteEnabled,
    requestedCuisineGroups: [...targetCuisineNames],
    cuisineNodesFound: targetNodes.map(({ name, level, slug }) => ({ name, level, slug })),
    cuisineDescendantsToDelete: cuisines.filter((node) => removeIds.has(String(node._id))).map(({ name, level, slug }) => ({ name, level, slug })),
    recipesToDelete: removeRecipes.length,
    recipeSamples: removeRecipes.slice(0, 30).map(({ title, slug, cuisine }) => ({ title, slug, cuisine })),
  };
  console.log(JSON.stringify(report, null, 2));

  if (deleteEnabled) {
    const recipeResult = await Recipe.deleteMany({ _id: { $in: removeRecipes.map(({ _id }) => _id) } });
    const cuisineResult = await Cuisine.deleteMany({ _id: { $in: [...removeIds] } });
    console.log(JSON.stringify({ deletedRecipes: recipeResult.deletedCount, deletedCuisineNodes: cuisineResult.deletedCount }, null, 2));
  } else {
    console.log('Dry run only. Set DELETE_SELECTED_INDIAN_CUISINES=true to permanently delete these records.');
  }
} catch (error) {
  console.error('Cuisine group removal failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
