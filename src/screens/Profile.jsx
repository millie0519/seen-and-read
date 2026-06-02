import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Squiggle, SectionHead, StatusPills, statusPills, iconBtn } from '../components/ui.jsx';
import { fetchAllRecordViews, fetchRecordView, deleteRecord, addReplayLog } from '../db/records.js';
import { db } from '../db/index.js';

// ── 마이페이지 ────────────────────────────────────────────────

function ProfileScreen() {
  const records = useLiveQuery(fetchAllRecordViews, []) ?? [];
  const total   = records.length;

  const catCounts = Object.keys(CATS).map(cat => ({
    cat, n: records.filter(r => r.cat === cat).length,
  })).filter(c => c.n > 0);

  return (
    <div className="screen screen-anim" style={{ padding: '4px 16px 0' }}>
      <div className="t-display" style={{ fontSize: 30, lineHeight: 1, padding: '8px 0 2px' }}>마이페이지</div>
      <Squiggle w={120} style={{ margin: '8px 0 16px' }} />

      {/* 게스트 프로필 */}
      <div className="card" style={{ padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2.5px solid var(--ink)', background: 'var(--paper-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <span style={{ color: 'var(--ink-soft)' }}><Icon name="user" size={32} /></span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-head" style={{ fontSize: 19 }}>게스트</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ color: 'var(--ink-soft)', display: 'flex' }}><Icon name="pin" size={13} /></span>
            <span className="muted" style={{ fontSize: 13 }}>이 기기에만 저장됨 · {total}개</span>
          </div>
        </div>
      </div>

      {/* 백업 유도 */}
      <div className="block-shadow" style={{ position: 'relative', marginBottom: 22 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--yellow)', borderRadius: 'var(--r-lg)', transform: 'translate(5px,6px)', border: '2.5px solid var(--ink)' }} />
        <div style={{ position: 'relative', background: '#fff', border: '2.5px solid var(--ink)', borderRadius: 'var(--r-lg)', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--mint)', border: '2.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name="lock" size={22} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-head" style={{ fontSize: 17, lineHeight: 1.25 }}>기록을 안전하게 보관할까요?</div>
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>
                지금은 이 기기에만 저장돼요. 계정을 만들면 클라우드에 백업되고, 기기를 바꿔도 그대로 이어집니다.
              </div>
            </div>
          </div>
          <button className="btn btn-coral" style={{ width: '100%' }}>계정 만들고 백업하기</button>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button style={{ background: 'none', border: 'none', fontFamily: 'var(--font-head)', fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'underline', cursor: 'pointer' }}>이미 계정이 있어요 · 로그인</button>
          </div>
        </div>
      </div>

      {/* 결산 티저 */}
      <div className="block-shadow" style={{ position: 'relative', marginBottom: 22 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--sky)', borderRadius: 'var(--r-lg)', transform: 'translate(6px,7px)', border: '2.5px solid var(--ink)' }} />
        <div style={{ position: 'relative', background: 'var(--coral)', border: '2.5px solid var(--ink)', borderRadius: 'var(--r-lg)', padding: '18px 18px 16px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="t-head" style={{ fontSize: 13, opacity: 0.9 }}>2026 결산</div>
              <div className="t-display" style={{ fontSize: 26, lineHeight: 1.1 }}>올해 만난 {total}개</div>
            </div>
            <span style={{ background: '#fff', color: 'var(--ink)', borderRadius: '50%', width: 48, height: 48, border: '2.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chart" size={26} />
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {catCounts.slice(0, 4).map(({ cat, n }, i) => (
              <div key={i} style={{ flex: 1, background: '#ffffff22', border: '2px solid #ffffff88', borderRadius: 12, padding: '8px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 16 }}><Icon name={CATS[cat].icon} size={16} /></div>
                <div className="t-head" style={{ fontSize: 11, marginTop: 2 }}>{CATS[cat].ko} {n}</div>
              </div>
            ))}
          </div>
          <button className="btn" style={{ width: '100%', marginTop: 14, background: 'var(--yellow)' }}>나의 한 해 돌아보기 →</button>
        </div>
      </div>

      {/* 설정 */}
      <SectionHead title="설정" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
        {[
          { ic: 'download', c: 'var(--mint)',  t: '백업 · 내보내기', s: '내 기록은 내 것 · CSV/JSON로 저장' },
          { ic: 'lock',     c: 'var(--coral)', t: '공개 범위',        s: '누가 내 기록을 볼 수 있나' },
          { ic: 'bell',     c: 'var(--yellow)', t: '알림',            s: '기록 리마인더 · 친구 활동' },
          { ic: 'settings', c: 'var(--grape)', t: '일반 설정',        s: '테마 · 카테고리 · 계정' },
        ].map((row, i) => (
          <button key={i} className="card-flat" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px', cursor: 'pointer', textAlign: 'left', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: row.c, border: '2.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              color: (row.c === 'var(--yellow)' || row.c === 'var(--mint)') ? 'var(--ink)' : '#fff' }}>
              <Icon name={row.ic} size={20} />
            </span>
            <span style={{ flex: 1 }}>
              <span className="t-head" style={{ fontSize: 15, display: 'block' }}>{row.t}</span>
              <span className="muted" style={{ fontSize: 12 }}>{row.s}</span>
            </span>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </div>

      <div className="muted" style={{ textAlign: 'center', fontSize: 12, padding: '18px 0 8px' }}>보고 읽고 본것들 · v0.2</div>
    </div>
  );
}

// ── 회차 추가 시트 ────────────────────────────────────────────

function LogSheet({ rec, onClose, onSave }) {
  const [date, setDate]   = React.useState('');
  const [place, setPlace] = React.useState(rec.place || '');
  const [rating, setRating] = React.useState(rec.rating || 4);
  const [note, setNote]   = React.useState('');

  const nextN = (rec.times ?? 1) + 1;

  return (
    <div className="sheet-back" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '80%', background: 'var(--paper)', borderTop: '3px solid var(--ink)', borderRadius: '28px 28px 0 0', display: 'flex', flexDirection: 'column', animation: 'sheetUp .26s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ padding: '10px 0 4px', flex: 'none' }}>
          <div style={{ width: 46, height: 5, borderRadius: 3, background: 'var(--ink)', opacity: 0.3, margin: '0 auto' }} />
        </div>
        <div style={{ padding: '8px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 'none' }}>
          <div>
            <span className="t-display" style={{ fontSize: 20 }}>{nextN}차 기록</span>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{rec.title}</div>
          </div>
          <button className="btn btn-coral" style={{ padding: '9px 18px', fontSize: 14 }}
            onClick={() => onSave({ date: date ? date.replace(/-/g, '.') : '', place: place.trim(), rating, note: note.trim() })}>
            저장
          </button>
        </div>
        <div className="screen" style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="t-head" style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>날짜</label>
            <div className="card-flat" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14 }}>
              <Icon name="calendar" size={18} />
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', minWidth: 0 }} />
            </div>
          </div>
          <div>
            <label className="t-head" style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>장소</label>
            <div className="card-flat" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14 }}>
              <Icon name="pin" size={18} />
              <input value={place} onChange={e => setPlace(e.target.value)} placeholder="어디서 봤어요?"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', minWidth: 0 }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="t-head" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>이번엔 몇 점?</label>
            <span onClick={() => setRating(r => r >= 5 ? 1 : r + 1)} style={{ cursor: 'pointer' }}>
              <Stars value={rating} size={26} gap={3} />
            </span>
          </div>
          <div>
            <label className="t-head" style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>이번 감상</label>
            <div className="card-flat" style={{ padding: '12px 14px', borderRadius: 14, minHeight: 72 }}>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="다시 봤을 때 느낌은 달랐나요?" rows={3}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.5, resize: 'none', minWidth: 0, boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 상세 페이지 ───────────────────────────────────────────────

function DetailPage({ logId, onClose, onDelete, onEdit }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [addingLog, setAddingLog]         = React.useState(false);

  // logId 기반으로 직접 DB 구독
  const rec = useLiveQuery(
    () => logId ? fetchRecordView(logId) : undefined,
    [logId],
  );

  // 로딩 중 또는 삭제 후 빈 화면
  if (!rec) return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--paper)', zIndex: 50 }} />
  );

  const handleAddLog = async (logData) => {
    await addReplayLog(rec.titleId, rec.times, logData);
    setAddingLog(false);
    // useLiveQuery가 자동으로 rec을 최신 상태로 갱신
  };

  const handleDelete = async () => {
    await deleteRecord(logId);
    onDelete(); // 패널 닫기
  };

  return (
    <div className="screen-anim" style={{ position: 'absolute', inset: 0, background: 'var(--paper)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '52px 16px 8px', flex: 'none' }}>
        <button onClick={onClose} style={{ ...iconBtn, background: '#fff', border: '2.5px solid var(--ink)' }}><Icon name="back" size={22} /></button>
        <CatChip cat={rec.cat} solid />
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusPills rec={rec} />
          <button onClick={() => setConfirmDelete(true)}
            style={{ width: 38, height: 38, borderRadius: 10, border: '2px solid var(--ink)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)' }}>
            <Icon name="trash" size={17} />
          </button>
        </span>
      </div>

      <div className="screen" style={{ paddingBottom: 40 }}>
        {/* 히어로 */}
        <div style={{ display: 'flex', gap: 16, padding: '4px 18px 0' }}>
          <div style={{ width: 130, height: 195, flex: 'none', background: rec.cover, color: rec.coverFg,
            border: '2.5px solid var(--ink)', borderRadius: 14, boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 10, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.85 }}><Icon name={CATS[rec.cat]?.icon} size={20} /></div>
            <div className="t-display" style={{ fontSize: 19, lineHeight: 1.06,
              textShadow: rec.coverFg === '#fff' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>{rec.title}</div>
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <h2 className="t-display" style={{ fontSize: 24, margin: '0 0 4px', lineHeight: 1.1 }}>{rec.title}</h2>
            <div className="muted" style={{ fontSize: 14, marginBottom: 10 }}>{rec.creator}</div>
            <div style={{ marginBottom: 12 }}><Stars value={rec.rating} size={19} gap={3} /></div>
            {statusPills(rec).length > 0 && <div style={{ marginBottom: 12 }}><StatusPills rec={rec} size={13} /></div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {rec.span ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                  <span style={{ color: 'var(--ink-soft)', display: 'flex', marginTop: 1 }}><Icon name="calendar" size={16} /></span>
                  <span style={{ fontSize: 13, lineHeight: 1.35 }}>
                    {rec.span.start} ~ {rec.span.end || '진행 중'}<br />
                    <span className="muted" style={{ fontSize: 12 }}>{rec.span.end ? `${rec.span.days || ''}일에 걸쳐` : `진행 중`}</span>
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: 'var(--ink-soft)', display: 'flex' }}><Icon name="calendar" size={16} /></span>
                  <span style={{ fontSize: 13 }}>{rec.when}</span>
                </div>
              )}
              {rec.place && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: 'var(--ink-soft)', display: 'flex' }}><Icon name="pin" size={16} /></span>
                  <span style={{ fontSize: 13 }}>{rec.place}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ color: 'var(--ink-soft)', display: 'flex' }}><Icon name="user" size={16} /></span>
                <span style={{ fontSize: 13 }}>{rec.with || '혼자'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 18px 0' }}>
          {/* 태그 */}
          {rec.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {rec.tags.map((tag, i) => (
                <span key={i} className="pill" style={{ background: 'var(--sky)', fontSize: 12, padding: '4px 10px' }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* 인용 */}
          {rec.quote && (
            <div style={{ margin: '0 0 16px', background: 'var(--yellow)', border: '2.5px solid var(--ink)', borderRadius: 16, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
              <div className="t-head" style={{ fontSize: 12, color: 'var(--coral-d)', marginBottom: 4 }}>" 인용 "</div>
              <div style={{ fontSize: 16, lineHeight: 1.5, fontStyle: 'italic' }}>{rec.quote}</div>
            </div>
          )}

          {rec.note && <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 18px' }}>{rec.note}</p>}

          {/* 회차 타임라인 */}
          {rec.logs && rec.logs.length > 1 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 className="t-head" style={{ margin: 0, fontSize: 17 }}>이 작품을 본 기록</h3>
                <span className="pill" style={{ fontSize: 12, padding: '3px 10px', background: 'var(--status-times)' }}>{rec.logs.length}번</span>
              </div>
              <div style={{ position: 'relative', paddingLeft: 22 }}>
                <div style={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 2.5, background: 'var(--ink)', opacity: 0.25 }} />
                {rec.logs.map((lg, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: i === rec.logs.length - 1 ? 0 : 16 }}>
                    <div style={{ position: 'absolute', left: -20, top: 3, width: 14, height: 14, borderRadius: '50%',
                      background: i === 0 ? 'var(--status-times)' : '#fff', border: '2.5px solid var(--ink)' }} />
                    <div className="card-flat" style={{ padding: '11px 14px', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="t-head" style={{ fontSize: 14 }}>{lg.n}차</span>
                        <span className="muted" style={{ fontSize: 12 }}>{lg.date}</span>
                        <span style={{ marginLeft: 'auto' }}><Stars value={lg.rating} size={12} /></span>
                      </div>
                      {lg.place && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                          <span style={{ color: 'var(--ink-soft)', display: 'flex' }}><Icon name="pin" size={13} /></span>
                          <span className="muted" style={{ fontSize: 12 }}>{lg.place}</span>
                        </div>
                      )}
                      {lg.note && <div style={{ fontSize: 13, lineHeight: 1.45 }}>{lg.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          {!confirmDelete ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => onEdit(rec)}>
                <Icon name="edit" size={17} style={{ verticalAlign: '-3px', marginRight: 4 }} />수정
              </button>
              <button className="btn btn-sky" style={{ flex: 1 }} onClick={() => setAddingLog(true)}>
                <Icon name="plus" size={17} style={{ verticalAlign: '-3px', marginRight: 4 }} />{rec.logs ? '새 회차 추가' : '다시 보기'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="t-head muted" style={{ flex: 1, fontSize: 13 }}>정말 삭제할까요?</span>
              <button onClick={() => setConfirmDelete(false)} className="btn" style={{ padding: '10px 16px', fontSize: 14 }}>취소</button>
              <button onClick={handleDelete} className="btn" style={{ padding: '10px 16px', fontSize: 14, background: 'var(--status-dropped)', color: '#fff', borderColor: 'var(--status-dropped)' }}>삭제</button>
            </div>
          )}
        </div>
      </div>

      {addingLog && (
        <LogSheet rec={rec} onClose={() => setAddingLog(false)} onSave={handleAddLog} />
      )}
    </div>
  );
}

export { ProfileScreen, DetailPage };
