export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const MEAL_TYPES = ['Breakfast','Lunch','Dinner','Snack'];
export const CATEGORIES = ['Produce','Meat & Fish','Dairy','Bakery','Pantry','Frozen','Other'];

export const MEAL_TYPE_COLORS = {
  Breakfast: { color: 'var(--amber)', bg: 'var(--amber-light)' },
  Lunch:     { color: 'var(--blue)',  bg: 'var(--blue-light)'  },
  Dinner:    { color: 'var(--accent)', bg: 'var(--accent-light)'},
  Snack:     { color: 'var(--red)',   bg: 'var(--red-light)'   },
};

export const SAMPLE_RECIPES = [
  {
    id: 1, name: 'Avocado Toast', servings: 2, prepTime: 5, cookTime: 5,
    tags: ['breakfast','vegan','quick'], calories: 320, protein: 10, carbs: 34, fat: 18, sugar: 2,
    ingredients: [
      { name: 'sourdough bread', qty: 2, unit: 'slices' },
      { name: 'avocado', qty: 1, unit: 'whole' },
      { name: 'lemon', qty: 0.5, unit: 'whole' },
      { name: 'chilli flakes', qty: 1, unit: 'pinch' },
    ],
    steps: ['Toast the bread until golden', 'Mash avocado with lemon juice', 'Season with salt and chilli flakes', 'Spread on toast and serve'],
  },
  {
    id: 2, name: 'Chicken Stir Fry', servings: 2, prepTime: 10, cookTime: 15,
    tags: ['dinner','high-protein','asian'], calories: 480, protein: 42, carbs: 28, fat: 18, sugar: 6,
    ingredients: [
      { name: 'chicken breast', qty: 300, unit: 'g' },
      { name: 'soy sauce', qty: 2, unit: 'tbsp' },
      { name: 'garlic', qty: 2, unit: 'cloves' },
      { name: 'broccoli', qty: 200, unit: 'g' },
      { name: 'sesame oil', qty: 1, unit: 'tbsp' },
    ],
    steps: ['Slice chicken into strips', 'Steam broccoli for 3 min', 'Cook chicken in hot wok', 'Add garlic, soy sauce and sesame oil', 'Toss with broccoli and serve'],
  },
  {
    id: 3, name: 'Greek Salad', servings: 2, prepTime: 10, cookTime: 0,
    tags: ['lunch','vegetarian','quick'], calories: 280, protein: 8, carbs: 16, fat: 22, sugar: 8,
    ingredients: [
      { name: 'cucumber', qty: 1, unit: 'whole' },
      { name: 'tomatoes', qty: 3, unit: 'whole' },
      { name: 'feta cheese', qty: 100, unit: 'g' },
      { name: 'olive oil', qty: 2, unit: 'tbsp' },
      { name: 'olives', qty: 50, unit: 'g' },
    ],
    steps: ['Chop cucumber and tomatoes', 'Combine in bowl with olives', 'Crumble feta on top', 'Drizzle with olive oil'],
  },
  {
    id: 4, name: 'Overnight Oats', servings: 1, prepTime: 5, cookTime: 0,
    tags: ['breakfast','vegan','quick'], calories: 380, protein: 12, carbs: 62, fat: 10, sugar: 18,
    ingredients: [
      { name: 'rolled oats', qty: 80, unit: 'g' },
      { name: 'almond milk', qty: 200, unit: 'ml' },
      { name: 'banana', qty: 1, unit: 'whole' },
      { name: 'chia seeds', qty: 1, unit: 'tbsp' },
      { name: 'honey', qty: 1, unit: 'tbsp' },
    ],
    steps: ['Combine oats and almond milk', 'Add chia seeds and honey', 'Refrigerate overnight', 'Top with sliced banana before serving'],
  },
  {
    id: 5, name: 'Baked Salmon & Veg', servings: 2, prepTime: 10, cookTime: 20,
    tags: ['dinner','high-protein','healthy'], calories: 520, protein: 48, carbs: 22, fat: 26, sugar: 7,
    ingredients: [
      { name: 'salmon fillets', qty: 300, unit: 'g' },
      { name: 'sweet potato', qty: 1, unit: 'whole' },
      { name: 'asparagus', qty: 150, unit: 'g' },
      { name: 'olive oil', qty: 2, unit: 'tbsp' },
      { name: 'lemon', qty: 1, unit: 'whole' },
    ],
    steps: ['Preheat oven to 200°C', 'Cube sweet potato, toss in oil, roast 10 min', 'Add salmon and asparagus to tray', 'Bake 15 minutes more', 'Serve with lemon wedges'],
  },
  {
    id: 6, name: 'Red Lentil Soup', servings: 4, prepTime: 10, cookTime: 30,
    tags: ['lunch','vegan','high-protein'], calories: 320, protein: 18, carbs: 52, fat: 6, sugar: 5,
    ingredients: [
      { name: 'red lentils', qty: 200, unit: 'g' },
      { name: 'onion', qty: 1, unit: 'whole' },
      { name: 'tomatoes', qty: 2, unit: 'whole' },
      { name: 'cumin', qty: 1, unit: 'tsp' },
      { name: 'vegetable stock', qty: 1, unit: 'L' },
    ],
    steps: ['Sauté diced onion until soft', 'Add lentils and stock', 'Simmer 25 minutes', 'Add tomatoes and cumin', 'Blend half the soup for texture'],
  },
];

export const SAMPLE_PANTRY = [
  { id: 1, name: 'Eggs', qty: 6, unit: 'whole', category: 'Dairy' },
  { id: 2, name: 'Olive oil', qty: 500, unit: 'ml', category: 'Pantry' },
  { id: 3, name: 'Garlic', qty: 3, unit: 'cloves', category: 'Produce' },
  { id: 4, name: 'Soy sauce', qty: 1, unit: 'bottle', category: 'Pantry' },
  { id: 5, name: 'Rolled oats', qty: 500, unit: 'g', category: 'Pantry' },
];

export const SAMPLE_MEAL_PLAN = {
  'Monday_Breakfast': [4],
  'Monday_Dinner': [2],
  'Tuesday_Lunch': [3],
  'Wednesday_Dinner': [5],
  'Thursday_Breakfast': [1],
  'Friday_Lunch': [6],
  'Saturday_Dinner': [5],
  'Sunday_Breakfast': [4],
};

// Helper: ensure slot value is always an array (handles legacy single-id format)
export const slotIds = (val) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

export const guessCategory = (name) => {
  const n = name.toLowerCase();
  if (['chicken','beef','salmon','fish','pork','lamb','turkey','meat','mince'].some(m => n.includes(m))) return 'Meat & Fish';
  if (['milk','cheese','yogurt','butter','egg','cream','feta','dairy'].some(m => n.includes(m))) return 'Dairy';
  if (['bread','roll','pita','tortilla','sourdough','loaf'].some(m => n.includes(m))) return 'Bakery';
  if (['frozen'].some(m => n.includes(m))) return 'Frozen';
  if (['olive oil','soy sauce','flour','sugar','honey','rice','pasta','oats','stock','cumin','spice','salt','pepper','vinegar','sauce','oil','chia','lentil','bean'].some(m => n.includes(m))) return 'Pantry';
  return 'Produce';
};
