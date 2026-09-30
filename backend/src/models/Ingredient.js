import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  aliases: [{ type: String, trim: true }],
  category: { type: String, trim: true, default: 'other' },
  baseUnit: { type: String, trim: true, default: '' },
  displayUnits: [{ type: String, trim: true }],
  shelfLifeDays: { type: Number, min: 0 },
  allergens: [{ type: String, trim: true }],
  nutritionPer100g: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbohydrates: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
  },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });

ingredientSchema.index({ name: 1 });
ingredientSchema.index({ aliases: 1 });

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export default Ingredient;