import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../src/models/Cuisine.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before verifying cuisines.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const cuisines = await Cuisine.find({ status: 'active' }).select('_id name slug level parentCuisine').lean();
  const byId = new Map(cuisines.map((cuisine) => [String(cuisine._id), cuisine]));
  const errors = [];
  const state = new Map();

  for (const cuisine of cuisines) {
    if (cuisine.level !== 'world' && cuisine.level !== 'tag' && (!cuisine.parentCuisine || !byId.has(String(cuisine.parentCuisine)))) {
      errors.push(`${cuisine.slug}: missing or invalid parent cuisine`);
    }
  }

  function visit(id, path = []) {
    const key = String(id);
    if (state.get(key) === 2) return;
    if (state.get(key) === 1) {
      errors.push(`Cycle detected: ${[...path, key].map((nodeId) => byId.get(nodeId)?.name || nodeId).join(' -> ')}`);
      return;
    }
    state.set(key, 1);
    const cuisine = byId.get(key);
    if (cuisine?.parentCuisine && byId.has(String(cuisine.parentCuisine))) visit(cuisine.parentCuisine, [...path, key]);
    state.set(key, 2);
  }

  for (const cuisine of cuisines) visit(cuisine._id);
  const counts = new Map();
  for (const { level } of cuisines) counts.set(level, (counts.get(level) || 0) + 1);
  console.table([...counts.entries()].map(([level, count]) => ({ level, count })));
  console.log(`Cuisines checked: ${cuisines.length}`);

  if (errors.length) {
    console.error(`Cuisine validation failed with ${errors.length} issue(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log('Cuisine parents and hierarchy are valid.');
  }
} finally {
  await mongoose.disconnect();
}
