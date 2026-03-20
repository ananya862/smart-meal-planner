/**
 * Check a recipe against user settings.
 * Returns { hasIssue, allergens, avoided, dietaryFlags }
 * Respects recipe tags — e.g. "gluten-free" tag means skip gluten check.
 */
export function checkRecipe(recipe, settings) {
  if (!settings || !recipe) return { hasIssue: false, allergens: [], avoided: [], dietaryFlags: [] };

  const ingredientNames = (recipe.ingredients || []).map(i => i.name.toLowerCase());
  const recipeName = recipe.name.toLowerCase();
  const tags = (recipe.tags || []).map(t => t.toLowerCase());

  // Helper: recipe explicitly declares it is safe for a diet via tags
  const taggedAs = (...keywords) => keywords.some(k => tags.some(t => t.includes(k)));

  const allergens = (settings.allergies || []).filter(a => {
    const al = a.toLowerCase();
    return ingredientNames.some(i => i.includes(al)) || recipeName.includes(al);
  });

  const avoided = (settings.avoid || []).filter(a => {
    const av = a.toLowerCase();
    return ingredientNames.some(i => i.includes(av)) || recipeName.includes(av) || tags.some(t => t.includes(av));
  });

  const dietaryFlags = [];
  const meatKeywords    = ['chicken','beef','pork','lamb','turkey','meat','bacon','ham','sausage','mince'];
  const fishKeywords    = ['salmon','fish','tuna','prawn','shrimp','seafood','cod','haddock'];
  const dairyKeywords   = ['milk','cheese','butter','cream','yogurt','feta','dairy','ghee'];
  const glutenKeywords  = ['flour','bread','pasta','wheat','gluten','sourdough','tortilla','pita','naan','couscous','barley','rye'];

  if (settings.vegetarian || settings.vegan) {
    // Skip if recipe is tagged vegetarian/vegan
    if (!taggedAs('vegetarian','vegan')) {
      if (meatKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains meat');
      if (fishKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains fish');
    }
  }

  if (settings.vegan) {
    if (!taggedAs('vegan')) {
      if (dairyKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains dairy');
      if (ingredientNames.some(i => i.includes('egg'))) dietaryFlags.push('Contains eggs');
    }
  }

  if (settings.glutenFree) {
    // Skip if recipe is tagged gluten-free
    if (!taggedAs('gluten-free','gluten free','gf')) {
      if (glutenKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains gluten');
    }
  }

  if (settings.dairyFree) {
    // Skip if recipe is tagged dairy-free
    if (!taggedAs('dairy-free','dairy free')) {
      if (dairyKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains dairy');
    }
  }

  const hasIssue = allergens.length > 0 || avoided.length > 0 || dietaryFlags.length > 0;
  return { hasIssue, allergens, avoided, dietaryFlags };
}
