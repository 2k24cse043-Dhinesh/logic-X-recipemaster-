import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

const recipes = [
  {
    title: 'Sambar', slug: 'sambar-india-tamil-nadu', cuisine: { primary: 'India', regional: 'Tamil Nadu' }, dishCategory: 'main',
    description: 'A tangy South Indian lentil and vegetable stew finished with tamarind and spices.',
    servings: 5, prepTimeMinutes: 15, cookTimeMinutes: 35, totalTimeMinutes: 50, difficulty: 'medium',
    ingredients: [
      { name: 'Toor dal', quantity: 1, unit: 'cup', preparation: 'rinsed' }, { name: 'Carrot', quantity: 1, unit: 'medium', preparation: 'chopped' },
      { name: 'Drumstick', quantity: 1, unit: 'piece', preparation: 'cut into pieces', optional: true }, { name: 'Tomato', quantity: 1, unit: 'medium', preparation: 'chopped' },
      { name: 'Tamarind', quantity: 1, unit: 'tbsp', preparation: 'soaked in warm water' }, { name: 'Sambar powder', quantity: 2, unit: 'tbsp' },
      { name: 'Turmeric', quantity: 0.25, unit: 'tsp' }, { name: 'Mustard seeds', quantity: 1, unit: 'tsp' },
      { name: 'Curry leaves', quantity: 8, unit: 'leaves' }, { name: 'Oil', quantity: 1, unit: 'tbsp' }, { name: 'Salt', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Prepare the dal', instruction: 'Pressure-cook the rinsed toor dal with turmeric and 2 1/2 cups water until soft, then whisk until smooth.', heatLevel: 'high', durationMinutes: 15, visualCue: 'The dal is soft and creamy.', safetyNote: 'Allow pressure to release naturally before opening the cooker.' },
      { stepNumber: 2, phase: 'cook', title: 'Cook the vegetables', instruction: 'Simmer carrot, drumstick, tomato, salt, and water until the vegetables are tender.', heatLevel: 'medium', durationMinutes: 12, visualCue: 'Vegetables are fork-tender.' },
      { stepNumber: 3, phase: 'cook', title: 'Build the sambar', instruction: 'Stir in tamarind water, sambar powder, and cooked dal. Simmer until the flavors combine.', heatLevel: 'medium', durationMinutes: 8, visualCue: 'The stew is aromatic and lightly thickened.' },
      { stepNumber: 4, phase: 'finish', title: 'Temper and serve', instruction: 'Heat oil, crackle mustard seeds, fry curry leaves, and pour the tempering over the sambar.', heatLevel: 'medium-high', durationMinutes: 2, visualCue: 'Mustard seeds pop and the tempering smells fragrant.' },
    ],
    tags: ['South Indian', 'lentils', 'vegetarian'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Medu Vada', slug: 'medu-vada-india-tamil-nadu', cuisine: { primary: 'India', regional: 'Tamil Nadu' }, dishCategory: 'starter',
    description: 'Crisp, fluffy South Indian savory fritters made from urad dal.', servings: 4, prepTimeMinutes: 30, cookTimeMinutes: 20, totalTimeMinutes: 50, difficulty: 'medium',
    ingredients: [
      { name: 'Urad dal', quantity: 1, unit: 'cup', preparation: 'soaked 4 hours' }, { name: 'Green chili', quantity: 1, unit: '', preparation: 'chopped' },
      { name: 'Ginger', quantity: 1, unit: 'tsp', preparation: 'grated' }, { name: 'Curry leaves', quantity: 8, unit: 'leaves', preparation: 'chopped' },
      { name: 'Black pepper', quantity: 0.5, unit: 'tsp', preparation: 'crushed' }, { name: 'Salt', quantity: 1, unit: 'tsp' }, { name: 'Oil', quantity: 500, unit: 'ml', preparation: 'for frying' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Grind the batter', instruction: 'Drain the soaked urad dal and grind it with very little water until light and fluffy.', heatLevel: 'off', durationMinutes: 12, visualCue: 'The batter is smooth and holds soft peaks.' },
      { stepNumber: 2, phase: 'prep', title: 'Season', instruction: 'Fold in chili, ginger, curry leaves, pepper, and salt without deflating the batter.', heatLevel: 'off', durationMinutes: 3 },
      { stepNumber: 3, phase: 'cook', title: 'Shape and fry', instruction: 'Wet your hand, shape a small ring of batter, and carefully slide it into hot oil.', heatLevel: 'medium-high', durationMinutes: 4, visualCue: 'The vada turns golden and floats.' , safetyNote: 'Keep hands clear of hot oil and fry in small batches.'},
      { stepNumber: 4, phase: 'finish', title: 'Drain', instruction: 'Fry until crisp outside and cooked through, then drain on a rack or paper towel.', heatLevel: 'medium', durationMinutes: 2, visualCue: 'The center is fluffy and the crust is crisp.' },
    ],
    tags: ['South Indian', 'fritter', 'vegetarian'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Samosa', slug: 'samosa-india-punjab', cuisine: { primary: 'India', regional: 'Punjab' }, dishCategory: 'starter',
    description: 'Golden pastry pockets filled with spiced potato and peas.', servings: 4, prepTimeMinutes: 35, cookTimeMinutes: 25, totalTimeMinutes: 60, difficulty: 'medium',
    ingredients: [
      { name: 'All-purpose flour', quantity: 2, unit: 'cups' }, { name: 'Potato', quantity: 4, unit: 'medium', preparation: 'boiled and diced' },
      { name: 'Green peas', quantity: 0.5, unit: 'cup' }, { name: 'Cumin seeds', quantity: 1, unit: 'tsp' }, { name: 'Garam masala', quantity: 1, unit: 'tsp' },
      { name: 'Ground coriander', quantity: 1, unit: 'tsp' }, { name: 'Green chili', quantity: 1, unit: '', preparation: 'chopped' },
      { name: 'Salt', quantity: 1, unit: 'tsp' }, { name: 'Oil', quantity: 500, unit: 'ml', preparation: 'for frying' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Make the dough', instruction: 'Mix flour, salt, and 4 tablespoons oil. Add water gradually and knead into a firm dough. Rest covered.', heatLevel: 'off', durationMinutes: 20, visualCue: 'The dough is firm and smooth.' },
      { stepNumber: 2, phase: 'cook', title: 'Prepare the filling', instruction: 'Temper cumin in a little oil, then add chili, peas, potato, coriander, garam masala, and salt. Cool the filling.', heatLevel: 'medium', durationMinutes: 8, visualCue: 'The filling is dry and fragrant.' },
      { stepNumber: 3, phase: 'prep', title: 'Shape', instruction: 'Roll dough portions into ovals, cut in half, form cones, fill with potato mixture, and seal the edges with water.', heatLevel: 'off', durationMinutes: 15 },
      { stepNumber: 4, phase: 'cook', title: 'Fry slowly', instruction: 'Fry samosas over medium-low heat until crisp and deeply golden.', heatLevel: 'medium-low', durationMinutes: 12, visualCue: 'The pastry is blistered and golden.', safetyNote: 'Lower the samosas gently into the oil.' },
    ],
    tags: ['Punjabi', 'street food', 'vegetarian'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Gulab Jamun', slug: 'gulab-jamun-india-punjab', cuisine: { primary: 'India', regional: 'Punjab' }, dishCategory: 'dessert',
    description: 'Soft milk-solid dumplings soaked in warm cardamom sugar syrup.', servings: 6, prepTimeMinutes: 25, cookTimeMinutes: 20, totalTimeMinutes: 45, difficulty: 'medium',
    ingredients: [
      { name: 'Milk powder', quantity: 1, unit: 'cup' }, { name: 'All-purpose flour', quantity: 0.25, unit: 'cup' }, { name: 'Baking soda', quantity: 0.25, unit: 'tsp' },
      { name: 'Yogurt', quantity: 3, unit: 'tbsp' }, { name: 'Ghee', quantity: 1, unit: 'tbsp' }, { name: 'Sugar', quantity: 2, unit: 'cups' },
      { name: 'Cardamom', quantity: 4, unit: 'pods', preparation: 'crushed' }, { name: 'Rose water', quantity: 1, unit: 'tsp', optional: true }, { name: 'Oil', quantity: 500, unit: 'ml', preparation: 'for frying' },
    ],
    steps: [
      { stepNumber: 1, phase: 'cook', title: 'Make the syrup', instruction: 'Boil sugar and 2 cups water with cardamom until slightly sticky. Stir in rose water and keep warm.', heatLevel: 'medium', durationMinutes: 8, visualCue: 'The syrup lightly coats a spoon.' },
      { stepNumber: 2, phase: 'prep', title: 'Form the dough', instruction: 'Mix milk powder, flour, baking soda, and ghee. Add yogurt gradually to make a soft dough. Rest briefly.', heatLevel: 'off', durationMinutes: 8, visualCue: 'The dough is soft without cracks.' },
      { stepNumber: 3, phase: 'prep', title: 'Shape', instruction: 'Roll small smooth balls with no visible cracks so they do not split while frying.', heatLevel: 'off', durationMinutes: 8 },
      { stepNumber: 4, phase: 'cook', title: 'Fry and soak', instruction: 'Fry over low-medium heat until evenly golden, then transfer directly into warm syrup.', heatLevel: 'medium-low', durationMinutes: 10, visualCue: 'The balls are golden and expand in the syrup.', safetyNote: 'Avoid overheating the oil because the outside will brown before the center cooks.' },
    ],
    tags: ['Punjabi', 'dessert', 'festival'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Kerala Chicken Curry', slug: 'kerala-chicken-curry-india-kerala', cuisine: { primary: 'India', regional: 'Kerala' }, dishCategory: 'main',
    description: 'A fragrant Kerala-style chicken curry with coconut, curry leaves, and warm spices.', servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 35, totalTimeMinutes: 55, difficulty: 'medium',
    ingredients: [
      { name: 'Chicken', quantity: 750, unit: 'g', preparation: 'bone-in pieces' }, { name: 'Onion', quantity: 2, unit: 'medium', preparation: 'sliced' },
      { name: 'Tomato', quantity: 2, unit: 'medium', preparation: 'chopped' }, { name: 'Ginger', quantity: 1, unit: 'tbsp', preparation: 'minced' },
      { name: 'Garlic', quantity: 6, unit: 'cloves', preparation: 'minced' }, { name: 'Coconut milk', quantity: 1, unit: 'cup' },
      { name: 'Curry leaves', quantity: 12, unit: 'leaves' }, { name: 'Coriander powder', quantity: 2, unit: 'tsp' }, { name: 'Turmeric', quantity: 0.5, unit: 'tsp' },
      { name: 'Black pepper', quantity: 1, unit: 'tsp' }, { name: 'Coconut oil', quantity: 2, unit: 'tbsp' }, { name: 'Salt', quantity: 1.5, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Season the chicken', instruction: 'Toss chicken with turmeric, pepper, and half the salt while preparing the curry base.', heatLevel: 'off', durationMinutes: 10 },
      { stepNumber: 2, phase: 'cook', title: 'Build the masala', instruction: 'Heat coconut oil, fry curry leaves, then cook onion, ginger, and garlic until soft. Add tomato and coriander powder.', heatLevel: 'medium', durationMinutes: 12, visualCue: 'The masala is thick and oil begins to separate.' },
      { stepNumber: 3, phase: 'cook', title: 'Cook the chicken', instruction: 'Add chicken and stir until coated. Add water, cover, and simmer until the chicken reaches 74°C internally.', heatLevel: 'medium-low', durationMinutes: 20, visualCue: 'Chicken is tender and the sauce is rich.', safetyNote: 'Use a thermometer or check that chicken is fully cooked with no pink center.' },
      { stepNumber: 4, phase: 'finish', title: 'Add coconut milk', instruction: 'Lower the heat, stir in coconut milk, and warm gently without boiling hard.', heatLevel: 'low', durationMinutes: 3, visualCue: 'The curry is creamy and fragrant.' },
    ],
    tags: ['Kerala', 'curry', 'chicken'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
];

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  for (const recipe of recipes) {
    await Recipe.updateOne({ slug: recipe.slug }, { $set: recipe }, { upsert: true });
  }
  console.log(`Added or updated ${recipes.length} complete Indian recipes.`);
} finally {
  await mongoose.disconnect();
}
