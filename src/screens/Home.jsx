import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Squiggle, StatusPills } from '../components/ui.jsx';
import { PhotoSlider } from '../components/PhotoSlider.jsx';
import { fetchAllRecordViews } from '../db/records.js';
import styles from './Home.module.css';

function FeedPost({ rec, onOpen }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <article className={`card ${styles.feedPost}`} onClick={() => onOpen(rec.id)}>
      <div className={styles.feedHeader}>
        <CatChip cat={rec.cat} solid />
        <div className={styles.feedHeaderMeta}>
          <div className={`t-head ${styles.feedHeaderPlace}`}>{rec.place && <Icon name="pin" size={13} />}{rec.place}</div>
          <div className={`muted ${styles.feedHeaderDate}`}>
            {rec.span ? `${rec.span.start} ~ ${rec.span.end || '진행 중'}` : rec.when}
          </div>
        </div>
        <StatusPills rec={rec} />
      </div>

      <div className={styles.coverBox} style={{ background: rec.cover }}>
        {rec.coverUrl ? (
          <img src={rec.coverUrl} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
        ) : (
          <div className={styles.coverContent} style={{ color: rec.coverFg }}>
            <div className={styles.coverIcon}><Icon name={CATS[rec.cat]?.icon} size={40} /></div>
            <div className={`t-display ${styles.coverTitle}`} style={{
              textShadow: rec.coverFg === '#fff' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            }}>{rec.title}</div>
          </div>
        )}
        <div className={styles.ratingBadge}>
          <Stars value={rec.rating} size={13} />
        </div>
      </div>

      <div className={styles.caption}>
        <div className={styles.captionTop}>
          <span className={`t-head ${styles.captionTitle}`}>
            {rec.title}{rec.releaseYear && <span className={`muted ${styles.captionYear}`}> ({rec.releaseYear})</span>}
          </span>
          <div className={styles.rgt}>
            <button onClick={(e) => { e.stopPropagation(); setSaved(v => !v); }} className="btn-reset">
              <Icon name={saved ? 'bookmark' : 'bookmarkBorder'} size={24} fill={saved ? 'var(--green)' : 'none'} />
            </button>
          </div>
        </div>
        <div className={styles.captionText}>
          {rec.creator && <span className={`muted ${styles.captionCreator}`}>{rec.creator}</span>}
          {rec.note && <p className={styles.captionNote}>{rec.note}</p>}
        </div>
        {rec.quote && (
          <div className={styles.quoteBox}>
            <span className={styles.quoteAccent}><Icon name="quote" size={14} style={{ transform: 'rotate(180deg)' }} /> </span>
            {rec.quote}
          </div>
        )}
        {rec.photos?.length > 0 && (
          <div style={{ margin: '15px 0 0' }} onClick={e => e.stopPropagation()}>
            <PhotoSlider photos={rec.photos} />
          </div>
        )}
      </div>

      <div className={styles.spacer} />
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
            background: activeCat === 'all' ? 'var(--ink)' : undefined,
            color: activeCat === 'all' ? '#fff' : 'var(--ink)',
          }}>전체</span>
        </button>
        {Object.keys(CATS).map(k => (
          <button key={k} onClick={() => setActiveCat(k)} className="filter-btn">
            <CatChip cat={k} solid={activeCat === k} />
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
