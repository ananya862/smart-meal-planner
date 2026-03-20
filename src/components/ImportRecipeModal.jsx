import React, { useState } from 'react';
import { Icon, Spinner, inputStyle, MacroBar, Tag } from './UI.jsx';
import { normaliseRecipe } from '../data.js';

const SYSTEM_PROMPT = `You are a recipe parser. Extract recipe information and return ONLY a valid JSON object with these exact fields:
{"name":string,"servings":number,"prepTime":number,"cookTime":number,"tags":string[],"calories":number,"protein":number,"carbs":number,"fat":number,"sugar":number,"ingredients":[{"name":string,"qty":number,"unit":string}],"steps":string[]}
No markdown, no explanation. JSON only. Estimate nutrition if not provided.`;

export default function ImportRecipeModal({ onClose, onAdd }) {
  const [tab, setTab]         = useState('paste');
  const [text, setText]       = useState('');
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [preview, setPreview] = useState(null);
  const [added, setAdded]     = useState(false);

  const callAPI = async (bodyObj) => {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj),
    });
    const data = await res.json();
    return data;
  };

  const parseResponse = (data) => {
    if (data.error) throw new Error(typeof data.error === 'object' ? data.error.message || JSON.stringify(data.error) : data.error);
    const raw = data.content?.map(b => b.text || '').join('') || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON in response. Got: "${raw.slice(0, 200)}"`);
    return JSON.parse(match[0]);
  };

  const handleImportPaste = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setPreview(null);
    try {
      const data = await callAPI({
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Parse this recipe:\n\n${text}` }],
      });
      const recipe = parseResponse(data);
      // Normalise tags to lowercase
      if (recipe.tags) recipe.tags = recipe.tags.map(t => t.trim().toLowerCase());
      setPreview({ ...recipe, id: Date.now() });
    } catch (e) {
      console.error('Import error:', e);
      setError(`Could not parse recipe: ${e.message}`);
    }
    setLoading(false);
  };

  const handleImportURL = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setPreview(null);
    try {
      const data = await callAPI({
        system: SYSTEM_PROMPT,
        fetchUrl: url,
      });
      const recipe = parseResponse(data);
      // Normalise tags to lowercase
      if (recipe.tags) recipe.tags = recipe.tags.map(t => t.trim().toLowerCase());
      setPreview({ ...recipe, id: Date.now() });
    } catch (e) {
      console.error('Import error:', e);
      setError(`Could not import from URL: ${e.message}`);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    onAdd(normaliseRecipe(preview));
    setAdded(true);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:300, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'60px 16px 16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="slide-up" style={{
        background:'var(--surface)', borderRadius:20, width:'100%', maxWidth:520,
        maxHeight:'88dvh', display:'flex', flexDirection:'column', boxShadow:'0 8px 40px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="import" size={18} />
            <h2 style={{ fontSize:20 }}>Import Recipe</h2>
          </div>
          <button onClick={onClose}
            style={{ width:32, height:32, borderRadius:'50%', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, padding:'14px 20px 0', flexShrink:0 }}>
          {[['paste','Paste text'],['url','From URL']].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); setPreview(null); setError(''); }}
              style={{
                flex:1, padding:'9px', borderRadius:10, fontSize:13, fontWeight:600,
                background: tab === id ? 'var(--accent)' : 'var(--surface2)',
                color: tab === id ? '#fff' : 'var(--text2)',
                border:'none', transition:'all 0.15s',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', paddingBottom:'24px' }}>
          {!preview ? (
            <>
              {tab === 'paste' ? (
                <>
                  <p style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>
                    Paste any recipe — from a website, cookbook, or message.
                  </p>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={"Paste your recipe here...\n\nIngredients:\n- 2 cups flour\n..."}
                    rows={6}
                    style={{ ...inputStyle, resize:'none', marginBottom:12, lineHeight:1.6 }}
                  />
                  <button onClick={handleImportPaste} disabled={loading || !text.trim()}
                    style={{ width:'100%', padding:'12px', borderRadius:12, border:'none', background: !text.trim() ? 'var(--border2)' : 'var(--accent)', color:'#fff', fontWeight:600, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor: !text.trim() ? 'not-allowed' : 'pointer' }}>
                    {loading ? <><Spinner size={16}/> Parsing...</> : <><Icon name="sparkle" size={15}/> Parse with AI</>}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>
                    Enter a recipe URL and AI will extract the recipe.
                  </p>
                  <input value={url} onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleImportURL(); }}
                    placeholder="https://www.example.com/recipe/..."
                    style={{ ...inputStyle, marginBottom:12 }}
                  />
                  <button onClick={handleImportURL} disabled={loading || !url.trim()}
                    style={{ width:'100%', padding:'12px', borderRadius:12, border:'none', background: !url.trim() ? 'var(--border2)' : 'var(--accent)', color:'#fff', fontWeight:600, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor: !url.trim() ? 'not-allowed' : 'pointer' }}>
                    {loading ? <><Spinner size={16}/> Fetching...</> : <><Icon name="sparkle" size={15}/> Import from URL</>}
                  </button>
                  <p style={{ fontSize:11, color:'var(--text3)', marginTop:10 }}>
                    If a URL fails, try pasting the recipe text instead.
                  </p>
                </>
              )}
              {error && (
                <div style={{ marginTop:14, padding:'12px 14px', background:'var(--red-light)', borderRadius:12, fontSize:13, color:'var(--red)' }}>
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="fade-in">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, padding:'10px 14px', background:'var(--accent-light)', borderRadius:12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize:13, color:'var(--accent)', fontWeight:600 }}>Recipe parsed!</span>
              </div>
              <h3 style={{ fontSize:20, fontFamily:'Playfair Display, serif', marginBottom:6 }}>{preview.name}</h3>
              <div style={{ display:'flex', gap:14, fontSize:13, color:'var(--text2)', marginBottom:12 }}>
                <span><Icon name="clock" size={13}/> {(preview.prepTime||0)+(preview.cookTime||0)} min</span>
                <span><Icon name="users" size={13}/> {preview.servings} servings</span>
              </div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:12 }}>
                {(preview.tags||[]).map(t => <Tag key={t} label={t}/>)}
              </div>
              <MacroBar recipe={preview}/>
              <div style={{ marginTop:16, background:'var(--surface2)', borderRadius:12, padding:'12px 14px' }}>
                <p style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Ingredients ({preview.ingredients?.length || 0})</p>
                {(preview.ingredients||[]).slice(0,5).map((ing,i) => (
                  <p key={i} style={{ fontSize:13, color:'var(--text2)', marginBottom:3 }}>• {ing.qty} {ing.unit} {ing.name}</p>
                ))}
                {(preview.ingredients||[]).length > 5 && <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>+{preview.ingredients.length-5} more</p>}
              </div>
              <button onClick={() => { setPreview(null); setError(''); }}
                style={{ marginTop:12, fontSize:13, color:'var(--text3)', textDecoration:'underline', background:'none', border:'none', cursor:'pointer' }}>
                ← Try again
              </button>
            </div>
          )}
          <div style={{ height:8 }} />
        </div>

        {preview && (
          <div style={{ padding:'12px 20px', paddingBottom:'calc(var(--nav-height) + var(--safe-bottom) + 12px)', borderTop:'1px solid var(--border)', flexShrink:0 }}>
            <button onClick={handleAdd} disabled={added}
              style={{ width:'100%', padding:'13px', borderRadius:12, border:'none', background: added ? 'var(--accent-light)' : 'var(--accent)', color: added ? 'var(--accent)' : '#fff', fontWeight:600, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {added
                ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Added!</>
                : <><Icon name="plus" size={16}/> Add to my recipes</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
