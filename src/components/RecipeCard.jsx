import React, { useState } from 'react';
import { checkRecipe } from '../utils/dietaryCheck.js';
import { normaliseRecipe } from '../data.js';
import { Icon, Tag, MacroBar, inputStyle } from './UI.jsx';

// Scale ingredient quantity based on serving ratio
const scaleQty = (qty, ratio) => {
  const scaled = qty * ratio;
  return Number.isInteger(scaled) ? scaled : parseFloat(scaled.toFixed(2));
};

export default function RecipeCard({ recipe, onAddToMeal, onDelete, onEdit, compact, settings }) {
  const [expanded, setExpanded]   = useState(false);
  const [editing, setEditing]     = useState(false);
  const [tagInput, setTagInput]   = useState('');

  // Edit form state — initialised from recipe
  const [form, setForm] = useState({
    name: recipe.name,
    servings: recipe.servings,
    tags: [...(recipe.tags || [])],
  });

  const { hasIssue, allergens, avoided, dietaryFlags } = checkRecipe(recipe, settings);

  // Serving ratio for scaling ingredients
  const ratio = form.servings / (recipe.servings || 1);

  const handleSave = () => {
    if (!form.name.trim() || !onEdit) return;
    const updated = normaliseRecipe({
      ...recipe,
      name: form.name.trim(),
      servings: Number(form.servings) || recipe.servings,
      tags: form.tags,
      // Scale ingredients by new serving ratio
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        qty: scaleQty(ing.qty, Number(form.servings) / (recipe.servings || 1)),
      })),
      // Scale nutrition per serving
      calories: Math.round(recipe.calories * (Number(form.servings) / (recipe.servings || 1))),
      protein:  Math.round(recipe.protein  * (Number(form.servings) / (recipe.servings || 1))),
      carbs:    Math.round(recipe.carbs    * (Number(form.servings) / (recipe.servings || 1))),
      fat:      Math.round(recipe.fat      * (Number(form.servings) / (recipe.servings || 1))),
      sugar:    Math.round((recipe.sugar||0) * (Number(form.servings) / (recipe.servings || 1))),
    });
    onEdit(updated);
    setEditing(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hasIssue ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: compact ? '12px 14px' : '16px',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Dietary warning */}
      {hasIssue && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10, padding:'7px 10px', background:'var(--red-light)', borderRadius:8 }}>
          <span style={{ fontSize:11, color:'var(--red)', marginRight:2 }}>⚠</span>
          {allergens.map(a => <span key={a} style={{ fontSize:11, color:'var(--red)', fontWeight:600, background:'rgba(192,57,43,0.12)', borderRadius:4, padding:'1px 6px' }}>Allergen: {a}</span>)}
          {avoided.map(a => <span key={a} style={{ fontSize:11, color:'var(--amber)', fontWeight:600, background:'rgba(184,110,0,0.1)', borderRadius:4, padding:'1px 6px' }}>Avoid: {a}</span>)}
          {dietaryFlags.map(f => <span key={f} style={{ fontSize:11, color:'var(--amber)', fontWeight:600, background:'rgba(184,110,0,0.1)', borderRadius:4, padding:'1px 6px' }}>{f}</span>)}
        </div>
      )}

      {/* Edit mode */}
      {editing ? (
        <div>
          {/* Name */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:4 }}>Recipe name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ ...inputStyle, fontSize:15 }} />
          </div>

          {/* Servings with live preview */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:4 }}>Servings</label>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => setForm(f => ({ ...f, servings: Math.max(1, Number(f.servings) - 1) }))}
                style={{ width:36, height:36, borderRadius:10, background:'var(--surface2)', fontSize:20, color:'var(--text)', border:'1px solid var(--border)', flexShrink:0 }}>−</button>
              <input type="number" value={form.servings} onChange={e => setForm(f => ({ ...f, servings: e.target.value }))}
                style={{ ...inputStyle, textAlign:'center', width:70 }} />
              <button onClick={() => setForm(f => ({ ...f, servings: Number(f.servings) + 1 }))}
                style={{ width:36, height:36, borderRadius:10, background:'var(--surface2)', fontSize:20, color:'var(--text)', border:'1px solid var(--border)', flexShrink:0 }}>+</button>
              {ratio !== 1 && (
                <span style={{ fontSize:12, color:'var(--text3)' }}>
                  Ingredients scaled ×{ratio.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Ingredients preview scaled */}
          {ratio !== 1 && (
            <div style={{ marginBottom:12, background:'var(--surface2)', borderRadius:10, padding:'10px 12px' }}>
              <p style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Adjusted ingredients</p>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text2)', padding:'2px 0' }}>
                  <span>{ing.name}</span>
                  <span style={{ color:'var(--accent)', fontWeight:500 }}>{scaleQty(ing.qty, ratio)} {ing.unit}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:6 }}>Tags</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
              {form.tags.map(t => (
                <div key={t} style={{ display:'flex', alignItems:'center', gap:4, background:'var(--accent-light)', color:'var(--accent)', borderRadius:20, padding:'4px 10px', fontSize:12, fontWeight:500 }}>
                  {t}
                  <button onClick={() => removeTag(t)} style={{ color:'var(--accent)', opacity:0.7, lineHeight:1, display:'flex' }}>
                    <Icon name="x" size={11} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag and press Enter"
                style={{ ...inputStyle, flex:1, fontSize:13 }} />
              <button onClick={addTag}
                style={{ padding:'0 14px', borderRadius:10, background:'var(--accent-light)', color:'var(--accent)', fontWeight:600, fontSize:13 }}>
                Add
              </button>
            </div>
          </div>

          {/* Save / Cancel */}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { setEditing(false); setForm({ name: recipe.name, servings: recipe.servings, tags: [...(recipe.tags||[])] }); }}
              style={{ flex:1, padding:'10px', borderRadius:12, border:'1.5px solid var(--border)', fontWeight:600, fontSize:14, background:'var(--surface)' }}>
              Cancel
            </button>
            <button onClick={handleSave}
              style={{ flex:2, padding:'10px', borderRadius:12, background:'var(--accent)', color:'#fff', fontWeight:600, fontSize:14, border:'none' }}>
              Save changes
            </button>
          </div>
        </div>
      ) : (
        /* Normal view */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: compact ? 15 : 17, marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>
                {recipe.name}
              </h3>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="clock" size={12} /> {recipe.prepTime + recipe.cookTime} min
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="users" size={12} /> {recipe.servings} servings
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {recipe.tags.slice(0, 4).map(t => <Tag key={t} label={t} />)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {onAddToMeal && (
                <button onClick={() => onAddToMeal(recipe)}
                  style={{ width:36, height:36, borderRadius:10, background:'var(--accent-light)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name="plus" size={16} />
                </button>
              )}
              {onEdit && (
                <button onClick={() => setEditing(true)}
                  style={{ width:36, height:36, borderRadius:10, background:'var(--surface2)', color:'var(--text2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(recipe.id)}
                  style={{ width:36, height:36, borderRadius:10, background:'var(--surface2)', color:'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name="trash" size={14} />
                </button>
              )}
            </div>
          </div>

          {!compact && (
            <>
              <MacroBar recipe={recipe} />
              <button onClick={() => setExpanded(!expanded)}
                style={{ marginTop:12, fontSize:13, color:'var(--accent)', display:'flex', alignItems:'center', gap:4 }}>
                {expanded ? 'Hide details' : 'View recipe'}
                <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
              </button>
              {expanded && (
                <div className="fade-in" style={{ marginTop:12, fontSize:14 }}>
                  <p style={{ fontWeight:600, marginBottom:8, color:'var(--text)' }}>Ingredients</p>
                  <ul style={{ listStyle:'none', marginBottom:14 }}>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} style={{ padding:'3px 0', color:'var(--text2)', display:'flex', gap:8 }}>
                        <span style={{ color:'var(--accent-mid)', fontSize:12, marginTop:2 }}>●</span>
                        {ing.qty} {ing.unit} {ing.name}
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontWeight:600, marginBottom:8, color:'var(--text)' }}>Steps</p>
                  <ol style={{ paddingLeft:18 }}>
                    {recipe.steps.map((s, i) => (
                      <li key={i} style={{ marginBottom:6, color:'var(--text2)' }}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
