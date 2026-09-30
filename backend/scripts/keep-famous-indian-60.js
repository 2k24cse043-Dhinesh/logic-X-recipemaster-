import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../src/models/Cuisine.js';
import Recipe from '../src/models/Recipe.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before reducing the catalog.');
  process.exit(1);
}

const keepTitles = new Set([
  'Idli', 'Masala Dosa', 'Dosa', 'Vada', 'Ven Pongal', 'Sambar', 'Rasam', 'Lemon Rice', 'Tamarind Rice', 'Curd Rice',
  'Biryani', 'Hyderabadi Biryani', 'Mutton Biryani', 'Chicken Biryani', 'Butter Chicken', 'Tandoori Chicken', 'Chicken Chettinad',
  'Chicken Curry', 'Mutton Chukka', 'Rogan Josh', 'Fish Curry', 'Fish Fry', 'Paneer Butter Masala', 'Paneer Tikka', 'Palak Paneer',
  'Dal Tadka', 'Dal Makhani', 'Chana Masala', 'Rajma Masala', 'Aloo Gobi', 'Baingan Bharta', 'Malai Kofta', 'Kadhi Pakora',
  'Aloo Paratha', 'Naan', 'Roti', 'Parotta', 'Pav Bhaji', 'Vada Pav', 'Samosa', 'Pani Puri', 'Bhel Puri', 'Pakora',
  'Chole Bhature', 'Kachori', 'Dhokla', 'Thepla', 'Poha', 'Puran Poli', 'Gulab Jamun', 'Jalebi', 'Kheer', 'Gajar Halwa',
  'Rasgulla', 'Payasam', 'Mysore Pak', 'Lassi', 'Filter Coffee', 'Tomato Rice', 'Vegetable Fried Rice', 'Sushi Bowl', 'Margherita Pizza',
]);

const deleteEnabled = process.env.DELETE_EXTRA_INDIAN_DISHES === 'true';
const targetCount = 60;

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const recipes = await Recipe.find({ 'cuisine.primary': 'India' }).select('_id title slug cuisine').lean();
  const priorityRecipes = recipes.filter((recipe) => keepTitles.has(recipe.title));
  const remainingRecipes = recipes
    .filter((recipe) => !keepTitles.has(recipe.title))
    .sort((left, right) => left.title.localeCompare(right.title));
  const keepRecipes = [...priorityRecipes, ...remainingRecipes.slice(0, Math.max(0, targetCount - priorityRecipes.length))];
  const keepRecipeIds = new Set(keepRecipes.map(({ _id }) => String(_id)));
  const removeRecipes = recipes.filter((recipe) => !keepRecipeIds.has(String(recipe._id)));
  const keptRegions = new Set(keepRecipes.flatMap((recipe) => [recipe.cuisine?.primary, recipe.cuisine?.regional]).filter(Boolean));

  const cuisines = await Cuisine.find({ status: 'active' }).select('_id name slug level parentCuisine').lean();
  const keepCuisineIds = new Set();
  const byId = new Map(cuisines.map((cuisine) => [String(cuisine._id), cuisine]));
  const byName = new Map(cuisines.map((cuisine) => [cuisine.name, cuisine]));
  for (const name of keptRegions) {
    let cuisine = byName.get(name);
    while (cuisine) {
      const id = String(cuisine._id);
      if (keepCuisineIds.has(id)) break;
      keepCuisineIds.add(id);
      cuisine = cuisine.parentCuisine ? byId.get(String(cuisine.parentCuisine)) : null;
    }
  }

  const report = {
    dryRun: !deleteEnabled,
    requestedDishes: targetCount,
    matchedDishes: keepRecipes.length,
    missingDishes: [...keepTitles].filter((title) => !priorityRecipes.some((recipe) => recipe.title === title)),
    recipesToDelete: removeRecipes.length,
    cuisineNodesToDelete: cuisines.filter((cuisine) => !keepCuisineIds.has(String(cuisine._id)) && cuisine.level !== 'world' && cuisine.level !== 'continent').length,
    keptDishes: keepRecipes.map(({ title, cuisine }) => ({ title, cuisine })),
  };
  console.log(JSON.stringify(report, null, 2));

  if (deleteEnabled) {
    const recipeResult = await Recipe.deleteMany({ _id: { $in: removeRecipes.map(({ _id }) => _id) } });
    const cuisineResult = await Cuisine.deleteMany({
      _id: { $nin: [...keepCuisineIds] },
      level: { $in: ['country', 'region', 'subregion', 'tag'] },
    });
    console.log(JSON.stringify({ deletedRecipes: recipeResult.deletedCount, deletedCuisineNodes: cuisineResult.deletedCount }, null, 2));
  } else {
    console.log('Dry run only. Set DELETE_EXTRA_INDIAN_DISHES=true to permanently remove the other dishes.');
  }
} catch (error) {
  console.error('Famous dish reduction failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
