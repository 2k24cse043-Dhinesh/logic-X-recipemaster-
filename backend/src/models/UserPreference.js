import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferredLanguage: { type: String, enum: ['en', 'ta', 'hi'], default: 'en' },
  dietaryPreferences: [{ type: String, trim: true }],
  allergies: [{ type: String, trim: true }],
  dislikedIngredients: [{ type: String, trim: true }],
  preferredCuisines: [{ type: String, trim: true }],
  householdServings: { type: Number, min: 1, max: 24, default: 2 },
}, { timestamps: true });

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

export default UserPreference;