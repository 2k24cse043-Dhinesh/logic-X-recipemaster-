import Recipe from '../models/Recipe.js';
import { getCuisineDescendantNames } from './cuisineService.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listRecipes({ search, cuisine, diet, dishCategory, maxTime, sort, page, limit }) {
  const filter = { status: 'published', visibility: 'public' };
  if (search) {
    const searchTerms = search
      .trim()
      .split(/\s+/)
      .map((term) => term.toLowerCase())
      .filter((term) => term && !['and', 'or', 'with', 'the', 'a', 'an'].includes(term));

    if (searchTerms.length > 0) {
      const termFilters = searchTerms.map((term) => ({
        $or: [
          { title: new RegExp(escapeRegex(term), 'i') },
          { description: new RegExp(escapeRegex(term), 'i') },
          { tags: new RegExp(escapeRegex(term), 'i') },
          { 'ingredients.name': new RegExp(escapeRegex(term), 'i') },
          { 'translations.ta.title': new RegExp(escapeRegex(term), 'i') },
          { 'translations.ta.description': new RegExp(escapeRegex(term), 'i') },
          { 'translations.ta.ingredients.name': new RegExp(escapeRegex(term), 'i') },
          { 'translations.hi.title': new RegExp(escapeRegex(term), 'i') },
          { 'translations.hi.description': new RegExp(escapeRegex(term), 'i') },
          { 'translations.hi.ingredients.name': new RegExp(escapeRegex(term), 'i') },
        ],
      }));

      filter.$and = [...(filter.$and || []), ...termFilters];
    }
  }
  if (cuisine) {
    const cuisineNames = await getCuisineDescendantNames(cuisine);
    if (!cuisineNames) filter._id = null;
    else filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { 'cuisine.primary': { $in: cuisineNames } },
          { 'cuisine.regional': { $in: cuisineNames } },
        ],
      },
    ];
  }
  if (diet) filter.diet = diet;
  if (dishCategory) filter.dishCategory = dishCategory;
  if (maxTime) filter.totalTimeMinutes = { $lte: maxTime };

  const sortOptions = {
    newest: { createdAt: -1 },
    shortest: { totalTimeMinutes: 1 },
    saved: { saveCount: -1 },
  };
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Recipe.find(filter)
      .select('title slug description coverImage cuisine dishCategory catalogOnly aiGenerated mealTypes diet servings prepTimeMinutes cookTimeMinutes totalTimeMinutes difficulty tags ingredients isDemo ratingAvg ratingCount saveCount translations')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Recipe.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getRecipeBySlug(slug) {
  return Recipe.findOne({ slug, status: 'published', visibility: 'public' })
    .select('-shareToken -__v')
    .lean();
}

export async function getRecipeByShareToken(shareToken) {
  return Recipe.findOne({ shareToken, status: 'published', visibility: 'unlisted' })
    .select('-shareToken -__v')
    .lean();
}