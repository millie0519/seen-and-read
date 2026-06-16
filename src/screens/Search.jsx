import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip } from '../components/ui.jsx';
import { fetchAllRecordViews } from '../db/records.js';
import styles from './Search.module.css';

function SearchScreen({ onClose, onOpen }) {
  const [q, setQ]     = React.useState('');
  const [cat, setCat] = React.useState('all');
  const inputRef      = React.useRef(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const records = useLiveQuery(fetchAllRecordViews, []) ?? [];
  const recent  = ['김영하', '듄', '제주', '뮤지컬'];

  const results = records.filter(r => {
    const inCat  = cat === 'all' || r.cat === cat;
    const text   = [r.title, r.creator, ...(r.tags || []), r.place, r.note].filter(Boolean).join(' ').toLowerCase();
    const inQ    = !q.trim() || text.includes(q.trim().toLowerCase());
    return inCat && inQ;
  });

  const showResults = q.trim().length > 0;

  return (
    <div className={`screen-anim ${styles.container}`}>
      <div className={styles.header}>
        <button onClick={onClose} className="icon-btn" style={{ border: '2.5px solid var(--ink)', flex: 'none' }}><Icon name="back" size={22} /></button>
        <div className={`card-flat ${styles.searchBar}`}>
          <Icon name="search" size={20} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="내 기록에서 찾기"
            className="field-input" />
          {q && <button onClick={() => setQ('')} className="btn-reset"><Icon name="close" size={18} /></button>}
        </div>
      </div>

      <div className={styles.filterRow}>
        <button onClick={() => setCat('all')} className="filter-btn">
          <span className="pill" style={{ background: cat === 'all' ? 'var(--ink)' : '#fff', color: cat === 'all' ? '#fff' : 'var(--ink)' }}>전체</span>
        </button>
        {Object.keys(CATS).map(k => (
          <button key={k} onClick={() => setCat(k)} className="filter-btn">
            <span className="pill" style={{
              background: cat === k ? CATS[k].color : '#fff',
              color: cat === k && k !== 'movie' && k !== 'exhibit' ? '#fff' : 'var(--ink)',
            }}>
              <Icon name={CATS[k].icon} size={15} />{CATS[k].ko}
            </span>
          </button>
        ))}
      </div>

      <div className={`screen ${styles.body}`}>
        {!showResults ? (
          <>
            <div className={styles.recentHeader}>
              <h3 className={`t-head ${styles.recentTitle}`}>최근 검색</h3>
            </div>
            <div className={styles.recentChips}>
              {recent.map((t, i) => (
                <button key={i} onClick={() => setQ(t)} className={`pill ${styles.recentChipBtn}`}>
                  <Icon name="search" size={14} />{t}
                </button>
              ))}
            </div>
            <h3 className={`t-head ${styles.recentListTitle}`}>최근 기록</h3>
            <div className={styles.resultList}>
              {records.slice(0, 3).map(rec => <ResultRow key={rec.id} rec={rec} onOpen={onOpen} />)}
            </div>
          </>
        ) : (
          <>
            <div className={`muted ${styles.searchCount}`}>'{q}' 검색 결과 {results.length}개</div>
            {results.length > 0 ? (
              <div className={styles.resultList}>
                {results.map(rec => <ResultRow key={rec.id} rec={rec} onOpen={onOpen} />)}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={`t-head ${styles.emptyTitle}`}>기록이 없어요</div>
                <div className={`muted ${styles.emptyMsg}`}>
                  '{q}'에 대한 기록이 아직 없네요.<br />새로 남겨볼까요?
                </div>
              </div>
            )}
          </>
        )}
        <div className={styles.bottomSpacer} />
      </div>
    </div>
  );
}

function ResultRow({ rec, onOpen }) {
  return (
    <button onClick={() => onOpen(rec.id)} className={`card-flat ${styles.resultRow}`}>
      <div className={styles.resultThumb} style={{ background: rec.cover, color: rec.coverFg }}>
        <Icon name={CATS[rec.cat]?.icon} size={15} />
      </div>
      <div className={styles.resultMeta}>
        <div className={styles.resultCatRow}>
          <CatChip cat={rec.cat} size={11} />
        </div>
        <div className={`t-head ${styles.resultTitle}`}>{rec.title}</div>
        <div className={`muted ${styles.resultCreator}`}>{rec.creator}</div>
        <Stars value={rec.rating} size={11} />
      </div>
      <span className={styles.resultChevron}><Icon name="chevron" size={18} /></span>
    </button>
  );
}

export { SearchScreen };
