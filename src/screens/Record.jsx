import React from 'react';
import { CATS } from '../data.js';
import { Icon, Stars, Poster, iconBtn, btnReset } from '../components/ui.jsx';

// screen-record.jsx — 기록: add a new entry (full-screen modal)

function RecordScreen({ onClose }) {
  const [cat, setCat] = React.useState('book');
  const [rating, setRating] = React.useState(4);
  const [status, setStatus] = React.useState('done');
  const [times, setTimes] = React.useState(1);
  const [quotes, setQuotes] = React.useState(['']);
  const [place, setPlace] = React.useState(null);
  const [people, setPeople] = React.useState([]);
  const [sheet, setSheet] = React.useState(null); // 'place' | 'people'

  const togglePerson = (name) => setPeople(ps => ps.includes(name) ? ps.filter(p=>p!==name) : [...ps, name]);

  const longForm = cat==='book' || cat==='drama' || cat==='ott';
  const STATUS_OPTS = longForm
    ? [{k:'done',l:'완독'},{k:'watching',l:'보는 중'},{k:'dropped',l:'중도하차'}]
    : [{k:'done',l:'봤어요'},{k:'dropped',l:'중도하차'}];

  const addQuote = () => setQuotes(qs => [...qs, '']);
  const removeQuote = (i) => setQuotes(qs => qs.filter((_,j)=>j!==i));

  return (
    <div className="screen-anim" style={{ position:'absolute', inset:0, background:'var(--paper)', zIndex:50, display:'flex', flexDirection:'column' }}>
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'52px 18px 10px', flex:'none' }}>
        <button onClick={onClose} style={{ ...iconBtn, background:'#fff', border:'2.5px solid var(--ink)' }}><Icon name="close" size={22} /></button>
        <span className="t-display" style={{ fontSize:22 }}>새 기록</span>
        <button className="btn btn-coral" style={{ padding:'9px 18px', fontSize:14 }} onClick={onClose}>저장</button>
      </div>

      <div className="screen" style={{ padding:'4px 18px 0' }}>
        {/* category */}
        <label className="t-head" style={lbl}>무엇을 봤어요?</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:18 }}>
          {Object.keys(CATS).map(k => (
            <button key={k} onClick={()=>setCat(k)} style={{ border:'none', background:'none', padding:0, cursor:'pointer' }}>
              <span className="pill" style={{ background: cat===k?CATS[k].color:'#fff',
                color: cat===k && k!=='movie' && k!=='exhibit' ? '#fff':'var(--ink)',
                boxShadow: cat===k?'var(--shadow-sm)':'none', fontSize:14, padding:'7px 13px' }}>
                <Icon name={CATS[k].icon} size={16} />{CATS[k].ko}
              </span>
            </button>
          ))}
        </div>

        {/* search auto-fill */}
        <label className="t-head" style={lbl}>제목으로 찾기</label>
        <div className="card-flat" style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', borderRadius:14, marginBottom:6, boxShadow:'var(--shadow-sm)' }}>
          <Icon name="search" size={20} />
          <span style={{ fontSize:15 }}>작별인사</span>
          <span style={{ flex:1 }} />
          <Icon name="camera" size={20} />
        </div>
        <div className="muted" style={{ fontSize:12, marginBottom:14, paddingLeft:4 }}>제목·표지·작가가 자동으로 채워져요 · 안 나오면 직접 입력</div>

        {/* auto-filled card */}
        <div className="card" style={{ display:'flex', gap:12, padding:12, marginBottom:18 }}>
          <Poster rec={{cat, title:'작별인사', cover:'#E9DCC0', coverFg:'#221C14'}} w={64} h={92} radius={8} />
          <div style={{ flex:1, minWidth:0 }}>
            <div className="t-head" style={{ fontSize:17 }}>작별인사</div>
            <div className="muted" style={{ fontSize:13, marginBottom:6 }}>김영하 · 복복서가 · 2022</div>
            <span className="pill" style={{ fontSize:11, padding:'3px 8px' }}>장편소설</span>
          </div>
          <span style={{ color:'var(--mint)' }}><Icon name="bookmark" size={20} fill="var(--mint)" /></span>
        </div>

        {/* 반자동 — 이미 기록한 작품이면 새 회차로 묶기 안내 */}
        <div className="card-flat" style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:14, marginBottom:18, borderLeft:'5px solid var(--status-times)' }}>
          <span style={{ width:40, height:40, borderRadius:12, background:'var(--status-times)', border:'2.5px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
            <span className="t-head" style={{ fontSize:15 }}>3차</span>
          </span>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="t-head" style={{ fontSize:14, lineHeight:1.25 }}>이미 2번 기록한 작품이에요</div>
            <div className="muted" style={{ fontSize:12 }}>새 회차로 묶어서 기록할까요?</div>
          </div>
          <label style={{ display:'flex', flex:'none', cursor:'pointer' }}>
            <span style={{ width:46, height:28, borderRadius:999, background:'var(--status-done)', border:'2.5px solid var(--ink)', position:'relative', transition:'background .15s' }}>
              <span style={{ position:'absolute', top:1.5, right:2, width:21, height:21, borderRadius:'50%', background:'#fff', border:'2px solid var(--ink)' }} />
            </span>
          </label>
        </div>

        {/* dates — range for long-form, single for one-session */}
        {(() => {
          return longForm ? (
            <>
              <label className="t-head" style={lbl}>언제 보기 시작 → 끝냈어요?</label>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <div className="card-flat" style={{ flex:1, display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:14 }}>
                  <Icon name="calendar" size={18} />
                  <div>
                    <div className="muted" style={{ fontSize:11 }}>시작</div>
                    <div style={{ fontSize:14 }}>5월 19일</div>
                  </div>
                </div>
                <span className="t-head" style={{ color:'var(--ink-soft)' }}>→</span>
                <div className="card-flat" style={{ flex:1, display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:14 }}>
                  <Icon name="calendar" size={18} />
                  <div>
                    <div className="muted" style={{ fontSize:11 }}>완료</div>
                    <div style={{ fontSize:14 }}>5월 26일</div>
                  </div>
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, paddingLeft:2, cursor:'pointer' }}>
                <span style={{ width:22, height:22, borderRadius:7, border:'2.5px solid var(--ink)', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}></span>
                <span className="muted" style={{ fontSize:13 }}>아직 보는 중이에요 (완료일 없음)</span>
              </label>
            </>
          ) : (
            <>
              <label className="t-head" style={lbl}>언제 봤어요?</label>
              <div className="card-flat" style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', borderRadius:14, marginBottom:16 }}>
                <Icon name="calendar" size={18} />
                <span style={{ fontSize:15 }}>5월 26일</span>
              </div>
            </>
          );
        })()}

        {/* status tags */}
        <label className="t-head" style={lbl}>상태</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          {STATUS_OPTS.map(o => {
            const on = status===o.k;
            const bg = o.k==='dropped' ? 'var(--status-dropped)' : o.k==='watching' ? 'var(--status-watching)' : 'var(--status-done)';
            return (
              <button key={o.k} onClick={()=>setStatus(o.k)} style={{ border:'none', background:'none', padding:0, cursor:'pointer' }}>
                <span className="pill" style={{ background: on?bg:'#fff', color: on&&o.k==='dropped'?'#fff':'var(--ink)',
                  boxShadow: on?'var(--shadow-sm)':'none', fontSize:14, padding:'7px 14px' }}>
                  {o.k==='done' && <Icon name="bookmark" size={15} />}{o.l}
                </span>
              </button>
            );
          })}
        </div>

        {/* rewatch counter (N차) */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div>
            <label className="t-head" style={{ ...lbl, margin:0 }}>{longForm?'다시 본 횟수':'관람 회차'}</label>
            <span className="muted" style={{ fontSize:12 }}>{times===1?'처음 봤어요':`${times}번째로 봤어요`}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={()=>setTimes(t=>Math.max(1,t-1))} style={stepBtn}><Icon name="close" size={16} /></button>
            <span className="t-display" style={{ fontSize:22, minWidth:44, textAlign:'center' }}>{times}차</span>
            <button onClick={()=>setTimes(t=>t+1)} style={stepBtn}><Icon name="plus" size={16} /></button>
          </div>
        </div>

        {/* rating */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <label className="t-head" style={{ ...lbl, margin:0 }}>별점</label>
          <button onClick={()=>{}} style={{ border:'none', background:'none', cursor:'pointer' }}>
            <span onClick={()=>setRating(r=> r>=5?0:r+1)}><Stars value={rating} size={28} gap={3} /></span>
          </button>
        </div>

        {/* mood removed */}

        {/* one-liner */}
        <label className="t-head" style={lbl}>한 줄 느낌</label>
        <div className="card-flat" style={{ padding:'13px 16px', borderRadius:14, marginBottom:18 }}>
          <span style={{ fontSize:15 }}>오래 남을 한 권.</span>
        </div>

        {/* quotes */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <label className="t-head" style={{ ...lbl, margin:0 }}>인용 <span className="muted" style={{ fontSize:12 }}>(기억하고 싶은 문장)</span></label>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
          {quotes.map((qt,i) => (
            <div key={i} className="card-flat" style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'12px 14px', borderRadius:14, borderLeft:'5px solid var(--yellow)' }}>
              <span className="t-display" style={{ fontSize:20, color:'var(--coral-d)', lineHeight:1, marginTop:2 }}>“</span>
              <span className="muted" style={{ flex:1, fontSize:14, lineHeight:1.5 }}>{i===0 ? '사람은 결국 자기가 살아온 방식으로 떠나간다.' : '문장을 입력하세요…'}</span>
              {quotes.length>1 && (
                <button onClick={()=>removeQuote(i)} style={{ ...btnReset, color:'var(--ink-soft)', marginTop:2 }}><Icon name="close" size={16} /></button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addQuote} className="pill" style={{ cursor:'pointer', padding:'8px 14px', marginBottom:18, background:'#fff' }}>
          <Icon name="plus" size={15} />인용 추가
        </button>

        {/* long note */}
        <label className="t-head" style={lbl}>긴 감상 <span className="muted" style={{ fontSize:12 }}>(선택)</span></label>
        <div className="card-flat" style={{ padding:'13px 16px', borderRadius:14, minHeight:96, marginBottom:14 }}>
          <span className="muted" style={{ fontSize:14, lineHeight:1.5 }}>마음에 남은 장면, 같이 본 사람…</span>
        </div>

        {/* attachments */}
        <label className="t-head" style={lbl}>기록에 더하기</label>
        <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
          <span className="pill" style={{ background:'var(--yellow)', padding:'9px 14px', cursor:'pointer' }}><Icon name="camera" size={17} />사진</span>
          <button onClick={()=>setSheet('place')} style={{ border:'none', background:'none', padding:0, cursor:'pointer' }}>
            <span className="pill" style={{ padding:'9px 14px', background: place?'var(--mint)':'#fff' }}><Icon name="pin" size={17} />{place || '장소'}</span>
          </button>
          <button onClick={()=>setSheet('people')} style={{ border:'none', background:'none', padding:0, cursor:'pointer' }}>
            <span className="pill" style={{ padding:'9px 14px', background: people.length?'var(--mint)':'#fff' }}>
              <Icon name="user" size={17} />{people.length ? people.join(', ') : '함께 본 사람'}
            </span>
          </button>
        </div>

        <div style={{ height:30 }} />
      </div>

      {sheet==='place' && <PlaceSheet onClose={()=>setSheet(null)} onPick={(p)=>{ setPlace(p); setSheet(null); }} />}
      {sheet==='people' && <PeopleSheet selected={people} onToggle={togglePerson} onClose={()=>setSheet(null)} />}
    </div>
  );
}

const lbl = { display:'block', fontSize:14, marginBottom:8, color:'var(--ink-soft)' };
const stepBtn = { width:36, height:36, borderRadius:'50%', border:'2.5px solid var(--ink)', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink)' };

// ─── Place search sheet (map autocomplete + GPS + recent) ───
function PlaceSheet({ onClose, onPick }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const recent = ['CGV 용산아이파크몰', '블루스퀘어 신한카드홀', '국립현대미술관 서울'];
  const MAP = [
    { name: 'CGV 용산아이파크몰', addr: '서울 용산구 한강대로23길 55' },
    { name: '용산역', addr: '서울 용산구 한강대로23길 55' },
    { name: '용산 CGV IMAX', addr: '서울 용산구 한강로동' },
    { name: '국립중앙박물관', addr: '서울 용산구 서빙고로 137' },
  ];
  const results = q.trim() ? MAP.filter(m => (m.name+m.addr).includes(q.trim())) : [];

  return (
    <div className="sheet-back" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxHeight:'80%', background:'var(--paper)',
        borderTop:'3px solid var(--ink)', borderRadius:'28px 28px 0 0',
        display:'flex', flexDirection:'column', animation:'sheetUp .26s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ padding:'10px 0 4px', flex:'none' }}>
          <div style={{ width:46, height:5, borderRadius:3, background:'var(--ink)', opacity:0.3, margin:'0 auto' }} />
        </div>
        <div style={{ padding:'8px 18px 12px', flex:'none' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span className="t-display" style={{ fontSize:20 }}>장소</span>
            <button onClick={onClose} style={{ ...iconBtn, width:36, height:36, background:'#fff', border:'2.5px solid var(--ink)' }}><Icon name="close" size={18} /></button>
          </div>
          {/* search input */}
          <div className="card-flat" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:999, boxShadow:'var(--shadow-sm)' }}>
            <Icon name="search" size={20} />
            <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
              placeholder="장소 검색 (예: 용산)"
              style={{ flex:1, border:'none', outline:'none', background:'transparent', fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)', minWidth:0 }} />
            {q && <button onClick={()=>setQ('')} style={{ ...btnReset }}><Icon name="close" size={18} /></button>}
          </div>
        </div>

        <div className="screen" style={{ padding:'0 18px 20px' }}>
          {q.trim() ? (
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {results.map((m,i) => (
                <button key={i} onClick={()=>onPick(m.name)} style={rowBtn}>
                  <span style={{ color:'var(--coral-d)', flex:'none' }}><Icon name="pin" size={20} /></span>
                  <span style={{ flex:1, minWidth:0 }}>
                    <span className="t-head" style={{ fontSize:15, display:'block' }}>{m.name}</span>
                    <span className="muted" style={{ fontSize:12 }}>{m.addr}</span>
                  </span>
                </button>
              ))}
              {results.length===0 && <div className="muted" style={{ fontSize:14, padding:'16px 4px' }}>'{q}' 검색 결과가 없어요. 직접 입력하려면 <button onClick={()=>onPick(q)} style={{ ...btnReset, color:'var(--coral-d)', fontFamily:'var(--font-head)', textDecoration:'underline' }}>'{q}' 사용</button></div>}
            </div>
          ) : (
            <>
              {/* current location */}
              <button onClick={()=>onPick('현재 위치')} className="card-flat" style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:14, width:'100%', cursor:'pointer', marginBottom:16, boxShadow:'var(--shadow-sm)', textAlign:'left' }}>
                <span style={{ width:40, height:40, borderRadius:12, background:'var(--sky)', border:'2.5px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}><Icon name="pin" size={20} /></span>
                <span>
                  <span className="t-head" style={{ fontSize:15, display:'block' }}>지금 위치에서 찾기</span>
                  <span className="muted" style={{ fontSize:12 }}>근처 장소를 추천해드려요</span>
                </span>
              </button>
              <h4 className="t-head muted" style={{ margin:'0 0 8px', fontSize:13 }}>최근 장소</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {recent.map((r,i) => (
                  <button key={i} onClick={()=>onPick(r)} style={rowBtn}>
                    <span style={{ color:'var(--ink-soft)', flex:'none' }}><Icon name="pin" size={18} /></span>
                    <span className="t-head" style={{ fontSize:15, flex:1, minWidth:0 }}>{r}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── People chip sheet (reusable people tags) ───────────────
function PeopleSheet({ selected, onToggle, onClose }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  const saved = ['엄마', '지현', '회사 동료', '동생', '친구 둘'];
  const filtered = q.trim() ? saved.filter(s=>s.includes(q.trim())) : saved;
  const canAdd = q.trim() && !saved.includes(q.trim());

  return (
    <div className="sheet-back" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxHeight:'80%', background:'var(--paper)',
        borderTop:'3px solid var(--ink)', borderRadius:'28px 28px 0 0',
        display:'flex', flexDirection:'column', animation:'sheetUp .26s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ padding:'10px 0 4px', flex:'none' }}>
          <div style={{ width:46, height:5, borderRadius:3, background:'var(--ink)', opacity:0.3, margin:'0 auto' }} />
        </div>
        <div style={{ padding:'8px 18px 12px', flex:'none' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span className="t-display" style={{ fontSize:20 }}>함께 본 사람</span>
            <button onClick={onClose} className="btn btn-coral" style={{ padding:'8px 16px', fontSize:14 }}>완료</button>
          </div>
          <div className="card-flat" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:999, boxShadow:'var(--shadow-sm)' }}>
            <Icon name="search" size={20} />
            <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
              placeholder="이름 검색 또는 새로 추가"
              style={{ flex:1, border:'none', outline:'none', background:'transparent', fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)', minWidth:0 }} />
          </div>
        </div>

        <div className="screen" style={{ padding:'0 18px 20px' }}>
          {canAdd && (
            <button onClick={()=>{ onToggle(q.trim()); setQ(''); }} className="card-flat" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:14, width:'100%', cursor:'pointer', marginBottom:12, boxShadow:'var(--shadow-sm)', textAlign:'left' }}>
              <span style={{ color:'var(--coral-d)' }}><Icon name="plus" size={20} /></span>
              <span className="t-head" style={{ fontSize:15 }}>'{q.trim()}' 새로 추가</span>
            </button>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {filtered.map((name,i) => {
              const on = selected.includes(name);
              return (
                <button key={i} onClick={()=>onToggle(name)} style={{ border:'none', background:'none', padding:0, cursor:'pointer' }}>
                  <span className="pill" style={{ background: on?'var(--mint)':'#fff', fontSize:15, padding:'9px 15px', boxShadow: on?'var(--shadow-sm)':'none' }}>
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

const rowBtn = { display:'flex', alignItems:'center', gap:12, padding:'12px 6px', background:'none', border:'none', borderBottom:'1.5px solid rgba(43,33,24,0.1)', cursor:'pointer', textAlign:'left', width:'100%' };

export { RecordScreen };
