import React from 'react';
import { CATS, FEED } from '../data.js';
import { Icon, Stars, CatChip, iconBtn, btnReset } from '../components/ui.jsx';

// screen-search.jsx — 검색: find your own records (full page)

function SearchScreen({ onClose, onOpen }) {
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const inputRef = React.useRef(null);

  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const recent = ['김영하', '듄', '제주', '뮤지컬'];

  const results = FEED.filter(r => {
    const inCat = cat === 'all' || r.cat === cat;
    const text = (r.title + ' ' + (r.creator||'') + ' ' + (r.tags||[]).join(' ') + ' ' + (r.place||'')).toLowerCase();
    const inQ = !q.trim() || text.includes(q.trim().toLowerCase());
    return inCat && inQ;
  });

  const showResults = q.trim().length > 0;

  return (
    <div className="screen-anim" style={{
      position:'absolute', inset:0, background:'var(--paper)', zIndex:50,
      display:'flex', flexDirection:'column' }}>
      {/* search bar header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'52px 16px 12px', flex:'none' }}>
        <button onClick={onClose} style={{ ...iconBtn, background:'#fff', border:'2.5px solid var(--ink)', flex:'none' }}><Icon name="back" size={22} /></button>
        <div className="card-flat" style={{ flex:1, display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderRadius:999, boxShadow:'var(--shadow-sm)' }}>
          <Icon name="search" size={20} />
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="내 기록에서 찾기"
            style={{ flex:1, border:'none', outline:'none', background:'transparent',
              fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)', minWidth:0 }} />
          {q && <button onClick={()=>setQ('')} style={{ ...btnReset }}><Icon name="close" size={18} /></button>}
        </div>
      </div>

      {/* category filter */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'0 16px 12px', flex:'none' }}>
        <button onClick={()=>setCat('all')} style={chipBtn}>
          <span className="pill" style={{ background: cat==='all'?'var(--ink)':'#fff', color: cat==='all'?'#fff':'var(--ink)' }}>전체</span>
        </button>
        {Object.keys(CATS).map(k => (
          <button key={k} onClick={()=>setCat(k)} style={chipBtn}>
            <span className="pill" style={{ background: cat===k?CATS[k].color:'#fff',
              color: cat===k && k!=='movie' && k!=='exhibit' ? '#fff':'var(--ink)' }}>
              <Icon name={CATS[k].icon} size={15} />{CATS[k].ko}
            </span>
          </button>
        ))}
      </div>

      <div className="screen" style={{ padding:'4px 16px 0' }}>
        {!showResults ? (
          <>
            {/* recent */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'8px 0 10px' }}>
              <h3 className="t-head" style={{ margin:0, fontSize:16 }}>최근 검색</h3>
              <button style={{ ...btnReset, fontSize:13, color:'var(--ink-soft)', fontFamily:'var(--font-head)' }}>지우기</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
              {recent.map((t,i) => (
                <button key={i} onClick={()=>setQ(t)} className="pill" style={{ cursor:'pointer', padding:'7px 13px' }}>
                  <Icon name="search" size={14} />{t}
                </button>
              ))}
            </div>

            {/* recently viewed shortcut */}
            <h3 className="t-head" style={{ margin:'0 0 12px', fontSize:16 }}>다시 보고 싶어 저장한 것</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {FEED.slice(0,3).map(rec => <ResultRow key={rec.id} rec={rec} onOpen={onOpen} />)}
            </div>
          </>
        ) : (
          <>
            <div className="muted" style={{ fontSize:13, margin:'8px 0 12px' }}>
              '{q}' 검색 결과 {results.length}개
            </div>
            {results.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {results.map(rec => <ResultRow key={rec.id} rec={rec} onOpen={onOpen} q={q} />)}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{ fontSize:44, marginBottom:12 }}>🔍</div>
                <div className="t-head" style={{ fontSize:17, marginBottom:6 }}>기록이 없어요</div>
                <div className="muted" style={{ fontSize:14, lineHeight:1.5, marginBottom:18 }}>
                  '{q}'에 대한 기록이 아직 없네요.<br/>새로 남겨볼까요?
                </div>
                <button className="btn btn-coral"><Icon name="edit" size={16} style={{verticalAlign:'-3px', marginRight:5}}/>'{q}' 기록하기</button>
              </div>
            )}
          </>
        )}
        <div style={{ height:30 }} />
      </div>
    </div>
  );
}

function ResultRow({ rec, onOpen, q }) {
  return (
    <button onClick={()=>onOpen(rec)} className="card-flat" style={{
      display:'flex', gap:12, padding:10, borderRadius:16, cursor:'pointer',
      textAlign:'left', alignItems:'center', boxShadow:'var(--shadow-sm)', width:'100%' }}>
      <div style={{ width:48, height:68, flex:'none', background:rec.cover, color:rec.coverFg,
        border:'2px solid var(--ink)', borderRadius:8, display:'flex', alignItems:'flex-end',
        justifyContent:'flex-end', padding:5, boxSizing:'border-box' }}>
        <Icon name={CATS[rec.cat].icon} size={15} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <CatChip cat={rec.cat} size={11} />
        </div>
        <div className="t-head" style={{ fontSize:16, lineHeight:1.15 }}>{rec.title}</div>
        <div className="muted" style={{ fontSize:12, marginBottom:4 }}>{rec.creator}</div>
        <Stars value={rec.rating} size={11} />
      </div>
      <span style={{ color:'var(--ink-soft)', flex:'none' }}><Icon name="chevron" size={18} /></span>
    </button>
  );
}

const chipBtn = { border:'none', background:'none', padding:0, cursor:'pointer', flex:'none' };

export { SearchScreen };
