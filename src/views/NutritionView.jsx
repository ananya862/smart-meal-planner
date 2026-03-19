import React from 'react';
import { DAYS, MEAL_TYPES, slotIds } from '../data.js';
import { Empty } from '../components/UI.jsx';

export default function NutritionView({ mealPlan, recipes, activeMealTypes }) {
  const weeklyData = DAYS.map(day => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };
    const activeTypes = activeMealTypes || MEAL_TYPES;
    activeTypes.forEach(type => {
      slotIds(mealPlan[`${day}_${type}`]).forEach(id => {
        const r = recipes.find(x => x.id === id);
        if (r) {
          totals.calories += r.calories;
          totals.protein  += r.protein;
          totals.carbs    += r.carbs;
          totals.fat      += r.fat;
          totals.sugar    += r.sugar || 0;
        }
      });
    });
    return { day: day.slice(0, 3), ...totals };
  });

  const totalMeals = Object.keys(mealPlan).length;
  if (totalMeals === 0) {
    return (
      <div>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>Nutrition</h2>
        <Empty emoji="🥗" title="No meals planned" subtitle="Add meals to your planner to see nutrition data." />
      </div>
    );
  }

  const daysWithData = weeklyData.filter(d => d.calories > 0);
  const avg = daysWithData.length > 0 ? {
    calories: Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / daysWithData.length),
    protein:  Math.round(daysWithData.reduce((s, d) => s + d.protein,  0) / daysWithData.length),
    carbs:    Math.round(daysWithData.reduce((s, d) => s + d.carbs,    0) / daysWithData.length),
    fat:      Math.round(daysWithData.reduce((s, d) => s + d.fat,      0) / daysWithData.length),
    sugar:    Math.round(daysWithData.reduce((s, d) => s + d.sugar,    0) / daysWithData.length),
  } : { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };

  const maxCal = Math.max(...weeklyData.map(d => d.calories), 1);

  // WHO recommended daily sugar limit: 25g
  const SUGAR_LIMIT = 25;

  const stats = [
    { label: 'Avg Calories', value: avg.calories,        unit: 'kcal/day', color: 'var(--amber)',      bg: 'var(--amber-light)' },
    { label: 'Avg Protein',  value: avg.protein + 'g',   unit: '/day',     color: 'var(--blue)',        bg: 'var(--blue-light)'  },
    { label: 'Avg Carbs',    value: avg.carbs + 'g',     unit: '/day',     color: 'var(--accent-mid)',  bg: 'var(--accent-light)'},
    { label: 'Avg Fat',      value: avg.fat + 'g',       unit: '/day',     color: 'var(--red)',         bg: 'var(--red-light)'   },
    { label: 'Avg Sugar',    value: avg.sugar + 'g',     unit: '/day',     color: avg.sugar > SUGAR_LIMIT ? 'var(--red)' : 'var(--accent-mid)', bg: avg.sugar > SUGAR_LIMIT ? 'var(--red-light)' : 'var(--accent-light)' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 26, marginBottom: 4 }}>Nutrition</h2>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
        Based on {daysWithData.length} days planned
      </p>

      {/* Stat cards — 2 col grid, sugar gets full width on last row if odd */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 16, padding: '16px',
            border: `1px solid ${s.color}22`,
            gridColumn: i === 4 ? '1 / -1' : 'auto',
          }}>
            <p style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
              {i === 4 && avg.sugar > SUGAR_LIMIT && (
                <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>
                  ⚠ above {SUGAR_LIMIT}g recommended limit
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: s.color, opacity: 0.7 }}>{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Calorie bar chart */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '18px 16px', marginBottom: 16,
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>Daily Calories</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {weeklyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {d.calories > 0 && (
                <span style={{ fontSize: 9, color: 'var(--text3)' }}>{d.calories}</span>
              )}
              <div style={{
                width: '100%', borderRadius: '5px 5px 0 0',
                background: d.calories > 0 ? 'var(--accent)' : 'var(--surface2)',
                height: d.calories > 0 ? `${(d.calories / maxCal) * 90}px` : 4,
                minHeight: 4, transition: 'height 0.4s ease',
              }} />
              <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 500 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Macro breakdown table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Macro Breakdown</p>
        </div>
        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr 1fr 1fr',
          padding: '8px 16px', gap: 6,
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface2)',
        }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Day</span>
          <span style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600, textAlign: 'center' }}>Cal</span>
          <span style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 600, textAlign: 'center' }}>Protein</span>
          <span style={{ fontSize: 10, color: 'var(--accent-mid)', fontWeight: 600, textAlign: 'center' }}>Carbs</span>
          <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600, textAlign: 'center' }}>Fat</span>
          <span style={{ fontSize: 10, color: 'var(--accent-mid)', fontWeight: 600, textAlign: 'center' }}>Sugar</span>
        </div>
        {weeklyData.map((d, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr 1fr 1fr',
            padding: '10px 16px', gap: 6, alignItems: 'center',
            borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
            background: d.calories === 0 ? 'var(--surface2)' : 'var(--surface)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: d.calories === 0 ? 'var(--text3)' : 'var(--text)' }}>{d.day}</span>
            <span style={{ fontSize: 12, color: 'var(--amber)', textAlign: 'center' }}>{d.calories || '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--blue)', textAlign: 'center' }}>{d.protein ? d.protein + 'g' : '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--accent-mid)', textAlign: 'center' }}>{d.carbs ? d.carbs + 'g' : '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>{d.fat ? d.fat + 'g' : '—'}</span>
            <span style={{ fontSize: 12, color: d.sugar > SUGAR_LIMIT ? 'var(--red)' : 'var(--accent-mid)', textAlign: 'center', fontWeight: d.sugar > SUGAR_LIMIT ? 600 : 400 }}>
              {d.sugar ? d.sugar + 'g' : '—'}
            </span>
          </div>
        ))}
        {/* Avg row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr 1fr 1fr',
          padding: '10px 16px', gap: 6, background: 'var(--surface2)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Avg</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textAlign: 'center' }}>{avg.calories}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textAlign: 'center' }}>{avg.protein}g</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-mid)', textAlign: 'center' }}>{avg.carbs}g</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textAlign: 'center' }}>{avg.fat}g</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: avg.sugar > SUGAR_LIMIT ? 'var(--red)' : 'var(--accent-mid)', textAlign: 'center' }}>{avg.sugar}g</span>
        </div>
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}
