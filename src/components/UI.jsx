import React from 'react';

// ── Icons ──────────────────────────────────────────────────────────────────
export const Icon = ({ name, size = 18 }) => {
  const s = { width: size, height: size, display: 'inline-block', flexShrink: 0 };
  const icons = {
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    book: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    shopping: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    box: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    leaf: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.402 17.07 2 22z"/>
      </svg>
    ),
    sparkle: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    plus: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    trash: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    zap: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    chevronRight: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    ),
    chevronDown: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    ),
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
    ),
    import: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    share: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

// ── Tag pill ───────────────────────────────────────────────────────────────
export const Tag = ({ label }) => (
  <span style={{
    fontSize: 11, padding: '3px 9px', borderRadius: 20,
    background: 'var(--accent-light)', color: 'var(--accent)',
    fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-block',
  }}>{label}</span>
);

// ── Macro badges ───────────────────────────────────────────────────────────
export const MacroBar = ({ recipe }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
    {[
      ['Cal', recipe.calories, 'var(--amber)'],
      ['P', recipe.protein + 'g', 'var(--blue)'],
      ['C', recipe.carbs + 'g', 'var(--accent-mid)'],
      ['F', recipe.fat + 'g', 'var(--red)'],
    ].map(([k, v, c]) => (
      <div key={k} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'var(--surface2)', borderRadius: 8, padding: '4px 10px', minWidth: 46,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: c }}>{v}</span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{k}</span>
      </div>
    ))}
  </div>
);

// ── Bottom sheet modal ─────────────────────────────────────────────────────
export const BottomSheet = ({ onClose, title, children, fullHeight, stickyFooter }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end',
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div
      className="slide-up"
      style={{
        background: 'var(--surface)', width: '100%',
        borderRadius: '20px 20px 0 0',
        maxHeight: fullHeight ? '95dvh' : '80dvh',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Handle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
      </div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 20px 16px',
      }}>
        <h2 style={{ fontSize: 20 }}>{title}</h2>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text2)',
        }}>
          <Icon name="x" size={16} />
        </button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {children}
      </div>
      {/* Sticky footer */}
      {stickyFooter && (
        <div style={{
          padding: '12px 20px',
          paddingBottom: 'calc(var(--safe-bottom) + 12px)',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
        }}>
          {stickyFooter}
        </div>
      )}
    </div>
  </div>
);

// ── Center modal (desktop-friendly) ───────────────────────────────────────
export const CenterModal = ({ onClose, title, children }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div
      className="slide-up"
      style={{
        background: 'var(--surface)', borderRadius: 20,
        width: '100%', maxWidth: 520, maxHeight: '88dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 0',
      }}>
        <h2 style={{ fontSize: 20 }}>{title}</h2>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text2)',
        }}>
          <Icon name="x" size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {children}
      </div>
    </div>
  </div>
);

// ── Input field ────────────────────────────────────────────────────────────
export const Field = ({ label, children, style }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && (
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
    )}
    {children}
  </div>
);

export const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 10, fontSize: 16,
  background: 'var(--surface2)',
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.15s',
};

// ── Btn ────────────────────────────────────────────────────────────────────
export const Btn = ({ onClick, children, variant = 'primary', disabled, style: extra, fullWidth, size = 'md' }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, fontWeight: 600, borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s, transform 0.1s',
    border: 'none', fontFamily: 'inherit', width: fullWidth ? '100%' : 'auto',
    fontSize: size === 'sm' ? 13 : 15,
    padding: size === 'sm' ? '8px 14px' : '12px 20px',
  };
  const variants = {
    primary:  { background: 'var(--accent)', color: '#fff' },
    secondary:{ background: 'var(--surface2)', color: 'var(--text)' },
    ghost:    { background: 'transparent', color: 'var(--text2)', border: '1.5px solid var(--border)' },
    accent:   { background: 'var(--accent-light)', color: 'var(--accent)' },
    danger:   { background: 'var(--red-light)', color: 'var(--red)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...extra }}>
      {children}
    </button>
  );
};

// ── Loading spinner ────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: `2px solid var(--border2)`,
    borderTopColor: 'var(--accent)',
    animation: 'spin 0.7s linear infinite',
  }} />
);

// ── Empty state ────────────────────────────────────────────────────────────
export const Empty = ({ emoji, title, subtitle }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
    <p style={{ fontSize: 16, color: 'var(--text2)', fontWeight: 500, marginBottom: 6 }}>{title}</p>
    {subtitle && <p style={{ fontSize: 14 }}>{subtitle}</p>}
  </div>
);
