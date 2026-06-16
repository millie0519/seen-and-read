import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Squiggle, StatusPills } from '../components/ui.jsx';
import { fetchAllRecordViews } from '../db/records.js';
import styles from './Home.module.css';

function FeedPost({ rec, onOpen }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <article className={`card ${styles.feedPost}`} onClick={() => onOpen(rec.id)}>
      <div className={styles.feedHeader}>
        <CatChip cat={rec.cat} solid />
        <div className={styles.feedHeaderMeta}>
          <div className={`t-head ${styles.feedHeaderPlace}`}>{rec.place}</div>
          <div className={`muted ${styles.feedHeaderDate}`}>
            {rec.span ? `${rec.span.start} ~ ${rec.span.end || '진행 중'}` : rec.when}
          </div>
        </div>
        <StatusPills rec={rec} />
      </div>

      <div className={styles.coverBox} style={{ background: rec.cover }}>
        <div className={styles.coverContent} style={{ color: rec.coverFg }}>
          <div className={styles.coverIcon}><Icon name={CATS[rec.cat]?.icon} size={40} /></div>
          <div className={`t-display ${styles.coverTitle}`} style={{
            textShadow: rec.coverFg === '#fff' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}>{rec.title}</div>
        </div>
        <div className={styles.ratingBadge}>
          <Stars value={rec.rating} size={13} />
        </div>
      </div>

      <div className={styles.feedActions}>
        <div className={styles.feedActionSpacer} />
        <button onClick={(e) => { e.stopPropagation(); setSaved(v => !v); }} className="btn-reset">
          <span style={{ color: saved ? 'var(--coral)' : 'var(--ink)' }}>
            <Icon name="bookmark" size={24} fill={saved ? 'var(--coral)' : 'none'} />
          </span>
        </button>
      </div>

      <div className={styles.caption}>
        <div className={styles.captionText}>
          <span className={`t-head ${styles.captionTitle}`}>{rec.title}</span>
          {rec.creator && <span className={`muted ${styles.captionCreator}`}>· {rec.creator}</span>}
          <br />{rec.note}
        </div>
        {rec.quote && (
          <div className={styles.quoteBox}>
            <span className={styles.quoteAccent}>" </span>
            {rec.quote}
            <span className={styles.quoteAccent}> "</span>
          </div>
        )}
      </div>

      {rec.with && (
        <div className={styles.withLine}>
          <span className={`t-head ${styles.withText}`}>함께 · {rec.with}</span>
        </div>
      )}
      {!rec.with && <div className={styles.spacer} />}
    </article>
  );
}

function HomeScreen({ onOpen, onSearch }) {
  const [activeCat, setActiveCat] = React.useState('all');
  const records = useLiveQuery(fetchAllRecordViews, []) ?? [];
  const filtered = activeCat === 'all' ? records : records.filter(r => r.cat === activeCat);

  return (
    <div className={`screen screen-anim ${styles.screen}`}>
      <div className={styles.topBar}>
        <div>
          <div className={`t-display ${styles.topBarTitle}`}>오늘의 기록</div>
          <div className={`muted ${styles.topBarCount}`}>총 {records.length}개를 봤어요</div>
        </div>
        <div className={styles.topBarActions}>
          <button onClick={onSearch} className="card-flat icon-btn">
            <Icon name="search" size={22} />
          </button>
        </div>
      </div>

      <Squiggle w={150} style={{ marginBottom: 12 }} />

      <div className={styles.filterRow}>
        <button onClick={() => setActiveCat('all')} className="filter-btn">
          <span className="pill" style={{
            background: activeCat === 'all' ? 'var(--ink)' : '#fff',
            color: activeCat === 'all' ? '#fff' : 'var(--ink)',
          }}>전체</span>
        </button>
        {Object.keys(CATS).map(k => (
          <button key={k} onClick={() => setActiveCat(k)} className="filter-btn">
            <CatChip cat={k} />
          </button>
        ))}
      </div>

      {filtered.map(rec => <FeedPost key={rec.id} rec={rec} onOpen={onOpen} />)}

      {filtered.length === 0 && records.length > 0 && (
        <div className={`muted ${styles.emptyMsg}`}>이 카테고리 기록이 없어요</div>
      )}
      {records.length === 0 && (
        <div className={`muted ${styles.emptyMsg}`}>기록 버튼을 눌러 첫 기록을 남겨보세요</div>
      )}

      <div className={`muted ${styles.endLine}`}>— 여기까지 봤어요 —</div>
    </div>
  );
}

export { HomeScreen };
