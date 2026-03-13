import React, { useState } from 'react';
import { Icon, MacroBar, Tag, Btn, Spinner, inputStyle, BottomSheet } from './UI.jsx';

export default function AISuggestModal({ onClose, onAdd, pantry }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [added, setAdded] = useState({});

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true); setError(''); setResults([]);
    const pantryList = pantry.map(p => `${p.qty} ${p.unit} ${p.name}`).join(', ');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: 'You are a professional chef. Return ONLY a valid JSON array of 3 recipe objects. Each object must have: name (string), servings (number), prepTime (minutes, number), cookTime (minutes, number), tags (string array), calories (number), protein (number), carbs (number), fat (number), ingredients (array of {name, qty, unit}), steps (string array). No markdown, no explanation, JSON only.',
          messages: [{ role: 'user', content: `Create 3 meal suggestions for: "${prompt}". Pantry available: ${pantryList || 'standard items'}. Return JSON array only.` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || '').join('') || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setResults(parsed.map((r, i) => ({ ...r, id: Date.now() + i })));
    } catch {
      setError('Could not generate suggestions. Please try again.');
    }
    setLoading(false);
  };

  const handleAdd = (r) => {
    onAdd(r);
    setAdded(prev => ({ ...prev, [r.id]: true }));
  };

  return (
    <BottomSheet onClose={onClose} title="AI Meal Suggestions" fullHeight>
      <div style={{ paddingBottom: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
          Describe what you want and AI will generate recipes for you.
        </p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. 3 high-protein dinners under 30 min, using chicken..."
          rows={3}
          style={{ ...inputStyle, resize: 'none', marginBottom: 12 }}
        />
        <Btn onClick={generate} disabled={loading || !prompt.trim()} fullWidth>
          {loading ? <><Spinner size={16} /> Generating...</> : <><Icon name="zap" size={15} /> Generate Suggestions</>}
        </Btn>

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--red-light)', borderRadius: 12, fontSize: 14, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer" style={{ height: 100, borderRadius: 14 }} />
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {results.map((r) => (
              <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16 }} className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 17, fontFamily: 'Playfair Display, serif' }}>{r.name}</h3>
                  <Btn
                    onClick={() => handleAdd(r)}
                    variant={added[r.id] ? 'secondary' : 'accent'}
                    size="sm"
                    style={{ flexShrink: 0 }}
                  >
                    {added[r.id] ? '✓ Added' : '+ Add'}
                  </Btn>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                  <span><Icon name="clock" size={12} /> {(r.prepTime || 0) + (r.cookTime || 0)} min</span>
                  <span><Icon name="users" size={12} /> {r.servings} servings</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                  {(r.tags || []).map(t => <Tag key={t} label={t} />)}
                </div>
                <MacroBar recipe={r} />
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
