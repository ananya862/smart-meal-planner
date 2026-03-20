import React, { useState, useEffect } from 'react';
import { DAYS, MEAL_TYPES, MEAL_TYPE_COLORS, slotIds } from '../data.js';
import { checkRecipe } from '../utils/dietaryCheck.js';
import { Icon, Empty } from '../components/UI.jsx';

export default function PlannerView({ mealPlan, recipes, onRemoveMeal, onAddRecipeToMeal, settings, activeMealTypes }) {
  const activeMT = activeMealTypes || MEAL_TYPES;

  // Reset servings when opening a new meal detail
  useEffect(() => {
    if (detailFor?.meal) setViewServings(detailFor.meal.servings || 1);
  }, [detailFor?.meal?.id]);

  // Sync generate dialog selection when active meal types change in settings
  useEffect(() => {
    setSelectedMealTypes(activeMT);
  }, [JSON.stringify(activeMT)]);

  const [view, setView]             = useState('calendar');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [pickingFor, setPickingFor]   = useState(null); // { day, type }
  const [detailFor, setDetailFor]     = useState(null); // { day, type, meal, index }
  const [viewServings, setViewServings] = useState(1);
  const [confirming, setConfirming]   = useState(false);
  const [applyDietary, setApplyDietary] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);

  const clearWeek = () => {
    DAYS.forEach(day => activeMT.forEach(type => onRemoveMeal(`${day}_${type}`)));
    setClearConfirm(false);
  };
  const [selectedMealTypes, setSelectedMealTypes] = useState(['Breakfast','Lunch','Dinner','Snack']);

  // Randomly generate a full week plan
  const GENERATED_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];
  const generateWeekPlan = () => {
    if (recipes.length === 0) return;
    // Filter out recipes that conflict with settings (only if applyDietary is on)
    const safeRecipes = applyDietary ? recipes.filter(r => !checkRecipe(r, settings).hasIssue) : recipes;
    const pool = safeRecipes.length > 0 ? safeRecipes : recipes;
    const newPlan = {};
    DAYS.forEach(day => {
      selectedMealTypes.forEach(type => {
        const preferred = pool.filter(r => r.tags.some(t => t.toLowerCase() === type.toLowerCase()));
        const typePool = preferred.length > 0 ? preferred : pool;
        const shuffled = [...typePool].sort(() => Math.random() - 0.5);
        newPlan[`${day}_${type}`] = [shuffled[0].id];
      });
    });
    DAYS.forEach(day => activeMT.forEach(type => onRemoveMeal(`${day}_${type}`)));
    Object.entries(newPlan).forEach(([key, val]) => onAddRecipeToMeal(key, val));
    setConfirming(false);
  };

  // Get array of meals for a slot
  const getMeals = (day, type) => {
    const ids = slotIds(mealPlan[`${day}_${type}`]);
    return ids.map(id => recipes.find(r => r.id === id)).filter(Boolean);
  };

  // Total calories for a slot
  const slotCalories = (day, type) =>
    getMeals(day, type).reduce((s, r) => s + r.calories, 0);

  const dayCalories = (day) =>
    activeMT.reduce((sum, type) => sum + slotCalories(day, type), 0);

  const todayIdx  = new Date().getDay();
  const todayName = DAYS[(todayIdx + 6) % 7];
  const DAY_SHORT = { Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed', Thursday:'Thu', Friday:'Fri', Saturday:'Sat', Sunday:'Sun' };

  const weekCalories = DAYS.reduce((sum, d) => sum + dayCalories(d), 0);
  const daysWithMeals = DAYS.filter(d => dayCalories(d) > 0).length;
  const avgCalories = daysWithMeals > 0 ? Math.round(weekCalories / daysWithMeals) : 0;
  const mealsCount   = Object.entries(mealPlan).reduce((sum, [key, v]) => {
    const type = key.split('_')[1];
    return activeMT.includes(type) ? sum + slotIds(v).length : sum;
  }, 0);

  // Add a recipe to a slot (append to array)
  const handleAdd = (day, type, recipeId) => {
    const key = `${day}_${type}`;
    const current = slotIds(mealPlan[key]);
    onAddRecipeToMeal(key, [...current, recipeId]);
    setPickingFor(null);
  };

  // Remove one recipe from a slot by index
  const handleRemoveOne = (day, type, index) => {
    const key = `${day}_${type}`;
    const current = slotIds(mealPlan[key]);
    const updated = current.filter((_, i) => i !== index);
    if (updated.length === 0) onRemoveMeal(key);
    else onAddRecipeToMeal(key, updated);
    setDetailFor(null);
  };

  // ── Recipe picker sheet ───────────────────────────────────────────────────
  const RecipePicker = () => pickingFor ? (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) setPickingFor(null); }}>
      <div className="slide-up" style={{
        background:'var(--surface)', width:'100%', borderRadius:'20px 20px 0 0',
        maxHeight:'80dvh', display:'flex', flexDirection:'column',
        paddingBottom:'calc(var(--nav-height) + var(--safe-bottom) + 16px)',
      }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'var(--border2)' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 20px 14px' }}>
          <div>
            <h2 style={{ fontSize:18 }}>Add to {pickingFor.type}</h2>
            <p style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>{pickingFor.day}</p>
          </div>
          <button onClick={() => setPickingFor(null)} style={{ padding:6, color:'var(--text2)' }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ overflowY:'auto', padding:'0 16px', display:'flex', flexDirection:'column', gap:10 }}>
          {recipes.length === 0
            ? <Empty emoji="📖" title="No recipes yet" subtitle="Add some recipes first." />
            : recipes.map(r => (
              <button key={r.id}
                onClick={() => handleAdd(pickingFor.day, pickingFor.type, r.id)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  border:'1px solid var(--border)', borderRadius:14, padding:'12px 14px',
                  background:'var(--surface)', textAlign:'left', width:'100%', gap:10,
                }}
              >
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:15, fontFamily:'Playfair Display, serif', color:'var(--text)' }}>{r.name}</p>
                  <p style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{r.calories} kcal · {r.prepTime + r.cookTime} min</p>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:6 }}>
                    {r.tags.slice(0,3).map(t => (
                      <span key={t} style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'var(--accent-light)', color:'var(--accent)', fontWeight:500 }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ width:32, height:32, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name="plus" size={16} />
                </div>
              </button>
            ))
          }
          <div style={{ height:16 }} />
        </div>
      </div>
    </div>
  ) : null;

  // ── Meal detail sheet ─────────────────────────────────────────────────────
  const MealDetail = () => detailFor ? (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) setDetailFor(null); }}>
      <div className="slide-up" style={{
        background:'var(--surface)', width:'100%', borderRadius:'20px 20px 0 0',
        maxHeight:'75dvh', display:'flex', flexDirection:'column',
        paddingBottom:'calc(var(--nav-height) + var(--safe-bottom) + 16px)',
      }}>
        {/* Fixed handle + header — stays visible when scrolling */}
        <div style={{ flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
            <div style={{ width:36, height:4, borderRadius:2, background:'var(--border2)' }} />
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', padding:'4px 20px 12px', borderBottom:'1px solid var(--border)', gap:10 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <span style={{
                fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, display:'inline-block', marginBottom:6,
                background: MEAL_TYPE_COLORS[detailFor.type].bg, color: MEAL_TYPE_COLORS[detailFor.type].color,
              }}>{detailFor.type} · {detailFor.day}</span>
              <h2 style={{ fontSize:19, fontFamily:'Playfair Display, serif', lineHeight:1.3 }}>{detailFor.meal.name}</h2>
            </div>
            <button onClick={() => setDetailFor(null)} style={{ width:32, height:32, borderRadius:'50%', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)', flexShrink:0, marginTop:2 }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 24px' }}>
          <div style={{ marginBottom:14 }}>
          {(() => {
            const { hasIssue, allergens, avoided, dietaryFlags } = checkRecipe(detailFor.meal, settings);
            return hasIssue ? (
              <div style={{ padding:'10px 12px', background:'var(--red-light)', borderRadius:10, marginBottom:14 }}>
                <p style={{ fontSize:12, color:'var(--red)', fontWeight:700, marginBottom:6 }}>⚠ Dietary conflict</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {allergens.map(a => <span key={a} style={{ fontSize:11, color:'var(--red)', fontWeight:600, background:'rgba(192,57,43,0.12)', borderRadius:4, padding:'2px 7px' }}>Allergen: {a}</span>)}
                  {avoided.map(a => <span key={a} style={{ fontSize:11, color:'var(--amber)', fontWeight:600, background:'rgba(184,110,0,0.1)', borderRadius:4, padding:'2px 7px' }}>Avoid: {a}</span>)}
                  {dietaryFlags.map(f => <span key={f} style={{ fontSize:11, color:'var(--amber)', fontWeight:600, background:'rgba(184,110,0,0.1)', borderRadius:4, padding:'2px 7px' }}>{f}</span>)}
                </div>
              </div>
            ) : null;
          })()}
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {[
              ['Calories', detailFor.meal.calories, 'var(--amber)'],
              ['Protein', detailFor.meal.protein+'g', 'var(--blue)'],
              ['Carbs', detailFor.meal.carbs+'g', 'var(--accent-mid)'],
              ['Fat', detailFor.meal.fat+'g', 'var(--red)'],
              ['Time', (detailFor.meal.prepTime+detailFor.meal.cookTime)+' min', 'var(--text2)'],
            ].map(([k,v,c]) => (
              <div key={k} style={{ background:'var(--surface2)', borderRadius:10, padding:'8px 12px', textAlign:'center', minWidth:56 }}>
                <p style={{ fontSize:15, fontWeight:700, color:c }}>{v}</p>
                <p style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{k}</p>
              </div>
            ))}
          </div>
          {/* Servings adjuster */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, background:'var(--surface2)', borderRadius:12, padding:'10px 14px' }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Servings</span>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => setViewServings(s => Math.max(1, s - 1))}
                style={{ width:30, height:30, borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', fontSize:18, color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
              <span style={{ fontSize:16, fontWeight:700, color:'var(--accent)', minWidth:24, textAlign:'center' }}>{viewServings}</span>
              <button onClick={() => setViewServings(s => s + 1)}
                style={{ width:30, height:30, borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', fontSize:18, color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
            </div>
          </div>

          {/* Ingredients scaled by servings */}
          {(detailFor.meal.ingredients||[]).length > 0 && (() => {
            const ratio = viewServings / (detailFor.meal.servings || 1);
            return (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:8 }}>
                  Ingredients
                  {ratio !== 1 && <span style={{ fontSize:11, color:'var(--accent)', marginLeft:6, fontWeight:400 }}>scaled for {viewServings} serving{viewServings !== 1 ? 's' : ''}</span>}
                </p>
                <div style={{ background:'var(--surface2)', borderRadius:12, padding:'10px 14px' }}>
                  {detailFor.meal.ingredients.map((ing, i) => {
                    const scaled = ing.qty * ratio;
                    const display = Number.isInteger(scaled) ? scaled : parseFloat(scaled.toFixed(2));
                    return (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom: i < detailFor.meal.ingredients.length-1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize:13, color:'var(--text2)' }}>{ing.name}</span>
                        <span style={{ fontSize:13, color: ratio !== 1 ? 'var(--accent)' : 'var(--text3)', fontWeight: ratio !== 1 ? 600 : 500 }}>{display} {ing.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Steps */}
          {(detailFor.meal.steps||[]).length > 0 && (
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:8 }}>Steps</p>
              <ol style={{ paddingLeft:18, margin:0 }}>
                {detailFor.meal.steps.map((step, i) => (
                  <li key={i} style={{ fontSize:13, color:'var(--text2)', marginBottom:6, lineHeight:1.5 }}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Tags */}
          {(detailFor.meal.tags||[]).length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
              {detailFor.meal.tags.map(t => (
                <span key={t} style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:'var(--accent-light)', color:'var(--accent)', fontWeight:500 }}>{t}</span>
              ))}
            </div>
          )}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => handleRemoveOne(detailFor.day, detailFor.type, detailFor.index)}
              style={{ flex:1, padding:'12px', borderRadius:12, background:'var(--red-light)', color:'var(--red)', fontWeight:600, fontSize:14, border:'none' }}
            >Remove</button>
            <button
              onClick={() => { setDetailFor(null); setPickingFor({ day: detailFor.day, type: detailFor.type }); }}
              style={{ flex:1, padding:'12px', borderRadius:12, background:'var(--accent)', color:'#fff', fontWeight:600, fontSize:14, border:'none' }}
            >Replace</button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // ── CALENDAR VIEW ─────────────────────────────────────────────────────────
  const CalendarView = () => (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        <div style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:12, color:'var(--text3)' }}>Meals planned</p>
          <p style={{ fontSize:18, fontWeight:700, color:'var(--accent)' }}>{mealsCount}</p>
        </div>
        <div style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:12, color:'var(--text3)' }}>Avg cal/day</p>
          <p style={{ fontSize:18, fontWeight:700, color:'var(--amber)' }}>{avgCalories.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch', marginLeft:-16, marginRight:-16, paddingLeft:16, paddingRight:16 }}>
        <div style={{ minWidth:540 }}>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'52px repeat(7, 1fr)', gap:3, marginBottom:3 }}>
            <div />
            {DAYS.map(day => {
              const isToday = day === todayName;
              const cal = dayCalories(day);
              return (
                <button key={day} onClick={() => { setSelectedDay(day); setView('day'); }}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'7px 2px', borderRadius:10, cursor:'pointer', background: isToday ? 'var(--accent)' : 'var(--surface)', border:`1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}` }}>
                  <span style={{ fontSize:9, fontWeight:700, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{DAY_SHORT[day]}</span>
                  <span style={{ fontSize:9, color: isToday ? 'rgba(255,255,255,0.85)' : 'var(--text3)', marginTop:2 }}>{cal > 0 ? cal : '·'}</span>
                </button>
              );
            })}
          </div>

          {/* Meal rows */}
          {activeMT.map(type => {
            const { color, bg } = MEAL_TYPE_COLORS[type];
            return (
              <div key={type} style={{ display:'grid', gridTemplateColumns:'52px repeat(7, 1fr)', gap:3, marginBottom:3 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, background:bg, minHeight:72 }}>
                  <span style={{ fontSize:8, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'0.06em', writingMode:'vertical-rl', transform:'rotate(180deg)' }}>{type}</span>
                </div>
                {DAYS.map(day => {
                  const meals = getMeals(day, type);
                  const isToday = day === todayName;
                  return (
                    <div key={day} style={{ minHeight:72, borderRadius:10, overflow:'hidden', display:'flex', flexDirection:'column', gap:2 }}>
                      {/* Existing recipe chips */}
                      {meals.map((meal, idx) => {
                        const { hasIssue } = checkRecipe(meal, settings);
                        return (
                          <button key={idx}
                            onClick={() => setDetailFor({ day, type, meal, index: idx })}
                            style={{
                              width:'100%', flex:1,
                              background: hasIssue ? 'var(--red-light)' : bg,
                              border: hasIssue ? '1.5px solid var(--red)' : `1.5px solid ${color}44`,
                              borderRadius: meals.length === 1 ? 10 : idx === 0 ? '10px 10px 4px 4px' : idx === meals.length-1 ? '4px 4px 10px 10px' : 4,
                              padding:'4px 5px', display:'flex', flexDirection:'column',
                              alignItems:'flex-start', justifyContent:'center',
                              textAlign:'left', cursor:'pointer', minHeight:28,
                            }}
                          >
                            <span style={{ fontSize:8, fontWeight:700, color: hasIssue ? 'var(--red)' : color, lineHeight:1.3, wordBreak:'break-word', display:'block' }}>
                              {hasIssue ? '⚠ ' : ''}{meal.name}
                            </span>
                          </button>
                        );
                      })}
                      {/* Add button */}
                      <button
                        onClick={() => setPickingFor({ day, type })}
                        style={{
                          width:'100%', minHeight: meals.length === 0 ? 72 : 20,
                          border: meals.length === 0 ? `1.5px dashed ${isToday ? color : 'var(--border2)'}` : `1px dashed ${color}66`,
                          borderRadius: meals.length === 0 ? 10 : '4px 4px 10px 10px',
                          background: meals.length === 0 ? (isToday ? bg : 'transparent') : 'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          color: meals.length === 0 ? (isToday ? color : 'var(--border2)') : `${color}99`,
                          cursor:'pointer', flexShrink:0,
                        }}
                      >
                        <Icon name="plus" size={meals.length === 0 ? 13 : 10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calorie bar */}
      <div style={{ marginTop:16, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px' }}>
        <p style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:10 }}>Daily calories</p>
        <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:52 }}>
          {DAYS.map(day => {
            const cal = dayCalories(day);
            const maxCal = Math.max(...DAYS.map(d => dayCalories(d)), 1);
            const isToday = day === todayName;
            return (
              <div key={day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <span style={{ fontSize:7, color: isToday ? 'var(--accent)' : 'var(--text3)', fontWeight: isToday ? 700 : 400 }}>{cal > 0 ? cal : ''}</span>
                <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background: isToday ? 'var(--accent)' : cal > 0 ? 'var(--accent-mid)' : 'var(--border)', height: cal > 0 ? `${Math.max((cal/maxCal)*30, 4)}px` : '3px', transition:'height 0.4s ease', opacity: isToday ? 1 : 0.65 }} />
                <span style={{ fontSize:7, color: isToday ? 'var(--accent)' : 'var(--text3)', fontWeight: isToday ? 700 : 400 }}>{DAY_SHORT[day]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── DAY VIEW ──────────────────────────────────────────────────────────────
  const DayView = () => (
    <div>
      {/* Day selector */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:20, scrollbarWidth:'none' }}>
        {DAYS.map(day => {
          const cal = dayCalories(day);
          const isToday = day === todayName;
          const isSelected = day === selectedDay;
          return (
            <button key={day} onClick={() => setSelectedDay(day)}
              style={{
                flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center',
                padding:'8px 14px', borderRadius:14, minWidth:56, transition:'all 0.15s',
                background: isSelected ? 'var(--accent)' : isToday ? 'var(--accent-light)' : 'var(--surface)',
                color: isSelected ? '#fff' : isToday ? 'var(--accent)' : 'var(--text2)',
                border:`1.5px solid ${isSelected ? 'var(--accent)' : isToday ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <span style={{ fontSize:11, fontWeight:700, marginBottom:2 }}>{DAY_SHORT[day]}</span>
              <span style={{ fontSize:10, opacity:0.75 }}>{cal > 0 ? cal : '—'}</span>
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div style={{ marginBottom:18 }}>
        <h2 style={{ fontSize:26 }}>{selectedDay}</h2>
        {dayCalories(selectedDay) > 0
          ? <p style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>{dayCalories(selectedDay)} kcal planned</p>
          : <p style={{ fontSize:13, color:'var(--text3)', marginTop:2 }}>No meals planned yet</p>
        }
      </div>

      {/* Meal slots */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {MEAL_TYPES.map(type => {
          const meals = getMeals(selectedDay, type);
          const { color, bg } = MEAL_TYPE_COLORS[type];
          const totalCal = meals.reduce((s, r) => s + r.calories, 0);
          return (
            <div key={type}>
              {/* Slot header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:bg, color }}>{type}</span>
                  {totalCal > 0 && <span style={{ fontSize:12, color:'var(--text3)' }}>{totalCal} kcal total</span>}
                </div>
                <button
                  onClick={() => setPickingFor({ day: selectedDay, type })}
                  style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:600, color, background:bg, padding:'5px 12px', borderRadius:20 }}
                >
                  <Icon name="plus" size={12} /> Add
                </button>
              </div>

              {/* Recipe cards in this slot */}
              {meals.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
                  {meals.map((meal, idx) => (
                    <div key={idx} style={{ background:bg, borderRadius:14, padding:'12px 14px', border:`1px solid ${color}33`, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:600, fontSize:15, color, fontFamily:'Playfair Display, serif', marginBottom:3 }}>{meal.name}</p>
                        <p style={{ fontSize:12, color:'var(--text2)' }}>{meal.calories} kcal · {meal.prepTime+meal.cookTime} min</p>
                        <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                          {[['P', meal.protein+'g','var(--blue)'],['C', meal.carbs+'g','var(--accent-mid)'],['F', meal.fat+'g','var(--red)']].map(([k,v,c]) => (
                            <span key={k} style={{ fontSize:11, background:'rgba(255,255,255,0.6)', borderRadius:6, padding:'2px 8px', color:c, fontWeight:600 }}>{k}: {v}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveOne(selectedDay, type, idx)}
                        style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', marginLeft:8, flexShrink:0 }}
                      >
                        <Icon name="x" size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {meals.length === 0 && (
                <button
                  onClick={() => setPickingFor({ day: selectedDay, type })}
                  style={{ width:'100%', padding:'14px', borderRadius:14, border:'2px dashed var(--border2)', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:14, color:'var(--text3)' }}
                >
                  <Icon name="plus" size={14} /> Add {type}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingTop: 4, paddingBottom: 32 }}>
      {/* View toggle — row 1: title + week/day toggle */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, gap:10 }}>
        <h2 style={{ fontSize:22, fontFamily:'Playfair Display, serif' }}>
          {view === 'calendar' ? 'Weekly Plan' : selectedDay}
        </h2>
        <div style={{ display:'flex', background:'var(--surface2)', borderRadius:12, padding:3, gap:2 }}>
          {[
            { id:'calendar', label:'Week', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
            { id:'day',      label:'Day',  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
          ].map(({ id, label, icon }) => (
            <button key={id} onClick={() => setView(id)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, fontSize:12, fontWeight:600, transition:'all 0.15s', background: view === id ? 'var(--surface)' : 'transparent', color: view === id ? 'var(--accent)' : 'var(--text3)', boxShadow: view === id ? 'var(--shadow)' : 'none' }}>
              {icon}{label}
            </button>
          ))}
        </div>
      </div>
      {/* Row 2: Clear + Generate */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button onClick={() => setClearConfirm(true)}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:10, fontSize:13, fontWeight:600, background:'var(--red-light)', color:'var(--red)', border:'none' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Clear week
        </button>
        <button onClick={() => setConfirming(true)}
          style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:10, fontSize:13, fontWeight:600, background:'var(--accent)', color:'#fff', border:'none' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          Generate week
        </button>
      </div>

      {/* Clear week confirm */}
      {clearConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={e => { if (e.target === e.currentTarget) setClearConfirm(false); }}>
          <div className="slide-up" style={{ background:'var(--surface)', borderRadius:20, padding:24, maxWidth:320, width:'100%', boxShadow:'var(--shadow-lg)' }}>
            <h2 style={{ fontSize:20, marginBottom:8 }}>Clear week?</h2>
            <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>
              This will remove all meals from the current week plan. This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setClearConfirm(false)}
                style={{ flex:1, padding:'12px', borderRadius:12, border:'1.5px solid var(--border)', fontWeight:600, fontSize:14, background:'var(--surface)' }}>
                Cancel
              </button>
              <button onClick={clearWeek}
                style={{ flex:1, padding:'12px', borderRadius:12, background:'var(--red)', color:'#fff', fontWeight:600, fontSize:14, border:'none' }}>
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate plan dialog */}
      {confirming && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={e => { if (e.target === e.currentTarget) setConfirming(false); }}>
          <div className="slide-up" style={{ background:'var(--surface)', borderRadius:20, padding:24, maxWidth:360, width:'100%', boxShadow:'var(--shadow-lg)' }}>
            <h2 style={{ fontSize:20, marginBottom:6 }}>Generate week plan</h2>
            <p style={{ fontSize:14, color:'var(--text2)', marginBottom:20 }}>Choose which meals to include each day</p>

            {/* Meal type toggles */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {activeMT.map(type => {
                const { color, bg } = MEAL_TYPE_COLORS[type];
                const active = selectedMealTypes.includes(type);
                return (
                  <button key={type}
                    onClick={() => setSelectedMealTypes(prev =>
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    )}
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'12px 16px', borderRadius:14, border:`2px solid ${active ? color : 'var(--border)'}`,
                      background: active ? bg : 'var(--surface2)', cursor:'pointer',
                    }}
                  >
                    <span style={{ fontWeight:600, fontSize:15, color: active ? color : 'var(--text2)' }}>{type}</span>
                    <div style={{
                      width:22, height:22, borderRadius:6,
                      border:`2px solid ${active ? color : 'var(--border2)'}`,
                      background: active ? color : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {active && <Icon name="check" size={12} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>
              {selectedMealTypes.length === 0
                ? 'Select at least one meal type'
                : `${selectedMealTypes.length} meal${selectedMealTypes.length > 1 ? 's' : ''} × 7 days = ${selectedMealTypes.length * 7} slots will be filled`
              }
            </p>
            {settings && ((settings.allergies||[]).length > 0 || (settings.avoid||[]).length > 0 || settings.vegetarian || settings.vegan || settings.glutenFree || settings.dairyFree) && (
              <button
                onClick={() => setApplyDietary(!applyDietary)}
                style={{
                  display:'flex', alignItems:'center', gap:10, width:'100%',
                  padding:'10px 12px', borderRadius:12, marginBottom:16, cursor:'pointer',
                  background: applyDietary ? 'var(--accent-light)' : 'var(--surface2)',
                  border: `1.5px solid ${applyDietary ? 'var(--accent)' : 'var(--border)'}`,
                  transition:'all 0.15s',
                }}
              >
                <div style={{
                  width:20, height:20, borderRadius:6, flexShrink:0,
                  border: `2px solid ${applyDietary ? 'var(--accent)' : 'var(--border2)'}`,
                  background: applyDietary ? 'var(--accent)' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {applyDietary && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ textAlign:'left' }}>
                  <p style={{ fontSize:13, fontWeight:600, color: applyDietary ? 'var(--accent)' : 'var(--text2)' }}>Apply dietary settings</p>
                  <p style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
                    {applyDietary ? 'Restricted recipes will be excluded' : 'All recipes will be included'}
                  </p>
                </div>
              </button>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirming(false)}
                style={{ flex:1, padding:'12px', borderRadius:12, border:'1.5px solid var(--border)', fontWeight:600, fontSize:14, background:'var(--surface)' }}>
                Cancel
              </button>
              <button onClick={generateWeekPlan} disabled={selectedMealTypes.length === 0}
                style={{ flex:1, padding:'12px', borderRadius:12, background: selectedMealTypes.length === 0 ? 'var(--border2)' : 'var(--accent)', color:'#fff', fontWeight:600, fontSize:14, border:'none', cursor: selectedMealTypes.length === 0 ? 'not-allowed' : 'pointer' }}>
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'calendar' ? <CalendarView /> : <DayView />}
      <MealDetail />
      <RecipePicker />
    </div>
  );
}
