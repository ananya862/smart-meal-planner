import React, { useState } from 'react';
import { Icon, Tag, MacroBar, Btn } from './UI.jsx';

export default function RecipeCard({ recipe, onAddToMeal, onDelete, compact }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: compact ? '12px 14px' : '16px',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: compact ? 15 : 17, marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>
            {recipe.name}
          </h3>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Icon name="clock" size={12} /> {recipe.prepTime + recipe.cookTime} min
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Icon name="users" size={12} /> {recipe.servings} servings
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {recipe.tags.slice(0, 3).map(t => <Tag key={t} label={t} />)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {onAddToMeal && (
            <button
              onClick={() => onAddToMeal(recipe)}
              style={{
                width: 36, height: 36, borderRadius: 10, background: 'var(--accent-light)',
                color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="plus" size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--surface2)', color: 'var(--text3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          )}
        </div>
      </div>

      {!compact && (
        <>
          <MacroBar recipe={recipe} />
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: 12, fontSize: 13, color: 'var(--accent)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {expanded ? 'Hide details' : 'View recipe'}
            <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
          </button>
          {expanded && (
            <div className="fade-in" style={{ marginTop: 12, fontSize: 14 }}>
              <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Ingredients</p>
              <ul style={{ listStyle: 'none', marginBottom: 14 }}>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} style={{ padding: '3px 0', color: 'var(--text2)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--accent-mid)', fontSize: 12, marginTop: 2 }}>●</span>
                    {ing.qty} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
              <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Steps</p>
              <ol style={{ paddingLeft: 18 }}>
                {recipe.steps.map((s, i) => (
                  <li key={i} style={{ marginBottom: 6, color: 'var(--text2)' }}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
