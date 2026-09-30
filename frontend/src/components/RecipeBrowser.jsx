import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchCuisineTree, fetchRecipes, recognizePantryImage } from '../services/api.js';
import RecipeCard from './RecipeCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const initialFilters = { search: '', diet: '', dishCategory: '', cuisine: '', maxTime: '', sort: 'newest' };
const pantryStopWords = new Set(['a', 'an', 'and', 'or', 'some', 'the', 'with']);
const ingredientAliases = { tomatoes: 'tomato', onions: 'onion', potatoes: 'potato', chilies: 'chili', chillies: 'chili', oils: 'oil' };

function normalizeIngredient(value) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => ingredientAliases[word] || (word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word))
    .join(' ');
}

function parsePantryTerms(value) {
  return [...new Set(value
    .split(/[,;\n]+|\band\b|\s+/i)
    .map((term) => normalizeIngredient(term))
    .filter((term) => term && !pantryStopWords.has(term)))];
}

function scoreRecipe(recipe, terms) {
  const ingredientWords = (recipe.ingredients || [])
    .map((ingredient) => normalizeIngredient(ingredient.name || ''))
    .join(' ')
    .split(/\s+/);
  const matchedTerms = terms.filter((term) => ingredientWords.includes(term));
  return { recipe, matchedCount: matchedTerms.length, matchedTerms };
}

async function preparePantryPhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo file to scan.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose an image smaller than 12 MB.');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.78));
  if (!blob) throw new Error('This photo could not be prepared. Try another image.');
  if (blob.size > 700_000) {
    const reducedCanvas = document.createElement('canvas');
    reducedCanvas.width = Math.round(canvas.width * 0.75);
    reducedCanvas.height = Math.round(canvas.height * 0.75);
    reducedCanvas.getContext('2d').drawImage(canvas, 0, 0, reducedCanvas.width, reducedCanvas.height);
    blob = await new Promise((resolve) => reducedCanvas.toBlob(resolve, 'image/jpeg', 0.68));
  }
  if (!blob || blob.size > 700_000) throw new Error('This photo is too detailed to upload. Try a smaller photo.');

  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  const data = btoa(binary);
  return { mimeType: 'image/jpeg', data, preview: `data:image/jpeg;base64,${data}` };
}

function filtersFromLocation() {
  const params = new URLSearchParams(window.location.search);
  return { ...initialFilters, cuisine: params.get('cuisine') || '' };
}

function flattenCuisineOptions(nodes, result = []) {
  for (const node of nodes) {
    if (['region', 'country', 'tag', 'continent'].includes(node.level)) result.push(node);
    flattenCuisineOptions(node.children || [], result);
  }
  return result;
}

export default function RecipeBrowser({ compact = false }) {
  const { t } = useLanguage();
  const { user, initializing } = useAuth();
  const [draft, setDraft] = useState(filtersFromLocation);
  const [filters, setFilters] = useState(filtersFromLocation);
  const [pantryInput, setPantryInput] = useState('');
  const [submittedPantry, setSubmittedPantry] = useState([]);
  const [pantryNotice, setPantryNotice] = useState('');
  const [page, setPage] = useState(1);
  const [pantryPhoto, setPantryPhoto] = useState(null);
  const query = useQuery({
    queryKey: ['recipes', user?.id || 'guest', filters, page],
    queryFn: () => fetchRecipes({ ...filters, page, limit: compact ? 3 : 9 }),
    enabled: !initializing,
  });
  const cuisineQuery = useQuery({
    queryKey: ['cuisine-tree'],
    queryFn: fetchCuisineTree,
    enabled: !compact && !initializing,
  });
  const pantryQuery = useQuery({
    queryKey: ['pantry-recommendations', submittedPantry],
    queryFn: () => fetchRecipes({ page: 1, limit: 50 }),
    enabled: !compact && !initializing && submittedPantry.length > 0,
  });
  const scanMutation = useMutation({
    mutationFn: recognizePantryImage,
    onSuccess: ({ items }) => {
      const recognized = items.map((item) => item.name);
      const input = recognized.join(', ');
      setPantryInput(input);
      setSubmittedPantry(parsePantryTerms(input));
      setPantryNotice(recognized.length
        ? `Found ${recognized.length} possible ingredients. Review the list and edit anything that looks wrong.`
        : 'No ingredients were clear enough to identify. Add them manually and search again.');
    },
    onError: (error) => setPantryNotice(error.response?.data?.error?.message || error.message || 'Photo recognition failed. Try again.'),
  });

  function updateDraft(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function submitSearch(event) {
    event.preventDefault();
    setPage(1);
    setFilters(draft);
  }

  function clearFilters() {
    setDraft(initialFilters);
    setFilters(initialFilters);
    setPage(1);
  }

  async function handlePantryFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPantryPhoto(null);
    setPantryNotice('Preparing photo…');
    event.target.value = '';
    try {
      const prepared = await preparePantryPhoto(file);
      setPantryPhoto(prepared);
      setPantryNotice(`${file.name} is ready to scan.`);
    } catch (error) {
      setPantryNotice(error.message);
    }
  }

  function scanPantryPhoto() {
    if (!pantryPhoto) return;
    setPantryNotice('Looking for ingredients in the photo…');
    scanMutation.mutate({ mimeType: pantryPhoto.mimeType, data: pantryPhoto.data });
  }

  const pantryTerms = useMemo(() => parsePantryTerms(pantryInput), [pantryInput]);

  function findPantryRecipes(event) {
    event.preventDefault();
    setSubmittedPantry(pantryTerms);
    setPantryNotice('');
    setPage(1);
  }

  const pantryMatches = useMemo(() => (pantryQuery.data?.data || [])
    .map((recipe) => scoreRecipe(recipe, submittedPantry))
    .filter((result) => result.matchedCount > 0)
    .sort((left, right) => right.matchedCount - left.matchedCount || (left.recipe.totalTimeMinutes || Infinity) - (right.recipe.totalTimeMinutes || Infinity)), [pantryQuery.data, submittedPantry]);
  const usingPantry = !compact && submittedPantry.length > 0;
  const visibleRecipes = usingPantry ? pantryMatches.map(({ recipe }) => recipe) : (query.data?.data || []);

  function errorMessage(error) {
    if (error.response?.data?.error?.code === 'QUOTA_EXCEEDED') {
      const quota = error.response.data.error;
      const reset = new Intl.DateTimeFormat('en', { timeZone: quota.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(quota.resetsAt));
      return t('quotaExceeded', { limit: quota.limit, reset });
    }
    if (error.response?.status === 503) return t('apiOffline');
    if (error.response?.status === 404) return t('notFoundError');
    if (error.code === 'ECONNABORTED' || !error.response) return t('apiUnreachable');
    return t('genericLoadError');
  }

  const recipes = query.data?.data || [];
  const pagination = query.data?.pagination;

  return (
    <section className={compact ? 'recipe-browser compact-browser' : 'recipe-browser'} id="recipes">
      <div className="browser-heading">
        <div>
          <p className="eyebrow">{t('indexEyebrow')}</p>
          <h2>{compact ? t('compactRecipesHeading') : t('recipesHeading')}</h2>
        </div>
        {!compact && <span className="results-count">{usingPantry ? `${visibleRecipes.length} pantry matches` : pagination ? t('recipesCount', { count: pagination.total }) : t('resultsFromPantry')}</span>}
      </div>

      <form className="filter-bar" onSubmit={submitSearch}>
        <label className="search-control">
          <span className="sr-only">{t('searchLabel')}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" /><path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <input name="search" value={draft.search} onChange={updateDraft} placeholder={t('searchPlaceholder')} />
        </label>
        {!compact && <>
          <label className="filter-control">
            <span className="sr-only">{t('dietLabel')}</span>
            <select name="diet" value={draft.diet} onChange={updateDraft}>
              <option value="">{t('anyDiet')}</option>
              <option value="vegetarian">{t('vegetarian')}</option>
              <option value="vegan">{t('vegan')}</option>
              <option value="gluten-free">{t('glutenFree')}</option>
            </select>
          </label>
          <label className="filter-control">
            <span className="sr-only">Dish category</span>
            <select name="dishCategory" value={draft.dishCategory} onChange={updateDraft}>
              <option value="">All dish categories</option>
              <option value="main">Main dish</option>
              <option value="starter">Starter</option>
              <option value="side">Side dish</option>
              <option value="dessert">Dessert</option>
              <option value="snack">Snack</option>
              <option value="beverage">Beverage</option>
              <option value="bread">Bread</option>
            </select>
          </label>
          <label className="filter-control cuisine-control">
            <span className="sr-only">{t('cuisineLabel')}</span>
            <select name="cuisine" value={draft.cuisine} onChange={updateDraft}>
              <option value="">{t('anyCuisine')}</option>
              {flattenCuisineOptions(cuisineQuery.data || []).map((cuisine) => <option value={cuisine.slug} key={cuisine.slug}>{cuisine.name}</option>)}
            </select>
          </label>
          <label className="filter-control">
            <span className="sr-only">{t('maxTimeLabel')}</span>
            <select name="maxTime" value={draft.maxTime} onChange={updateDraft}>
              <option value="">{t('anyTime')}</option>
              <option value="20">{t('under20')}</option>
              <option value="30">{t('under30')}</option>
              <option value="45">{t('under45')}</option>
            </select>
          </label>
          <label className="filter-control sort-control">
            <span className="sr-only">{t('sortLabel')}</span>
            <select name="sort" value={draft.sort} onChange={updateDraft}>
              <option value="newest">{t('recentlyAdded')}</option>
              <option value="shortest">{t('shortestTime')}</option>
              <option value="saved">{t('mostSaved')}</option>
            </select>
          </label>
        </>}
        <button className="search-submit" type="submit" aria-label={t('searchActionLabel')}>
          <span>{t('search')}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M3.5 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>

      {!compact && <div className="pantry-panel">
        <div className="pantry-header">
          <div>
            <p className="eyebrow">Pantry scan</p>
            <h3>What do you already have?</h3>
          </div>
          <label className="upload-ghost">
            <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handlePantryFile} />
            <span>Upload a photo</span>
          </label>
        </div>
        {pantryPhoto && <div className="pantry-photo-row">
          <img src={pantryPhoto.preview} alt="Selected pantry photo" />
          <button className="search-submit pantry-submit" type="button" onClick={scanPantryPhoto} disabled={scanMutation.isPending}>
            {scanMutation.isPending ? 'Recognizing…' : 'Recognize ingredients'}
          </button>
        </div>}
        <form className="pantry-form" onSubmit={findPantryRecipes}>
          <textarea
            value={pantryInput}
            onChange={(event) => setPantryInput(event.target.value)}
            placeholder="Enter ingredients, separated by commas or spaces, e.g. tomato onion oil"
            rows="3"
          />
          <div className="pantry-actions">
            <button className="text-button" type="button" onClick={() => { setPantryInput(''); setPantryPhoto(null); setSubmittedPantry([]); setPantryNotice(''); scanMutation.reset(); }}>Clear pantry</button>
            <button className="search-submit pantry-submit" type="submit" disabled={!pantryTerms.length}>Find recipes</button>
          </div>
        </form>
        {pantryNotice && <p className="pantry-notice" role="status">{pantryNotice}</p>}
        {usingPantry && <p className="pantry-result-summary" role="status">Ranked by how many of your ingredients each recipe uses.</p>}
      </div>}

      {!compact && <div className="filter-summary">
        <span>{t('filterSummary')}</span>
        {(filters.search || filters.diet || filters.dishCategory || filters.cuisine || filters.maxTime) && <button type="button" className="text-button" onClick={clearFilters}>{t('clearFilters')}</button>}
      </div>}

      {(initializing || query.isLoading || (usingPantry && pantryQuery.isLoading)) && <div className="status-panel" role="status"><span className="status-mark" />{usingPantry ? 'Finding recipes for your ingredients…' : t('loadingRecipes')}</div>}
      {(query.isError || (usingPantry && pantryQuery.isError)) && <div className="status-panel error-panel" role="alert"><strong>{t('recipesErrorTitle')}</strong><span>{errorMessage(pantryQuery.error || query.error)}</span>{(pantryQuery.error || query.error)?.response?.data?.error?.code === 'QUOTA_EXCEEDED' ? <Link className="text-button" to={(pantryQuery.error || query.error).response.data.error.upgradeUrl || '/pricing'}>See Premium plans</Link> : <button className="text-button" type="button" onClick={() => (usingPantry ? pantryQuery.refetch() : query.refetch())}>{t('tryAgain')}</button>}</div>}
      {((usingPantry && pantryQuery.isSuccess) || (!usingPantry && query.isSuccess)) && visibleRecipes.length === 0 && <div className="status-panel empty-panel"><strong>No recipe matches yet</strong><span>Try adding another ingredient or a broader term such as oil, rice, or onion.</span></div>}

      {visibleRecipes.length > 0 && <div className={compact ? 'recipe-grid compact-grid' : 'recipe-grid'}>
        {visibleRecipes.map((recipe, index) => <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} index={index} showPantryMatch={usingPantry} pantryMatch={usingPantry ? pantryMatches[index] : null} />)}
      </div>}

      {compact && recipes.length > 0 && <a className="underlined-link" href="/recipes">{t('browseAll')} <span aria-hidden="true">→</span></a>}
      {!compact && !usingPantry && pagination?.pages > 1 && <nav className="pagination" aria-label="Recipe pages">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{t('previous')}</button>
        <span>{t('pageLabel', { page, pages: pagination.pages })}</span>
        <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)}>{t('next')}</button>
      </nav>}
    </section>
  );
}