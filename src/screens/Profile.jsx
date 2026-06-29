import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Squiggle, SectionHead, StatusPills, statusPills } from '../components/ui.jsx';
import { PhotoSlider } from '../components/PhotoSlider.jsx';
import { fetchAllRecordViews, fetchRecordView, deleteRecord, addReplayLog } from '../db/records.js';
import { db } from '../db/index.js';
import styles from './Profile.module.css';

function ProfileScreen() {
  const records = useLiveQuery(fetchAllRecordViews, []) ?? [];
  const total   = records.length;

  const catCounts = Object.keys(CATS).map(cat => ({
    cat, n: records.filter(r => r.cat === cat).length,
  })).filter(c => c.n > 0);

  return (
    <div className={`screen screen-anim ${styles.screen}`}>
      <div className={`t-display ${styles.title}`}>마이페이지</div>
      <Squiggle w={120} style={{ margin: '8px 0 16px' }} />

      <div className={`card ${styles.profileCard}`}>
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}><Icon name="user" size={32} /></span>
        </div>
        <div className={styles.profileInfo}>
          <div className={`t-head ${styles.profileName}`}>게스트</div>
          <div className={styles.profileMeta}>
            <span className={styles.profileMetaIcon}><Icon name="pin" size={13} /></span>
            <span className={`muted ${styles.profileMetaText}`}>이 기기에만 저장됨 · {total}개</span>
          </div>
        </div>
      </div>

      <div className={styles.blockShadow}>
        <div className={styles.shadowLayer} style={{ background: 'var(--yellow)', transform: 'translate(5px,6px)' }} />
        <div className={styles.backupContent}>
          <div className={styles.backupHeader}>
            <span className={styles.backupIcon}><Icon name="lock" size={22} /></span>
            <div className={styles.backupText}>
              <div className={`t-head ${styles.backupTitle}`}>기록을 안전하게 보관할까요?</div>
              <div className={`muted ${styles.backupDesc}`}>
                지금은 이 기기에만 저장돼요. 계정을 만들면 클라우드에 백업되고, 기기를 바꿔도 그대로 이어집니다.
              </div>
            </div>
          </div>
          <button className="btn btn-coral" style={{ width: '100%' }}>계정 만들고 백업하기</button>
          <div className={styles.backupFooter}>
            <button className={styles.loginLink}>이미 계정이 있어요 · 로그인</button>
          </div>
        </div>
      </div>

      <div className={styles.blockShadow}>
        <div className={styles.shadowLayer} style={{ background: 'var(--sky)', transform: 'translate(6px,7px)' }} />
        <div className={styles.summaryContent}>
          <div className={styles.summaryRow}>
            <div>
              <div className={`t-head ${styles.summaryYear}`}>2026 결산</div>
              <div className={`t-display ${styles.summaryTotalLabel}`}>올해 만난 {total}개</div>
            </div>
            <span className={styles.summaryChartBtn}><Icon name="chart" size={26} /></span>
          </div>
          <div className={styles.summaryStats}>
            {catCounts.slice(0, 4).map(({ cat, n }, i) => (
              <div key={i} className={styles.statItem}>
                <div className={styles.statIcon}><Icon name={CATS[cat].icon} size={16} /></div>
                <div className={`t-head ${styles.statLabel}`}>{CATS[cat].ko} {n}</div>
              </div>
            ))}
          </div>
          <button className="btn" style={{ width: '100%', marginTop: 14, background: 'var(--yellow)' }}>나의 한 해 돌아보기 →</button>
        </div>
      </div>

      <SectionHead title="설정" />
      <div className={styles.settingsList}>
        {[
          { ic: 'download', c: 'var(--mint)',   t: '백업 · 내보내기', s: '내 기록은 내 것 · CSV/JSON로 저장' },
          { ic: 'lock',     c: 'var(--coral)',  t: '공개 범위',        s: '누가 내 기록을 볼 수 있나' },
          { ic: 'bell',     c: 'var(--yellow)', t: '알림',             s: '기록 리마인더 · 친구 활동' },
          { ic: 'settings', c: 'var(--grape)',  t: '일반 설정',        s: '테마 · 카테고리 · 계정' },
        ].map((row, i) => (
          <button key={i} className={`card-flat ${styles.settingRow}`}>
            <span className={styles.settingIcon} style={{
              background: row.c,
              color: (row.c === 'var(--yellow)' || row.c === 'var(--mint)') ? 'var(--ink)' : '#fff',
            }}>
              <Icon name={row.ic} size={20} />
            </span>
            <span className={styles.settingText}>
              <span className={`t-head ${styles.settingTitle}`}>{row.t}</span>
              <span className={`muted ${styles.settingDesc}`}>{row.s}</span>
            </span>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </div>

      <div className={`muted ${styles.versionLine}`}>보고 읽고 본것들 · v0.2</div>
    </div>
  );
}

function LogSheet({ rec, onClose, onSave }) {
  const [date, setDate]     = React.useState('');
  const [place, setPlace]   = React.useState(rec.place || '');
  const [rating, setRating] = React.useState(rec.rating || 4);
  const [note, setNote]     = React.useState('');

  const nextN = (rec.times ?? 1) + 1;

  return (
    <div className="sheet-back" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sheet-inner">
        <div className="sheet-handle-row">
          <div className="sheet-handle" />
        </div>
        <div className={styles.logSheetHeader}>
          <div>
            <span className={`t-display ${styles.logSheetTitle}`}>{nextN}차 기록</span>
            <div className={`muted ${styles.logSheetSub}`}>{rec.title}</div>
          </div>
          <button className="btn btn-coral" style={{ padding: '9px 18px', fontSize: 14 }}
            onClick={() => onSave({ date: date ? date.replace(/-/g, '.') : '', place: place.trim(), rating, note: note.trim() })}>
            저장
          </button>
        </div>
        <div className={`screen ${styles.logSheetBody}`}>
          <div>
            <label className={`t-head ${styles.logSheetLabel}`}>날짜</label>
            <div className={`card-flat ${styles.logSheetInputRow}`}>
              <Icon name="calendar" size={18} />
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="field-input-sm" />
            </div>
          </div>
          <div>
            <label className={`t-head ${styles.logSheetLabel}`}>장소</label>
            <div className={`card-flat ${styles.logSheetInputRow}`}>
              <Icon name="pin" size={18} />
              <input value={place} onChange={e => setPlace(e.target.value)} placeholder="어디서 봤어요?"
                className="field-input-sm" />
            </div>
          </div>
          <div className={styles.logSheetRatingRow}>
            <label className={`t-head ${styles.logSheetRatingLabel}`}>이번엔 몇 점?</label>
            <span onClick={() => setRating(r => r >= 5 ? 1 : r + 1)} className={styles.logSheetRatingStars}>
              <Stars value={rating} size={26} gap={3} />
            </span>
          </div>
          <div>
            <label className={`t-head ${styles.logSheetLabel}`}>이번 감상</label>
            <div className={`card-flat ${styles.logSheetNoteBox}`}>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="다시 봤을 때 느낌은 달랐나요?" rows={3}
                className="textarea-field" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailPage({ logId, onClose, onDelete, onEdit, onReplay }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [viewingId, setViewingId]         = React.useState(logId);

  const rec = useLiveQuery(
    () => viewingId ? fetchRecordView(viewingId) : undefined,
    [viewingId],
  );

  const isLatest = viewingId === logId;

  if (!rec) return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--paper)', zIndex: 50 }} />
  );

  const handleDelete = async () => {
    await deleteRecord(logId);
    onDelete();
  };

  return (
    <div className={`screen-anim ${styles.detailScreen}`}>
      <div className={styles.detailTopBar}>
        <button onClick={onClose} className="icon-btn" style={{ border: '2.5px solid var(--ink)' }}><Icon name="back" size={22} /></button>
        <CatChip cat={rec.cat} solid />
        <div className={styles.detailTopBarRight}>
          <StatusPills rec={rec} showNthViewing={rec.times > 1 ? rec.n : undefined} />
          <button onClick={() => setConfirmDelete(true)} className={styles.deleteBtn}>
            <Icon name="trash" size={17} />
          </button>
        </div>
      </div>

      <div className="screen" style={{ paddingBottom: 40 }}>
        <div className={styles.heroSection}>
          <div className={styles.heroCover} style={{ background: rec.cover, color: rec.coverFg, padding: rec.coverUrl ? 0 : undefined }}>
            {rec.coverUrl ? (
              <img src={rec.coverUrl} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <>
                <div className={styles.heroCoverIcon}><Icon name={CATS[rec.cat]?.icon} size={20} /></div>
                <div className={`t-display ${styles.heroCoverTitle}`} style={{
                  textShadow: rec.coverFg === '#fff' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}>{rec.title}</div>
              </>
            )}
          </div>

          <div className={styles.heroMeta}>
            <h2 className={`t-display ${styles.heroTitle}`}>
              {rec.title}{rec.releaseYear && <span className={`muted ${styles.heroTitleYear}`}> ({rec.releaseYear})</span>}
            </h2>
            <div className={`muted ${styles.heroCreator}`}>{rec.cast || rec.creator}</div>
            <div className={styles.heroStars}><Stars value={rec.rating} size={19} gap={3} /></div>
            <div className={styles.metaRowWrap}>
              <div className={styles.metaRows}>
                {rec.span ? (
                  <div className={styles.metaRow}>
                    <span className={styles.metaIcon}><Icon name="calendar" size={16} /></span>
                    <span className={styles.metaText}>
                      {rec.span.start} ~ {rec.span.end || '진행 중'}
                    </span>
                  </div>
                ) : (
                  <div className={styles.metaRowCenter}>
                    <span className={styles.metaIconCenter}><Icon name="calendar" size={16} /></span>
                    <span className={styles.metaText}>{rec.when}</span>
                  </div>
                )}
                {rec.place && (
                  <div className={styles.metaRowCenter}>
                    <span className={styles.metaIconCenter}><Icon name="pin" size={16} /></span>
                    <span className={styles.metaText}>{rec.place}</span>
                  </div>
                )}
                {rec.with && (
                  <div className={styles.metaRowCenter}>
                    <span className={styles.metaIconCenter}><Icon name="face" size={16} /></span>
                    <span className={styles.metaText}>{rec.with}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailBody}>
          {rec.quotes?.map((q, i) => (
            <div key={i} className={styles.quoteCard}>
              <span className={styles.quoteAccent}><Icon name="quote" size={18} style={{ transform: 'rotate(180deg)' }} /></span>
              <div className={styles.quoteCardText}>{q}</div>
            </div>
          ))}

          {rec.note && <p className={styles.noteText}>{rec.note}</p>}
          <div style={{ margin: '20px 0 0' }}>
            {rec.photos?.length > 0 && <PhotoSlider photos={rec.photos} />}
          </div>

          {rec.logs && rec.logs.length > 1 && (
            <div className={styles.timeline}>
              <div className={styles.timelineHeader}>
                <h3 className={`t-head ${styles.timelineTitle}`}>이 작품을 본 기록</h3>
                <span className="pill pill-xs" style={{ background: 'var(--status-times)' }}>{rec.logs.length}번</span>
              </div>
              <div className={styles.timelineTrack}>
                <div className={styles.timelineLine} />
                {rec.logs.map((lg, i) => {
                  const isActive = lg.id === viewingId;
                  return (
                    <div key={i} className={i === rec.logs.length - 1 ? styles.timelineItemLast : styles.timelineItem}>
                      <div className={styles.timelineDot} style={{ background: isActive ? 'var(--status-times)' : '#fff' }} />
                      <div
                        className={`card-flat ${styles.logCard} ${isActive ? styles.logCardActive : ''}`}
                        onClick={() => !isActive && setViewingId(lg.id)}
                        style={{ cursor: isActive ? 'default' : 'pointer' }}
                      >
                        <div className={styles.logCardHeader}>
                          <span className={`t-head ${styles.logCardN}`}>{lg.n}차</span>
                          <span className={`muted ${styles.logCardDate}`}>{lg.date}</span>
                          <span className={styles.logCardStars}><Stars value={lg.rating} size={12} /></span>
                        </div>
                        {rec.cat === 'stage' && lg.creator && (
                          <div className={styles.logPlace}>
                            <span className={styles.logPlaceIcon}><Icon name="user" size={13} /></span>
                            <span className={`muted ${styles.logPlaceText}`}>{lg.creator}</span>
                          </div>
                        )}
                        {lg.place && (
                          <div className={styles.logPlace}>
                            <span className={styles.logPlaceIcon}><Icon name="pin" size={13} /></span>
                            <span className={`muted ${styles.logPlaceText}`}>{lg.place}</span>
                          </div>
                        )}
                        {lg.note && <div className={styles.logNote}>{lg.note}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.actionsRow}>
            <button className="btn" style={{ flex: 1 }} onClick={() => onEdit(rec)}>
              <Icon name="edit" size={17} style={{ verticalAlign: '-3px', marginRight: 4 }} />수정
            </button>
            <button className="btn btn-sky" style={{ flex: 1 }} onClick={() => onReplay(rec)}>
              <Icon name="plus" size={17} style={{ verticalAlign: '-3px', marginRight: 4 }} />{rec.logs ? '새 회차 추가' : '다시 보기'}
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className={styles.modalBack} onClick={() => setConfirmDelete(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={`t-head ${styles.modalTitle}`}>이 기록을 삭제할까요?</div>
            <div className={`muted ${styles.modalDesc}`}>삭제하면 되돌릴 수 없어요.</div>
            <div className={styles.modalBtns}>
              <button onClick={() => setConfirmDelete(false)} className="btn" style={{ flex: 1 }}>취소</button>
              <button onClick={handleDelete} className="btn" style={{ flex: 1, background: 'var(--status-dropped)', color: '#fff', borderColor: 'var(--status-dropped)' }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ProfileScreen, DetailPage };
