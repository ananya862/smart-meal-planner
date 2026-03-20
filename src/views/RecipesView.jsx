import React, { useState } from 'react';
import RecipeCard from '../components/RecipeCard.jsx';
import { normaliseRecipe } from '../data.js';
import AISuggestModal from '../components/AISuggestModal.jsx';
import ImportRecipeModal from '../components/ImportRecipeModal.jsx';
import { Icon, Btn, Field, inputStyle, BottomSheet, Empty, Tag } from '../components/UI.jsx';

const BLANK_FORM = {
  name: '', servings: 2, prepTime: 10, cookTime: 20, tags: '',
  calories: 400, protein: 30, carbs: 40, fat: 15, sugar: 10,
  ingredients: '', steps: '',
};

export default function RecipesView({ recipes, setRecipes, pantry, settings }) {
  const [showAI, setShowAI] = useState(false);
  const [showImport, setShowImport] = useState(false);
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
    setRecipes(prev => [normaliseRecipe(recipe), ...prev]);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const recipe = {
      id: Date.now(),
      name: form.name.trim(),
      servings: +form.servings || 2,
      prepTime: +form.prepTime || 10,
      cookTime: +form.cookTime || 20,
      tags: form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      calories: +form.calories || 400,
      protein: +form.protein || 20,
      carbs: +form.carbs || 40,
      fat: +form.fat || 15,
      sugar: +form.sugar || 0,
      ingredients: form.ingredients.split('\n').filter(Boolean).map(line => {
        const parts = line.trim().split(' ');
        return { qty: parseFloat(parts[0]) || 1, unit: parts[1] || '', name: parts.slice(2).join(' ') };
      }),
      steps: form.steps.split('\n').filter(Boolean),
    };
    setRecipes(prev => [normaliseRecipe(recipe), ...prev]);
    setShowForm(false);
    setForm(BLANK_FORM);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 26 }}>Recipes</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{recipes.length} saved</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
            onClick={() => setShowImport(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: 12,
              fontWeight: 600, fontSize: 13,
            }}
          >
            <Icon name="import" size={14} /> Import
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
          : filtered.map(r => <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} settings={settings} />)
        }
      </div>

      {/* Add Recipe popup */}
      {showForm && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:300, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'60px 16px 16px' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setForm(BLANK_FORM); } }}
        >
          <div className="slide-up" style={{
            background:'var(--surface)', borderRadius:20, width:'100%', maxWidth:520,
            maxHeight:'88dvh', display:'flex', flexDirection:'column', boxShadow:'0 8px 40px rgba(0,0,0,0.18)',
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' }}>
              <h2 style={{ fontSize:20 }}>New Recipe</h2>
              <button onClick={() => { setShowForm(false); setForm(BLANK_FORM); }}
                style={{ width:32, height:32, borderRadius:'50%', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            {/* Scrollable content */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
              <Field label="Recipe name">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Chicken Stir Fry" style={inputStyle} />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['Servings','servings'],['Prep time (min)','prepTime'],['Cook time (min)','cookTime'],['Calories','calories'],['Protein (g)','protein'],['Carbs (g)','carbs'],['Fat (g)','fat'],['Sugar (g)','sugar']].map(([label, key]) => (
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
                  rows={3} placeholder={"200 g chicken breast\n2 tbsp soy sauce"}
                  style={{ ...inputStyle, resize: 'none' }} />
              </Field>
              <Field label="Steps (one per line)">
                <textarea value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })}
                  rows={3} placeholder={"Slice chicken\nHeat pan..."}
                  style={{ ...inputStyle, resize: 'none' }} />
              </Field>
            </div>
            {/* Sticky footer */}
            <div style={{ padding:'12px 20px 20px', borderTop:'1px solid var(--border)' }}>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => { setShowForm(false); setForm(BLANK_FORM); }}
                  style={{ flex:1, padding:'12px', borderRadius:12, border:'1.5px solid var(--border)', fontWeight:600, fontSize:14, background:'var(--surface)' }}>
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  style={{ flex:2, padding:'12px', borderRadius:12, background:'var(--accent)', color:'#fff', fontWeight:600, fontSize:14, border:'none' }}>
                  Save Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAI && (
        <AISuggestModal onClose={() => setShowAI(false)} onAdd={handleAddAI} pantry={pantry} />
      )}
      {showImport && (
        <ImportRecipeModal onClose={() => setShowImport(false)} onAdd={(recipe) => { handleAddAI(recipe); setShowImport(false); }} />
      )}
    </div>
  );
}
