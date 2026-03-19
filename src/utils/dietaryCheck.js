/**
 * Check a recipe against user settings.
 * Returns { hasIssue, allergens, avoided, dietaryFlags }
 */
export function checkRecipe(recipe, settings) {
  if (!settings || !recipe) return { hasIssue: false, allergens: [], avoided: [], dietaryFlags: [] };

  const ingredientNames = (recipe.ingredients || []).map(i => i.name.toLowerCase());
  const recipeName = recipe.name.toLowerCase();
  const tags = (recipe.tags || []).map(t => t.toLowerCase());

  const allergens = (settings.allergies || []).filter(a => {
    const al = a.toLowerCase();
    return ingredientNames.some(i => i.includes(al)) || recipeName.includes(al);
  });

  const avoided = (settings.avoid || []).filter(a => {
    const av = a.toLowerCase();
    return ingredientNames.some(i => i.includes(av)) || recipeName.includes(av) || tags.some(t => t.includes(av));
  });

  const dietaryFlags = [];
  const meatKeywords = ['chicken','beef','pork','lamb','turkey','meat','bacon','ham','sausage','mince'];
  const fishKeywords = ['salmon','fish','tuna','prawn','shrimp','seafood','cod','haddock'];
  const dairyKeywords = ['milk','cheese','butter','cream','yogurt','feta','dairy','ghee'];
  const glutenKeywords = ['flour','bread','pasta','wheat','gluten','sourdough','tortilla','pita','naan','couscous','barley','rye'];

  if (settings.vegetarian || settings.vegan) {
    if (meatKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains meat');
    if (fishKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains fish');
  }
  if (settings.vegan) {
    if (dairyKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains dairy');
    if (ingredientNames.some(i => i.includes('egg'))) dietaryFlags.push('Contains eggs');
  }
  if (settings.glutenFree) {
    if (glutenKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains gluten');
  }
  if (settings.dairyFree) {
    if (dairyKeywords.some(k => ingredientNames.some(i => i.includes(k)))) dietaryFlags.push('Contains dairy');
  }

  const hasIssue = allergens.length > 0 || avoided.length > 0 || dietaryFlags.length > 0;
  return { hasIssue, allergens, avoided, dietaryFlags };
}
