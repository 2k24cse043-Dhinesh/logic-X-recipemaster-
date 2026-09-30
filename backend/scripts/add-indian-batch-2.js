import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

const recipes = [
  {
    title: 'Aloo Paratha', slug: 'aloo-paratha-india-punjab', cuisine: { primary: 'India', regional: 'Punjab' }, dishCategory: 'bread',
    description: 'Whole-wheat flatbread stuffed with warmly spiced mashed potato.', servings: 4, prepTimeMinutes: 30, cookTimeMinutes: 20, totalTimeMinutes: 50, difficulty: 'medium',
    ingredients: [
      { name: 'Whole-wheat flour', quantity: 2, unit: 'cups' }, { name: 'Potato', quantity: 4, unit: 'medium', preparation: 'boiled and mashed' },
      { name: 'Green chili', quantity: 1, unit: '', preparation: 'minced' }, { name: 'Coriander', quantity: 2, unit: 'tbsp', preparation: 'chopped' },
      { name: 'Cumin', quantity: 1, unit: 'tsp' }, { name: 'Garam masala', quantity: 0.5, unit: 'tsp' }, { name: 'Salt', quantity: 1, unit: 'tsp' }, { name: 'Ghee', quantity: 3, unit: 'tbsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Make the dough', instruction: 'Mix flour and salt. Add water gradually and knead into a soft dough. Cover and rest.', heatLevel: 'off', durationMinutes: 20, visualCue: 'Dough is soft and elastic.' },
      { stepNumber: 2, phase: 'prep', title: 'Season the potato', instruction: 'Mix mashed potato with chili, coriander, cumin, garam masala, and salt.', heatLevel: 'off', durationMinutes: 5, visualCue: 'Filling is dry enough to shape.' },
      { stepNumber: 3, phase: 'prep', title: 'Stuff and roll', instruction: 'Divide dough and filling into equal portions. Stuff each dough ball, seal it, and roll gently into a round.', heatLevel: 'off', durationMinutes: 15 },
      { stepNumber: 4, phase: 'cook', title: 'Cook the paratha', instruction: 'Cook on a hot griddle, brushing both sides with ghee, until golden spots appear and the bread is cooked through.', heatLevel: 'medium-high', durationMinutes: 5, visualCue: 'Golden patches form on both sides.' },
    ],
    tags: ['Punjabi', 'breakfast', 'flatbread'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Ambur Biryani', slug: 'ambur-biryani-india-tamil-nadu', cuisine: { primary: 'India', regional: 'Tamil Nadu' }, dishCategory: 'main',
    description: 'Tamil Nadu-style biryani with seeraga samba rice, meat, and a fragrant chili-tomato base.', servings: 5, prepTimeMinutes: 25, cookTimeMinutes: 45, totalTimeMinutes: 70, difficulty: 'advanced',
    ingredients: [
      { name: 'Chicken', quantity: 750, unit: 'g', preparation: 'bone-in pieces' }, { name: 'Seeraga samba rice', quantity: 3, unit: 'cups', preparation: 'washed' },
      { name: 'Onion', quantity: 3, unit: 'medium', preparation: 'sliced' }, { name: 'Tomato', quantity: 3, unit: 'medium', preparation: 'chopped' },
      { name: 'Garlic', quantity: 12, unit: 'cloves', preparation: 'ground' }, { name: 'Ginger', quantity: 2, unit: 'tbsp', preparation: 'ground' },
      { name: 'Dried red chili', quantity: 8, unit: '', preparation: 'soaked and ground' }, { name: 'Cinnamon', quantity: 2, unit: 'sticks' },
      { name: 'Clove', quantity: 5, unit: '' }, { name: 'Mint', quantity: 0.5, unit: 'cup' }, { name: 'Yogurt', quantity: 0.5, unit: 'cup' }, { name: 'Oil', quantity: 4, unit: 'tbsp' }, { name: 'Salt', quantity: 2, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Marinate', instruction: 'Mix chicken with yogurt, half the ginger-garlic, chili paste, and salt. Rest while preparing the pot.', heatLevel: 'off', durationMinutes: 20 },
      { stepNumber: 2, phase: 'cook', title: 'Cook the masala', instruction: 'Heat oil, fry whole spices and onion, then add remaining ginger-garlic, tomato, and mint. Cook until thick.', heatLevel: 'medium', durationMinutes: 15, visualCue: 'The masala is glossy and oil begins to separate.' },
      { stepNumber: 3, phase: 'cook', title: 'Cook the chicken', instruction: 'Add marinated chicken and cook until it is mostly tender and coated in the masala.', heatLevel: 'medium', durationMinutes: 15, visualCue: 'Chicken is opaque and the sauce is thick.' },
      { stepNumber: 4, phase: 'cook', title: 'Add rice and finish', instruction: 'Add washed rice and measured hot water. Cover and cook until rice is tender, then rest before fluffing.', heatLevel: 'low', durationMinutes: 20, visualCue: 'Rice is separate and fully tender.' },
    ],
    tags: ['Tamil Nadu', 'biryani', 'chicken'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Amritsari Fish', slug: 'amritsari-fish-india-punjab', cuisine: { primary: 'India', regional: 'Punjab' }, dishCategory: 'starter',
    description: 'Crisp gram-flour battered fish seasoned with ajwain and chili.', servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 15, totalTimeMinutes: 35, difficulty: 'easy',
    ingredients: [
      { name: 'Firm white fish', quantity: 600, unit: 'g', preparation: 'boneless pieces' }, { name: 'Besan', quantity: 1, unit: 'cup' },
      { name: 'Rice flour', quantity: 2, unit: 'tbsp' }, { name: 'Lemon juice', quantity: 2, unit: 'tbsp' }, { name: 'Ajwain', quantity: 1, unit: 'tsp' },
      { name: 'Chili powder', quantity: 1, unit: 'tsp' }, { name: 'Garam masala', quantity: 0.5, unit: 'tsp' }, { name: 'Salt', quantity: 1, unit: 'tsp' }, { name: 'Oil', quantity: 500, unit: 'ml', preparation: 'for frying' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Marinate the fish', instruction: 'Toss fish with lemon juice, salt, chili, ajwain, and garam masala. Rest briefly.', heatLevel: 'off', durationMinutes: 15, visualCue: 'Fish is evenly seasoned.' },
      { stepNumber: 2, phase: 'prep', title: 'Make the batter', instruction: 'Mix besan and rice flour with enough water to make a thick coating batter.', heatLevel: 'off', durationMinutes: 3, visualCue: 'Batter clings to the fish without running.' },
      { stepNumber: 3, phase: 'cook', title: 'Fry', instruction: 'Coat fish pieces and fry in hot oil until crisp and cooked through.', heatLevel: 'medium-high', durationMinutes: 8, visualCue: 'The crust is crisp and golden.', safetyNote: 'Check the fish is opaque and flakes easily.' },
      { stepNumber: 4, phase: 'finish', title: 'Serve', instruction: 'Drain well and serve immediately with lemon wedges and chutney.', heatLevel: 'off', durationMinutes: 2 },
    ],
    tags: ['Punjabi', 'fish', 'starter'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Appam', slug: 'appam-india-kerala', cuisine: { primary: 'India', regional: 'Kerala' }, dishCategory: 'bread',
    description: 'Lacy Kerala rice pancakes with crisp edges and a soft center.', servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 20, totalTimeMinutes: 35, difficulty: 'medium',
    ingredients: [
      { name: 'Raw rice', quantity: 2, unit: 'cups', preparation: 'soaked 4 hours' }, { name: 'Cooked rice', quantity: 0.5, unit: 'cup' },
      { name: 'Grated coconut', quantity: 0.5, unit: 'cup' }, { name: 'Sugar', quantity: 1, unit: 'tsp' }, { name: 'Instant yeast', quantity: 0.5, unit: 'tsp' }, { name: 'Salt', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Blend the batter', instruction: 'Blend soaked rice, cooked rice, and coconut with water until smooth and pourable.', heatLevel: 'off', durationMinutes: 10, visualCue: 'Batter is smooth with no gritty texture.' },
      { stepNumber: 2, phase: 'prep', title: 'Ferment', instruction: 'Stir in yeast, sugar, and salt. Cover and ferment until the batter is airy and slightly risen.', heatLevel: 'off', durationMinutes: 480, visualCue: 'Small bubbles appear on the surface.' },
      { stepNumber: 3, phase: 'cook', title: 'Swirl the pan', instruction: 'Pour batter into a hot appam pan, swirl to spread it thinly around the sides, and cover.', heatLevel: 'medium', durationMinutes: 3, visualCue: 'Edges become lacy and crisp.' },
      { stepNumber: 4, phase: 'finish', title: 'Serve', instruction: 'Cook until the center is soft and set, then lift out gently. Repeat with remaining batter.', heatLevel: 'medium-low', durationMinutes: 2, visualCue: 'Crisp rim surrounds a soft center.' },
    ],
    tags: ['Kerala', 'breakfast', 'rice bread'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Bisi Bele Bath', slug: 'bisi-bele-bath-india-karnataka', cuisine: { primary: 'India', regional: 'Karnataka' }, dishCategory: 'main',
    description: 'A warm Karnataka rice and lentil dish cooked with vegetables and spice powder.', servings: 5, prepTimeMinutes: 20, cookTimeMinutes: 35, totalTimeMinutes: 55, difficulty: 'medium',
    ingredients: [
      { name: 'Rice', quantity: 1, unit: 'cup' }, { name: 'Toor dal', quantity: 0.5, unit: 'cup' }, { name: 'Carrot', quantity: 1, unit: 'medium', preparation: 'diced' },
      { name: 'Green beans', quantity: 1, unit: 'cup', preparation: 'chopped' }, { name: 'Peas', quantity: 0.5, unit: 'cup' }, { name: 'Tamarind', quantity: 1, unit: 'tbsp' },
      { name: 'Bisi bele bath powder', quantity: 2, unit: 'tbsp' }, { name: 'Turmeric', quantity: 0.25, unit: 'tsp' }, { name: 'Ghee', quantity: 2, unit: 'tbsp' },
      { name: 'Mustard seeds', quantity: 1, unit: 'tsp' }, { name: 'Curry leaves', quantity: 8, unit: 'leaves' }, { name: 'Salt', quantity: 1.5, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'cook', title: 'Cook rice and dal', instruction: 'Cook rice and toor dal with turmeric and plenty of water until very soft.', heatLevel: 'medium', durationMinutes: 20, visualCue: 'Rice and dal are soft enough to mash together.' },
      { stepNumber: 2, phase: 'cook', title: 'Cook vegetables', instruction: 'Simmer carrots, beans, peas, tamarind, salt, and water until tender.', heatLevel: 'medium', durationMinutes: 10, visualCue: 'Vegetables are tender but still colorful.' },
      { stepNumber: 3, phase: 'cook', title: 'Combine', instruction: 'Stir in bisi bele bath powder and the cooked rice-dal mixture. Add water until loose and spoonable.', heatLevel: 'low', durationMinutes: 8, visualCue: 'The mixture becomes thick, glossy, and aromatic.' },
      { stepNumber: 4, phase: 'finish', title: 'Temper', instruction: 'Heat ghee, crackle mustard seeds, fry curry leaves, and pour over the dish before serving.', heatLevel: 'medium-high', durationMinutes: 3, visualCue: 'The ghee tempering is fragrant.' },
    ],
    tags: ['Karnataka', 'rice', 'lentils', 'vegetarian'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
];

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  for (const recipe of recipes) await Recipe.updateOne({ slug: recipe.slug }, { $set: recipe }, { upsert: true });
  console.log(`Added or updated ${recipes.length} complete Indian recipes.`);
} finally {
  await mongoose.disconnect();
}
