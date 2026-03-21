import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, guessCategory, slotIds } from '../data.js';
import { useStorage } from '../hooks/useStorage.js';
import { Icon, Empty } from '../components/UI.jsx';

export default function GroceryView({ mealPlan, recipes, pantry, setPantry, activeMealTypes }) {
  // Persisted state
  const [mergedItems, setMergedItems] = useStorage('smp_grocery_merges', {});

  // Session state — resets when meal plan changes
  const [deletedItems, setDeletedItems] = useState([]);

  // AI analysis state
  const [analysing, setAnalysing]   = useState(false);
  const [analysis, setAnalysis]     = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Reset deletions when meal plan changes
  const mealPlanKey = JSON.stringify(mealPlan);
  useEffect(() => {
    setDeletedItems([]);
  }, [mealPlanKey]);

  // ── Base grocery list from meal plan ──────────────────────────────────────
  const groceryList = useMemo(() => {
    const needed = {};
    const activeTypes = activeMealTypes || ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    Object.entries(mealPlan)
      .filter(([key]) => activeTypes.includes(key.split('_')[1]))
      .forEach(([, val]) => {
        slotIds(val).forEach(recipeId => {
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
      });

    // Subtract pantry quantities
    const list = {};
    Object.entries(needed).forEach(([key, item]) => {
      const pantryItem = pantry.find(p => p.name.toLowerCase() === key);
      const pantryQty  = pantryItem ? parseFloat(pantryItem.qty) : 0;
      const remaining  = item.qty - pantryQty;
      if (remaining > 0) list[key] = { ...item, qty: remaining };
    });
    return list;
  }, [mealPlan, recipes, pantry, activeMealTypes]);

  // ── Apply merges + deletions ──────────────────────────────────────────────
  const displayList = useMemo(() => {
    const list = { ...groceryList };

    // Remove keys that were merged away
    const removedByMerge = new Set();
    Object.values(mergedItems).forEach(item => {
      (item._removedKeys || []).forEach(k => removedByMerge.add(k));
    });
    removedByMerge.forEach(k => delete list[k]);

    // Add merged items
    Object.values(mergedItems).forEach(({ _removedKeys, ...item }) => {
      // Only add if at least one original key was in groceryList (still relevant)
      const stillRelevant = (_removedKeys || []).some(k => groceryList[k]);
      if (stillRelevant) list[item.name.toLowerCase()] = item;
    });

    // Remove manually checked/deleted items
    deletedItems.forEach(k => delete list[k]);

    return list;
  }, [groceryList, mergedItems, deletedItems]);

  const byCategory = useMemo(() => {
    const bc = {};
    Object.values(displayList).forEach(item => {
      if (!bc[item.category]) bc[item.category] = [];
      bc[item.category].push(item);
    });
    return bc;
  }, [displayList]);

  const total = Object.keys(displayList).length;

  // ── Checking an item: add to pantry + remove from list ───────────────────
  const checkItem = (key, item) => {
    // Add to pantry only if not already there
    const alreadyInPantry = pantry.some(p => p.name.toLowerCase() === key);
    if (!alreadyInPantry) {
      setPantry(prev => [...prev, {
        id: Date.now(),
        name: item.name,
        qty: item.qty,
        unit: item.unit,
        category: item.category,
      }]);
    }
    // Remove from grocery list
    setDeletedItems(prev => [...new Set([...prev, key])]);
  };

  // ── Delete without adding to pantry ──────────────────────────────────────
  const deleteItem = (key) => {
    setDeletedItems(prev => [...new Set([...prev, key])]);
  };

  // ── AI smart deduplicate ──────────────────────────────────────────────────
  const analyseList = async () => {
    setAnalysing(true);
    setAnalysis(null);
    const items      = Object.values(displayList).map(i => `${i.qty} ${i.unit} ${i.name}`).join('\n');
    const pantryList = pantry.map(p => `${p.qty} ${p.unit} ${p.name}`).join('\n');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are a culinary assistant. Analyse a grocery list and pantry. Return ONLY valid JSON:
{"duplicates":[{"items":["name1","name2"],"mergedName":"name","mergedQty":1,"mergedUnit":"unit","reason":"reason"}],"substitutions":[{"needed":"item","substitute":"pantry item","pantryQty":"qty","reason":"reason"}]}
Only include confident suggestions. Empty arrays if nothing found. JSON only.`,
          messages: [{ role: 'user', content: `Grocery list:\n${items}\n\nPantry:\n${pantryList}\n\nFind duplicates and substitution opportunities.` }],
        }),
      });
      const data = await res.json();
      const raw  = (data.content || []).map(b => b.text || '').join('');
      const match = raw.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        // Filter duplicates that reference items still in displayList
        const currentKeys = Object.keys(displayList);
        const filteredDups = (result.duplicates || []).filter(dup =>
          dup.items.filter(name =>
            currentKeys.some(k => k === name.toLowerCase() || k.includes(name.toLowerCase()) || name.toLowerCase().includes(k))
          ).length >= 2
        );
        setAnalysis({ ...result, duplicates: filteredDups });
        setShowAnalysis(true);
      }
    } catch (e) {
      console.error('Analysis error:', e);
    }
    setAnalysing(false);
  };

  // ── Apply a merge ─────────────────────────────────────────────────────────
  const applyMerge = (dup, index) => {
    const dupNamesLower = dup.items.map(n => n.toLowerCase().trim());

    // Find exact matching keys in current displayList
    const removedKeys = Object.keys(displayList).filter(key =>
      dupNamesLower.includes(displayList[key].name.toLowerCase().trim())
    );

    // Get category from first matched item
    const category = removedKeys.map(k => displayList[k]?.category).find(Boolean) || 'Other';

    const mergedKey = dup.mergedName.toLowerCase().trim();

    setMergedItems(prev => {
      const allRemovedKeys = new Set(removedKeys);
      // Absorb keys from any existing mergedItems that overlap
      Object.values(prev).forEach(existing => {
        if ((existing._removedKeys || []).some(k => allRemovedKeys.has(k))) {
          (existing._removedKeys || []).forEach(k => allRemovedKeys.add(k));
        }
      });
      // Remove overlapping existing merges
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([k, v]) =>
          !(v._removedKeys || []).some(rk => allRemovedKeys.has(rk)) && k !== mergedKey
        )
      );
      return {
        ...cleaned,
        [mergedKey]: {
          name: dup.mergedName,
          qty: dup.mergedQty,
          unit: dup.mergedUnit,
          category,
          _removedKeys: [...allRemovedKeys],
        },
      };
    });

    // Remove this dup from analysis; close panel if none left
    setAnalysis(prev => {
      const remaining = (prev.duplicates || []).filter((_, j) => j !== index);
      if (remaining.length === 0 && (prev.substitutions || []).length === 0) {
        setShowAnalysis(false);
      }
      return { ...prev, duplicates: remaining };
    });
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (total === 0 && Object.keys(groceryList).length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>Grocery List</h2>
        <Empty emoji="🛒" title="Nothing to buy" subtitle="Plan some meals to auto-generate your grocery list." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>Grocery List</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
            {total === 0 ? 'All done — happy shopping! 🎉' : `${total} item${total !== 1 ? 's' : ''} to buy`}
          </p>
        </div>
      </div>

      {/* Smart analyse button */}
      {total > 0 && (
        <button onClick={analyseList} disabled={analysing}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 12, marginBottom: 16, border: '1.5px solid var(--accent)', background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>
          {analysing
            ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} /> Analysing list...</>
            : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Smart deduplicate & suggest substitutes</>
          }
        </button>
      )}

      {/* Analysis panel */}
      {showAnalysis && analysis && (
        <div className="fade-in" style={{ marginBottom: 20 }}>
          {/* Duplicates */}
          {(analysis.duplicates || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                ⚠ Possible duplicates ({analysis.duplicates.length})
              </p>
              {analysis.duplicates.map((dup, i) => {
                const mName = dup._editName ?? dup.mergedName;
                const mQty  = dup._editQty  ?? dup.mergedQty;
                const mUnit = dup._editUnit ?? dup.mergedUnit;
                const setField = (field, val) =>
                  setAnalysis(prev => ({ ...prev, duplicates: prev.duplicates.map((d, j) => j === i ? { ...d, [field]: val } : d) }));

                const unitSet = new Set(dup.items.map(name => {
                  const found = Object.values(displayList).find(g => g.name.toLowerCase() === name.toLowerCase());
                  return found?.unit;
                }).filter(Boolean));
                const unitsMatch = unitSet.size <= 1;

                return (
                  <div key={i} style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600, marginBottom: 2 }}>{dup.items.join(' + ')}</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{dup.reason}</p>
                    {!unitsMatch && <p style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>⚠ Different units — verify the merged quantity</p>}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                      {[['Merged name', mName, '_editName', 'text'], ['Qty', mQty, '_editQty', 'number'], ['Unit', mUnit, '_editUnit', 'text']].map(([label, val, field, type]) => (
                        <div key={field}>
                          <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{label}</p>
                          <input type={type} value={val} onChange={e => setField(field, e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 13, background: 'var(--surface)', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => applyMerge({ ...dup, mergedName: mName, mergedQty: parseFloat(mQty) || 1, mergedUnit: mUnit }, i)}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'var(--amber)', color: '#fff', fontWeight: 600, fontSize: 13 }}>
                        ✓ Merge
                      </button>
                      <button onClick={() => setAnalysis(prev => ({ ...prev, duplicates: prev.duplicates.filter((_, j) => j !== i) }))}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13 }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Substitutions */}
          {(analysis.substitutions || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                💡 Substitution suggestions ({analysis.substitutions.length})
              </p>
              {analysis.substitutions.map((sub, i) => (
                <div key={i} style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{sub.needed}</span>
                    <span style={{ color: 'var(--text3)' }}>→</span>
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{sub.substitute}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 6, padding: '1px 6px' }}>pantry: {sub.pantryQty}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{sub.reason}</p>
                  <button onClick={() => setAnalysis(prev => ({ ...prev, substitutions: prev.substitutions.filter((_, j) => j !== i) }))}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12 }}>
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}

          {(analysis.duplicates || []).length === 0 && (analysis.substitutions || []).length === 0 && (
            <div style={{ padding: '12px 16px', background: 'var(--accent-light)', borderRadius: 12, fontSize: 13, color: 'var(--accent)', fontWeight: 500, marginBottom: 8 }}>
              ✓ No duplicates or substitutions found — your list looks good!
            </div>
          )}
        </div>
      )}

      {/* Grocery items by category */}
      {total === 0
        ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>All items checked ✓</div>
        : CATEGORIES.filter(cat => byCategory[cat]).map(cat => (
          <div key={cat} style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{cat}</p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {byCategory[cat].map((item, i) => {
                const key = item.name.toLowerCase();
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
                    borderBottom: i < byCategory[cat].length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'var(--surface)',
                  }}>
                    {/* Checkbox — tap to add to pantry + remove */}
                    <button onClick={() => checkItem(key, item)}
                      style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: '2px solid var(--border2)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                    <span style={{ flex: 1, fontSize: 15 }}>{item.name}</span>
                    <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>
                      {Number.isInteger(item.qty) ? item.qty : item.qty.toFixed(1)} {item.unit}
                    </span>
                    {/* Delete without adding to pantry */}
                    <button onClick={() => deleteItem(key)}
                      style={{ color: 'var(--text3)', padding: '4px 6px', flexShrink: 0 }}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      }
      <div style={{ height: 8 }} />
    </div>
  );
}
