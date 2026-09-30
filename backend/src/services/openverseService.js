import Recipe from '../models/Recipe.js';

function serviceError(status, code, message) {
  return Object.assign(new Error(message), { status, code });
}

function normalizedWords(value) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !['and', 'with', 'the', 'of', 'a'].includes(word))
    .map((word) => word === 'idly' ? 'idli' : word);
}

function resultMatchesDish(result, title) {
  const titleWords = normalizedWords(title);
  const resultTitleWords = normalizedWords(result.title || '');
  const resultTagWords = (result.tags || []).flatMap((tag) => normalizedWords(tag.name || ''));
  if (resultTitleWords.some((word) => ['batter', 'ingredient', 'ingredients', 'menu', 'logo'].includes(word))) return false;
  if (titleWords.length === 1) {
    const term = titleWords[0];
    const exactTitle = resultTitleWords.length === 1 && resultTitleWords[0] === term;
    const clearlyLabeledPhoto = resultTitleWords[0] === term
      && resultTitleWords.length === 2
      && ['dish', 'food', 'meal', 'recipe'].includes(resultTitleWords[1]);
    const foodTagged = resultTagWords.includes(term)
      && resultTagWords.some((word) => ['food', 'dish', 'cuisine', 'meal'].includes(word));
    return exactTitle || clearlyLabeledPhoto || foodTagged;
  }
  return titleWords.every((word) => resultTitleWords.includes(word) || resultTagWords.includes(word));
}

function imageFromResult(result, recipe) {
  if (!result?.url || !result.license_url || !resultMatchesDish(result, recipe.title)) return null;
  return {
    url: result.thumbnail || result.url,
    publicId: result.id || '',
    alt: result.title || `${recipe.title} dish photo`,
    creator: result.creator || '',
    license: result.license || '',
    licenseUrl: result.license_url,
    sourceUrl: result.foreign_landing_url || result.detail_url || '',
    provider: result.provider || '',
  };
}

export async function getOpenLicenseRecipePhoto(slug) {
  const recipe = await Recipe.findOne({ slug, status: 'published', visibility: 'public' })
    .select('title cuisine coverImage catalogOnly')
    .lean();
  if (!recipe) return null;
  const lookupIsFresh = recipe.coverImage?.searchedAt
    && Date.now() - new Date(recipe.coverImage.searchedAt).getTime() < 30 * 24 * 60 * 60 * 1000;
  if (recipe.coverImage?.lookupStatus === 'not_found' && lookupIsFresh) return null;
  const isOpenversePhoto = Boolean(recipe.coverImage?.sourceUrl && recipe.coverImage?.licenseUrl);
  if (recipe.coverImage?.url && !isOpenversePhoto) return recipe.coverImage;
  if (recipe.coverImage?.url && resultMatchesDish({ title: recipe.coverImage.alt }, recipe.title)) return recipe.coverImage;
  if (recipe.coverImage?.url && isOpenversePhoto) {
    await Recipe.updateOne(
      { _id: recipe._id, 'coverImage.url': recipe.coverImage.url },
      { $set: { 'coverImage.url': '', 'coverImage.publicId': '', 'coverImage.alt': '', 'coverImage.creator': '', 'coverImage.license': '', 'coverImage.licenseUrl': '', 'coverImage.sourceUrl': '', 'coverImage.provider': '', 'coverImage.lookupStatus': '', 'coverImage.searchedAt': new Date() } },
    );
  }

  const url = new URL('https://api.openverse.org/v1/images/');
  url.searchParams.set('q', recipe.title);
  url.searchParams.set('category', 'photograph');
  url.searchParams.set('license_type', 'commercial');
  url.searchParams.set('page_size', '10');
  url.searchParams.set('mature', 'false');

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw serviceError(503, 'IMAGE_SEARCH_UNAVAILABLE', 'Open-license image search is unavailable right now.');
  }
  if (!response.ok) {
    throw serviceError(response.status === 429 ? 503 : 502, 'IMAGE_SEARCH_FAILED', 'Open-license image search could not complete.');
  }

  const payload = await response.json();
  const image = (payload.results || []).map((result) => imageFromResult(result, recipe)).find(Boolean);
  if (!image) {
    await Recipe.updateOne(
      { _id: recipe._id, $or: [{ 'coverImage.url': '' }, { 'coverImage.url': { $exists: false } }] },
      { $set: { 'coverImage.lookupStatus': 'not_found', 'coverImage.searchedAt': new Date() } },
    );
    return null;
  }
  image.lookupStatus = 'found';
  image.searchedAt = new Date();

  await Recipe.updateOne(
    { _id: recipe._id, $or: [{ 'coverImage.url': '' }, { 'coverImage.url': { $exists: false } }, { 'coverImage.sourceUrl': { $ne: '' } }] },
    { $set: { coverImage: image } },
  );
  return image;
}
