export const defaultPlans = {
  timezone: 'Asia/Kolkata',
  plans: {
    free: {
      priceMonthly: 0,
      currency: 'INR',
      limits: {
        recipeSearchesPerDay: 4,
        aiRecommendationsPerDay: 3,
        ingredientScansPerMonth: 5,
        aiAssistantMessagesPerDay: 0,
        pantryItemsMax: 50,
        collectionsMax: 3,
        mealPlanDaysAhead: 7,
        wasteAnalyticsRangeDays: 30,
      },
    },
    premium: {
      priceMonthly: 99,
      priceYearly: 799,
      currency: 'INR',
      limits: {
        recipeSearchesPerDay: null,
        aiRecommendationsPerDay: null,
        ingredientScansPerMonth: 300,
        aiAssistantMessagesPerDay: 100,
        pantryItemsMax: 500,
        collectionsMax: 100,
        mealPlanDaysAhead: 365,
        wasteAnalyticsRangeDays: 365,
      },
    },
  },
};

export const implementedPlanFeatures = [
  { key: 'recipeSearchesPerDay', label: 'Recipe and ingredient searches', implemented: true },
  { key: 'ingredientScansPerMonth', label: 'Photo ingredient recognition', implemented: true },
  { key: 'aiRecommendationsPerDay', label: 'AI-generated recipe drafts', implemented: true },
  { key: 'recipeBrowsing', label: 'Recipe browsing and cuisine discovery', implemented: true },
  { key: 'savedLanguage', label: 'English, Tamil and Hindi interface', implemented: true },
  { key: 'account', label: 'Email-verified account and password recovery', implemented: true },
];