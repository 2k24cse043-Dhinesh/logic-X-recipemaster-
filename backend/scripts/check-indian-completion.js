import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const recipes = await Recipe.find({ 'cuisine.primary': 'India' }).select('title ingredients steps catalogOnly aiGenerated').lean();
  const complete = recipes.filter((recipe) => recipe.ingredients?.length > 0 && recipe.steps?.length > 0);
  const namesOnly = recipes.filter((recipe) => recipe.catalogOnly);
  console.log(JSON.stringify({ total: recipes.length, complete: complete.length, namesOnly: namesOnly.length, missing: recipes.length - complete.length, names: namesOnly.map((recipe) => recipe.title) }, null, 2));
} finally {
  await mongoose.disconnect();
}
