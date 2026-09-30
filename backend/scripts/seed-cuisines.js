import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../src/models/Cuisine.js';
import Ingredient from '../src/models/Ingredient.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before seeding cuisines.');
  process.exit(1);
}

const slugify = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const definitions = [];
const add = (name, level, parent = null, extra = {}) => definitions.push({ name, level, parent, ...extra });
const group = (parent, level, names, extra = {}) => names.forEach((name) => add(name, level, parent, extra));

add('World', 'world');
for (const continent of ['Asia', 'Middle East & North Africa', 'Europe', 'Africa', 'North America', 'South America', 'Oceania']) add(continent, 'continent', 'World');

add('India', 'country', 'Asia', { continent: 'Asia', popularGroup: 'india' });
for (const name of ['North Indian', 'South Indian']) add(name, 'region', 'India', { country: 'India', continent: 'Asia', popularGroup: 'india' });
add('East Asian-inspired', 'region', 'Asia', { continent: 'Asia', popularGroup: 'asia' });
const indiaRegions = {
  'Tamil': ['Chettinad', 'Kongunadu', 'Madurai', 'Tirunelveli', 'Nanjilnadu', 'Brahmin / Iyer-Iyengar'],
  'Kerala': ['Malabar / Moplah', 'Syrian Christian', 'Travancore', 'Sadya'],
  'Karnataka': ['Udupi', 'Mangalorean', 'Coorg / Kodava', 'North Karnataka', 'Mysore'],
  'Telangana': ['Hyderabadi', 'Telangana home cooking'],
  'Maharashtra': ['Malvani', 'Kolhapuri', 'Konkani', 'Vidarbha'],
  'Goa': ['Goan Catholic', 'Goan Hindu'],
  'Gujarat': ['Kathiawadi', 'Surti'],
  'Rajasthan': ['Marwari'],
  'Punjab': ['Punjabi'],
  'Haryana': ['Haryanvi'],
  'Himachal Pradesh': ['Himachali'],
  'Kashmir': ['Kashmiri'],
  'Uttarakhand': ['Garhwali', 'Kumaoni'],
  'Uttar Pradesh': ['Awadhi', 'Lucknowi', 'Banarasi'],
  'Bihar': ['Bihari'],
  'Jharkhand': ['Jharkhandi'],
  'West Bengal': ['Bengali'],
  'Odisha': ['Odia'],
  'Assam': ['Assamese'],
  'Manipur': ['Manipuri'],
  'Nagaland': ['Naga'],
  'Mizoram': ['Mizo'],
  'Meghalaya': ['Meghalayan'],
  'Tripura': ['Tripuri'],
  'Sikkim': ['Sikkimese'],
  'Arunachal Pradesh': ['Arunachali'],
  'Madhya Pradesh': ['Malwa', 'Bundelkhand'],
  'Chhattisgarh': ['Chhattisgarhi'],
  'Sindh': ['Sindhi'],
  'Mughlai': [],
};
for (const [region, children] of Object.entries(indiaRegions)) {
  add(region, 'region', 'India', { country: 'India', continent: 'Asia', popularGroup: 'india' });
  group(region, 'subregion', children, { country: 'India', continent: 'Asia', popularGroup: 'india' });
}
for (const name of ['Indo-Chinese']) {
  add(name, 'region', 'India', { country: 'India', continent: 'Asia', popularGroup: 'india' });
}

const asiaCountries = {
  China: ['Sichuan', 'Cantonese', 'Hunan', 'Shandong', 'Fujian', 'Shanghainese', 'Yunnan', 'Xinjiang'],
  Japan: ['Kansai', 'Kanto', 'Okinawan', 'Washoku home cooking'],
  Korea: ['Korean'],
  Thailand: ['Northern Thai', 'Central Thai', 'Isaan', 'Southern Thai'],
  Vietnam: ['Northern Vietnamese', 'Central Vietnamese', 'Southern Vietnamese'],
  Indonesia: ['Javanese', 'Padang', 'Balinese'],
  Malaysia: ['Malay', 'Peranakan / Nyonya'],
  Singapore: ['Singaporean'],
  Philippines: ['Filipino'],
  Myanmar: ['Burmese'],
  Cambodia: ['Cambodian'],
  Laos: ['Laotian'],
  'Sri Lanka': ['Jaffna', 'Sinhalese'],
  Nepal: ['Nepali'],
  Bhutan: ['Bhutanese'],
  Bangladesh: ['Bangladeshi'],
  Pakistan: ['Lahori', 'Karachi', 'Peshawari'],
  Afghanistan: ['Afghan'],
  Mongolia: ['Mongolian'],
  Taiwan: ['Taiwanese'],
  Tibet: ['Tibetan'],
  'Central Asia': ['Uzbek', 'Kazakh'],
};
for (const [country, regions] of Object.entries(asiaCountries)) {
  add(country, 'country', 'Asia', { continent: 'Asia', popularGroup: 'asia' });
  group(country, 'region', regions, { country, continent: 'Asia', popularGroup: 'asia' });
}

const menaCountries = {
  Lebanon: ['Lebanese'], Syria: ['Syrian'], Palestine: ['Palestinian'], Jordan: ['Jordanian'], Turkey: ['Turkish'],
  Iran: ['Iranian / Persian'], Iraq: ['Iraqi'], Israel: ['Israeli'], Yemen: ['Yemeni'],
  'Gulf / Khaleeji': [], Egypt: ['Egyptian'], Morocco: ['Moroccan'], Tunisia: ['Tunisian'], Algeria: ['Algerian'], Libya: ['Libyan'],
};
for (const [country, regions] of Object.entries(menaCountries)) {
  add(country, 'country', 'Middle East & North Africa', { continent: 'Middle East & North Africa', popularGroup: 'mena' });
  group(country, 'region', regions, { country, continent: 'Middle East & North Africa', popularGroup: 'mena' });
}

const europeCountries = {
  Italy: ['Sicilian', 'Neapolitan', 'Tuscan', 'Lombard', 'Emilian'], France: ['Provençal', 'Alsatian', 'Breton'],
  Spain: ['Catalan', 'Basque', 'Andalusian'], Portugal: ['Portuguese'], Greece: ['Greek'], Germany: ['German'],
  Austria: ['Austrian'], Switzerland: ['Swiss'], 'United Kingdom': ['British'], Ireland: ['Irish'],
  Scandinavia: ['Swedish', 'Danish', 'Norwegian', 'Finnish'], Poland: ['Polish'], Russia: ['Russian'], Ukraine: ['Ukrainian'],
  Hungary: ['Hungarian'], Czechia: ['Czech'], Georgia: ['Georgian'], Balkans: ['Serbian', 'Croatian', 'Bosnian', 'Bulgarian', 'Romanian'],
  Netherlands: ['Dutch'], Belgium: ['Belgian'],
};
for (const [country, regions] of Object.entries(europeCountries)) {
  add(country, 'country', 'Europe', { continent: 'Europe', popularGroup: 'europe' });
  group(country, 'region', regions, { country, continent: 'Europe', popularGroup: 'europe' });
}

const africaCountries = {
  Ethiopia: ['Ethiopian'], Eritrea: ['Eritrean'], Nigeria: ['Nigerian'], Ghana: ['Ghanaian'], Senegal: ['Senegalese'],
  'South Africa': ['South African', 'Cape Malay'], Kenya: ['Kenyan'], Tanzania: ['Tanzanian', 'Zanzibari'], Uganda: ['Ugandan'],
  Congo: ['Congolese'], Cameroon: ['Cameroonian'], Madagascar: ['Malagasy'], Mozambique: ['Mozambican'],
};
for (const [country, regions] of Object.entries(africaCountries)) {
  add(country, 'country', 'Africa', { continent: 'Africa', popularGroup: 'africa' });
  group(country, 'region', regions, { country, continent: 'Africa', popularGroup: 'africa' });
}

const northAmericanCountries = {
  'United States': ['Southern American', 'Cajun / Creole', 'Tex-Mex', 'Californian', 'New England', 'Midwestern', 'Soul food'],
  Canada: ['Quebecois', 'Canadian'],
  Mexico: ['Oaxacan', 'Yucatecan', 'Pueblan', 'Northern Mexican'],
  Caribbean: ['Jamaican', 'Cuban', 'Puerto Rican', 'Haitian', 'Trinidadian'],
  'Central America': ['Guatemalan', 'Salvadoran', 'Costa Rican'],
};
for (const [country, regions] of Object.entries(northAmericanCountries)) {
  add(country, 'country', 'North America', { continent: 'North America', popularGroup: 'americas' });
  group(country, 'region', regions, { country, continent: 'North America', popularGroup: 'americas' });
}

const southAmericanCountries = {
  Brazil: ['Bahian', 'Minas Gerais'], Argentina: ['Argentinian'], Peru: ['Peruvian', 'Nikkei'], Colombia: ['Colombian'],
  Chile: ['Chilean'], Venezuela: ['Venezuelan'], Ecuador: ['Ecuadorian'], Bolivia: ['Bolivian'], Uruguay: ['Uruguayan'],
};
for (const [country, regions] of Object.entries(southAmericanCountries)) {
  add(country, 'country', 'South America', { continent: 'South America', popularGroup: 'americas' });
  group(country, 'region', regions, { country, continent: 'South America', popularGroup: 'americas' });
}

const oceaniaCountries = {
  Australia: ['Australian'], 'New Zealand': ['New Zealand / Māori'], Polynesia: ['Hawaiian', 'Samoan', 'Fijian'],
  'Pacific Islands': ['Pacific Islander'],
};
for (const [country, regions] of Object.entries(oceaniaCountries)) {
  add(country, 'country', 'Oceania', { continent: 'Oceania', popularGroup: 'oceania' });
  group(country, 'region', regions, { country, continent: 'Oceania', popularGroup: 'oceania' });
}

for (const tag of ['Vegan / Plant-based', 'Fusion', 'Street food', 'Festival / Religious foods', 'Everyday favourites']) {
  add(tag, 'tag', null, { popularGroup: 'global' });
}

const indianDefinitions = definitions.filter((definition) => (
  definition.name === 'World'
  || definition.name === 'Asia'
  || definition.country === 'India'
));
definitions.splice(0, definitions.length, ...indianDefinitions);

const ingredientGroups = {
  india: ['rice', 'lentils', 'tomato', 'onion', 'garlic', 'ginger', 'turmeric', 'cumin', 'chili', 'coconut', 'tamarind', 'mustard seed'],
  asia: ['rice', 'soy sauce', 'ginger', 'garlic', 'spring onion', 'sesame oil', 'chili', 'coconut', 'lime'],
  mena: ['olive oil', 'chickpeas', 'lemon', 'parsley', 'cumin', 'tomato', 'onion', 'garlic'],
  europe: ['olive oil', 'potato', 'tomato', 'onion', 'garlic', 'butter', 'lemon'],
  africa: ['beans', 'millet', 'tomato', 'onion', 'chili', 'peanut', 'rice'],
  americas: ['corn', 'beans', 'chili', 'tomato', 'lime', 'potato', 'onion'],
  oceania: ['coconut', 'taro', 'lime', 'sweet potato', 'ginger'],
  global: ['rice', 'tomato', 'onion', 'garlic', 'potato'],
};

function describeCuisine(item) {
  if (item.level === 'world') return 'A broad index of culinary traditions and regional foodways. The collection is curated and not exhaustive.';
  if (item.level === 'continent') return `A diverse collection of cuisines associated with ${item.name} and its many regions. This index is curated and not exhaustive.`;
  if (item.level === 'country') return `A collection of distinct local cuisines and foodways associated with ${item.name}. This index is curated and not exhaustive.`;
  if (item.level === 'tag') return `A cross-cutting recipe category that can appear across many places and culinary traditions. It is not a geographic region.`;
  return `A curated entry for ${item.name}, reflecting local food traditions and regional variation. This index is not exhaustive.`;
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const allNames = [...new Set(Object.values(ingredientGroups).flat())];
  await Promise.all(allNames.map((name) => Ingredient.updateOne(
    { slug: slugify(name) },
    { $setOnInsert: { name, slug: slugify(name), category: 'pantry', baseUnit: '', displayUnits: [], status: 'active', isDemo: false } },
    { upsert: true },
  )));
  const ingredientDocs = await Ingredient.find({ slug: { $in: allNames.map(slugify) } }).select('_id slug').lean();
  const ingredientIds = new Map(ingredientDocs.map((ingredient) => [ingredient.slug, ingredient._id]));
  const idsByGroup = new Map(Object.entries(ingredientGroups).map(([key, names]) => [key, names.map((name) => ingredientIds.get(slugify(name))).filter(Boolean)]));
  const idsByName = new Map();

  for (const definition of definitions) {
    const slug = slugify(definition.name);
    const parentCuisine = definition.parent ? idsByName.get(slugify(definition.parent)) || null : null;
    const doc = await Cuisine.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: definition.name,
          slug,
          level: definition.level,
          parentCuisine,
          country: definition.country || '',
          continent: definition.continent || '',
          description: describeCuisine(definition),
          popularIngredients: idsByGroup.get(definition.popularGroup || 'global') || [],
          popularTechniques: [],
          popularDishes: [],
          typicalMealStructure: '',
          spiceLevelTypical: 'not_specified',
          dietNotes: '',
          status: 'active',
          isDemo: false,
        },
        $setOnInsert: { image: '' },
      },
      { upsert: true, new: true },
    ).select('_id').lean();
    idsByName.set(slug, doc._id);
  }

  console.log(`Seeded ${definitions.length} cuisine nodes across ${new Set(definitions.map(({ level }) => level)).size} levels.`);
} finally {
  await mongoose.disconnect();
}
