import React, { useState } from 'react';
import { Icon, inputStyle } from '../components/UI.jsx';

const COMMON_ALLERGENS = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts',
  'Soy', 'Fish', 'Shellfish', 'Sesame', 'Wheat',
];

const FOODS_TO_AVOID = [
  'Red meat', 'Pork', 'Chicken', 'Seafood', 'Spicy food',
  'Onions', 'Garlic', 'Mushrooms', 'Citrus', 'Alcohol',
];

const Chip = ({ label, selected, onToggle, color = 'accent' }) => {
  const colors = {
    accent: { bg: selected ? 'var(--accent)' : 'var(--surface2)', text: selected ? '#fff' : 'var(--text2)', border: selected ? 'var(--accent)' : 'var(--border)' },
    red:    { bg: selected ? 'var(--red)' : 'var(--surface2)',    text: selected ? '#fff' : 'var(--text2)', border: selected ? 'var(--red)' : 'var(--border)' },
    amber:  { bg: selected ? 'var(--amber)' : 'var(--surface2)',  text: selected ? '#fff' : 'var(--text2)', border: selected ? 'var(--amber)' : 'var(--border)' },
  };
  const c = colors[color];
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
        background: c.bg, color: c.text, border: `1.5px solid ${c.border}`,
        transition: 'all 0.15s', cursor: 'pointer',
      }}
    >
      {selected && <span style={{ marginRight: 4 }}>✓</span>}{label}
    </button>
  );
};

const Section = ({ title, subtitle, children }) => (
  <div style={{ marginBottom: 28 }}>
    <h3 style={{ fontSize: 17, marginBottom: subtitle ? 4 : 12 }}>{title}</h3>
    {subtitle && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>{subtitle}</p>}
    {children}
  </div>
);

const Toggle = ({ label, subtitle, value, onChange }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '14px 18px',
  }}>
    <div>
      <p style={{ fontWeight: 500, fontSize: 15 }}>{label}</p>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{subtitle}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14, padding: 3, flexShrink: 0,
        background: value ? 'var(--accent)' : 'var(--border2)',
        transition: 'background 0.2s', display: 'flex', alignItems: 'center',
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        transform: value ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  </div>
);

export default function SettingsView({ settings, setSettings }) {
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [customAvoidInput, setCustomAvoidInput]     = useState('');

  const toggle = (key, value) => {
    setSettings(prev => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value],
      };
    });
  };

  const addCustom = (key, value, clearFn) => {
    const val = value.trim();
    if (!val) return;
    setSettings(prev => {
      const arr = prev[key] || [];
      if (arr.includes(val)) return prev;
      return { ...prev, [key]: [...arr, val] };
    });
    clearFn('');
  };

  const removeCustom = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: (prev[key] || []).filter(x => x !== value) }));
  };

  const s = settings;

  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26 }}>Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Personalise your meal planning experience</p>
      </div>

      {/* ── Meals per day ── */}
      <Section title="Meals per day" subtitle="Choose which meal types appear in your plan">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { type: 'Breakfast', emoji: '🌅', desc: 'Morning meal' },
            { type: 'Lunch',     emoji: '☀️',  desc: 'Midday meal'  },
            { type: 'Dinner',    emoji: '🌙', desc: 'Evening meal' },
            { type: 'Snack',     emoji: '🍎', desc: 'Between meals' },
          ].map(({ type, emoji, desc }) => {
            const active = (s.activeMealTypes || ['Breakfast','Lunch','Dinner','Snack']).includes(type);
            return (
              <button key={type}
                onClick={() => {
                  const current = s.activeMealTypes || ['Breakfast','Lunch','Dinner','Snack'];
                  const updated = current.includes(type)
                    ? current.filter(t => t !== type)
                    : [...current, type];
                  // Keep at least 1 meal type
                  if (updated.length === 0) return;
                  setSettings(prev => ({ ...prev, activeMealTypes: updated }));
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-light)' : 'var(--surface2)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: active ? 'var(--accent)' : 'var(--text)' }}>{type}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{desc}</p>
                  </div>
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border2)'}`,
                  background: active ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
          {(s.activeMealTypes || ['Breakfast','Lunch','Dinner','Snack']).length} meal{(s.activeMealTypes || ['Breakfast','Lunch','Dinner','Snack']).length !== 1 ? 's' : ''} per day · Plan view and generator will update automatically
        </p>
      </Section>

      {/* ── Diet ── */}
      <Section title="Diet" subtitle="General dietary preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Toggle
            label="🥦 Vegetarian"
            subtitle="No meat or fish"
            value={s.vegetarian || false}
            onChange={v => setSettings(prev => ({ ...prev, vegetarian: v }))}
          />
          <Toggle
            label="🌱 Vegan"
            subtitle="No animal products"
            value={s.vegan || false}
            onChange={v => setSettings(prev => ({ ...prev, vegan: v }))}
          />
          <Toggle
            label="🌾 Gluten-free"
            subtitle="Avoid gluten-containing ingredients"
            value={s.glutenFree || false}
            onChange={v => setSettings(prev => ({ ...prev, glutenFree: v }))}
          />
          <Toggle
            label="🥛 Dairy-free"
            subtitle="Avoid dairy products"
            value={s.dairyFree || false}
            onChange={v => setSettings(prev => ({ ...prev, dairyFree: v }))}
          />
        </div>
      </Section>

      {/* ── Allergies ── */}
      <Section title="Allergies" subtitle="Select ingredients you're allergic to — these will be flagged in recipes">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {COMMON_ALLERGENS.map(a => (
            <Chip
              key={a} label={a} color="red"
              selected={(s.allergies || []).includes(a)}
              onToggle={() => toggle('allergies', a)}
            />
          ))}
        </div>
        {/* Custom allergy input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customAllergyInput}
            onChange={e => setCustomAllergyInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustom('allergies', customAllergyInput, setCustomAllergyInput); }}
            placeholder="Add custom allergy..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={() => addCustom('allergies', customAllergyInput, setCustomAllergyInput)}
            style={{ padding: '11px 16px', background: 'var(--red-light)', color: 'var(--red)', borderRadius: 10, fontWeight: 600, fontSize: 14 }}
          >
            Add
          </button>
        </div>
        {/* Custom allergies */}
        {(s.allergies || []).filter(a => !COMMON_ALLERGENS.includes(a)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {(s.allergies || []).filter(a => !COMMON_ALLERGENS.includes(a)).map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--red-light)', color: 'var(--red)', borderRadius: 20, padding: '5px 12px', fontSize: 13, fontWeight: 500 }}>
                {a}
                <button onClick={() => removeCustom('allergies', a)} style={{ color: 'var(--red)', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Foods to avoid ── */}
      <Section title="Foods to avoid" subtitle="Ingredients or foods you dislike — filtered from suggestions">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {FOODS_TO_AVOID.map(f => (
            <Chip
              key={f} label={f} color="amber"
              selected={(s.avoid || []).includes(f)}
              onToggle={() => toggle('avoid', f)}
            />
          ))}
        </div>
        {/* Custom avoid input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customAvoidInput}
            onChange={e => setCustomAvoidInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustom('avoid', customAvoidInput, setCustomAvoidInput); }}
            placeholder="Add food to avoid..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={() => addCustom('avoid', customAvoidInput, setCustomAvoidInput)}
            style={{ padding: '11px 16px', background: 'var(--amber-light)', color: 'var(--amber)', borderRadius: 10, fontWeight: 600, fontSize: 14 }}
          >
            Add
          </button>
        </div>
        {(s.avoid || []).filter(a => !FOODS_TO_AVOID.includes(a)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {(s.avoid || []).filter(a => !FOODS_TO_AVOID.includes(a)).map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--amber-light)', color: 'var(--amber)', borderRadius: 20, padding: '5px 12px', fontSize: 13, fontWeight: 500 }}>
                {a}
                <button onClick={() => removeCustom('avoid', a)} style={{ color: 'var(--amber)', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Summary ── */}
      {((s.allergies || []).length > 0 || (s.avoid || []).length > 0) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 10 }}>Your restrictions at a glance</p>
          {(s.allergies || []).length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>Allergies: </span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{(s.allergies || []).join(', ')}</span>
            </div>
          )}
          {(s.avoid || []).length > 0 && (
            <div>
              <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>Avoiding: </span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{(s.avoid || []).join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
