import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

const palettes = [
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#2563eb'],
  ['#8b5cf6', '#14b8a6'],
  ['#ec4899', '#f97316'],
  ['#0ea5e9', '#22c55e'],
  ['#f97316', '#f43f5e'],
  ['#6366f1', '#a855f7'],
];

function slugToHue(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % palettes.length;
}

function buildDishArt(title, cuisine, category) {
  const safeTitle = (title || 'Recipe').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const [start, end] = palettes[slugToHue(`${title}-${cuisine}-${category}`)];
  const lineOne = safeTitle.split(/\s+/).slice(0, 2).join(' ') || 'Recipe';
  const lineTwo = safeTitle.split(/\s+/).slice(2, 4).join(' ') || 'Masterpiece';

  const dishColor = category === 'dessert' ? '#f9d76f' : category === 'bread' ? '#efd099' : category === 'main' ? '#d27542' : category === 'snack' ? '#d3a15a' : '#8cc86d';
  const accentColor = category === 'dessert' ? '#ffbf69' : category === 'bread' ? '#d97706' : '#f97316';
  const herbColor = category === 'dessert' ? '#7aa45e' : '#70b35a';
  const garnishColor = category === 'dessert' ? '#fef3c7' : '#ebd9a7';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
        <radialGradient id="plate" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fffaf4"/>
          <stop offset="50%" stop-color="#f5f3ef"/>
          <stop offset="100%" stop-color="#e5ddd2"/>
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="rgba(0,0,0,0.18)"/>
        </filter>
      </defs>

      <rect width="640" height="420" fill="url(#bg)"/>
      <circle cx="540" cy="90" r="110" fill="rgba(255,255,255,0.10)"/>
      <circle cx="120" cy="345" r="140" fill="rgba(255,255,255,0.09)"/>
      <g opacity="0.42">
        <circle cx="130" cy="82" r="3.5" fill="#ffffff"/>
        <circle cx="190" cy="52" r="2.8" fill="#ffffff"/>
        <circle cx="215" cy="100" r="3.2" fill="#ffffff"/>
        <circle cx="255" cy="70" r="2.5" fill="#ffffff"/>
      </g>

      <g filter="url(#shadow)">
        <ellipse cx="330" cy="265" rx="220" ry="116" fill="url(#plate)"/>
        <ellipse cx="330" cy="255" rx="178" ry="86" fill="${dishColor}"/>
        <path d="M214 250 C270 208, 390 205, 440 252 C420 315, 330 325, 250 314 C228 304, 220 276, 214 250 Z" fill="${accentColor}" opacity="0.78"/>
        <path d="M220 262 C260 230, 300 220, 345 230 C397 242, 430 260, 438 289 C390 322, 305 325, 250 315 C230 308, 220 286, 220 262 Z" fill="${dishColor}" opacity="0.82"/>
        <g fill="${garnishColor}" opacity="0.75">
          <circle cx="282" cy="235" r="19"/>
          <circle cx="358" cy="225" r="17"/>
          <circle cx="325" cy="200" r="18"/>
          <circle cx="395" cy="246" r="18"/>
          <circle cx="255" cy="275" r="16"/>
          <circle cx="412" cy="285" r="16"/>
        </g>
        <g fill="${herbColor}" opacity="0.9">
          <path d="M250 246 C256 222, 273 232, 273 246 C265 248, 258 251, 250 246 Z"/>
          <path d="M292 230 C299 205, 316 216, 315 230 C307 232, 300 235, 292 230 Z"/>
          <path d="M370 244 C376 220, 394 230, 394 244 C386 248, 380 249, 370 244 Z"/>
          <path d="M410 270 C418 246, 434 256, 433 270 C425 272, 418 275, 410 270 Z"/>
        </g>
      </g>

      <g>
        <rect x="20" y="20" width="172" height="36" rx="18" fill="rgba(255,255,255,0.18)"/>
        <text x="38" y="45" fill="white" font-size="19" font-family="Arial, sans-serif" font-weight="700">RecipeMaster</text>
      </g>

      <g>
        <text x="38" y="340" fill="white" font-size="30" font-family="Arial, sans-serif" font-weight="700">${lineOne}</text>
        <text x="38" y="376" fill="rgba(255,255,255,0.86)" font-size="18" font-family="Arial, sans-serif">${lineTwo || (cuisine || 'India')}</text>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const limitArgument = process.argv.find((argument) => argument.startsWith('--limit='));
  const limit = limitArgument ? Number(limitArgument.slice('--limit='.length)) : Infinity;
  if (!(limit > 0)) throw new Error('The --limit value must be a positive number.');
  const recipes = await Recipe.find({ status: 'published', visibility: 'public' })
    .select('_id title cuisine dishCategory coverImage')
    .sort({ title: 1, _id: 1 })
    .limit(Number.isFinite(limit) ? limit : 0)
    .lean();
  let updated = 0;
  const generatedTitles = [];
  for (const recipe of recipes) {
    const url = buildDishArt(recipe.title, recipe.cuisine?.primary || recipe.cuisine?.regional || 'India', recipe.dishCategory || 'main');
    const result = await Recipe.updateOne(
      { _id: recipe._id },
      {
        $set: {
          coverImage: {
            url,
            publicId: '',
            alt: recipe.title,
            creator: 'RecipeMaster',
            license: 'Generated art',
            licenseUrl: 'https://example.com/generated-art',
            sourceUrl: 'https://example.com/generated-art',
            provider: 'RecipeMaster',
            lookupStatus: 'found',
            searchedAt: new Date(),
          },
        },
      },
    );
    if (result.modifiedCount || result.upsertedCount) {
      updated += 1;
      generatedTitles.push(recipe.title);
    }
  }
  console.log(JSON.stringify({ updatedCount: updated, totalRecipes: recipes.length, generatedTitles }, null, 2));
} finally {
  await mongoose.disconnect();
}
