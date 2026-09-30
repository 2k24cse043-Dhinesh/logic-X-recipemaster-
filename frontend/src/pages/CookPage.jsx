import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipe } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CookPage() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ['cook-recipe', slug],
    queryFn: () => fetchRecipe(slug),
    enabled: Boolean(slug),
  });

  const steps = useMemo(() => (recipe?.steps || []).sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0)), [recipe]);

  if (isLoading) return <main className="page-main"><div className="status-panel" role="status">{t('loadingRecipe')}</div></main>;
  if (isError || !recipe) return <main className="page-main"><div className="status-panel error-panel" role="alert"><strong>{t('recipeOpenError')}</strong><Link className="underlined-link" to="/recipes">{t('backToRecipes')}</Link></div></main>;

  if (!steps.length) {
    return <main className="page-main"><div className="status-panel" role="status">This recipe does not have cooking steps yet.</div></main>;
  }

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <main className="page-main recipe-cook-page">
      <div className="detail-heading">
        <div className="detail-copy">
          <p className="eyebrow">Cook mode</p>
          <h1>{recipe.title}</h1>
          <p className="detail-description">Follow each step in order and keep the pan moving.</p>
        </div>
      </div>

      <section className="detail-extra cook-panel">
        <div className="cook-progress-meta">
          <span>Step {stepIndex + 1} of {steps.length}</span>
          <span>{currentStep.durationMinutes ? `${currentStep.durationMinutes} min` : 'No timer set'}</span>
        </div>
        <div className="cook-progress-bar" aria-label="Cooking progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="cook-step-card">
          {currentStep.title && <h2>{currentStep.title}</h2>}
          <p className="cook-step-instruction">{currentStep.instruction}</p>

          <div className="cook-step-details">
            {currentStep.phase && <span><strong>Phase:</strong> {currentStep.phase}</span>}
            {currentStep.heatLevel && <span><strong>Heat:</strong> {currentStep.heatLevel}</span>}
            {currentStep.temperature?.value != null && <span><strong>Temp:</strong> {currentStep.temperature.value}°{currentStep.temperature.unit}</span>}
            {currentStep.visualCue && <span><strong>Look for:</strong> {currentStep.visualCue}</span>}
            {currentStep.sensoryCue && <span><strong>Sensory cue:</strong> {currentStep.sensoryCue}</span>}
            {currentStep.donenessCue && <span><strong>Doneness:</strong> {currentStep.donenessCue}</span>}
          </div>
        </div>

        <div className="cook-actions">
          <button type="button" className="text-button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}>Previous</button>
          <button type="button" className="auth-submit" disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))}>Next step</button>
        </div>
      </section>

      <div className="detail-bottom-actions">
        <Link className="underlined-link" to={`/recipes/${recipe.slug}`}>Back to recipe</Link>
      </div>
    </main>
  );
}
