import React, { useState } from 'react';
import { CATEGORIES, guessCategory } from '../data.js';
import { Icon, Btn, Field, inputStyle, Empty } from '../components/UI.jsx';

export default function PantryView({ pantry, setPantry }) {
  const [form, setForm] = useState({ name: '', qty: '', unit: 'whole', category: 'Produce' });
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setPantry(prev => [...prev, {
      id: Date.now(),
      name: form.name.trim(),
      qty: parseFloat(form.qty) || 1,
      unit: form.unit,
      category: form.category,
    }]);
    setForm({ name: '', qty: '', unit: 'whole', category: 'Produce' });
    setShowForm(false);
  };

  const handleDelete = (id) => setPantry(prev => prev.filter(p => p.id !== id));

  const byCategory = {};
  pantry.forEach(p => {
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
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
            background: 'var(--accent)', color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 14,
          }}
        >
          <Icon name="plus" size={15} /> Add
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <div className="fade-in" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 18, marginBottom: 20,
        }}>
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
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn onClick={() => setShowForm(false)} variant="ghost" fullWidth>Cancel</Btn>
            <Btn onClick={handleAdd} fullWidth>Add Item</Btn>
          </div>
        </div>
      )}

      {pantry.length === 0
        ? <Empty emoji="📦" title="Pantry is empty" subtitle="Add ingredients to auto-subtract them from your grocery list." />
        : CATEGORIES.filter(cat => byCategory[cat]).map(cat => (
          <div key={cat} style={{ marginBottom: 22 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text3)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
            }}>{cat}</p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {byCategory[cat].map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', padding: '13px 16px',
                  borderBottom: i < byCategory[cat].length - 1 ? '1px solid var(--border)' : 'none',
                  gap: 12,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--accent-mid)', flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: 15 }}>{item.name}</span>
                  <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500, marginRight: 8 }}>
                    {item.qty} {item.unit}
                  </span>
                  <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--text3)', padding: 4 }}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  );
}
