import React from 'react';
import {
  MdShelves, MdAdd, MdSearch, MdArrowBack, MdClose,
  MdNotifications, MdFavorite, MdBookmark, MdMenuBook,
  MdPlayCircle, MdTheaterComedy, MdConfirmationNumber,
  MdCameraAlt, MdCalendarMonth, MdLocationOn, MdChevronRight,
  MdSettings, MdDownload, MdLock, MdShare,
  MdOutlineFestival, MdStadium, MdMoreHoriz,
  MdBookmarkBorder, MdCollectionsBookmark, MdFace, MdCheck,
} from 'react-icons/md';
import {
  PiHouseLineFill, PiPencilLineBold, PiUserFill, PiTrashBold, PiChartBarFill,
  PiFilmSlateFill, PiTelevisionSimpleFill, PiPanoramaFill, PiMusicNotesFill,
  PiQuotesFill,
} from 'react-icons/pi';
import { CATS } from '../data.js';
import styles from './ui.module.css';

const ICON_MAP = {
  home: PiHouseLineFill,
  grid: MdShelves,
  plus: MdAdd,
  user: PiUserFill,
  search: MdSearch,
  back: MdArrowBack,
  close: MdClose,
  bell: MdNotifications,
  heart: MdFavorite,
  bookmark: MdBookmark,
  bookmarkBorder: MdBookmarkBorder,
  collectionsBookmark: MdCollectionsBookmark,
  book: MdMenuBook,
  film: PiFilmSlateFill,
  tv: PiTelevisionSimpleFill,
  play: MdPlayCircle,
  frame: PiPanoramaFill,
  mask: MdTheaterComedy,
  ticket: MdConfirmationNumber,
  camera: MdCameraAlt,
  calendar: MdCalendarMonth,
  pin: MdLocationOn,
  chevron: MdChevronRight,
  settings: MdSettings,
  download: MdDownload,
  lock: MdLock,
  chart: PiChartBarFill,
  share: MdShare,
  edit: PiPencilLineBold,
  trash: PiTrashBold,
  quote: PiQuotesFill,
  face: MdFace,
  music: PiMusicNotesFill,
  celebration: MdOutlineFestival,
  stadium: MdStadium,
  more: MdMoreHoriz,
  check: MdCheck,
};

function Icon({ name, size = 24, fill = 'none', style = {} }) {
  const Ico = ICON_MAP[name];
  if (!Ico) return null;
  return <Ico size={size} color={fill === 'none' ? 'currentColor' : fill} style={style} />;
}

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

function CatChip({ cat, size = 13, solid = false }) {
  const c = CATS[cat];
  if (!c) return null;
  const cls = size < 13 ? 'pill pill-xs' : size > 13 ? 'pill pill-xl' : 'pill';
  return (
    <span className={cls} style={{
      background: solid ? c.color : undefined,
      color: solid && (cat==='movie'||cat==='exhibit'||cat==='festival') ? 'var(--ink)' : solid ? '#fff' : 'var(--ink)',
    }}>
      <Icon name={c.icon} size={size + 3} />
      {c.ko}
    </span>
  );
}

function Poster({ rec, w, h, tilt = 0, radius = 8, showTitle = true }) {
  const cover = rec.cover || '#E9DCC0';
  const fg = rec.coverFg || 'var(--ink)';
  const nw = typeof w === 'number' ? w : 120;
  return (
    <div
      className={styles.poster}
      style={{
        width: w, height: h, background: cover, color: fg,
        borderRadius: radius,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
      }}
    >
      <div className={styles.posterIconRow}>
        <Icon name={CATS[rec.cat].icon} size={Math.min(18, nw*0.18)} />
      </div>
      {showTitle && (
        <div className={styles.posterTitle} style={{
          fontSize: Math.max(11, Math.min(20, nw * 0.16)),
          textShadow: fg === '#fff' ? '0 1px 2px rgba(0,0,0,0.25)' : 'none',
        }}>{rec.title}</div>
      )}
    </div>
  );
}

function Squiggle({ w = 120, color = 'var(--yellow)', sw = 6, style = {} }) {
  return (
    <svg width={w} height="16" viewBox={`0 0 ${w} 16`} className="squiggle" style={style}>
      <path d={`M3 11 Q ${w*0.18} 2, ${w*0.34} 9 T ${w*0.66} 8 T ${w-3} 6`}
        fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

function SectionHead({ title, action, onAction }) {
  return (
    <div className={styles.sectionHead}>
      <h3 className={`t-head ${styles.sectionHeadTitle}`}>{title}</h3>
      {action && (
        <button onClick={onAction} className={`t-head ${styles.sectionHeadAction}`}>{action}</button>
      )}
    </div>
  );
}

function statusPills(rec) {
  const out = [];
  if (rec.status === 'watching') {
    const lbl = (rec.span && rec.span.current) ? `${rec.span.current}화 보는 중` : '보는 중';
    out.push({ label: lbl, tone: 'var(--status-watching)', fg: 'var(--ink)' });
  } else if (rec.status === 'dropped') {
    out.push({ label: '중도하차', tone: 'var(--status-dropped)', fg: '#fff' });
  } else if (rec.status === 'done' && rec.cat === 'book') {
    out.push({ label: '완독', tone: 'var(--status-done)', fg: 'var(--ink)', icon: 'collectionsBookmark' });
  } else if (rec.status === 'done' && rec.cat === 'drama') {
    out.push({ label: '완주', tone: 'var(--status-done)', fg: 'var(--ink)', icon: 'collectionsBookmark' });
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
    <span className={styles.statusPillRow}>
      {pills.map((p,i) => (
        <span key={i} className={`pill${size <= 12 ? ' pill-xs' : ''}`} style={{ background:p.tone, color:p.fg }}>
          {p.icon && <Icon name={p.icon} size={size+1} />}{p.label}
        </span>
      ))}
    </span>
  );
}

export { Icon, Stars, CatChip, Poster, Squiggle, SectionHead, statusPills, StatusPills };
