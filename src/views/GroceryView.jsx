import React, { useState, useMemo } from 'react';
import { CATEGORIES, guessCategory } from '../data.js';
import { Icon, Btn, Empty } from '../components/UI.jsx';

export default function GroceryView({ mealPlan, recipes, pantry }) {
  const [checked, setChecked] = useState({});

  const groceryList = useMemo(() => {
    const needed = {};
    Object.values(mealPlan).forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      recipe.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase().trim();
        if (!needed[key]) {
          needed[key] = { name: ing.name, qty: 0, unit: ing.unit, category: guessCategory(ing.name) };
        }
        needed[key].qty += Number(ing.qty) || 0;
      });
    });
    // subtract pantry
    const list = {};
    Object.entries(needed).forEach(([key, item]) => {
      const pantryItem = pantry.find(p => p.name.toLowerCase() === key);
      const pantryQty = pantryItem ? parseFloat(pantryItem.qty) : 0;
      const remaining = item.qty - pantryQty;
      if (remaining > 0) list[key] = { ...item, qty: remaining };
    });
    return list;
  }, [mealPlan, recipes, pantry]);

  const byCategory = useMemo(() => {
    const bc = {};
    Object.values(groceryList).forEach(item => {
      if (!bc[item.category]) bc[item.category] = [];
      bc[item.category].push(item);
    });
    return bc;
  }, [groceryList]);

  const total = Object.keys(groceryList).length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  if (total === 0) {
    return (
      <div>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>Grocery List</h2>
        <Empty emoji="🛒" title="Nothing to buy" subtitle="Plan some meals to auto-generate your grocery list." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>Grocery List</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
            {checkedCount}/{total} items checked
          </p>
        </div>
        {checkedCount > 0 && (
          <button
            onClick={() => setChecked({})}
            style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'underline', marginTop: 6 }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--border)', borderRadius: 20, height: 8, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          background: 'var(--accent)', height: '100%', borderRadius: 20,
          width: `${progress}%`, transition: 'width 0.4s ease',
        }} />
      </div>

      {progress === 100 && (
        <div style={{
          background: 'var(--accent-light)', border: '1px solid var(--accent)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--accent)', fontWeight: 500,
        }}>
          <Icon name="check" size={18} /> All items checked — happy shopping!
        </div>
      )}

      {/* Categories */}
      {CATEGORIES.filter(cat => byCategory[cat]).map(cat => (
        <div key={cat} style={{ marginBottom: 22 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
          }}>{cat}</p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            {byCategory[cat].map((item, i) => {
              const key = item.name.toLowerCase();
              const done = !!checked[key];
              return (
                <button
                  key={i}
                  onClick={() => toggle(key)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 16px', textAlign: 'left',
                    borderBottom: i < byCategory[cat].length - 1 ? '1px solid var(--border)' : 'none',
                    background: done ? 'var(--surface2)' : 'var(--surface)',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, transition: 'all 0.15s',
                    border: `2px solid ${done ? 'var(--accent)' : 'var(--border2)'}`,
                    background: done ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <Icon name="check" size={12} />}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 15,
                    color: done ? 'var(--text3)' : 'var(--text)',
                    textDecoration: done ? 'line-through' : 'none',
                  }}>{item.name}</span>
                  <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>
                    {Number.isInteger(item.qty) ? item.qty : item.qty.toFixed(1)} {item.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ height: 8 }} />
    </div>
  );
}
