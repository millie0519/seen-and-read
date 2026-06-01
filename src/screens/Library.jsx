import React from 'react';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Poster, Squiggle, SectionHead } from '../components/ui.jsx';

// screen-library.jsx — 책장: category shelves + grid

function LibraryScreen({ records, onOpen, onSearch }) {
  const [active, setActive] = React.useState('all');

  const shelfCounts = Object.keys(CATS).map(cat => ({
    cat,
    n: records.filter(r => r.cat === cat).length,
  })).filter(c => c.n > 0);

  const total = records.length;
  const filtered = active === 'all' ? records : records.filter(r => r.cat === active);
  const books  = records.filter(r => r.cat === 'book');
  const movies = records.filter(r => r.cat === 'movie');

  return (
    <div className="screen screen-anim" style={{ padding:'4px 16px 0' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'8px 0 2px' }}>
        <div className="t-display" style={{ fontSize:30, lineHeight:1 }}>나의 책장</div>
        <div className="t-head muted" style={{ fontSize:13 }}>총 {total}개</div>
      </div>
      <Squiggle w={130} style={{ margin:'8px 0 14px' }} />

      {/* search */}
      <button onClick={onSearch} className="card-flat" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:999, marginBottom:16, boxShadow:'var(--shadow-sm)', width:'100%', cursor:'pointer', textAlign:'left' }}>
        <Icon name="search" size={20} />
        <span className="muted" style={{ fontSize:15 }}>제목 · 작가 · 태그 검색</span>
      </button>

      {/* category filter */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px', padding:'0 16px 16px' }}>
        <button onClick={()=>setActive('all')} className="pill" style={{ border:'none', padding:0, background:'none' }}>
          <span className="pill" style={{ background: active==='all'?'var(--ink)':'#fff', color: active==='all'?'#fff':'var(--ink)' }}>전체 {total}</span>
        </button>
        {shelfCounts.map(({cat,n}) => (
          <button key={cat} onClick={()=>setActive(cat)} style={{ border:'none', padding:0, background:'none', cursor:'pointer' }}>
            <span className="pill" style={{ background: active===cat?CATS[cat].color:'#fff',
              color: active===cat && cat!=='movie' && cat!=='exhibit' ? '#fff':'var(--ink)' }}>
              <Icon name={CATS[cat].icon} size={15} />{CATS[cat].ko} {n}
            </span>
          </button>
        ))}
      </div>

      {/* recently added grid */}
      <SectionHead title="📌 최근 추가" action="더보기" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:22 }}>
        {filtered.slice(0,3).map(rec => (
          <div key={rec.id} onClick={()=>onOpen(rec)} style={{ cursor:'pointer' }}>
            <Poster rec={rec} w={'100%'} h={148} radius={12} />
            <div className="t-head" style={{ fontSize:13, marginTop:6, lineHeight:1.2 }}>{rec.title}</div>
            <div style={{ marginTop:2 }}><Stars value={rec.rating} size={11} /></div>
          </div>
        ))}
      </div>

      {/* bookshelf — real shelf metaphor */}
      {books.length > 0 && <SectionHead title={`📚 책 ${books.length}권`} action="정렬" />}
      {books.length > 0 && <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', gap:6, alignItems:'flex-end', overflowX:'auto', paddingBottom:8 }}>
          {books.map((b,i) => (
            <div key={b.id} style={{ width:46, height: 110 + (i%3)*14, background:b.cover, color:b.coverFg,
              border:'2px solid var(--ink)', borderRadius:'4px 4px 2px 2px', flex:'none',
              transform:`rotate(${(i%4-1.5)*0.6}deg)`, position:'relative',
              display:'flex', alignItems:'flex-end', padding:6, boxSizing:'border-box' }}>
              <div style={{ writingMode:'vertical-rl', fontFamily:'var(--font-head)', fontSize:11, lineHeight:1 }}>{b.title}</div>
            </div>
          ))}
        </div>
        <div style={{ height:8, background:'var(--ink)', borderRadius:3, marginTop:-2 }} />
        <div style={{ height:14, background:'var(--paper-2)', borderLeft:'2.5px solid var(--ink)', borderRight:'2.5px solid var(--ink)', borderBottom:'2.5px solid var(--ink)', borderRadius:'0 0 8px 8px' }} />
      </div>}

      {/* movie grid */}
      {movies.length > 0 && <SectionHead title={`🎬 영화 ${movies.length}편`} action="더보기" />}
      {movies.length > 0 && <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {movies.map((m,i) => (
          <div key={m.id} onClick={()=>onOpen(m)} style={{ width:'100%', height:150, background:m.cover, color:m.coverFg, cursor:'pointer',
            border:'2.5px solid var(--ink)', borderRadius:12, boxShadow:'var(--shadow-sm)',
            display:'flex', flexDirection:'column', justifyContent:'space-between', padding:10, boxSizing:'border-box' }}>
            <div style={{ display:'flex', justifyContent:'flex-end', opacity:0.85 }}><Icon name="film" size={16} /></div>
            <div className="t-display" style={{ fontSize:17, lineHeight:1.05 }}>{m.title}</div>
          </div>
        ))}
      </div>}
    </div>
  );
}

export { LibraryScreen };
