import React, { useState } from 'react';
import { useStorage } from './hooks/useStorage.js';
import { SAMPLE_RECIPES, SAMPLE_PANTRY, SAMPLE_MEAL_PLAN } from './data.js';
import { Icon } from './components/UI.jsx';
import PlannerView from './views/PlannerView.jsx';
import RecipesView from './views/RecipesView.jsx';
import GroceryView from './views/GroceryView.jsx';
import PantryView from './views/PantryView.jsx';
import NutritionView from './views/NutritionView.jsx';

const NAV = [
  { id: 'planner',   icon: 'calendar',  label: 'Plan'     },
  { id: 'recipes',   icon: 'book',      label: 'Recipes'  },
  { id: 'grocery',   icon: 'shopping',  label: 'Grocery'  },
  { id: 'pantry',    icon: 'box',       label: 'Pantry'   },
  { id: 'nutrition', icon: 'leaf',      label: 'Nutrition'},
];

export default function App() {
  const [tab, setTab] = useState('planner');
  const [recipes,  setRecipes]  = useStorage('smp_recipes',  SAMPLE_RECIPES);
  const [mealPlan, setMealPlan] = useStorage('smp_mealplan', SAMPLE_MEAL_PLAN);
  const [pantry,   setPantry]   = useStorage('smp_pantry',   SAMPLE_PANTRY);

  const onRemoveMeal = (key) => setMealPlan(prev => { const n = { ...prev }; delete n[key]; return n; });
  const onAddRecipeToMeal = (key, rid) => setMealPlan(prev => ({ ...prev, [key]: rid }));

  // Badge counts
  const groceryNeeded = (() => {
    const needed = new Set();
    Object.values(mealPlan).forEach(rid => {
      const r = recipes.find(x => x.id === rid);
      if (r) r.ingredients.forEach(ing => needed.add(ing.name.toLowerCase()));
    });
    const pantryNames = new Set(pantry.map(p => p.name.toLowerCase()));
    return [...needed].filter(k => !pantryNames.has(k)).length;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: `calc(var(--safe-top) + 12px) 20px 12px`,
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="leaf" size={16} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>MealPlanner</h1>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
              {Object.keys(mealPlan).length} meals · {recipes.length} recipes
            </p>
          </div>
        </div>
      </header>

      {/* View content */}
      <main
        className="scroll-container safe-bottom"
        style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 0' }}
      >
        <div className="fade-in" key={tab}>
          {tab === 'planner'   && <PlannerView   mealPlan={mealPlan} recipes={recipes} onRemoveMeal={onRemoveMeal} onAddRecipeToMeal={onAddRecipeToMeal} />}
          {tab === 'recipes'   && <RecipesView   recipes={recipes} setRecipes={setRecipes} pantry={pantry} />}
          {tab === 'grocery'   && <GroceryView   mealPlan={mealPlan} recipes={recipes} pantry={pantry} />}
          {tab === 'pantry'    && <PantryView    pantry={pantry} setPantry={setPantry} />}
          {tab === 'nutrition' && <NutritionView mealPlan={mealPlan} recipes={recipes} />}
        </div>
      </main>

      {/* Bottom navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'var(--safe-bottom)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      }}>
        {NAV.map(item => {
          const active = tab === item.id;
          const badge = item.id === 'grocery' && groceryNeeded > 0 ? groceryNeeded : null;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 4px 8px', gap: 3, position: 'relative',
                color: active ? 'var(--accent)' : 'var(--text3)',
                transition: 'color 0.15s',
              }}
            >
              {/* Active indicator */}
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 28, height: 3, background: 'var(--accent)', borderRadius: '0 0 3px 3px',
                }} />
              )}
              <div style={{ position: 'relative' }}>
                <Icon name={item.icon} size={22} />
                {badge && (
                  <div style={{
                    position: 'absolute', top: -4, right: -6,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--red)', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {badge > 9 ? '9+' : badge}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
