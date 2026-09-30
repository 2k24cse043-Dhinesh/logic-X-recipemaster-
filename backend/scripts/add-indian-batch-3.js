import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

const recipes = [
  {
    title: 'Chingri Malai Curry', slug: 'chingri-malai-curry-india-west-bengal', cuisine: { primary: 'India', regional: 'West Bengal' }, dishCategory: 'main',
    description: 'Bengali prawns gently simmered in a fragrant coconut milk sauce.', servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 25, totalTimeMinutes: 40, difficulty: 'medium',
    ingredients: [
      { name: 'Prawns', quantity: 500, unit: 'g', preparation: 'cleaned' }, { name: 'Coconut milk', quantity: 1.5, unit: 'cups' }, { name: 'Onion', quantity: 1, unit: 'medium', preparation: 'pureed' },
      { name: 'Ginger', quantity: 1, unit: 'tbsp', preparation: 'paste' }, { name: 'Garlic', quantity: 1, unit: 'tbsp', preparation: 'paste' }, { name: 'Turmeric', quantity: 0.5, unit: 'tsp' },
      { name: 'Kashmiri chili powder', quantity: 1, unit: 'tsp' }, { name: 'Green chili', quantity: 2, unit: '', slit: true }, { name: 'Mustard oil', quantity: 3, unit: 'tbsp' }, { name: 'Salt', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Season prawns', instruction: 'Toss prawns with turmeric and salt. Rest briefly while preparing the sauce.', heatLevel: 'off', durationMinutes: 10 },
      { stepNumber: 2, phase: 'cook', title: 'Sear prawns', instruction: 'Heat mustard oil and sear prawns briefly on both sides. Remove before they overcook.', heatLevel: 'medium-high', durationMinutes: 4, visualCue: 'Prawns turn pink but remain tender.' },
      { stepNumber: 3, phase: 'cook', title: 'Cook the sauce', instruction: 'Cook onion, ginger, garlic, chili powder, and turmeric until the masala is glossy.', heatLevel: 'medium', durationMinutes: 10, visualCue: 'Raw spice smell disappears.' },
      { stepNumber: 4, phase: 'finish', title: 'Simmer gently', instruction: 'Add coconut milk and green chili. Return prawns and simmer gently until just cooked.', heatLevel: 'low', durationMinutes: 6, visualCue: 'Sauce is creamy and prawns are opaque.', safetyNote: 'Prawns should be fully opaque and firm, not translucent.' },
    ],
    tags: ['Bengali', 'prawns', 'coconut'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Dal Baati Churma', slug: 'dal-baati-churma-india-rajasthan', cuisine: { primary: 'India', regional: 'Rajasthan' }, dishCategory: 'main',
    description: 'Rajasthani baked wheat baati served with spiced lentils and sweet churma.', servings: 4, prepTimeMinutes: 30, cookTimeMinutes: 45, totalTimeMinutes: 75, difficulty: 'advanced',
    ingredients: [
      { name: 'Whole-wheat flour', quantity: 2, unit: 'cups' }, { name: 'Semolina', quantity: 0.25, unit: 'cup' }, { name: 'Ghee', quantity: 5, unit: 'tbsp' },
      { name: 'Toor dal', quantity: 0.5, unit: 'cup' }, { name: 'Moong dal', quantity: 0.25, unit: 'cup' }, { name: 'Masoor dal', quantity: 0.25, unit: 'cup' },
      { name: 'Turmeric', quantity: 0.5, unit: 'tsp' }, { name: 'Cumin', quantity: 1, unit: 'tsp' }, { name: 'Sugar', quantity: 2, unit: 'tbsp' }, { name: 'Salt', quantity: 2, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Make baati dough', instruction: 'Mix flour, semolina, salt, and 3 tablespoons ghee. Add water to form a firm dough and rest it.', heatLevel: 'off', durationMinutes: 20, visualCue: 'Firm dough holds its shape.' },
      { stepNumber: 2, phase: 'cook', title: 'Bake baati', instruction: 'Shape balls, press a small dent in each, and bake until deeply golden and cooked through.', heatLevel: 'medium', durationMinutes: 30, visualCue: 'Baati is browned and sounds hollow when tapped.' },
      { stepNumber: 3, phase: 'cook', title: 'Cook dal', instruction: 'Cook the mixed dals with turmeric and salt until soft. Temper cumin in ghee and stir it through.', heatLevel: 'medium', durationMinutes: 25, visualCue: 'Dal is creamy but still spoonable.' },
      { stepNumber: 4, phase: 'finish', title: 'Make churma and serve', instruction: 'Crush one baati, mix with ghee and sugar, then serve all three components with extra ghee.', heatLevel: 'off', durationMinutes: 8, visualCue: 'Churma is crumbly and fragrant.' },
    ],
    tags: ['Rajasthani', 'lentils', 'festive'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Dalma', slug: 'dalma-india-odisha', cuisine: { primary: 'India', regional: 'Odisha' }, dishCategory: 'main',
    description: 'Odisha-style lentils cooked with vegetables and roasted spices.', servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 30, totalTimeMinutes: 45, difficulty: 'easy',
    ingredients: [
      { name: 'Toor dal', quantity: 1, unit: 'cup' }, { name: 'Raw papaya', quantity: 1, unit: 'cup', preparation: 'cubed' }, { name: 'Pumpkin', quantity: 1, unit: 'cup', preparation: 'cubed' },
      { name: 'Potato', quantity: 1, unit: 'medium', preparation: 'cubed' }, { name: 'Tomato', quantity: 1, unit: 'medium', preparation: 'chopped' }, { name: 'Turmeric', quantity: 0.5, unit: 'tsp' },
      { name: 'Cumin seeds', quantity: 1, unit: 'tsp' }, { name: 'Dried red chili', quantity: 2, unit: '' }, { name: 'Ghee', quantity: 1, unit: 'tbsp' }, { name: 'Salt', quantity: 1.5, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'cook', title: 'Cook dal and vegetables', instruction: 'Cook dal, vegetables, tomato, turmeric, salt, and water until the dal is soft and vegetables are tender.', heatLevel: 'medium', durationMinutes: 25, visualCue: 'Vegetables are tender and dal is thick.' },
      { stepNumber: 2, phase: 'finish', title: 'Temper spices', instruction: 'Heat ghee, fry cumin and dried chili until fragrant, then pour over the dal.', heatLevel: 'medium-high', durationMinutes: 3, visualCue: 'Cumin sizzles and smells nutty.' },
      { stepNumber: 3, phase: 'serve', title: 'Adjust and serve', instruction: 'Stir, adjust salt and water, and serve hot with rice.', heatLevel: 'low', durationMinutes: 2 },
    ],
    tags: ['Odisha', 'vegetarian', 'lentils'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Dindigul Biryani', slug: 'dindigul-biryani-india-tamil-nadu', cuisine: { primary: 'India', regional: 'Tamil Nadu' }, dishCategory: 'main',
    description: 'Tangy Tamil Nadu biryani made with seeraga samba rice and tender meat.', servings: 5, prepTimeMinutes: 25, cookTimeMinutes: 50, totalTimeMinutes: 75, difficulty: 'advanced',
    ingredients: [
      { name: 'Mutton', quantity: 750, unit: 'g', preparation: 'pieces' }, { name: 'Seeraga samba rice', quantity: 3, unit: 'cups', preparation: 'washed' }, { name: 'Onion', quantity: 3, unit: 'medium', preparation: 'sliced' },
      { name: 'Tomato', quantity: 3, unit: 'medium', preparation: 'chopped' }, { name: 'Yogurt', quantity: 0.5, unit: 'cup' }, { name: 'Lemon juice', quantity: 2, unit: 'tbsp' },
      { name: 'Ginger garlic paste', quantity: 2, unit: 'tbsp' }, { name: 'Green chili', quantity: 4, unit: '', slit: true }, { name: 'Mint', quantity: 0.5, unit: 'cup' }, { name: 'Coriander', quantity: 0.5, unit: 'cup' },
      { name: 'Cinnamon', quantity: 2, unit: 'sticks' }, { name: 'Clove', quantity: 5, unit: '' }, { name: 'Oil', quantity: 4, unit: 'tbsp' }, { name: 'Salt', quantity: 2, unit: 'tsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'prep', title: 'Marinate meat', instruction: 'Mix mutton with yogurt, lemon juice, salt, and half the ginger garlic paste. Rest.', heatLevel: 'off', durationMinutes: 30 },
      { stepNumber: 2, phase: 'cook', title: 'Build the base', instruction: 'Fry whole spices, onion, remaining ginger garlic, tomato, green chili, mint, and coriander until soft.', heatLevel: 'medium', durationMinutes: 15, visualCue: 'The masala is thick and fragrant.' },
      { stepNumber: 3, phase: 'cook', title: 'Tenderize meat', instruction: 'Add marinated mutton and water, cover, and cook until tender.', heatLevel: 'medium-low', durationMinutes: 30, visualCue: 'Mutton is tender and sauce coats the pieces.', safetyNote: 'Mutton must be fully tender before rice is added.' },
      { stepNumber: 4, phase: 'cook', title: 'Cook rice', instruction: 'Add rice and measured water. Cover and cook until the grains are tender. Rest before serving.', heatLevel: 'low', durationMinutes: 20, visualCue: 'Rice is fluffy and separate.' },
    ],
    tags: ['Tamil Nadu', 'biryani', 'mutton'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
  {
    title: 'Double Ka Meetha', slug: 'double-ka-meetha-india-telangana', cuisine: { primary: 'India', regional: 'Telangana' }, dishCategory: 'dessert',
    description: 'Hyderabadi bread pudding made with fried bread, sweet milk, and nuts.', servings: 6, prepTimeMinutes: 15, cookTimeMinutes: 30, totalTimeMinutes: 45, difficulty: 'easy',
    ingredients: [
      { name: 'White bread', quantity: 8, unit: 'slices', preparation: 'quartered' }, { name: 'Milk', quantity: 4, unit: 'cups' }, { name: 'Sugar', quantity: 0.75, unit: 'cup' },
      { name: 'Cardamom', quantity: 4, unit: 'pods', preparation: 'crushed' }, { name: 'Saffron', quantity: 1, unit: 'pinch' }, { name: 'Ghee', quantity: 4, unit: 'tbsp' },
      { name: 'Cashews', quantity: 2, unit: 'tbsp' }, { name: 'Almonds', quantity: 2, unit: 'tbsp' }, { name: 'Raisins', quantity: 2, unit: 'tbsp' },
    ],
    steps: [
      { stepNumber: 1, phase: 'cook', title: 'Reduce the milk', instruction: 'Simmer milk with sugar, cardamom, and saffron until slightly reduced and creamy.', heatLevel: 'low', durationMinutes: 20, visualCue: 'Milk lightly coats the spoon.' },
      { stepNumber: 2, phase: 'cook', title: 'Toast bread', instruction: 'Fry bread pieces in ghee until crisp and golden on both sides.', heatLevel: 'medium', durationMinutes: 8, visualCue: 'Bread is crisp and evenly golden.' },
      { stepNumber: 3, phase: 'finish', title: 'Assemble', instruction: 'Arrange bread in a dish, pour over warm sweet milk, and let it absorb for several minutes.', heatLevel: 'off', durationMinutes: 5, visualCue: 'Bread softens while edges stay lightly crisp.' },
      { stepNumber: 4, phase: 'finish', title: 'Garnish', instruction: 'Toast nuts and raisins in a little ghee and scatter them over the dessert before serving.', heatLevel: 'medium', durationMinutes: 3, visualCue: 'Nuts are golden and fragrant.' },
    ],
    tags: ['Telangana', 'Hyderabadi', 'dessert'], catalogOnly: false, aiGenerated: false, reviewStatus: 'reviewed', status: 'published', visibility: 'public', source: 'original', isDemo: false,
  },
];

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  for (const recipe of recipes) await Recipe.updateOne({ slug: recipe.slug }, { $set: recipe }, { upsert: true });
  console.log(`Added or updated ${recipes.length} complete Indian recipes.`);
} finally {
  await mongoose.disconnect();
}
