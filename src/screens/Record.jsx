import React from 'react';
import { CATS } from '../data.js';
import { Icon, Stars } from '../components/ui.jsx';
import { useLiveQuery } from 'dexie-react-hooks';
import { saveNewRecord, updateRecord, fetchRecentPeople, searchPeople, touchPerson, deletePerson, addReplayLog, findExistingByRef } from '../db/records.js';
import { searchByCategory } from '../api/search.js';
import styles from './Record.module.css';

const CAT_COLORS = {
  book:     { cover: '#E9DCC0', coverFg: '#221C14' },
  movie:    { cover: '#C97A4A', coverFg: '#fff' },
  drama:    { cover: '#7E6BA8', coverFg: '#fff' },
  exhibit:  { cover: '#5E6B5A', coverFg: '#fff' },
  stage:    { cover: '#B5483C', coverFg: '#FBBE2C' },
  concert:  { cover: '#C97A7A', coverFg: '#fff' },
  sports:   { cover: '#6E80D8', coverFg: '#fff' },
  festival: { cover: '#7FBFA0', coverFg: '#221C14' },
  etc:      { cover: '#8A7F72', coverFg: '#fff' },
};

const isISODate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

function RecordScreen({ rec: initialRec, replayFor, onClose, onSaved }) {
  const isEdit   = !!initialRec;
  const isReplay = !!replayFor;
  const base     = initialRec ?? replayFor ?? {};

  const [cat, setCat]                   = React.useState(base.cat ?? 'book');
  const [title, setTitle]               = React.useState(base.title ?? '');
  const [creator, setCreator]           = React.useState(base.creator ?? '');
  const [rating, setRating]             = React.useState(initialRec?.rating ?? 4);
  const [status, setStatus]             = React.useState(initialRec?.status ?? null);
  const [times, setTimes]               = React.useState(isReplay ? (replayFor.n + 1) : (initialRec?.times ?? 1));
  const [note, setNote]                 = React.useState(initialRec?.note ?? '');
  const [quotes, setQuotes]             = React.useState(initialRec?.quotes?.length ? initialRec.quotes : ['']);
  const [startDate, setStartDate]       = React.useState(initialRec?.rawStart ?? '');
  const [endDate, setEndDate]           = React.useState(
    ['book','drama','etc'].includes(base.cat) ? (initialRec?.rawEnd ?? '') : (initialRec?.rawSingle ?? '')
  );
  const [stillWatching, setStillWatch]  = React.useState(initialRec?.span ? !initialRec.rawEnd : false);
  const [place, setPlace]               = React.useState(initialRec?.place ?? null);
  const [people, setPeople]             = React.useState(
    initialRec?.with ? initialRec.with.split(', ').filter(Boolean) : []
  );
  const [sheet, setSheet]               = React.useState(null);
  const [saving, setSaving]             = React.useState(false);
  const [coverUrl, setCoverUrl]         = React.useState(base.coverUrl ?? null);
  const [externalRef, setExRef]         = React.useState(null);
  const [searchResults, setResults]     = React.useState([]);
  const [searchOpen, setSearchOpen]     = React.useState(false);
  const [existingTitle, setExisting]    = React.useState(
    replayFor ? { id: replayFor.titleId, logCount: replayFor.n } : null
  );
  const [saveAsReplay, setSaveAsReplay] = React.useState(isReplay);

  const startDateRef  = React.useRef(null);
  const endDateRef    = React.useRef(null);
  const singleDateRef = React.useRef(null);
  const searchTimer   = React.useRef(null);
  const skipSearch    = React.useRef(false);
  const titleWrapRef  = React.useRef(null);
  const coverImgRef   = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (titleWrapRef.current && !titleWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const openPicker = (ref) => { try { ref.current?.showPicker(); } catch { ref.current?.click(); } };

  const togglePerson = (name) => setPeople(ps => ps.includes(name) ? ps.filter(p => p !== name) : [...ps, name]);

  React.useEffect(() => {
    if (isReplay) return;
    if (skipSearch.current) { skipSearch.current = false; return; }
    const searchable = ['book', 'movie', 'drama'].includes(cat);
    if (!searchable || title.trim().length < 2) {
      setResults([]); setSearchOpen(false); return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const results = await searchByCategory(cat, title);
      setResults(results);
      setSearchOpen(results.length > 0);
    }, 450);
    return () => clearTimeout(searchTimer.current);
  }, [title, cat]);

  const handleSelectResult = async (result) => {
    skipSearch.current = true;
    setTitle(result.title);
    setCreator(result.creator || '');
    setCoverUrl(result.coverUrl || null);
    setExRef(result.externalRef || null);
    setSearchOpen(false);
    setResults([]);
    if (result.externalRef) {
      const existing = await findExistingByRef(result.externalRef);
      setExisting(existing);
      setSaveAsReplay(false);
    } else {
      setExisting(null);
    }
  };

  const longForm   = cat === 'book' || cat === 'drama' || cat === 'etc';
  const doneLabel  = cat === 'book' ? '완독' : cat === 'drama' ? '완주' : '봤어요';
  const STATUS_OPTS = longForm
    ? [{ k: 'done', l: doneLabel }, { k: 'watching', l: '보는 중' }, { k: 'dropped', l: '중도하차' }]
    : [{ k: 'done', l: doneLabel }, { k: 'dropped', l: '중도하차' }];

  const addQuote    = () => setQuotes(qs => [...qs, '']);
  const removeQuote = (i) => setQuotes(qs => qs.filter((_, j) => j !== i));
  const updateQuote = (i, val) => setQuotes(qs => qs.map((q, j) => j === i ? val : q));

const fmtDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      if (saveAsReplay && existingTitle && !isEdit) {
        await addReplayLog(existingTitle.id, existingTitle.logCount, {
          rating,
          date:  endDate || null,
          note:  note.trim() || null,
          place: place || null,
        });
      } else {
        const now = new Date();
        const base = {
          cat,
          title:       title.trim(),
          creator:     creator.trim() || null,
          status, times, rating,
          note:        note.trim() || null,
          quotes:      quotes.filter(q => q.trim()),
          tags:        [],
          with:        people.length ? people.join(', ') : null,
          place:       place || null,
          externalRef: externalRef || null,
          coverUrl:    coverUrl || null,
          ...(longForm ? {
            span: {
              start: startDate || now.toISOString().slice(0, 10),
              end:   stillWatching ? null : (endDate || now.toISOString().slice(0, 10)),
              days:  null,
            },
          } : {
            dateSingle: endDate || now.toISOString().slice(0, 10),
          }),
        };
        if (isEdit) {
          await updateRecord(initialRec.id, base);
        } else {
          await saveNewRecord(base);
        }
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
        <span className={`t-display ${styles.headerTitle}`}>{isEdit ? '기록 수정' : isReplay ? 'N번째 기록' : '새 기록'}</span>
        <button className="btn btn-coral" style={{ padding: '9px 18px', fontSize: 14, opacity: saving ? 0.6 : 1 }} onClick={handleSave}>
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>

      <div className="screen" style={{ padding: '4px 18px 0' }}>
        <label className={`t-head ${styles.lbl}`}>무엇을 봤어요?</label>
        <div className={styles.catRow}>
          {(isReplay ? [cat] : Object.keys(CATS)).map(k => (
            <button key={k} onClick={() => setCat(k)} className={styles.catBtn}>
              <span className="pill pill-xl" style={{
                background: cat === k ? CATS[k].color : undefined,
                color: cat === k && k !== 'movie' && k !== 'exhibit' && k !== 'festival' ? '#fff' : 'var(--ink)',
                boxShadow: cat === k ? 'var(--shadow-sm)' : 'none',
              }}>
                <Icon name={CATS[k].icon} size={16} />{CATS[k].ko}
              </span>
            </button>
          ))}
        </div>

        <div
          className={styles.coverPreview}
          style={{ background: CAT_COLORS[cat]?.cover || '#E9DCC0', color: CAT_COLORS[cat]?.coverFg || 'var(--ink)' }}
        >
          {coverUrl ? (
            <>
              <img src={coverUrl} alt={title} className={styles.coverPreviewImg} />
              <button className={styles.coverPreviewDel} onClick={() => setCoverUrl(null)}>
                <Icon name="close" size={14} />
              </button>
            </>
          ) : (
            <div className={styles.coverPreviewEmpty}>
              <Icon name={CATS[cat]?.icon} size={42} />
              {title && <span className={`t-display ${styles.coverPreviewEmptyTitle}`}>{title}</span>}
            </div>
          )}
        </div>
        <div className={styles.coverActions}>
          <button className={styles.coverActionBtn} onClick={() => coverImgRef.current?.click()}>
            <Icon name="camera" size={14} />직접 등록
          </button>
          <input
            ref={coverImgRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                  const MAX = 500;
                  const scale = img.width > MAX ? MAX / img.width : 1;
                  const canvas = document.createElement('canvas');
                  canvas.width  = Math.round(img.width  * scale);
                  canvas.height = Math.round(img.height * scale);
                  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                  setCoverUrl(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.src = ev.target.result;
              };
              reader.readAsDataURL(file);
              e.target.value = '';
            }}
          />
        </div>

        <label className={`t-head ${styles.lbl}`}>제목</label>
        <div className={styles.titleWrap} ref={titleWrapRef}>
          <div className={`card-flat ${styles.inputBox}`} style={{ opacity: isReplay ? 0.7 : 1 }}>
            <Icon name="search" size={20} />
            <input value={title} onChange={e => !isReplay && setTitle(e.target.value)} placeholder="제목을 입력하세요"
              className="field-input" readOnly={isReplay} />
            {title && !isReplay && <button onClick={() => { setTitle(''); setResults([]); setSearchOpen(false); setExisting(null); }} className="btn-reset"><Icon name="close" size={18} /></button>}
          </div>
          {searchOpen && searchResults.length > 0 && (
            <div className={styles.searchDrop}>
              {searchResults.map((r, i) => (
                <button key={i} onClick={() => handleSelectResult(r)} className={styles.searchItem}>
                  {r.coverUrl
                    ? <img src={r.coverUrl} alt="" className={styles.searchCover} />
                    : <div className={styles.searchCoverPlaceholder}><Icon name={CATS[cat].icon} size={16} /></div>
                  }
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <strong className={styles.searchItemTitle}>{r.title}</strong>
                    {(r.creator || r.sub) && (
                      <span className={`muted ${styles.searchItemSub}`}>{[r.creator, r.sub].filter(Boolean).join(' · ')}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`card-flat ${styles.inputBoxGap}`} style={{ opacity: isReplay ? 0.7 : 1 }}>
          <Icon name="user" size={20} />
          <input value={creator} onChange={e => !isReplay && setCreator(e.target.value)} placeholder="감독 · 작가 · 아티스트 (선택)"
            className="field-input" readOnly={isReplay} />
        </div>

        {existingTitle && !isEdit && !isReplay && (
          <div className={styles.matchBanner}>
            <span className={`t-head ${styles.matchBannerLabel}`}>이미 {existingTitle.logCount}번 기록한 작품이에요</span>
            <div className={styles.matchBannerBtns}>
              <button onClick={() => setSaveAsReplay(false)} className={`${styles.matchBannerBtn} ${!saveAsReplay ? styles.matchBannerBtnActive : ''}`}>새 기록</button>
              <button onClick={() => setSaveAsReplay(true)}  className={`${styles.matchBannerBtn} ${saveAsReplay  ? styles.matchBannerBtnActive : ''}`}>{existingTitle.logCount + 1}번째 회차 추가</button>
            </div>
          </div>
        )}

        {longForm ? (
          <>
            <label className={`t-head ${styles.lbl}`}>기간</label>
            <div className={styles.dateRow}>
              <div className={`card-flat ${styles.dateField}`} onClick={() => openPicker(startDateRef)}>
                <Icon name="calendar" size={18} />
                <input ref={startDateRef} type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="field-input-sm" />
              </div>
              <span className={`t-head ${styles.dateArrow}`}>~</span>
              <div className={`card-flat ${styles.dateField}`} style={{ opacity: stillWatching ? 0.4 : 1 }} onClick={() => !stillWatching && openPicker(endDateRef)}>
                <Icon name="calendar" size={18} />
                <input ref={endDateRef} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={stillWatching}
                  className="field-input-sm" />
              </div>
            </div>
            <label className={styles.checkRow} onClick={() => { setStillWatch(v => { if (!v) setStatus('watching'); return !v; }); }}>
              <span className={styles.checkBox} style={{ background: stillWatching ? 'var(--ink)' : '#fff' }}>
                {stillWatching && '✓'}
              </span>
              <span className={`muted ${styles.checkLabel}`}>아직 보는 중이에요 (완료일 없음)</span>
            </label>
          </>
        ) : (
          <>
            <label className={`t-head ${styles.lbl}`}>언제 봤어요?</label>
            <div className={`card-flat ${styles.inputBoxGap}`} onClick={() => openPicker(singleDateRef)}>
              <Icon name="calendar" size={18} />
              <input ref={singleDateRef} type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
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
                <span className="pill pill-xl" style={{
                  background: on ? bg : undefined,
                  color: on && o.k === 'dropped' ? '#fff' : 'var(--ink)',
                  boxShadow: on ? 'var(--shadow-sm)' : 'none',
                }}>
                  {o.k === 'done' && <Icon name="collectionsBookmark" size={15} />}{o.l}
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
            <button onClick={() => setTimes(t => Math.max(1, t - 1))} className={styles.stepperBtn}><Icon name="minus" size={16} /></button>
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

        <label className={`t-head ${styles.lbl}`}>감상</label>
        <div className={`card-flat ${styles.noteBox}`}>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="오래 남을 한 마디…"
            rows={3} className={styles.noteInput} />
        </div>

        <label className={`t-head ${styles.lbl} ${styles.quoteLbl}`}>
          인용 <span className={`muted ${styles.quoteLblSub}`}>(기억하고 싶은 문장)</span>
        </label>
        <div className={styles.quotesStack}>
          {quotes.map((qt, i) => (
            <div key={i} className={`card-flat ${styles.quoteItem}`}>
              <span className={styles.quoteAccent}><Icon name="quote" size={18} style={{ transform: 'rotate(180deg)' }} /></span>
              <textarea value={qt} onChange={e => updateQuote(i, e.target.value)} placeholder="문장을 입력하세요…" rows={2}
                className={styles.quoteTextarea} />
              {quotes.length > 1 && (
                <button onClick={() => removeQuote(i)} className={`btn-reset ${styles.quoteRemove}`}><Icon name="close" size={16} /></button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addQuote} className="pill pill-xl" style={{ cursor: 'pointer', marginBottom: 18 }}>
          <Icon name="plus" size={15} />인용 추가
        </button>

        <label className={`t-head ${styles.lbl}`}>기록에 더하기</label>
        <div className={styles.attachRow}>
          <span className="pill pill-xl" style={{ background: 'var(--yellow)', cursor: 'pointer' }}><Icon name="camera" size={17} />사진</span>
          <button onClick={() => setSheet('place')} className="filter-btn">
            <span className="pill pill-xl" style={{ background: place ? 'var(--mint)' : undefined }}><Icon name="pin" size={17} />{place || '장소'}</span>
          </button>
          <button onClick={() => setSheet('people')} className="filter-btn">
            <span className="pill pill-xl" style={{ background: people.length ? 'var(--mint)' : undefined }}>
              <Icon name="face" size={17} />{people.length ? people.join(', ') : '함께 본 사람'}
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
  const [q, setQ]           = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const inputRef  = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const recent   = useLiveQuery(fetchRecentPeople, []) ?? [];
  const filtered = useLiveQuery(() => q.trim() ? searchPeople(q.trim()) : fetchRecentPeople(), [q]) ?? [];
  const canAdd   = q.trim() && !filtered.some(p => p.name === q.trim());

  const handleToggle = (name) => {
    onToggle(name);
    if (!selected.includes(name)) {
      touchPerson(name).catch(() => {});
      setQ('');
    }
  };

  const handleAdd = async (name = q.trim()) => {
    if (!name) return;
    setQ('');
    if (!selected.includes(name)) onToggle(name);
    await touchPerson(name);
  };

  const handleClose = async () => {
    if (q.trim()) await handleAdd();
    onClose();
  };

  return (
    <div className="sheet-back" onClick={handleClose}>
      <div onClick={e => e.stopPropagation()} className="sheet-inner">
        <div className="sheet-handle-row">
          <div className="sheet-handle" />
        </div>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetHeaderRow}>
            <span className={`t-display ${styles.sheetTitle}`}>함께 본 사람</span>
            <button onClick={handleClose} className="btn btn-coral" style={{ padding: '8px 16px', fontSize: 14 }}>완료</button>
          </div>
          <div className={`card-flat ${styles.sheetSearchBox}`}>
            <Icon name="search" size={20} />
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="이름 검색 또는 추가"
              className="field-input" />
          </div>
        </div>
        <div className={`screen ${styles.sheetBody}`}>
          {canAdd && (
            <button onClick={() => handleAdd()} className={`card-flat ${styles.addPersonBtn}`}>
              <span style={{ color: 'var(--coral-d)' }}><Icon name="plus" size={20} /></span>
              <span className={`t-head ${styles.addPersonLabel}`}>'{q.trim()}' 추가</span>
            </button>
          )}
          {recent.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button onClick={() => setEditing(v => !v)} className="btn-reset muted" style={{ fontSize: 13, textDecoration: 'underline' }}>
                {editing ? '완료' : '최근 검색어 삭제'}
              </button>
            </div>
          )}
          <div className={styles.peopleChips}>
            {filtered.map((p, i) => {
              const on = selected.includes(p.name);
              return (
                <button key={i} onClick={() => handleToggle(p.name)} className={`filter-btn ${styles.peopleChipWrap}`}>
                  <span className="pill pill-xl" style={{ background: on ? 'var(--mint)' : undefined, boxShadow: on ? 'var(--shadow-sm)' : 'none' }}>
                    {on && <Icon name="check" size={15} />}{p.name}
                    {editing && (
                      <span className={styles.peopleChipDel} onClick={e => { e.stopPropagation(); if (selected.includes(p.name)) onToggle(p.name); deletePerson(p.name); }}>
                        <Icon name="close" size={18} />
                      </span>
                    )}
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
