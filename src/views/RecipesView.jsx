import React, { useState } from 'react';
import RecipeCard from '../components/RecipeCard.jsx';
import AISuggestModal from '../components/AISuggestModal.jsx';
import { Icon, Btn, Field, inputStyle, BottomSheet, Empty, Tag } from '../components/UI.jsx';

const BLANK_FORM = {
  name: '', servings: 2, prepTime: 10, cookTime: 20, tags: '',
  calories: 400, protein: 30, carbs: 40, fat: 15,
  ingredients: '', steps: '',
};

export default function RecipesView({ recipes, setRecipes, pantry }) {
  const [showAI, setShowAI] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(BLANK_FORM);

  const allTags = ['All', ...new Set(recipes.flatMap(r => r.tags))];

  const filtered = recipes.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'All' || r.tags.includes(filter);
    return matchSearch && matchFilter;
  });

  const handleDelete = (id) => setRecipes(prev => prev.filter(r => r.id !== id));

  const handleAddAI = (recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const recipe = {
      id: Date.now(),
      name: form.name.trim(),
      servings: +form.servings || 2,
      prepTime: +form.prepTime || 10,
      cookTime: +form.cookTime || 20,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      calories: +form.calories || 400,
      protein: +form.protein || 20,
      carbs: +form.carbs || 40,
      fat: +form.fat || 15,
      ingredients: form.ingredients.split('\n').filter(Boolean).map(line => {
        const parts = line.trim().split(' ');
        return { qty: parseFloat(parts[0]) || 1, unit: parts[1] || '', name: parts.slice(2).join(' ') };
      }),
      steps: form.steps.split('\n').filter(Boolean),
    };
    setRecipes(prev => [recipe, ...prev]);
    setShowForm(false);
    setForm(BLANK_FORM);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>Recipes</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{recipes.length} saved</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowAI(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 12,
              fontWeight: 600, fontSize: 13,
            }}
          >
            <Icon name="sparkle" size={14} /> AI
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              background: 'var(--accent)', color: '#fff', borderRadius: 12,
              fontWeight: 600, fontSize: 13,
            }}
          >
            <Icon name="plus" size={14} /> Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes..."
          style={{ ...inputStyle, paddingLeft: 38 }}
        />
      </div>

      {/* Tag filters */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
        {allTags.slice(0, 12).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: '1.5px solid', transition: 'all 0.15s',
              borderColor: filter === t ? 'var(--accent)' : 'var(--border)',
              background: filter === t ? 'var(--accent)' : 'var(--surface)',
              color: filter === t ? '#fff' : 'var(--text2)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Recipe list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0
          ? <Empty emoji="🍽️" title="No recipes found" subtitle="Try a different search or add a new recipe." />
          : filtered.map(r => <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />)
        }
      </div>

      {/* Add Recipe sheet */}
      {showForm && (
        <BottomSheet onClose={() => setShowForm(false)} title="New Recipe" fullHeight>
          <div style={{ paddingBottom: 32 }}>
            <Field label="Recipe name">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Chicken Stir Fry" style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Servings','servings'],['Prep time (min)','prepTime'],['Cook time (min)','cookTime'],['Calories','calories'],['Protein (g)','protein'],['Carbs (g)','carbs'],['Fat (g)','fat']].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                </Field>
              ))}
            </div>
            <Field label="Tags (comma-separated)">
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="dinner, vegan, quick" style={inputStyle} />
            </Field>
            <Field label="Ingredients (one per line: qty unit name)">
              <textarea value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })}
                rows={4} placeholder={"200 g chicken breast\n2 tbsp soy sauce"}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <Field label="Steps (one per line)">
              <textarea value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })}
                rows={4} placeholder={"Slice chicken\nHeat pan..."}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <Btn onClick={handleSubmit} fullWidth>Save Recipe</Btn>
          </div>
        </BottomSheet>
      )}

      {showAI && (
        <AISuggestModal onClose={() => setShowAI(false)} onAdd={handleAddAI} pantry={pantry} />
      )}
    </div>
  );
}
