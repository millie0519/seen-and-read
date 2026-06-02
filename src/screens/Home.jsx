import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Squiggle, StatusPills, iconBtn, btnReset } from '../components/ui.jsx';
import { fetchAllRecordViews } from '../db/records.js';

function FeedPost({ rec, onOpen }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <article className="card" onClick={() => onOpen(rec.id)} style={{ marginBottom: 18, overflow: 'hidden', cursor: 'pointer' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 10px' }}>
        <CatChip cat={rec.cat} solid />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-head" style={{ fontSize: 13, lineHeight: 1.2 }}>{rec.place}</div>
          <div className="muted" style={{ fontSize: 11 }}>
            {rec.span ? `${rec.span.start} ~ ${rec.span.end || '진행 중'}` : rec.when}
          </div>
        </div>
        <StatusPills rec={rec} />
      </div>

      {/* cover */}
      <div style={{
        position: 'relative', margin: '0 14px',
        height: 300, borderRadius: 16, overflow: 'hidden',
        border: '2.5px solid var(--ink)', background: rec.cover,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: rec.coverFg, padding: 20 }}>
          <div style={{ opacity: 0.9, marginBottom: 10 }}><Icon name={CATS[rec.cat]?.icon} size={40} /></div>
          <div className="t-display" style={{ fontSize: 30, lineHeight: 1.05,
            textShadow: rec.coverFg === '#fff' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>{rec.title}</div>
        </div>
        <div style={{ position: 'absolute', left: 10, bottom: 10,
          background: '#fff', border: '2px solid var(--ink)', borderRadius: 999,
          padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Stars value={rec.rating} size={13} />
        </div>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 8px' }}>
        <div style={{ flex: 1 }} />
        <button onClick={(e) => { e.stopPropagation(); setSaved(v => !v); }} style={btnReset}>
          <span style={{ color: saved ? 'var(--coral)' : 'var(--ink)' }}>
            <Icon name="bookmark" size={24} fill={saved ? 'var(--coral)' : 'none'} />
          </span>
        </button>
      </div>

      {/* caption */}
      <div style={{ padding: '0 16px 6px' }}>
        <div style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
          <span className="t-head" style={{ marginRight: 6 }}>{rec.title}</span>
          {rec.creator && <span className="muted" style={{ fontSize: 13, marginRight: 6 }}>· {rec.creator}</span>}
          <br />{rec.note}
        </div>
        {rec.quote && (
          <div style={{ marginTop: 10, background: 'var(--paper-2)', border: '2px solid var(--ink)',
            borderRadius: 12, padding: '9px 12px', fontSize: 14, lineHeight: 1.45, fontStyle: 'italic' }}>
            <span style={{ color: 'var(--coral-d)', fontFamily: 'var(--font-head)', fontStyle: 'normal' }}>" </span>
            {rec.quote}
            <span style={{ color: 'var(--coral-d)', fontFamily: 'var(--font-head)', fontStyle: 'normal' }}> "</span>
          </div>
        )}
      </div>

      {rec.with && (
        <div style={{ padding: '4px 16px 16px' }}>
          <span className="t-head" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>함께 · {rec.with}</span>
        </div>
      )}
      {!rec.with && <div style={{ height: 14 }} />}
    </article>
  );
}

function HomeScreen({ onOpen, onSearch }) {
  const [activeCat, setActiveCat] = React.useState('all');
  const records = useLiveQuery(fetchAllRecordViews, []) ?? [];

  const filtered = activeCat === 'all' ? records : records.filter(r => r.cat === activeCat);

  return (
    <div className="screen screen-anim" style={{ padding: '4px 16px 0' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 6px' }}>
        <div>
          <div className="t-display" style={{ fontSize: 30, lineHeight: 1 }}>오늘의 기록</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>총 {records.length}개를 봤어요</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onSearch} className="card-flat" style={iconBtn}>
            <Icon name="search" size={22} />
          </button>
        </div>
      </div>

      <Squiggle w={150} style={{ marginBottom: 12 }} />

      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 14px' }}>
        <button onClick={() => setActiveCat('all')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', flex: 'none' }}>
          <span className="pill" style={{ background: activeCat === 'all' ? 'var(--ink)' : '#fff', color: activeCat === 'all' ? '#fff' : 'var(--ink)' }}>전체</span>
        </button>
        {Object.keys(CATS).map(k => (
          <button key={k} onClick={() => setActiveCat(k)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', flex: 'none' }}>
            <CatChip cat={k} />
          </button>
        ))}
      </div>

      {filtered.map(rec => <FeedPost key={rec.id} rec={rec} onOpen={onOpen} />)}

      {filtered.length === 0 && records.length > 0 && (
        <div className="muted" style={{ textAlign: 'center', fontSize: 14, padding: '40px 0' }}>이 카테고리 기록이 없어요</div>
      )}
      {records.length === 0 && (
        <div className="muted" style={{ textAlign: 'center', fontSize: 14, padding: '40px 0' }}>기록 버튼을 눌러 첫 기록을 남겨보세요</div>
      )}

      <div className="muted" style={{ textAlign: 'center', fontSize: 13, padding: '4px 0 20px' }}>
        — 여기까지 봤어요 —
      </div>
    </div>
  );
}

export { HomeScreen };
