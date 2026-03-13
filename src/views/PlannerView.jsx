import React, { useState } from 'react';
import { DAYS, MEAL_TYPES, MEAL_TYPE_COLORS } from '../data.js';
import { Icon, Empty, Btn } from '../components/UI.jsx';
import RecipeCard from '../components/RecipeCard.jsx';

export default function PlannerView({ mealPlan, recipes, onRemoveMeal, onAddRecipeToMeal }) {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [pickingFor, setPickingFor] = useState(null); // mealType string

  const getMeal = (day, type) => {
    const id = mealPlan[`${day}_${type}`];
    return id ? recipes.find(r => r.id === id) : null;
  };

  const dayCalories = (day) =>
    MEAL_TYPES.reduce((sum, type) => sum + (getMeal(day, type)?.calories || 0), 0);

  const todayIdx = new Date().getDay();
  const todayName = DAYS[(todayIdx + 6) % 7]; // Mon=0

  return (
    <div>
      {/* Day selector */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
        marginBottom: 20, scrollbarWidth: 'none',
      }}>
        {DAYS.map(day => {
          const cal = dayCalories(day);
          const isToday = day === todayName;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '8px 12px', borderRadius: 14, minWidth: 56,
                background: isSelected ? 'var(--accent)' : isToday ? 'var(--accent-light)' : 'var(--surface)',
                color: isSelected ? '#fff' : isToday ? 'var(--accent)' : 'var(--text2)',
                border: `1.5px solid ${isSelected ? 'var(--accent)' : isToday ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, opacity: 0.7 }}>
                {day.slice(0, 3).toUpperCase()}
              </span>
              <span style={{ fontSize: 10, opacity: 0.65 }}>{cal > 0 ? cal : '—'}</span>
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 24 }}>{selectedDay}</h2>
          {dayCalories(selectedDay) > 0 && (
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{dayCalories(selectedDay)} kcal planned</p>
          )}
        </div>
      </div>

      {/* Meal slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MEAL_TYPES.map(type => {
          const meal = getMeal(selectedDay, type);
          const { color, bg } = MEAL_TYPE_COLORS[type];
          return (
            <div key={type}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: bg, color,
                }}>{type}</span>
              </div>
              {meal ? (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    background: bg, borderRadius: 14, padding: '12px 14px',
                    border: `1px solid ${color}22`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15, color, fontFamily: 'Playfair Display, serif' }}>{meal.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                          {meal.calories} kcal · {meal.prepTime + meal.cookTime} min
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveMeal(`${selectedDay}_${type}`)}
                        style={{
                          width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text3)',
                        }}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPickingFor(type)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    border: '2px dashed var(--border2)', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, fontSize: 14, color: 'var(--text3)',
                  }}
                >
                  <Icon name="plus" size={14} /> Add {type}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Pick recipe sheet */}
      {pickingFor && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 200, display: 'flex', alignItems: 'flex-end',
          }}
          onClick={e => { if (e.target === e.currentTarget) setPickingFor(null); }}
        >
          <div className="slide-up" style={{
            background: 'var(--surface)', width: '100%',
            borderRadius: '20px 20px 0 0', maxHeight: '80dvh',
            display: 'flex', flexDirection: 'column',
            paddingBottom: 'calc(var(--safe-bottom) + 16px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 14px' }}>
              <h2 style={{ fontSize: 18 }}>Add {pickingFor} · {selectedDay}</h2>
              <button onClick={() => setPickingFor(null)} style={{ padding: 6, color: 'var(--text2)' }}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recipes.length === 0
                ? <Empty emoji="📖" title="No recipes yet" subtitle="Add some recipes first." />
                : recipes.map(r => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', gap: 10,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 15, fontFamily: 'Playfair Display, serif' }}>{r.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                        {r.calories} kcal · {r.prepTime + r.cookTime} min
                      </p>
                    </div>
                    <Btn
                      onClick={() => { onAddRecipeToMeal(`${selectedDay}_${pickingFor}`, r.id); setPickingFor(null); }}
                      size="sm"
                    >Add</Btn>
                  </div>
                ))
              }
              <div style={{ height: 16 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
