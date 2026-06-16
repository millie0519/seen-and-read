import React from 'react';
import { CATS } from '../data.js';
import { Icon, Stars } from '../components/ui.jsx';
import { saveNewRecord, updateRecord } from '../db/records.js';
import styles from './Record.module.css';

const CAT_COLORS = {
  book:    { cover: '#E9DCC0', coverFg: '#221C14' },
  movie:   { cover: '#C97A4A', coverFg: '#fff' },
  drama:   { cover: '#7E6BA8', coverFg: '#fff' },
  ott:     { cover: '#7FBFA0', coverFg: '#fff' },
  exhibit: { cover: '#5E6B5A', coverFg: '#fff' },
  musical: { cover: '#B5483C', coverFg: '#FBBE2C' },
  play:    { cover: '#3E5C8A', coverFg: '#fff' },
};

const isISODate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

function RecordScreen({ rec: initialRec, onClose, onSaved }) {
  const isEdit = !!initialRec;

  const [cat, setCat]                   = React.useState(initialRec?.cat ?? 'book');
  const [title, setTitle]               = React.useState(initialRec?.title ?? '');
  const [creator, setCreator]           = React.useState(initialRec?.creator ?? '');
  const [rating, setRating]             = React.useState(initialRec?.rating ?? 4);
  const [status, setStatus]             = React.useState(initialRec?.status ?? 'done');
  const [times, setTimes]               = React.useState(initialRec?.times ?? 1);
  const [note, setNote]                 = React.useState(initialRec?.note ?? '');
  const [quotes, setQuotes]             = React.useState(initialRec?.quote ? [initialRec.quote] : ['']);
  const [tags, setTags]                 = React.useState(initialRec?.tags ?? []);
  const [tagInput, setTagInput]         = React.useState('');
  const [startDate, setStartDate]       = React.useState(isISODate(initialRec?.span?.start) ? initialRec.span.start : '');
  const [endDate, setEndDate]           = React.useState(isISODate(initialRec?.span?.end) ? initialRec.span.end : '');
  const [stillWatching, setStillWatch]  = React.useState(initialRec?.span ? !initialRec.span.end : false);
  const [place, setPlace]               = React.useState(initialRec?.place ?? null);
  const [people, setPeople]             = React.useState(
    initialRec?.with ? initialRec.with.split(', ').filter(Boolean) : []
  );
  const [sheet, setSheet]               = React.useState(null);
  const [saving, setSaving]             = React.useState(false);

  const togglePerson = (name) => setPeople(ps => ps.includes(name) ? ps.filter(p => p !== name) : [...ps, name]);

  const longForm   = cat === 'book' || cat === 'drama' || cat === 'ott';
  const STATUS_OPTS = longForm
    ? [{ k: 'done', l: '완독' }, { k: 'watching', l: '보는 중' }, { k: 'dropped', l: '중도하차' }]
    : [{ k: 'done', l: '봤어요' }, { k: 'dropped', l: '중도하차' }];

  const addQuote    = () => setQuotes(qs => [...qs, '']);
  const removeQuote = (i) => setQuotes(qs => qs.filter((_, j) => j !== i));
  const updateQuote = (i, val) => setQuotes(qs => qs.map((q, j) => j === i ? val : q));

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags(ts => [...ts, t]);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const now = new Date();
      const base = {
        cat,
        title:   title.trim(),
        creator: creator.trim() || null,
        status, times, rating,
        note:    note.trim() || null,
        quote:   quotes.filter(q => q.trim())[0] || null,
        tags,
        with:    people.length ? people.join(', ') : null,
        place:   place || null,
        ...(longForm ? {
          span: {
            start: startDate || now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
            end:   stillWatching ? null : (endDate || now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })),
            days:  null,
          },
        } : {
          dateSingle: endDate || null,
        }),
      };

      if (isEdit) {
        await updateRecord(initialRec.id, base);
      } else {
        await saveNewRecord(base);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`screen-anim ${styles.container}`} style={{ zIndex: isEdit ? 60 : 50 }}>
      <div className={styles.header}>
        <button onClick={onClose} className="icon-btn" style={{ border: '2.5px solid var(--ink)' }}>
          <Icon name="close" size={22} />
        </button>
        <span className={`t-display ${styles.headerTitle}`}>{isEdit ? '기록 수정' : '새 기록'}</span>
        <button className="btn btn-coral" style={{ padding: '9px 18px', fontSize: 14, opacity: saving ? 0.6 : 1 }} onClick={handleSave}>
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>

      <div className="screen" style={{ padding: '4px 18px 0' }}>
        <label className={`t-head ${styles.lbl}`}>무엇을 봤어요?</label>
        <div className={styles.catRow}>
          {Object.keys(CATS).map(k => (
            <button key={k} onClick={() => setCat(k)} className={styles.catBtn}>
              <span className="pill" style={{
                background: cat === k ? CATS[k].color : '#fff',
                color: cat === k && k !== 'movie' && k !== 'exhibit' ? '#fff' : 'var(--ink)',
                boxShadow: cat === k ? 'var(--shadow-sm)' : 'none',
                fontSize: 14, padding: '7px 13px',
              }}>
                <Icon name={CATS[k].icon} size={16} />{CATS[k].ko}
              </span>
            </button>
          ))}
        </div>

        <label className={`t-head ${styles.lbl}`}>제목</label>
        <div className={`card-flat ${styles.inputBox}`}>
          <Icon name="search" size={20} />
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요"
            className="field-input" />
        </div>

        <div className={`card-flat ${styles.inputBoxGap}`}>
          <Icon name="user" size={20} />
          <input value={creator} onChange={e => setCreator(e.target.value)} placeholder="감독 · 작가 · 아티스트 (선택)"
            className="field-input" />
        </div>

        {longForm ? (
          <>
            <label className={`t-head ${styles.lbl}`}>언제 보기 시작 → 끝냈어요?</label>
            <div className={styles.dateRow}>
              <div className={`card-flat ${styles.dateField}`}>
                <Icon name="calendar" size={18} />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="field-input-sm" />
              </div>
              <span className={`t-head ${styles.dateArrow}`}>→</span>
              <div className={`card-flat ${styles.dateField}`} style={{ opacity: stillWatching ? 0.4 : 1 }}>
                <Icon name="calendar" size={18} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={stillWatching}
                  className="field-input-sm" />
              </div>
            </div>
            <label className={styles.checkRow} onClick={() => setStillWatch(v => !v)}>
              <span className={styles.checkBox} style={{ background: stillWatching ? 'var(--ink)' : '#fff' }}>
                {stillWatching && '✓'}
              </span>
              <span className={`muted ${styles.checkLabel}`}>아직 보는 중이에요 (완료일 없음)</span>
            </label>
          </>
        ) : (
          <>
            <label className={`t-head ${styles.lbl}`}>언제 봤어요?</label>
            <div className={`card-flat ${styles.inputBoxGap}`}>
              <Icon name="calendar" size={18} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="field-input" />
            </div>
          </>
        )}

        <label className={`t-head ${styles.lbl}`}>상태</label>
        <div className={styles.statusRow}>
          {STATUS_OPTS.map(o => {
            const on = status === o.k;
            const bg = o.k === 'dropped' ? 'var(--status-dropped)' : o.k === 'watching' ? 'var(--status-watching)' : 'var(--status-done)';
            return (
              <button key={o.k} onClick={() => setStatus(o.k)} className={styles.statusBtn}>
                <span className="pill" style={{
                  background: on ? bg : '#fff',
                  color: on && o.k === 'dropped' ? '#fff' : 'var(--ink)',
                  boxShadow: on ? 'var(--shadow-sm)' : 'none',
                  fontSize: 14, padding: '7px 14px',
                }}>
                  {o.k === 'done' && <Icon name="bookmark" size={15} />}{o.l}
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.stepperRow}>
          <div>
            <label className={`t-head ${styles.lbl}`} style={{ margin: 0 }}>{longForm ? '다시 본 횟수' : '관람 회차'}</label>
            <span className={`muted ${styles.stepperSub}`}>{times === 1 ? '처음 봤어요' : `${times}번째로 봤어요`}</span>
          </div>
          <div className={styles.stepperControls}>
            <button onClick={() => setTimes(t => Math.max(1, t - 1))} className={styles.stepperBtn}><Icon name="close" size={16} /></button>
            <span className={`t-display ${styles.stepperCount}`}>{times}차</span>
            <button onClick={() => setTimes(t => t + 1)} className={styles.stepperBtn}><Icon name="plus" size={16} /></button>
          </div>
        </div>

        <div className={styles.ratingRow}>
          <label className={`t-head ${styles.lbl}`} style={{ margin: 0 }}>별점</label>
          <span onClick={() => setRating(r => r >= 5 ? 1 : r + 1)} className={styles.ratingStars}>
            <Stars value={rating} size={28} gap={3} />
          </span>
        </div>

        <label className={`t-head ${styles.lbl}`}>태그</label>
        {tags.length > 0 && (
          <div className={styles.tagsRow}>
            {tags.map((tag, i) => (
              <span key={i} className="pill" style={{ background: 'var(--sky)', fontSize: 13, padding: '5px 10px' }}>
                #{tag}
                <button onClick={() => setTags(ts => ts.filter((_, j) => j !== i))} className={`btn-reset ${styles.tagClose}`}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={`card-flat ${styles.tagInputBox}`}>
          <input value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { e.preventDefault(); addTag(); } }}
            placeholder="태그 입력 후 Enter (예: SF, 재관람각)"
            className="field-input-sm" />
          {tagInput.trim() && (
            <button onClick={addTag} className="pill" style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 12, background: 'var(--sky)', border: 'none', flexShrink: 0 }}>추가</button>
          )}
        </div>

        <label className={`t-head ${styles.lbl}`}>한 줄 느낌</label>
        <div className={`card-flat ${styles.noteBox}`}>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="오래 남을 한 마디…"
            className={styles.noteInput} />
        </div>

        <label className={`t-head ${styles.lbl} ${styles.quoteLbl}`}>
          인용 <span className={`muted ${styles.quoteLblSub}`}>(기억하고 싶은 문장)</span>
        </label>
        <div className={styles.quotesStack}>
          {quotes.map((qt, i) => (
            <div key={i} className={`card-flat ${styles.quoteItem}`}>
              <span className={`t-display ${styles.quoteAccent}`}>"</span>
              <textarea value={qt} onChange={e => updateQuote(i, e.target.value)} placeholder="문장을 입력하세요…" rows={2}
                className={styles.quoteTextarea} />
              {quotes.length > 1 && (
                <button onClick={() => removeQuote(i)} className={`btn-reset ${styles.quoteRemove}`}><Icon name="close" size={16} /></button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addQuote} className="pill" style={{ cursor: 'pointer', padding: '8px 14px', marginBottom: 18, background: '#fff' }}>
          <Icon name="plus" size={15} />인용 추가
        </button>

        <label className={`t-head ${styles.lbl}`}>기록에 더하기</label>
        <div className={styles.attachRow}>
          <span className="pill" style={{ background: 'var(--yellow)', padding: '9px 14px', cursor: 'pointer' }}><Icon name="camera" size={17} />사진</span>
          <button onClick={() => setSheet('place')} className="filter-btn">
            <span className="pill" style={{ padding: '9px 14px', background: place ? 'var(--mint)' : '#fff' }}><Icon name="pin" size={17} />{place || '장소'}</span>
          </button>
          <button onClick={() => setSheet('people')} className="filter-btn">
            <span className="pill" style={{ padding: '9px 14px', background: people.length ? 'var(--mint)' : '#fff' }}>
              <Icon name="user" size={17} />{people.length ? people.join(', ') : '함께 본 사람'}
            </span>
          </button>
        </div>
        <div className={styles.bottomSpacer} />
      </div>

      {sheet === 'place'  && <PlaceSheet  onClose={() => setSheet(null)} onPick={(p) => { setPlace(p); setSheet(null); }} />}
      {sheet === 'people' && <PeopleSheet selected={people} onToggle={togglePerson} onClose={() => setSheet(null)} />}
    </div>
  );
}

function PlaceSheet({ onClose, onPick }) {
  const [q, setQ] = React.useState('');
  const inputRef  = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const recent = ['CGV 용산아이파크몰', '블루스퀘어 신한카드홀', '국립현대미술관 서울'];
  const MAP = [
    { name: 'CGV 용산아이파크몰', addr: '서울 용산구 한강대로23길 55' },
    { name: '용산역', addr: '서울 용산구 한강대로23길 55' },
    { name: '용산 CGV IMAX', addr: '서울 용산구 한강로동' },
    { name: '국립중앙박물관', addr: '서울 용산구 서빙고로 137' },
  ];
  const results = q.trim() ? MAP.filter(m => (m.name + m.addr).includes(q.trim())) : [];

  return (
    <div className="sheet-back" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sheet-inner">
        <div className="sheet-handle-row">
          <div className="sheet-handle" />
        </div>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetHeaderRow}>
            <span className={`t-display ${styles.sheetTitle}`}>장소</span>
            <button onClick={onClose} className="icon-btn" style={{ width: 36, height: 36, border: '2.5px solid var(--ink)' }}><Icon name="close" size={18} /></button>
          </div>
          <div className={`card-flat ${styles.sheetSearchBox}`}>
            <Icon name="search" size={20} />
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="장소 검색 (예: 용산)"
              className="field-input" />
            {q && <button onClick={() => setQ('')} className="btn-reset"><Icon name="close" size={18} /></button>}
          </div>
        </div>
        <div className={`screen ${styles.sheetBody}`}>
          {q.trim() ? (
            <div className={styles.rowBtnResults}>
              {results.map((m, i) => (
                <button key={i} onClick={() => onPick(m.name)} className={styles.rowBtn}>
                  <span style={{ color: 'var(--coral-d)', flex: 'none' }}><Icon name="pin" size={20} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className={`t-head ${styles.rowBtnName}`}>{m.name}</span>
                    <span className={`muted ${styles.rowBtnAddr}`}>{m.addr}</span>
                  </span>
                </button>
              ))}
              {!results.length && (
                <div className={`muted ${styles.noResultMsg}`}>
                  '{q}' 검색 결과가 없어요.{' '}
                  <button onClick={() => onPick(q)} className={`btn-reset ${styles.noResultLink}`} style={{ color: 'var(--coral-d)', fontFamily: 'var(--font-head)' }}>'{q}' 사용</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => onPick('현재 위치')} className={`card-flat ${styles.currentLocBtn}`}>
                <span className={styles.currentLocIcon}><Icon name="pin" size={20} /></span>
                <span>
                  <span className={`t-head ${styles.currentLocText}`}>지금 위치에서 찾기</span>
                  <span className={`muted ${styles.currentLocSub}`}>근처 장소를 추천해드려요</span>
                </span>
              </button>
              <h4 className={`t-head muted ${styles.recentLabel}`}>최근 장소</h4>
              {recent.map((r, i) => (
                <button key={i} onClick={() => onPick(r)} className={styles.rowBtn}>
                  <span style={{ color: 'var(--ink-soft)', flex: 'none' }}><Icon name="pin" size={18} /></span>
                  <span className="t-head" style={{ fontSize: 15, flex: 1, minWidth: 0 }}>{r}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PeopleSheet({ selected, onToggle, onClose }) {
  const [q, setQ]    = React.useState('');
  const inputRef     = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const saved    = ['엄마', '지현', '회사 동료', '동생', '친구 둘'];
  const filtered = q.trim() ? saved.filter(s => s.includes(q.trim())) : saved;
  const canAdd   = q.trim() && !saved.includes(q.trim());

  return (
    <div className="sheet-back" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="sheet-inner">
        <div className="sheet-handle-row">
          <div className="sheet-handle" />
        </div>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetHeaderRow}>
            <span className={`t-display ${styles.sheetTitle}`}>함께 본 사람</span>
            <button onClick={onClose} className="btn btn-coral" style={{ padding: '8px 16px', fontSize: 14 }}>완료</button>
          </div>
          <div className={`card-flat ${styles.sheetSearchBox}`}>
            <Icon name="search" size={20} />
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="이름 검색 또는 새로 추가"
              className="field-input" />
          </div>
        </div>
        <div className={`screen ${styles.sheetBody}`}>
          {canAdd && (
            <button onClick={() => { onToggle(q.trim()); setQ(''); }} className={`card-flat ${styles.addPersonBtn}`}>
              <span style={{ color: 'var(--coral-d)' }}><Icon name="plus" size={20} /></span>
              <span className={`t-head ${styles.addPersonLabel}`}>'{q.trim()}' 새로 추가</span>
            </button>
          )}
          <div className={styles.peopleChips}>
            {filtered.map((name, i) => {
              const on = selected.includes(name);
              return (
                <button key={i} onClick={() => onToggle(name)} className="filter-btn">
                  <span className="pill" style={{ background: on ? 'var(--mint)' : '#fff', fontSize: 15, padding: '9px 15px', boxShadow: on ? 'var(--shadow-sm)' : 'none' }}>
                    {on && <Icon name="bookmark" size={15} />}{name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export { RecordScreen };
