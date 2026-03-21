import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, guessCategory, slotIds } from '../data.js';
import { useStorage } from '../hooks/useStorage.js';
import { Icon, Empty } from '../components/UI.jsx';

export default function GroceryView({ mealPlan, recipes, pantry, setPantry, activeMealTypes }) {

  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [mergedItems, setMergedItems] = useStorage('smp_grocery_merges', {});
  const [deletedItems, setDeletedItems] = useState([]);
  const [editingMerge, setEditingMerge] = useState(null); // dup being edited // key: merged name, value: item override


  // Clear deleted and checked items when meal plan changes
  const mealPlanKey = JSON.stringify(mealPlan);
  useEffect(() => {
    setDeletedItems([]);

  }, [mealPlanKey]);

  const groceryList = useMemo(() => {
    const needed = {};
    const activeTypes = activeMealTypes || ['Breakfast','Lunch','Dinner','Snack'];
    Object.entries(mealPlan).filter(([key]) => activeTypes.includes(key.split('_')[1])).forEach(([, val]) => {
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

  // Apply merges on top of groceryList
  const mergedGroceryList = useMemo(() => {
    const list = { ...groceryList };
    // Collect all keys to remove
    const allRemovedKeys = new Set();
    Object.values(mergedItems).forEach(item => {
      if (item._removedKeys) item._removedKeys.forEach(k => allRemovedKeys.add(k));
    });
    // Remove original keys
    allRemovedKeys.forEach(k => delete list[k]);
    // Add merged items
    Object.values(mergedItems).forEach(item => {
      const { _removedKeys, ...clean } = item;
      list[clean.name.toLowerCase()] = clean;
    });
    // Remove manually deleted items
    deletedItems.forEach(k => delete list[k]);
    return list;
  }, [groceryList, mergedItems, deletedItems]);

  const byCategory = useMemo(() => {
    const bc = {};
    Object.values(mergedGroceryList).forEach(item => {
      if (!bc[item.category]) bc[item.category] = [];
      bc[item.category].push(item);
    });
    return bc;
  }, [mergedGroceryList]);

  const total = Object.keys(mergedGroceryList).length;
  const checkedCount = 0;
  const analyseList = async () => {
    setAnalysing(true);
    setAnalysis(null);
    const items = Object.values(mergedGroceryList).map(i => `${i.qty} ${i.unit} ${i.name}`).join('\n');
    const pantryItems = pantry.map(p => `${p.qty} ${p.unit} ${p.name}`).join('\n');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are a culinary assistant. Analyse a grocery list and pantry. Return ONLY valid JSON with this structure:
{
  "duplicates": [
    { "items": ["garlic cloves", "garlic"], "mergedName": "garlic", "mergedQty": 5, "mergedUnit": "cloves", "reason": "same ingredient" }
  ],
  "substitutions": [
    { "needed": "peanut oil", "substitute": "vegetable oil", "pantryQty": "500ml", "reason": "both neutral cooking oils" }
  ]
}
Only include items where you are confident. Return empty arrays if nothing found. JSON only, no markdown.`,
          messages: [{ role: 'user', content: `Grocery list:
${items}

Pantry:
${pantryItems}

Find duplicates (same ingredient, different names/specificity) and substitution opportunities (pantry items that could replace grocery items).` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || '').join('') || '';
      const clean = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        // Filter out duplicates that reference items no longer in the list
        const currentKeys = Object.keys(mergedGroceryList).map(k => k.toLowerCase());
        const filteredDups = (result.duplicates || []).filter(dup =>
          dup.items.some(name =>
            currentKeys.some(k => k.includes(name.toLowerCase()) || name.toLowerCase().includes(k))
          )
        );
        setAnalysis({ ...result, duplicates: filteredDups });
        setShowAnalysis(true);
      }
    } catch (e) {
      console.error('Analysis error:', e);
    }
    setAnalysing(false);
  };

  const applyMerge = (dup, index) => {
    // Build current list (base + merges applied)
    const currentList = { ...groceryList };
    Object.values(mergedItems).forEach(item => {
      if (item._removedKeys) item._removedKeys.forEach(k => delete currentList[k]);
      const { _removedKeys, ...clean } = item;
      currentList[clean.name.toLowerCase()] = clean;
    });

    // Only remove keys that EXACTLY match one of the dup.items names
    // Use exact match first, then fall back to startsWith to avoid "chicken" matching "chicken thighs"
    const dupNamesLower = dup.items.map(n => n.toLowerCase().trim());
    const removedKeys = Object.keys(currentList).filter(key => {
      const itemName = currentList[key].name.toLowerCase().trim();
      return dupNamesLower.some(n => itemName === n);
    });

    // Use category from first matched item
    let category = 'Other';
    for (const key of removedKeys) {
      if (currentList[key]?.category) { category = currentList[key].category; break; }
    }

    const mergedKey = dup.mergedName.toLowerCase().trim();
    setMergedItems(prev => {
      // Build new mergedItems — also absorb any previously merged keys
      const allRemovedKeys = new Set(removedKeys);
      // If any existing mergedItem overlaps with what we're removing, absorb its removedKeys too
      Object.values(prev).forEach(existing => {
        if (existing._removedKeys?.some(k => allRemovedKeys.has(k))) {
          existing._removedKeys.forEach(k => allRemovedKeys.add(k));
        }
      });
      // Remove any existing mergedItems that overlap
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([k, v]) =>
          !v._removedKeys?.some(rk => allRemovedKeys.has(rk)) && k !== mergedKey
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
        }
      };
    });

    // Remove just this dup from the list; keep the panel open for remaining items
    setAnalysis(prev => ({ ...prev, duplicates: prev.duplicates.filter((_, j) => j !== index) }));
  };

  const deleteItem = (key) => {
    setDeletedItems(prev => [...prev, key]);
  };

  const toggle = (key, item) => {
    // Add to pantry if not already there
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
    // Remove from grocery list immediately
    setDeletedItems(prev => [...new Set([...prev, key])]);
  };

  if (Object.keys(mergedGroceryList).length === 0 && Object.keys(groceryList).length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>Grocery List</h2>
        <Empty emoji="🛒" title="Nothing to buy" subtitle="Plan some meals to auto-generate your grocery list." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>Grocery List</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
`${total} item${total !== 1 ? 's' : ''} to buy`
          </p>
        </div>

      </div>

      {/* Smart analyse button */}
      {total > 0 && (
        <button onClick={analyseList} disabled={analysing}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:12, marginBottom:16, border:'1.5px solid var(--accent)', background:'var(--accent-light)', color:'var(--accent)', fontWeight:600, fontSize:14 }}>
          {analysing
            ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid var(--accent)', borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }} /> Analysing list...</>
            : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Smart deduplicate & suggest substitutes</>
          }
        </button>
      )}

      {/* Analysis results */}
      {showAnalysis && analysis && (
        <div className="fade-in" style={{ marginBottom:20 }}>
          {/* Duplicates */}
          {(analysis.duplicates||[]).length > 0 && (
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--amber)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                ⚠ Possible duplicates ({analysis.duplicates.length})
              </p>
              {analysis.duplicates.map((dup, i) => {
                const isEditing = editingMerge === i;
                const [mName, setMName] = [dup._editName ?? dup.mergedName, (v) => {
                  setAnalysis(prev => ({ ...prev, duplicates: prev.duplicates.map((d, j) => j === i ? { ...d, _editName: v } : d) }));
                }];
                const [mQty, setMQty] = [dup._editQty ?? dup.mergedQty, (v) => {
                  setAnalysis(prev => ({ ...prev, duplicates: prev.duplicates.map((d, j) => j === i ? { ...d, _editQty: v } : d) }));
                }];
                const [mUnit, setMUnit] = [dup._editUnit ?? dup.mergedUnit, (v) => {
                  setAnalysis(prev => ({ ...prev, duplicates: prev.duplicates.map((d, j) => j === i ? { ...d, _editUnit: v } : d) }));
                }];
                const unitsMatch = new Set(dup.items.map(name => {
                  const found = Object.values(groceryList).find(g => g.name.toLowerCase() === name.toLowerCase());
                  return found?.unit;
                })).size <= 1;
                return (
                  <div key={i} style={{ background:'var(--amber-light)', border:'1px solid var(--amber)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
                    <p style={{ fontSize:12, color:'var(--amber)', fontWeight:600, marginBottom:2 }}>{dup.items.join(' + ')}</p>
                    <p style={{ fontSize:11, color:'var(--text3)', marginBottom:8 }}>{dup.reason}</p>
                    {!unitsMatch && (
                      <p style={{ fontSize:11, color:'var(--red)', marginBottom:8 }}>⚠ Different units — please verify the merged quantity below</p>
                    )}
                    {/* Editable merge fields */}
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:6, marginBottom:10 }}>
                      <div>
                        <p style={{ fontSize:10, color:'var(--text3)', marginBottom:3 }}>Merged name</p>
                        <input value={mName} onChange={e => setMName(e.target.value)}
                          style={{ width:'100%', padding:'6px 8px', borderRadius:7, border:'1px solid var(--border)', fontSize:13, background:'var(--surface)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize:10, color:'var(--text3)', marginBottom:3 }}>Qty</p>
                        <input type="number" value={mQty} onChange={e => setMQty(e.target.value)}
                          style={{ width:'100%', padding:'6px 8px', borderRadius:7, border:'1px solid var(--border)', fontSize:13, background:'var(--surface)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize:10, color:'var(--text3)', marginBottom:3 }}>Unit</p>
                        <input value={mUnit} onChange={e => setMUnit(e.target.value)}
                          style={{ width:'100%', padding:'6px 8px', borderRadius:7, border:'1px solid var(--border)', fontSize:13, background:'var(--surface)' }} />
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => applyMerge({ ...dup, mergedName: mName, mergedQty: parseFloat(mQty)||1, mergedUnit: mUnit }, i)}
                        style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background:'var(--amber)', color:'#fff', fontWeight:600, fontSize:13 }}>
                        ✓ Merge
                      </button>
                      <button onClick={() => setAnalysis(prev => ({ ...prev, duplicates: prev.duplicates.filter((d, j) => j !== i) }))}
                        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', fontSize:13 }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Substitutions */}
          {(analysis.substitutions||[]).length > 0 && (
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                💡 Substitution suggestions ({analysis.substitutions.length})
              </p>
              {analysis.substitutions.map((sub, i) => (
                <div key={i} style={{ background:'var(--accent-light)', border:'1px solid var(--accent)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:13, color:'var(--text)', fontWeight:600 }}>{sub.needed}</span>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>→</span>
                    <span style={{ fontSize:13, color:'var(--accent)', fontWeight:600 }}>{sub.substitute}</span>
                    <span style={{ fontSize:11, color:'var(--text3)', background:'var(--surface2)', borderRadius:6, padding:'1px 6px' }}>in pantry: {sub.pantryQty}</span>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>{sub.reason}</p>
                  <button onClick={() => setAnalysis(prev => ({ ...prev, substitutions: prev.substitutions.filter(s => s !== sub) }))}
                    style={{ padding:'6px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', fontSize:12 }}>
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}

          {(analysis.duplicates||[]).length === 0 && (analysis.substitutions||[]).length === 0 && (
            <div style={{ padding:'12px 16px', background:'var(--accent-light)', borderRadius:12, fontSize:13, color:'var(--accent)', fontWeight:500, marginBottom:8 }}>
              ✓ No duplicates or substitutions found — your list looks good!
            </div>
          )}
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
              return (
                <button
                  key={i}
                  onClick={() => toggle(key, item)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 16px', textAlign: 'left',
                    borderBottom: i < byCategory[cat].length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: '2px solid var(--border2)', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} />
                  <span style={{ flex: 1, fontSize: 15, color: 'var(--text)' }}>{item.name}</span>
                  <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>
                    {Number.isInteger(item.qty) ? item.qty : item.qty.toFixed(1)} {item.unit}
                  </span>
                  <button onClick={e => { e.stopPropagation(); deleteItem(key); }}
                    style={{ color: 'var(--text3)', padding: '4px 6px', marginLeft: 4, flexShrink: 0 }}>
                    <Icon name="x" size={14} />
                  </button>

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
