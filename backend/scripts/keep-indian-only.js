import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../src/models/Cuisine.js';
import Recipe from '../src/models/Recipe.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before filtering cuisine data.');
  process.exit(1);
}

const deleteEnabled = process.env.DELETE_NON_INDIAN_CONTENT === 'true';

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });

  const cuisines = await Cuisine.find({}).select('_id name slug level parentCuisine country continent').lean();
  const india = cuisines.find((node) => node.slug === 'india' && node.level === 'country');
  if (!india) throw new Error('The India country node was not found; no data was changed.');

  const childrenByParent = new Map();
  for (const cuisine of cuisines) {
    const parentId = cuisine.parentCuisine ? String(cuisine.parentCuisine) : '';
    if (!parentId) continue;
    const children = childrenByParent.get(parentId) || [];
    children.push(cuisine);
    childrenByParent.set(parentId, children);
  }

  const keepCuisineIds = new Set([String(india._id)]);
  const indianCuisineNames = new Set([india.name]);
  const pending = [india];
  while (pending.length) {
    const parent = pending.pop();
    for (const child of childrenByParent.get(String(parent._id)) || []) {
      const id = String(child._id);
      if (keepCuisineIds.has(id)) continue;
      keepCuisineIds.add(id);
      indianCuisineNames.add(child.name);
      pending.push(child);
    }
  }

  let ancestor = india;
  const visitedAncestors = new Set();
  while (ancestor.parentCuisine) {
    const parentId = String(ancestor.parentCuisine);
    if (visitedAncestors.has(parentId)) break;
    visitedAncestors.add(parentId);
    const parent = cuisines.find((node) => String(node._id) === parentId);
    if (!parent) break;
    keepCuisineIds.add(parentId);
    ancestor = parent;
  }

  const recipes = await Recipe.find({}).select('_id cuisine.primary cuisine.regional').lean();
  const retainedRecipes = [];
  const removedRecipeCounts = new Map();
  for (const recipe of recipes) {
    const primary = recipe.cuisine?.primary || '';
    const regional = recipe.cuisine?.regional || '';
    if (indianCuisineNames.has(primary) || indianCuisineNames.has(regional)) {
      retainedRecipes.push(recipe._id);
    } else {
      const label = primary || '(no primary cuisine)';
      removedRecipeCounts.set(label, (removedRecipeCounts.get(label) || 0) + 1);
    }
  }

  const report = {
    dryRun: !deleteEnabled,
    retainedHierarchy: cuisines.filter((node) => keepCuisineIds.has(String(node._id))).map(({ name, level }) => `${level}: ${name}`).sort(),
    retainedRecipeCount: retainedRecipes.length,
    removedRecipeCount: recipes.length - retainedRecipes.length,
    removedCuisineCount: cuisines.length - keepCuisineIds.size,
    removedRecipeCuisineNames: [...removedRecipeCounts.entries()].sort((left, right) => right[1] - left[1]),
  };
  console.log(JSON.stringify(report, null, 2));

  if (deleteEnabled) {
    const cuisineResult = await Cuisine.deleteMany({ _id: { $nin: [...keepCuisineIds] } });
    const recipeResult = await Recipe.deleteMany({ _id: { $nin: retainedRecipes } });
    console.log(JSON.stringify({
      permanentlyDeletedCuisines: cuisineResult.deletedCount,
      permanentlyDeletedRecipes: recipeResult.deletedCount,
    }, null, 2));
  } else {
    console.log('Dry run only. Set DELETE_NON_INDIAN_CONTENT=true to permanently delete the listed records.');
  }
} catch (error) {
  console.error('Indian-only data operation failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
