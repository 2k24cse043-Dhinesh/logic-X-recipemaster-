import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipePhoto } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

function buildDishArt(title, accent) {
  const safeTitle = (title || 'Recipe').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const words = safeTitle.split(/\s+/).slice(0, 2).join(' ');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent[0]}"/>
          <stop offset="100%" stop-color="${accent[1]}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#grad)"/>
      <circle cx="520" cy="110" r="90" fill="rgba(255,255,255,0.15)"/>
      <circle cx="110" cy="330" r="150" fill="rgba(255,255,255,0.12)"/>
      <path d="M110 275 C180 195, 255 180, 360 210 C420 230, 475 290, 530 300 L530 365 L110 365 Z" fill="rgba(255,255,255,0.18)"/>
      <text x="42" y="152" fill="rgba(255,255,255,0.9)" font-size="28" font-family="Arial, sans-serif" font-weight="700">RecipeMaster</text>
      <text x="42" y="210" fill="white" font-size="38" font-family="Arial, sans-serif" font-weight="700">${words}</text>
      <text x="42" y="278" fill="rgba(255,255,255,0.9)" font-size="20" font-family="Arial, sans-serif">Freshly prepared</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const dishPalette = {
  starter: ['#f59e0b', '#fb7185'],
  main: ['#10b981', '#2563eb'],
  side: ['#8b5cf6', '#14b8a6'],
  dessert: ['#ec4899', '#f97316'],
  snack: ['#f97316', '#ef4444'],
  beverage: ['#06b6d4', '#3b82f6'],
  bread: ['#7c3aed', '#22c55e'],
};

const dishCategoryLabels = {
  starter: 'Starter',
  main: 'Main dish',
  side: 'Side dish',
  dessert: 'Dessert',
  snack: 'Snack',
  beverage: 'Beverage',
  bread: 'Bread',
};

export default function RecipeCard({ recipe, index = 0, showPantryMatch = false, pantryMatch = null }) {
  const { language, t } = useLanguage();
  const localized = recipe.translations?.[language] || {};
  const title = localized.title || recipe.title;
  const description = localized.description || recipe.description;
  const photoQuery = useQuery({
    queryKey: ['recipe-photo', recipe.slug],
    queryFn: () => fetchRecipePhoto(recipe.slug),
    enabled: Boolean(!recipe.coverImage?.url),
    retry: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
  const coverImage = recipe.coverImage?.url ? recipe.coverImage : photoQuery.data;
  const fallbackImage = buildDishArt(title, dishPalette[recipe.dishCategory] || ['#f97316', '#7c3aed']);
  const time = recipe.totalTimeMinutes
    ? t('minutes', { minutes: recipe.totalTimeMinutes })
    : t('timeNotSpecified');
  const difficultyKey = ['easy', 'medium', 'advanced'].includes(recipe.difficulty) ? recipe.difficulty : 'notSpecified';

  return (
    <article className="recipe-card" style={{ '--card-index': index }}>
      <Link className="recipe-photo-link" to={`/recipes/${recipe.slug}`} aria-label={t('viewRecipe', { title })}>
        {coverImage?.url ? (
          <img className="recipe-photo" src={coverImage.url} alt={localized.title || coverImage.alt || title} loading="lazy" />
        ) : (
          <img className="recipe-photo" src={fallbackImage} alt={title} loading="lazy" />
        )}
        <span className="photo-time">{time}</span>
      </Link>
      {coverImage?.licenseUrl && <p className="photo-credit">
        {coverImage.creator && <span>{coverImage.creator} · </span>}
        <a href={coverImage.licenseUrl} target="_blank" rel="noreferrer">{coverImage.license || 'Open license'}</a>
        {coverImage.sourceUrl && <> · <a href={coverImage.sourceUrl} target="_blank" rel="noreferrer">Source</a></>}
      </p>}
      <div className="recipe-card-copy">
        <div className="recipe-card-meta">
          <span>{localized.cuisine || recipe.cuisine?.primary || t('everydayCooking')}</span>
          {recipe.isDemo && <span className="demo-label">{t('demoData')}</span>}
        </div>
        <div className="recipe-card-categories">
          <span>{dishCategoryLabels[recipe.dishCategory] || 'Main dish'}</span>
          {recipe.catalogOnly && <span>Name only</span>}
          {recipe.aiGenerated && <span>AI draft</span>}
        </div>
        <h3><Link to={`/recipes/${recipe.slug}`}>{title}</Link></h3>
        <p>{recipe.catalogOnly ? 'Dish name in the world catalog. Cooking instructions are not included.' : recipe.aiGenerated ? 'AI-generated recipe draft. Review the ingredients and instructions before cooking.' : description}</p>
        <div className="recipe-card-foot">
          <span>{t(difficultyKey)}</span>
          <span>{t('servingsCount', { count: recipe.servings || 2 })}</span>
        </div>
        {showPantryMatch && <div className="recipe-recommendation-actions">
          <span className="pantry-match-count">Matches {pantryMatch?.matchedCount || 0} pantry items</span>
        </div>}
      </div>
    </article>
  );
}