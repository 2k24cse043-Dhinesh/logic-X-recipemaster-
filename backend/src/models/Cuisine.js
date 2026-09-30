import mongoose from 'mongoose';

const cuisineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  level: { type: String, enum: ['world', 'continent', 'country', 'region', 'subregion', 'tag'], required: true },
  parentCuisine: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuisine', default: null },
  country: { type: String, trim: true, default: '' },
  continent: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, maxlength: 600, default: '' },
  popularIngredients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  popularTechniques: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CookingTechnique' }],
  popularDishes: [{ type: String, trim: true }],
  typicalMealStructure: { type: String, trim: true, default: '' },
  spiceLevelTypical: { type: String, enum: ['mild', 'medium', 'hot', 'varies', 'not_specified'], default: 'not_specified' },
  dietNotes: { type: String, trim: true, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });

cuisineSchema.index({ parentCuisine: 1, name: 1 });

const Cuisine = mongoose.model('Cuisine', cuisineSchema);

export default Cuisine;