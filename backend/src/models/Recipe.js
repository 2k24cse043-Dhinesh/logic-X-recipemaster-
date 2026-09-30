import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, min: 0 },
  unit: { type: String, trim: true, default: '' },
  preparation: { type: String, trim: true, default: '' },
  optional: { type: Boolean, default: false },
  group: { type: String, trim: true, default: '' },
}, { _id: false });

const usedIngredientSchema = new mongoose.Schema({
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, min: 0 },
  unit: { type: String, trim: true, default: '' },
}, { _id: false });

const situationFixSchema = new mongoose.Schema({
  situation: { type: String, trim: true },
  fix: { type: String, trim: true },
}, { _id: false });

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  phase: { type: String, enum: ['prep', 'cook', 'finish', 'serve', null], default: null },
  title: { type: String, trim: true, maxlength: 120 },
  instruction: { type: String, required: true, trim: true },
  ingredientsUsed: { type: [usedIngredientSchema], default: [] },
  equipmentUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  techniqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'CookingTechnique' },
  heatLevel: { type: String, enum: ['low', 'medium-low', 'medium', 'medium-high', 'high', 'off', null], default: null },
  temperature: {
    value: { type: Number },
    unit: { type: String, enum: ['C', 'F'], default: undefined },
  },
  durationMinutes: { type: Number, min: 0 },
  timerEligible: { type: Boolean, default: false },
  visualCue: { type: String, trim: true },
  sensoryCue: { type: String, trim: true },
  donenessCue: { type: String, trim: true },
  tip: { type: String, trim: true },
  commonMistake: { type: String, trim: true },
  ifThisHappens: { type: [situationFixSchema], default: [] },
  safetyNote: { type: String, trim: true },
  canPauseHere: { type: Boolean, default: null },
}, { _id: false });

const miseEnPlaceSchema = new mongoose.Schema({
  task: { type: String, required: true, trim: true },
  ingredientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
  quantity: { type: Number, min: 0 },
  unit: { type: String, trim: true, default: '' },
  cutStyle: { type: String, trim: true },
  timeMinutes: { type: Number, min: 0 },
}, { _id: false });

const substitutionSchema = new mongoose.Schema({
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
  ingredientName: { type: String, trim: true },
  substitute: { type: String, trim: true },
  effect: { type: String, trim: true },
}, { _id: false });

const troubleshootingSchema = new mongoose.Schema({
  problem: { type: String, trim: true },
  cause: { type: String, trim: true },
  fix: { type: String, trim: true },
}, { _id: false });

const localizedIngredientSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  unit: { type: String, trim: true, default: '' },
  preparation: { type: String, trim: true, default: '' },
}, { _id: false });

const localizedStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true, trim: true },
}, { _id: false });

const localizedRecipeSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  cuisine: { type: String, trim: true },
  ingredients: [localizedIngredientSchema],
  steps: [localizedStepSchema],
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    creator: { type: String, default: '' },
    license: { type: String, default: '' },
    licenseUrl: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    provider: { type: String, default: '' },
    lookupStatus: { type: String, enum: ['', 'found', 'not_found'], default: '' },
    searchedAt: { type: Date },
  },
  cuisine: {
    primary: { type: String, trim: true, default: '' },
    regional: { type: String, trim: true, default: '' },
  },
  dishCategory: {
    type: String,
    enum: ['starter', 'main', 'side', 'dessert', 'snack', 'beverage', 'bread'],
    default: 'main',
  },
  catalogOnly: { type: Boolean, default: false },
  aiGenerated: { type: Boolean, default: false },
  mealTypes: [{ type: String, trim: true }],
  diet: [{ type: String, trim: true }],
  servings: { type: Number, min: 1, default: 2 },
  prepTimeMinutes: { type: Number, min: 0 },
  cookTimeMinutes: { type: Number, min: 0 },
  totalTimeMinutes: { type: Number, min: 0 },
  activeTimeMinutes: { type: Number, min: 0 },
  passiveTimeMinutes: { type: Number, min: 0 },
  skillNotes: { type: String, trim: true, maxlength: 1000 },
  mise_en_place: { type: [miseEnPlaceSchema], default: [] },
  equipmentNeeded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  servingSuggestions: [{ type: String, trim: true }],
  variations: [{ type: String, trim: true }],
  substitutions: { type: [substitutionSchema], default: [] },
  troubleshooting: { type: [troubleshootingSchema], default: [] },
  storage: {
    fridgeDays: { type: Number, min: 0 },
    freezerDays: { type: Number, min: 0 },
    reheating: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  makeAhead: {
    canMakeAhead: { type: Boolean },
    instructions: { type: String, trim: true },
  },
  foodSafetyNotes: [{ type: String, trim: true }],
  allergenWarnings: [{ type: String, trim: true }],
  yield: {
    servings: { type: Number, min: 1 },
    portionDescription: { type: String, trim: true },
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'advanced'], default: 'easy' },
  tags: [{ type: String, trim: true }],
  ingredients: [ingredientSchema],
  steps: [stepSchema],
  stepDataOrigin: { type: String, enum: ['authored', 'sourced'], default: undefined },
  stepSchemaVersion: { type: Number, default: 1 },
  completenessScore: { type: Number, min: 0, max: 100, default: 0 },
  reviewStatus: { type: String, enum: ['draft', 'reviewed', 'published'], default: 'draft' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewNotes: { type: String, select: false },
  translations: {
    ta: { type: localizedRecipeSchema, default: undefined },
    hi: { type: localizedRecipeSchema, default: undefined },
  },
  visibility: { type: String, enum: ['private', 'unlisted', 'public'], default: 'public' },
  shareToken: { type: String, sparse: true, unique: true },
  source: {
    type: String,
    enum: ['original', 'user', 'licensed', 'open_license', 'public_domain', 'partner', 'external_api'],
    default: 'original',
  },
  status: { type: String, enum: ['draft', 'pending', 'published', 'archived'], default: 'published' },
  isDemo: { type: Boolean, default: false },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  cookCount: { type: Number, default: 0 },
}, { timestamps: true });

recipeSchema.index({ status: 1, visibility: 1, createdAt: -1 });
recipeSchema.index({ saveCount: -1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;