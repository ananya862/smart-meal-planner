import React, { useState } from 'react';
import { useStorage } from './hooks/useStorage.js';
import { SAMPLE_RECIPES, SAMPLE_PANTRY, SAMPLE_MEAL_PLAN, slotIds } from './data.js';
import { Icon } from './components/UI.jsx';
import PlannerView   from './views/PlannerView.jsx';
import RecipesView   from './views/RecipesView.jsx';
import GroceryView   from './views/GroceryView.jsx';
import PantryView    from './views/PantryView.jsx';
import NutritionView from './views/NutritionView.jsx';
import SettingsView  from './views/SettingsView.jsx';

const NAV = [
  { id: 'planner',   icon: 'calendar', label: 'Plan'      },
  { id: 'recipes',   icon: 'book',     label: 'Recipes'   },
  { id: 'grocery',   icon: 'shopping', label: 'Grocery'   },
  { id: 'pantry',    icon: 'box',      label: 'Pantry'    },
  { id: 'nutrition', icon: 'leaf',     label: 'Nutrition' },
];

const DEFAULT_SETTINGS = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
  allergies: [],
  avoid: [],
  mealsPerDay: 1,
};

export default function App() {
  const [tab, setTab]           = useState('planner');
  const [showSettings, setShowSettings] = useState(false);
  const [recipes,  setRecipes]  = useStorage('smp_recipes',  SAMPLE_RECIPES);
  const [mealPlan, setMealPlan] = useStorage('smp_mealplan', SAMPLE_MEAL_PLAN);
  const [pantry,   setPantry]   = useStorage('smp_pantry',   SAMPLE_PANTRY);
  const [settings, setSettings] = useStorage('smp_settings', DEFAULT_SETTINGS);

  const onRemoveMeal     = (key) => setMealPlan(prev => { const n = { ...prev }; delete n[key]; return n; });
  const onAddRecipeToMeal = (key, val) => setMealPlan(prev => ({ ...prev, [key]: val }));

  const groceryNeeded = (() => {
    const needed = new Set();
    Object.values(mealPlan).forEach(val => {
      slotIds(val).forEach(rid => {
        const r = recipes.find(x => x.id === rid);
        if (r) r.ingredients.forEach(ing => needed.add(ing.name.toLowerCase()));
      });
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="leaf" size={16} />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>MealPlanner</h1>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                {Object.keys(mealPlan).length} meals · {recipes.length} recipes
              </p>
            </div>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              width: 38, height: 38, borderRadius: 12, position: 'relative',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>

          </button>
        </div>
      </header>

      {/* View content */}
      <main className="scroll-container safe-bottom" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 0' }}>
        <div className="fade-in" key={tab}>
          {tab === 'planner'   && <PlannerView   mealPlan={mealPlan} recipes={recipes} onRemoveMeal={onRemoveMeal} onAddRecipeToMeal={onAddRecipeToMeal} settings={settings} activeMealTypes={settings.activeMealTypes || ['Breakfast','Lunch','Dinner','Snack']} />}
          {tab === 'recipes'   && <RecipesView   recipes={recipes} setRecipes={setRecipes} pantry={pantry} settings={settings} />}
          {tab === 'grocery'   && <GroceryView   mealPlan={mealPlan} recipes={recipes} pantry={pantry} activeMealTypes={settings.activeMealTypes || ['Breakfast','Lunch','Dinner','Snack']} />}
          {tab === 'pantry'    && <PantryView    pantry={pantry} setPantry={setPantry} />}
          {tab === 'nutrition' && <NutritionView mealPlan={mealPlan} recipes={recipes} activeMealTypes={settings.activeMealTypes || ['Breakfast','Lunch','Dinner','Snack']} />}
        </div>
      </main>

      {/* Bottom navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        display: 'flex', paddingBottom: 'var(--safe-bottom)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      }}>
        {NAV.map(item => {
          const active = tab === item.id;
          const badge = item.id === 'grocery' && groceryNeeded > 0 ? groceryNeeded : null;
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 4px 8px', gap: 3, position: 'relative',
                color: active ? 'var(--accent)' : 'var(--text3)', transition: 'color 0.15s',
              }}
            >
              {active && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: 'var(--accent)', borderRadius: '0 0 3px 3px' }} />
              )}
              <div style={{ position: 'relative' }}>
                <Icon name={item.icon} size={22} />
                {badge && (
                  <div style={{ position: 'absolute', top: -4, right: -6, width: 16, height: 16, borderRadius: '50%', background: 'var(--red)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {badge > 9 ? '9+' : badge}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings slide-over panel */}
      {showSettings && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <div className="slide-up" style={{
            background: 'var(--surface)', width: '100%',
            borderRadius: '20px 20px 0 0', maxHeight: '92dvh',
            display: 'flex', flexDirection: 'column',
            paddingBottom: 'calc(var(--safe-bottom) + 16px)',
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
            </div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
              <h2 style={{ fontSize: 20 }}>Settings</h2>
              <button onClick={() => setShowSettings(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
              <SettingsView settings={settings} setSettings={setSettings} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
