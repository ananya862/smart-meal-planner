import React, { useState } from 'react';
import { CATEGORIES } from '../data.js';
import { Icon, Btn, Field, inputStyle, Empty } from '../components/UI.jsx';

const BLANK_FORM = {
  name: '', qty: '', unit: 'whole', category: 'Produce',
  calories: '', protein: '', carbs: '', fat: '', sugar: '',
};

export default function PantryView({ pantry, setPantry }) {
  const [form, setForm]         = useState(BLANK_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const item = {
      id: Date.now(),
      name: form.name.trim(),
      qty: parseFloat(form.qty) || 1,
      unit: form.unit,
      category: form.category,
    };
    // Only add nutrition if at least one value is filled
    const hasNutrition = ['calories','protein','carbs','fat','sugar'].some(k => form[k] !== '');
    if (hasNutrition) {
      item.nutrition = {
        calories: parseFloat(form.calories) || 0,
        protein:  parseFloat(form.protein)  || 0,
        carbs:    parseFloat(form.carbs)    || 0,
        fat:      parseFloat(form.fat)      || 0,
        sugar:    parseFloat(form.sugar)    || 0,
      };
    }
    setPantry(prev => [...prev, item]);
    setForm(BLANK_FORM);
    setShowForm(false);
    setShowNutrition(false);
  };

  const handleDelete = (id) => setPantry(prev => prev.filter(p => p.id !== id));

  const byCategory = {};
  pantry.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  const nutritionFields = [
    ['Calories', 'calories', 'var(--amber)'],
    ['Protein (g)', 'protein', 'var(--blue)'],
    ['Carbs (g)', 'carbs', 'var(--accent-mid)'],
    ['Fat (g)', 'fat', 'var(--red)'],
    ['Sugar (g)', 'sugar', 'var(--accent-mid)'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>Pantry</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{pantry.length} items tracked</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setShowNutrition(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--accent)', color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 14 }}
        >
          <Icon name="plus" size={15} /> Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Add pantry item</h3>

          <Field label="Item name">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Eggs" style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Quantity">
              <input type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })}
                placeholder="6" style={inputStyle} />
            </Field>
            <Field label="Unit">
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                placeholder="whole, g, ml..." style={inputStyle} />
            </Field>
          </div>

          <Field label="Category">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ ...inputStyle }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          {/* Advanced nutrition toggle */}
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              padding: '10px 14px', borderRadius: 10, marginBottom: showNutrition ? 12 : 16,
              background: showNutrition ? 'var(--accent-light)' : 'var(--surface2)',
              border: `1px solid ${showNutrition ? 'var(--accent)' : 'var(--border)'}`,
              color: showNutrition ? 'var(--accent)' : 'var(--text2)',
              fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {showNutrition ? 'Hide nutrition info' : 'Add nutrition info (optional)'}
            <span style={{ marginLeft: 'auto' }}>
              <Icon name={showNutrition ? 'chevronDown' : 'chevronRight'} size={14} />
            </span>
          </button>

          {/* Nutrition fields */}
          {showNutrition && (
            <div className="fade-in" style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 14px 6px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Per serving / per {form.unit || 'unit'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {nutritionFields.map(([label, key, color]) => (
                  <Field key={key} label={label}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        placeholder="0"
                        style={{ ...inputStyle, paddingLeft: 10, borderColor: form[key] ? color : undefined }}
                      />
                      {form[key] && (
                        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: color }} />
                      )}
                    </div>
                  </Field>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => { setShowForm(false); setShowNutrition(false); setForm(BLANK_FORM); }} variant="ghost" fullWidth>Cancel</Btn>
            <Btn onClick={handleAdd} fullWidth>Add Item</Btn>
          </div>
        </div>
      )}

      {/* Pantry list */}
      {pantry.length === 0
        ? <Empty emoji="📦" title="Pantry is empty" subtitle="Add ingredients to auto-subtract them from your grocery list." />
        : CATEGORIES.filter(cat => byCategory[cat]).map(cat => (
          <div key={cat} style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{cat}</p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {byCategory[cat].map((item, i) => (
                <div key={item.id} style={{
                  padding: '12px 16px',
                  borderBottom: i < byCategory[cat].length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-mid)', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 15 }}>{item.name}</span>
                    <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500, marginRight: 8 }}>
                      {item.qty} {item.unit}
                    </span>
                    <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--text3)', padding: 4 }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                  {/* Show nutrition if present */}
                  {item.nutrition && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, marginLeft: 20, flexWrap: 'wrap' }}>
                      {[
                        ['Cal', item.nutrition.calories, 'var(--amber)'],
                        ['P', item.nutrition.protein + 'g', 'var(--blue)'],
                        ['C', item.nutrition.carbs + 'g', 'var(--accent-mid)'],
                        ['F', item.nutrition.fat + 'g', 'var(--red)'],
                        ...(item.nutrition.sugar ? [['S', item.nutrition.sugar + 'g', 'var(--accent-mid)']] : []),
                      ].map(([k, v, color]) => (
                        <span key={k} style={{ fontSize: 11, color, fontWeight: 600, background: 'var(--surface2)', borderRadius: 6, padding: '2px 7px' }}>
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  );
}
