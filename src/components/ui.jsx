import React from 'react';
import { CATS } from '../data.js';

// components.jsx — shared UI primitives for the prototype

// ─── Icons (thick-stroke line, chunky) ──────────────────────
function Icon({ name, size = 24, fill = 'none', style = {} }) {
  const p = { className: 'ico', strokeWidth: 2.4 };
  const paths = {
    home: <><path {...p} d="M4 11.5 12 4l8 7.5" /><path {...p} d="M6 10v9.5h12V10" /></>,
    grid: <><rect {...p} x="4" y="4" width="7" height="7" rx="1.6"/><rect {...p} x="13" y="4" width="7" height="7" rx="1.6"/><rect {...p} x="4" y="13" width="7" height="7" rx="1.6"/><rect {...p} x="13" y="13" width="7" height="7" rx="1.6"/></>,
    plus: <><path {...p} d="M12 6v12M6 12h12" /></>,
    user: <><circle {...p} cx="12" cy="8" r="3.6"/><path {...p} d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></>,
    search: <><circle {...p} cx="11" cy="11" r="6.5"/><path {...p} d="m20 20-3.6-3.6"/></>,
    back: <><path {...p} d="M15 5 8 12l7 7"/></>,
    close: <><path {...p} d="M6 6l12 12M18 6 6 18"/></>,
    bell: <><path {...p} d="M6 16V11a6 6 0 1 1 12 0v5l1.6 2H4.4z"/><path {...p} d="M10 20a2 2 0 0 0 4 0"/></>,
    heart: <><path {...p} d="M12 20S4 14.5 4 9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 8 2.2C20 14.5 12 20 12 20Z"/></>,
    bookmark: <><path {...p} d="M7 4h10v16l-5-3.5L7 20z"/></>,
    book: <><path {...p} d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path {...p} d="M14 4v13"/></>,
    film: <><rect {...p} x="4" y="5" width="16" height="14" rx="2"/><path {...p} d="M9 5v14M15 5v14M4 9.7h5M15 9.7h5M4 14.3h5M15 14.3h5"/></>,
    tv: <><rect {...p} x="3.5" y="6.5" width="17" height="11" rx="2"/><path {...p} d="m8 3.5 4 3 4-3"/></>,
    play: <><circle {...p} cx="12" cy="12" r="8"/><path {...p} d="m10 8.5 5 3.5-5 3.5z" fill="currentColor"/></>,
    frame: <><rect {...p} x="4" y="4" width="16" height="16" rx="1.6"/><path {...p} d="m7 16 3.5-4 2.5 2.5L16 10l1 1.5"/><circle {...p} cx="9" cy="8.5" r="1.3"/></>,
    mask: <><path {...p} d="M5 5c0 9 3 14 7 14s7-5 7-14c-2.5 1-4.5 1.5-7 1.5S7.5 6 5 5Z"/><circle cx="9.5" cy="11" r="1" fill="currentColor"/><circle cx="14.5" cy="11" r="1" fill="currentColor"/></>,
    ticket: <><path {...p} d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 4H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4Z"/><path {...p} strokeDasharray="2 2" d="M13 6v12"/></>,
    camera: <><rect {...p} x="3.5" y="7" width="17" height="12" rx="2.4"/><circle {...p} cx="12" cy="13" r="3.2"/><path {...p} d="M8.5 7l1.3-2h4.4l1.3 2"/></>,
    calendar: <><rect {...p} x="4" y="5.5" width="16" height="14" rx="2"/><path {...p} d="M4 10h16M8 3.5v4M16 3.5v4"/></>,
    pin: <><path {...p} d="M12 21c4-4.5 6-7.6 6-10.5A6 6 0 0 0 6 10.5C6 13.4 8 16.5 12 21Z"/><circle {...p} cx="12" cy="10.5" r="2.2"/></>,
    chevron: <><path {...p} d="m9 5 7 7-7 7"/></>,
    settings: <><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/></>,
    download: <><path {...p} d="M12 4v10m0 0 4-4m-4 4-4-4"/><path {...p} d="M5 18h14"/></>,
    lock: <><rect {...p} x="5" y="10.5" width="14" height="9.5" rx="2"/><path {...p} d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></>,
    chart: <><path {...p} d="M4 20V4M4 20h16"/><rect {...p} x="7" y="12" width="3" height="5"/><rect {...p} x="12.5" y="8" width="3" height="9"/><rect {...p} x="18" y="14" width="0" height="3"/></>,
    share: <><circle {...p} cx="6" cy="12" r="2.5"/><circle {...p} cx="17" cy="6" r="2.5"/><circle {...p} cx="17" cy="18" r="2.5"/><path {...p} d="m8.2 10.8 6.6-3.6M8.2 13.2l6.6 3.6"/></>,
    edit: <><path {...p} d="M5 19h14"/><path {...p} d="M14 5.5 18.5 10 9 19.5H5V15z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} style={style}>
      {paths[name] || null}
    </svg>
  );
}

// ─── Star rating ────────────────────────────────────────────
function Stars({ value = 0, size = 15, gap = 1 }) {
  return (
    <span style={{ display: 'inline-flex', gap }}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20">
          <path d="M10 1.6l2.5 5.3 5.8.8-4.2 4 1 5.8L10 14.9 4.8 17.5l1-5.8-4.2-4 5.8-.8z"
            fill={i < value ? 'var(--yellow)' : 'none'} stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );
}

// ─── Category chip ──────────────────────────────────────────
function CatChip({ cat, size = 13, solid = false }) {
  const c = CATS[cat];
  if (!c) return null;
  return (
    <span className="pill" style={{
      fontSize: size, padding: `4px 10px`,
      background: solid ? c.color : '#fff',
      color: solid && (cat==='movie'||cat==='exhibit') ? 'var(--ink)' : solid ? '#fff' : 'var(--ink)',
    }}>
      <Icon name={c.icon} size={size + 3} />
      {c.ko}
    </span>
  );
}

// ─── Poster / cover placeholder ─────────────────────────────
function Poster({ rec, w, h, tilt = 0, radius = 8, showTitle = true }) {
  const cover = rec.cover || '#E9DCC0';
  const fg = rec.coverFg || 'var(--ink)';
  const nw = typeof w === 'number' ? w : 120;  // fallback for '100%' etc
  return (
    <div style={{
      width: w, height: h, background: cover, color: fg,
      border: '2px solid var(--ink)', borderRadius: radius,
      transform: tilt ? `rotate(${tilt}deg)` : undefined,
      position: 'relative', flex: 'none', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: 8, boxSizing: 'border-box',
    }}>
      {/* faux cover composition */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <span style={{ opacity: 0.85 }}><Icon name={CATS[rec.cat].icon} size={Math.min(18, nw*0.18)} /></span>
      </div>
      {showTitle && (
        <div style={{
          fontFamily: 'var(--font-display)', lineHeight: 1.04,
          fontSize: Math.max(11, Math.min(20, nw * 0.16)),
          textShadow: fg === '#fff' ? '0 1px 2px rgba(0,0,0,0.25)' : 'none',
        }}>{rec.title}</div>
      )}
    </div>
  );
}

// ─── Squiggle (hand-drawn marker accent) ────────────────────
function Squiggle({ w = 120, color = 'var(--yellow)', sw = 6, style = {} }) {
  return (
    <svg width={w} height="16" viewBox={`0 0 ${w} 16`} className="squiggle" style={style}>
      <path d={`M3 11 Q ${w*0.18} 2, ${w*0.34} 9 T ${w*0.66} 8 T ${w-3} 6`}
        fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

// ─── Section header ─────────────────────────────────────────
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'2px 0 12px' }}>
      <h3 className="t-head" style={{ margin:0, fontSize:20 }}>{title}</h3>
      {action && <button onClick={onAction} className="t-head" style={{ background:'none', border:'none', color:'var(--coral-d)', fontSize:13, cursor:'pointer', textDecoration:'underline' }}>{action}</button>}
    </div>
  );
}

// ─── Status pills (완독 / 보는 중 / 중도하차 / N차) ──────────
function statusPills(rec) {
  const out = [];
  const longForm = rec.cat==='book' || rec.cat==='drama' || rec.cat==='ott';
  if (rec.status === 'watching') {
    const lbl = (rec.span && rec.span.current) ? `${rec.span.current}화 보는 중` : '보는 중';
    out.push({ label: lbl, tone: 'var(--status-watching)', fg: 'var(--ink)' });
  } else if (rec.status === 'dropped') {
    out.push({ label: '중도하차', tone: 'var(--status-dropped)', fg: '#fff' });
  } else if (rec.status === 'done' && longForm) {
    out.push({ label: '완독', tone: 'var(--status-done)', fg: 'var(--ink)', icon: 'bookmark' });
  }
  if (rec.times && rec.times > 1) {
    out.push({ label: `${rec.times}차`, tone: 'var(--status-times)', fg: 'var(--ink)' });
  }
  return out;
}

function StatusPills({ rec, size = 12 }) {
  const pills = statusPills(rec);
  if (!pills.length) return null;
  return (
    <span style={{ display:'inline-flex', gap:6, flexWrap:'wrap' }}>
      {pills.map((p,i) => (
        <span key={i} className="pill" style={{ background:p.tone, color:p.fg, fontSize:size, padding:'3px 10px' }}>
          {p.icon && <Icon name={p.icon} size={size+1} />}{p.label}
        </span>
      ))}
    </span>
  );
}

// shared inline-style objects used across screens
const iconBtn = { position:'relative', width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'#fff' };
const btnReset = { background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', color:'var(--ink)' };

export { Icon, Stars, CatChip, Poster, Squiggle, SectionHead, statusPills, StatusPills, iconBtn, btnReset };
