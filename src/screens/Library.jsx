import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Poster, Squiggle, SectionHead } from '../components/ui.jsx';
import { fetchAllRecordViews } from '../db/records.js';
import styles from './Library.module.css';

function LibraryScreen({ onOpen, onSearch }) {
  const [active, setActive] = React.useState('all');
  const records = useLiveQuery(fetchAllRecordViews, []) ?? [];

  const shelfCounts = Object.keys(CATS).map(cat => ({
    cat,
    n: records.filter(r => r.cat === cat).length,
  })).filter(c => c.n > 0);

  const total    = records.length;
  const filtered = active === 'all' ? records : records.filter(r => r.cat === active);
  const books    = records.filter(r => r.cat === 'book');
  const movies   = records.filter(r => r.cat === 'movie');

  return (
    <div className={`screen screen-anim ${styles.screen}`}>
      <div className={styles.topBar}>
        <div className={`t-display ${styles.topBarTitle}`}>나의 책장</div>
        <div className={`t-head muted ${styles.topBarCount}`}>총 {total}개</div>
      </div>
      <Squiggle w={130} style={{ margin: '8px 0 14px' }} />

      <button onClick={onSearch} className={`card-flat ${styles.searchBtn}`}>
        <Icon name="search" size={20} />
        <span className={`muted ${styles.searchBtnLabel}`}>제목 · 작가 · 태그 검색</span>
      </button>

      <div className={styles.filterRow}>
        <button onClick={() => setActive('all')} className="filter-btn">
          <span className="pill" style={{
            background: active === 'all' ? 'var(--ink)' : '#fff',
            color: active === 'all' ? '#fff' : 'var(--ink)',
          }}>전체 {total}</span>
        </button>
        {shelfCounts.map(({ cat, n }) => (
          <button key={cat} onClick={() => setActive(cat)} className="filter-btn">
            <span className="pill" style={{
              background: active === cat ? CATS[cat].color : '#fff',
              color: active === cat && cat !== 'movie' && cat !== 'exhibit' ? '#fff' : 'var(--ink)',
            }}>
              <Icon name={CATS[cat].icon} size={15} />{CATS[cat].ko} {n}
            </span>
          </button>
        ))}
      </div>

      <SectionHead title="📌 최근 추가" action="더보기" />
      <div className={styles.recentGrid}>
        {filtered.slice(0, 3).map(rec => (
          <div key={rec.id} onClick={() => onOpen(rec.id)} className={styles.recentItem}>
            <Poster rec={rec} w={'100%'} h={148} radius={12} />
            <div className={`t-head ${styles.recentTitle}`}>{rec.title}</div>
            <div className={styles.recentStars}><Stars value={rec.rating} size={11} /></div>
          </div>
        ))}
      </div>

      {books.length > 0 && <SectionHead title={`📚 책 ${books.length}권`} action="정렬" />}
      {books.length > 0 && (
        <div className={styles.bookSection}>
          <div className={styles.bookRow}>
            {books.map((b, i) => (
              <div
                key={b.id}
                onClick={() => onOpen(b.id)}
                className={styles.bookSpine}
                style={{
                  height: 110 + (i % 3) * 14,
                  background: b.cover,
                  color: b.coverFg,
                  transform: `rotate(${(i % 4 - 1.5) * 0.6}deg)`,
                }}
              >
                <div className={styles.bookSpineTitle}>{b.title}</div>
              </div>
            ))}
          </div>
          <div className={styles.shelfPlank} />
          <div className={styles.shelfBase} />
        </div>
      )}

      {movies.length > 0 && <SectionHead title={`🎬 영화 ${movies.length}편`} action="더보기" />}
      {movies.length > 0 && (
        <div className={styles.movieGrid}>
          {movies.map(m => (
            <div
              key={m.id}
              onClick={() => onOpen(m.id)}
              className={styles.movieCard}
              style={{ background: m.cover, color: m.coverFg }}
            >
              <div className={styles.movieCardHeader}><Icon name="film" size={16} /></div>
              <div className={`t-display ${styles.movieCardTitle}`}>{m.title}</div>
            </div>
          ))}
        </div>
      )}

      {records.length === 0 && (
        <div className={`muted ${styles.emptyMsg}`}>아직 기록이 없어요</div>
      )}
    </div>
  );
}

export { LibraryScreen };
