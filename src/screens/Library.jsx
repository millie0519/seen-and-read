import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Squiggle, SectionHead } from '../components/ui.jsx';
import { fetchAllRecordViews } from '../db/records.js';
import styles from './Library.module.css';

const CAT_SUFFIX = {
  book: '권', movie: '편', drama: '편',
  exhibit: '개', stage: '편', concert: '회',
  sports: '경기', festival: '개', etc: '개',
};

function renderCard(rec, onOpen, styles) {
  if (rec.cat === 'book') {
    return (
      <div key={rec.id} onClick={() => onOpen(rec.id)} className={styles.bookItem}>
        <div className={styles.bookCard}>
          <div className={styles.bookCardCover} style={{ background: rec.cover, color: rec.coverFg }}>
            {rec.coverUrl ? (
              <img src={rec.coverUrl} alt={rec.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Icon name="book" size={28} />
            )}
          </div>
        </div>
        <div className={`t-head ${styles.cardTitle}`}>{rec.title}</div>
      </div>
    );
  }

  if (rec.cat === 'movie') {
    return (
      <div key={rec.id} onClick={() => onOpen(rec.id)} className={styles.movieItem}>
        <div className={styles.movieCard}>
          <div className={styles.movieCardPhoto} style={{ background: rec.cover, color: rec.coverFg }}>
            {rec.coverUrl ? (
              <img src={rec.coverUrl} alt={rec.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Icon name="film" size={28} />
            )}
          </div>
        </div>
        <div className={`t-head ${styles.cardTitle}`}>{rec.title}</div>
      </div>
    );
  }

  return (
    <div key={rec.id} onClick={() => onOpen(rec.id)} className={styles.catItem}>
      <div className={styles.catCard} style={{ background: rec.cover, color: rec.coverFg }}>
        {rec.coverUrl ? (
          <img src={rec.coverUrl} alt={rec.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Icon name={CATS[rec.cat]?.icon} size={28} />
        )}
      </div>
      <div className={`t-head ${styles.cardTitle}`}>{rec.title}</div>
    </div>
  );
}

function LibraryScreen({ onOpen, onSearch }) {
  const [active, setActive] = React.useState('all');
  const records = useLiveQuery(fetchAllRecordViews, []) ?? [];

  const total = records.length;

  const shelfCounts = Object.keys(CATS).map(cat => ({
    cat,
    n: records.filter(r => r.cat === cat).length,
  })).filter(c => c.n > 0);

  // 카테고리별 그룹 (최근 등록 카테고리 순)
  const catOrder = [];
  const catMap = {};
  records.forEach(r => {
    if (!catMap[r.cat]) {
      catMap[r.cat] = [];
      catOrder.push(r.cat);
    }
    catMap[r.cat].push(r);
  });

  const visibleCats = active === 'all'
    ? catOrder
    : catOrder.filter(c => c === active);

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
            background: active === 'all' ? 'var(--ink)' : undefined,
            color: active === 'all' ? '#fff' : 'var(--ink)',
          }}>전체 {total}</span>
        </button>
        {shelfCounts.map(({ cat, n }) => (
          <button key={cat} onClick={() => setActive(cat)} className="filter-btn">
            <span className="pill" style={{
              background: active === cat ? CATS[cat].color : undefined,
              color: active === cat && cat !== 'movie' && cat !== 'exhibit' ? '#fff' : 'var(--ink)',
            }}>
              <Icon name={CATS[cat].icon} size={15} />{CATS[cat].ko} {n}
            </span>
          </button>
        ))}
      </div>

      {visibleCats.map(cat => {
        const items = catMap[cat];
        const isFiltered = active !== 'all';
        const shown = isFiltered ? items : items.slice(0, 6);
        const hasMore = !isFiltered && items.length > 6;

        return (
          <React.Fragment key={cat}>
            <SectionHead
              title={`${CATS[cat].ko} ${items.length}${CAT_SUFFIX[cat] ?? '개'}`}
              action={hasMore ? `전체보기` : undefined}
              onAction={() => setActive(cat)}
            />
            <div className={styles.catGrid}>
              {shown.map(rec => renderCard(rec, onOpen, styles))}
            </div>
          </React.Fragment>
        );
      })}

      {records.length === 0 && (
        <div className={`muted ${styles.emptyMsg}`}>아직 기록이 없어요</div>
      )}
    </div>
  );
}

export { LibraryScreen };
