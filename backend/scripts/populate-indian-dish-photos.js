import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../src/models/Cuisine.js';
import Recipe from '../src/models/Recipe.js';
import { getOpenLicenseRecipePhoto } from '../src/services/openverseService.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before looking up Indian dish photos.');
  process.exit(1);
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const monthMilliseconds = 30 * 24 * 60 * 60 * 1000;

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const cuisines = await Cuisine.find({ status: 'active' }).select('_id name slug parentCuisine').lean();
  const india = cuisines.find((cuisine) => cuisine.slug === 'india');
  if (!india) throw new Error('India cuisine node was not found.');

  const children = new Map();
  for (const cuisine of cuisines) {
    if (!cuisine.parentCuisine) continue;
    const parentId = String(cuisine.parentCuisine);
    const items = children.get(parentId) || [];
    items.push(cuisine);
    children.set(parentId, items);
  }

  const indianNames = new Set(['India']);
  const pendingCuisines = [india];
  while (pendingCuisines.length) {
    const cuisine = pendingCuisines.pop();
    for (const child of children.get(String(cuisine._id)) || []) {
      if (indianNames.has(child.name)) continue;
      indianNames.add(child.name);
      pendingCuisines.push(child);
    }
  }

  const recipes = await Recipe.find({
    status: 'published',
    visibility: 'public',
    $and: [
      { $or: [{ 'cuisine.primary': { $in: [...indianNames] } }, { 'cuisine.regional': { $in: [...indianNames] } }] },
      { $or: [{ 'coverImage.url': '' }, { 'coverImage.url': { $exists: false } }] },
    ],
  }).select('slug title coverImage').sort({ title: 1 }).lean();

  const now = Date.now();
  const pending = recipes.filter((recipe) => !(
    recipe.coverImage?.lookupStatus === 'not_found'
    && recipe.coverImage?.searchedAt
    && now - new Date(recipe.coverImage.searchedAt).getTime() < monthMilliseconds
  ));
  let found = 0;
  let noMatch = recipes.length - pending.length;
  let errors = 0;

  console.log(`Looking up open-license photos for ${pending.length} Indian dishes; ${noMatch} recent no-match results will be skipped.`);
  for (const [index, recipe] of pending.entries()) {
    try {
      const photo = await getOpenLicenseRecipePhoto(recipe.slug);
      if (photo?.url) found += 1;
      else noMatch += 1;
    } catch (error) {
      errors += 1;
      console.error(`Photo lookup failed for ${recipe.title}: ${error.message}`);
      if (error.status === 503 && /rate|busy|unavailable/i.test(error.message)) await wait(10_000);
    }
    if ((index + 1) % 10 === 0 || index + 1 === pending.length) {
      console.log(`Processed ${index + 1}/${pending.length}; photos found ${found}, no match ${noMatch}, errors ${errors}.`);
    }
    await wait(1200);
  }

  console.log(JSON.stringify({
    dishesChecked: pending.length,
    photosFound: found,
    noRelevantLicensedPhoto: noMatch,
    lookupErrors: errors,
  }, null, 2));
} catch (error) {
  console.error('Indian dish photo population failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
