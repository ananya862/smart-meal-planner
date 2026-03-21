import React, { useState } from 'react';
import { CATEGORIES, guessCategory } from '../data.js';
import { Icon, Field, inputStyle, Empty } from '../components/UI.jsx';

const BLANK_FORM = {
  name: '', qty: '', unit: 'whole', category: 'Produce',
  calories: '', protein: '', carbs: '', fat: '', sugar: '',
};

const toForm = (item) => ({
  name: item.name,
  qty: String(item.qty),
  unit: item.unit,
  category: item.category,
  calories: item.nutrition?.calories ?? '',
  protein:  item.nutrition?.protein  ?? '',
  carbs:    item.nutrition?.carbs    ?? '',
  fat:      item.nutrition?.fat      ?? '',
  sugar:    item.nutrition?.sugar    ?? '',
});

const NutritionFields = ({ form, setForm }) => {
  const fields = [
    ['Calories', 'calories', 'var(--amber)'],
    ['Protein (g)', 'protein', 'var(--blue)'],
    ['Carbs (g)', 'carbs', 'var(--accent-mid)'],
    ['Fat (g)', 'fat', 'var(--red)'],
    ['Sugar (g)', 'sugar', 'var(--accent-mid)'],
  ];
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 14px 6px', marginBottom: 14 }}>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Per serving / per {form.unit || 'unit'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {fields.map(([label, key, color]) => (
          <Field key={key} label={label}>
            <input type="number" value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder="0"
              style={{ ...inputStyle, borderColor: form[key] ? color : undefined }}
            />
          </Field>
        ))}
      </div>
    </div>
  );
};

const ItemForm = ({ initial, onSave, onCancel, title }) => {
  const [form, setForm] = useState(initial);
  const [showNutrition, setShowNutrition] = useState(
    Object.keys(initial).some(k => ['calories','protein','carbs','fat','sugar'].includes(k) && initial[k] !== '')
  );

  const handleSave = () => {
    if (!form.name.trim()) return;
    const item = {
      name: form.name.trim(),
      qty: parseFloat(form.qty) || 1,
      unit: form.unit,
      category: form.category || guessCategory(form.name),
    };
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
    onSave(item);
  };

  return (
    <div className="fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>{title}</h3>

      <Field label="Item name">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Eggs" style={inputStyle} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Quantity">
          <input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
            placeholder="6" style={inputStyle} />
        </Field>
        <Field label="Unit">
          <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            placeholder="whole, g, ml..." style={inputStyle} />
        </Field>
      </div>

      <Field label="Category">
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          style={inputStyle}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>

      {/* Nutrition toggle */}
      <button
        onClick={() => setShowNutrition(!showNutrition)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          padding: '10px 14px', borderRadius: 10, marginBottom: showNutrition ? 12 : 14, cursor: 'pointer',
          background: showNutrition ? 'var(--accent-light)' : 'var(--surface2)',
          border: `1px solid ${showNutrition ? 'var(--accent)' : 'var(--border)'}`,
          color: showNutrition ? 'var(--accent)' : 'var(--text2)',
          fontSize: 13, fontWeight: 500,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {showNutrition ? 'Hide nutrition info' : 'Add / edit nutrition info'}
        <span style={{ marginLeft: 'auto' }}><Icon name={showNutrition ? 'chevronDown' : 'chevronRight'} size={14} /></span>
      </button>

      {showNutrition && <NutritionFields form={form} setForm={setForm} />}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel}
          style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--border)', fontWeight: 600, fontSize: 14, background: 'var(--surface)' }}>
          Cancel
        </button>
        <button onClick={handleSave}
          style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14 }}>
          Save
        </button>
      </div>
    </div>
  );
};

export default function PantryView({ pantry, setPantry }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [search, setSearch]           = useState('');

  const handleAdd = (item) => {
    setPantry(prev => [...prev, { id: Date.now(), ...item }]);
    setShowAddForm(false);
  };

  const handleEdit = (item) => {
    setPantry(prev => prev.map(p => p.id === editingId ? { ...p, ...item } : p));
    setEditingId(null);
  };

  const handleDelete = (id) => setPantry(prev => prev.filter(p => p.id !== id));

  const byCategory = {};
  const q = search.toLowerCase().trim();
  pantry.filter(p => !q || p.name.toLowerCase().includes(q)).forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>Pantry</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{pantry.length} items tracked</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--accent)', color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 14 }}
        >
          <Icon name="plus" size={15} /> Add
        </button>
      </div>

      {/* Search */}
      {pantry.length > 0 && (
        <div style={{ position:'relative', marginBottom:16 }}>
          <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pantry..."
            style={{ width:'100%', padding:'9px 12px 9px 34px', borderRadius:12, border:'1px solid var(--border)', background:'var(--surface2)', fontSize:14, boxSizing:'border-box' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <ItemForm
          initial={BLANK_FORM}
          title="Add pantry item"
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Pantry list */}
      {pantry.length === 0
        ? <Empty emoji="📦" title="Pantry is empty" subtitle="Add ingredients to auto-subtract them from your grocery list." />
        : CATEGORIES.filter(cat => byCategory[cat]).map(cat => (
          <div key={cat} style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{cat}</p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {byCategory[cat].map((item, i) => (
                <div key={item.id}>
                  {/* Edit form inline */}
                  {editingId === item.id ? (
                    <div style={{ padding: '12px 16px', borderBottom: i < byCategory[cat].length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <ItemForm
                        initial={toForm(item)}
                        title={`Edit ${item.name}`}
                        onSave={handleEdit}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: i < byCategory[cat].length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                    }}
                      onClick={() => { setEditingId(item.id); setShowAddForm(false); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-mid)', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 15 }}>{item.name}</span>
                        <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>
                          {item.qty} {item.unit}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>›</span>
                        <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                          style={{ color: 'var(--text3)', padding: '4px 6px' }}>
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                      {/* Nutrition badges */}
                      {item.nutrition && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, marginLeft: 20, flexWrap: 'wrap' }}>
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
