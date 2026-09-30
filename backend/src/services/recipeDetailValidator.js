const present = (value) => value !== undefined && value !== null && value !== '';
const listHas = (values, predicate) => Array.isArray(values) && values.some(predicate);

export function validateRecipeDetail(recipe) {
  const errors = [];
  const warnings = [];
  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];
  const ingredientNames = new Set(ingredients.map(({ name }) => String(name || '').trim().toLowerCase()).filter(Boolean));
  const usedNames = new Set();
  const knownIds = new Set(ingredients.map(({ ingredientId }) => String(ingredientId || '')).filter(Boolean));

  if (steps.length < 8) warnings.push('Detailed recipes typically have at least 8 steps.');
  if (steps.length > 20) warnings.push('Detailed recipes typically have no more than 20 steps.');
  for (const [index, step] of steps.entries()) {
    if (!present(step.instruction)) errors.push(`Step ${index + 1} needs an instruction.`);
    for (const used of step.ingredientsUsed || []) {
      const name = String(used.name || '').trim().toLowerCase();
      if (name) usedNames.add(name);
      if (used.ingredientId && knownIds.size && !knownIds.has(String(used.ingredientId))) {
        errors.push(`Step ${step.stepNumber || index + 1} references an ingredient that is not in the recipe.`);
      } else if (name && ingredientNames.size && !ingredientNames.has(name)) {
        errors.push(`Step ${step.stepNumber || index + 1} uses an ingredient not listed in the recipe: ${used.name}.`);
      }
    }
    if (step.timerEligible && (!Number.isFinite(step.durationMinutes) || step.durationMinutes <= 0)) {
      errors.push(`Step ${step.stepNumber || index + 1} cannot have an eligible timer without a duration.`);
    }
    if (step.durationMinutes && !step.timerEligible) warnings.push(`Step ${step.stepNumber || index + 1} has a duration but its timer is disabled.`);
    if (/raw chicken|eat raw poultry|undercooked chicken/i.test(step.instruction) && !present(step.safetyNote)) {
      errors.push(`Step ${step.stepNumber || index + 1} needs a food-safety note.`);
    }
  }

  if (steps.some((step) => Array.isArray(step.ingredientsUsed) && step.ingredientsUsed.length)) {
    for (const ingredient of ingredients) {
      const name = String(ingredient.name || '').trim().toLowerCase();
      if (name && !usedNames.has(name)) warnings.push(`Listed ingredient is not referenced by a method step: ${ingredient.name}.`);
    }
  }

  const measuredTimes = [recipe.prepTimeMinutes, recipe.cookTimeMinutes, recipe.passiveTimeMinutes].filter(Number.isFinite);
  if (Number.isFinite(recipe.totalTimeMinutes) && measuredTimes.length === 3) {
    const expected = measuredTimes.reduce((sum, value) => sum + value, 0);
    if (Math.abs(recipe.totalTimeMinutes - expected) > Math.max(10, expected * 0.2)) {
      warnings.push('Total time differs from the available prep, cook, and passive time fields.');
    }
  }

  const completenessFields = [
    recipe.title,
    recipe.description,
    recipe.servings,
    recipe.activeTimeMinutes,
    recipe.passiveTimeMinutes,
    recipe.skillNotes,
    recipe.mise_en_place,
    recipe.equipmentNeeded,
    ingredients,
    steps,
    recipe.substitutions,
    recipe.troubleshooting,
    recipe.storage,
    recipe.servingSuggestions,
    recipe.foodSafetyNotes,
    recipe.allergenWarnings,
  ];
  const fieldCount = completenessFields.length;
  const presentCount = completenessFields.filter((value) => Array.isArray(value) ? value.length > 0 : typeof value === 'object' && value !== null ? Object.values(value).some(present) : present(value)).length;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    completenessScore: Math.round((presentCount / fieldCount) * 100),
  };
}