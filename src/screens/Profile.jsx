import React from 'react';
import { CATS } from '../data.js';
import { Icon, Stars, CatChip, Squiggle, SectionHead, StatusPills, statusPills, iconBtn } from '../components/ui.jsx';

// screen-profile.jsx — 마이페이지: profile + 결산 teaser + settings/backup
// screen-detail.jsx merged here — DetailSheet for a single record

function ProfileScreen() {
  return (
    <div className="screen screen-anim" style={{ padding:'4px 16px 0' }}>
      <div className="t-display" style={{ fontSize:30, lineHeight:1, padding:'8px 0 2px' }}>마이페이지</div>
      <Squiggle w={120} style={{ margin:'8px 0 16px' }} />

      {/* guest profile card — local-first, not logged in */}
      <div className="card" style={{ padding:16, marginBottom:14, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', border:'2.5px solid var(--ink)', background:'var(--paper-2)',
          display:'flex', alignItems:'center', justifyContent:'center', flex:'none', overflow:'hidden' }}>
          <span style={{ color:'var(--ink-soft)' }}><Icon name="user" size={32} /></span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="t-head" style={{ fontSize:19 }}>게스트</div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
            <span style={{ color:'var(--ink-soft)', display:'flex' }}><Icon name="pin" size={13} /></span>
            <span className="muted" style={{ fontSize:13 }}>이 기기에만 저장됨 · 247개</span>
          </div>
        </div>
      </div>

      {/* backup / login nudge card */}
      <div className="block-shadow" style={{ position:'relative', marginBottom:22 }}>
        <div style={{ position:'absolute', inset:0, background:'var(--yellow)', borderRadius:'var(--r-lg)', transform:'translate(5px,6px)', border:'2.5px solid var(--ink)' }} />
        <div style={{ position:'relative', background:'#fff', border:'2.5px solid var(--ink)', borderRadius:'var(--r-lg)', padding:'18px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
            <span style={{ width:46, height:46, borderRadius:14, background:'var(--mint)', border:'2.5px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none', color:'var(--ink)' }}>
              <Icon name="lock" size={22} />
            </span>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="t-head" style={{ fontSize:17, lineHeight:1.25 }}>기록을 안전하게 보관할까요?</div>
              <div className="muted" style={{ fontSize:13, lineHeight:1.5, marginTop:4 }}>
                지금은 이 폰에만 저장돼요. 계정을 만들면 클라우드에 백업되고, 기기를 바꿔도 그대로 이어집니다.
              </div>
            </div>
          </div>
          <button className="btn btn-coral" style={{ width:'100%' }}>계정 만들고 백업하기</button>
          <div style={{ textAlign:'center', marginTop:10 }}>
            <button style={{ background:'none', border:'none', fontFamily:'var(--font-head)', fontSize:13, color:'var(--ink-soft)', textDecoration:'underline', cursor:'pointer' }}>이미 계정이 있어요 · 로그인</button>
          </div>
        </div>
      </div>

      {/* 결산 teaser */}
      <div className="block-shadow" style={{ position:'relative', marginBottom:22 }}>
        <div style={{ position:'absolute', inset:0, background:'var(--sky)', borderRadius:'var(--r-lg)', transform:'translate(6px,7px)', border:'2.5px solid var(--ink)' }} />
        <div style={{ position:'relative', background:'var(--coral)', border:'2.5px solid var(--ink)', borderRadius:'var(--r-lg)', padding:'18px 18px 16px', color:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div className="t-head" style={{ fontSize:13, opacity:0.9 }}>2026 결산</div>
              <div className="t-display" style={{ fontSize:26, lineHeight:1.1 }}>올해 만난 78개</div>
            </div>
            <span style={{ background:'#fff', color:'var(--ink)', borderRadius:'50%', width:48, height:48, border:'2.5px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="chart" size={26} />
            </span>
          </div>
          {/* mini stat row */}
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            {[['📖','책 18'],['🎬','영화 24'],['📺','드라마 12'],['🎭','공연 9']].map(([e,t],i)=>(
              <div key={i} style={{ flex:1, background:'#ffffff22', border:'2px solid #ffffff88', borderRadius:12, padding:'8px 4px', textAlign:'center' }}>
                <div style={{ fontSize:16 }}>{e}</div>
                <div className="t-head" style={{ fontSize:12, marginTop:2 }}>{t}</div>
              </div>
            ))}
          </div>
          <button className="btn" style={{ width:'100%', marginTop:14, background:'var(--yellow)' }}>나의 한 해 돌아보기 →</button>
        </div>
      </div>

      {/* settings list */}
      <SectionHead title="설정" />
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:8 }}>
        {[
          { ic:'download', c:'var(--mint)', t:'백업 · 내보내기', s:'내 기록은 내 것 · CSV/JSON로 저장' },
          { ic:'lock', c:'var(--coral)', t:'공개 범위', s:'누가 내 기록을 볼 수 있나' },
          { ic:'bell', c:'var(--yellow)', t:'알림', s:'기록 리마인더 · 친구 활동' },
          { ic:'settings', c:'var(--grape)', t:'일반 설정', s:'테마 · 카테고리 · 계정' },
        ].map((row,i)=>(
          <button key={i} className="card-flat" style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 14px', cursor:'pointer', textAlign:'left', boxShadow:'var(--shadow-sm)' }}>
            <span style={{ width:40, height:40, borderRadius:12, background:row.c, border:'2.5px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none',
              color: (row.c==='var(--yellow)'||row.c==='var(--mint)')?'var(--ink)':'#fff' }}>
              <Icon name={row.ic} size={20} />
            </span>
            <span style={{ flex:1 }}>
              <span className="t-head" style={{ fontSize:15, display:'block' }}>{row.t}</span>
              <span className="muted" style={{ fontSize:12 }}>{row.s}</span>
            </span>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </div>

      <div className="muted" style={{ textAlign:'center', fontSize:12, padding:'18px 0 8px' }}>
        보고 읽고 본것들 · v0.1
      </div>
    </div>
  );
}

// ─── Detail sheet ───────────────────────────────────────────
function DetailPage({ rec, onClose }) {
  if (!rec) return null;
  return (
    <div className="screen-anim" style={{
      position:'absolute', inset:0, background:'var(--paper)', zIndex:50,
      display:'flex', flexDirection:'column' }}>
      {/* top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'52px 16px 8px', flex:'none' }}>
        <button onClick={onClose} style={{ ...iconBtn, background:'#fff', border:'2.5px solid var(--ink)' }}><Icon name="back" size={22} /></button>
        <CatChip cat={rec.cat} solid />
        <span style={{ marginLeft:'auto' }}><StatusPills rec={rec} /></span>
      </div>

      <div className="screen" style={{ paddingBottom:40 }}>
        {/* hero — vertical poster + info beside */}
        <div style={{ display:'flex', gap:16, padding:'4px 18px 0' }}>
          <div style={{ width:130, height:195, flex:'none', background:rec.cover, color:rec.coverFg,
            border:'2.5px solid var(--ink)', borderRadius:14, boxShadow:'var(--shadow-sm)',
            display:'flex', flexDirection:'column', justifyContent:'space-between', padding:10, boxSizing:'border-box' }}>
            <div style={{ display:'flex', justifyContent:'flex-end', opacity:0.85 }}><Icon name={CATS[rec.cat].icon} size={20} /></div>
            <div className="t-display" style={{ fontSize:19, lineHeight:1.06,
              textShadow: rec.coverFg==='#fff'?'0 1px 3px rgba(0,0,0,0.3)':'none' }}>{rec.title}</div>
          </div>

          <div style={{ flex:1, minWidth:0, paddingTop:2 }}>
            <h2 className="t-display" style={{ fontSize:24, margin:'0 0 4px', lineHeight:1.1 }}>{rec.title}</h2>
            <div className="muted" style={{ fontSize:14, marginBottom:10 }}>{rec.creator}</div>
            <div style={{ marginBottom:12 }}><Stars value={rec.rating} size={19} gap={3} /></div>
            {statusPills(rec).length > 0 && (
              <div style={{ marginBottom:12 }}><StatusPills rec={rec} size={13} /></div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {rec.span ? (
                <div style={{ display:'flex', alignItems:'flex-start', gap:7 }}>
                  <span style={{ color:'var(--ink-soft)', display:'flex', marginTop:1 }}><Icon name="calendar" size={16} /></span>
                  <span style={{ fontSize:13, lineHeight:1.35 }}>
                    {rec.span.start} ~ {rec.span.end || '진행 중'}<br/>
                    <span className="muted" style={{ fontSize:12 }}>
                      {rec.span.end ? `${rec.span.days}일에 걸쳐` : `${rec.span.days}일째`}
                    </span>
                  </span>
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ color:'var(--ink-soft)', display:'flex' }}><Icon name="calendar" size={16} /></span>
                  <span style={{ fontSize:13 }}>{rec.when}</span>
                </div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ color:'var(--ink-soft)', display:'flex' }}><Icon name="pin" size={16} /></span>
                <span style={{ fontSize:13 }}>{rec.place}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ color:'var(--ink-soft)', display:'flex' }}><Icon name="user" size={16} /></span>
                <span style={{ fontSize:13 }}>{rec.with || '혼자'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:'18px 18px 0' }}>
          {rec.quote && (
            <div style={{ margin:'0 0 16px', background:'var(--yellow)', border:'2.5px solid var(--ink)', borderRadius:16, padding:'14px 16px', boxShadow:'var(--shadow-sm)' }}>
              <div className="t-head" style={{ fontSize:12, color:'var(--coral-d)', marginBottom:4 }}>“ 인용 ”</div>
              <div style={{ fontSize:16, lineHeight:1.5, fontStyle:'italic' }}>{rec.quote}</div>
            </div>
          )}

          <p style={{ fontSize:15, lineHeight:1.6, whiteSpace:'pre-line', margin:'0 0 18px' }}>{rec.note}</p>

          {/* 회차 타임라인 — 같은 작품을 여러 번 본 기록 */}
          {rec.logs && rec.logs.length > 1 && (
            <div style={{ marginBottom:22 }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12 }}>
                <h3 className="t-head" style={{ margin:0, fontSize:17 }}>이 작품을 본 기록</h3>
                <span className="pill" style={{ fontSize:12, padding:'3px 10px', background:'var(--status-times)' }}>{rec.logs.length}번</span>
              </div>
              <div style={{ position:'relative', paddingLeft:22 }}>
                {/* vertical line */}
                <div style={{ position:'absolute', left:6, top:8, bottom:8, width:2.5, background:'var(--ink)', opacity:0.25 }} />
                {rec.logs.map((lg, i) => (
                  <div key={i} style={{ position:'relative', marginBottom: i===rec.logs.length-1 ? 0 : 16 }}>
                    {/* dot */}
                    <div style={{ position:'absolute', left:-20, top:3, width:14, height:14, borderRadius:'50%',
                      background: i===0 ? 'var(--status-times)' : '#fff', border:'2.5px solid var(--ink)' }} />
                    <div className="card-flat" style={{ padding:'11px 14px', borderRadius:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span className="t-head" style={{ fontSize:14 }}>{lg.n}차</span>
                        <span className="muted" style={{ fontSize:12 }}>{lg.date}</span>
                        <span style={{ marginLeft:'auto' }}><Stars value={lg.rating} size={12} /></span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                        <span style={{ color:'var(--ink-soft)', display:'flex' }}><Icon name="pin" size={13} /></span>
                        <span className="muted" style={{ fontSize:12 }}>{lg.place}</span>
                      </div>
                      <div style={{ fontSize:13, lineHeight:1.45 }}>{lg.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:10 }}>
            <button className="btn" style={{ flex:1 }}><Icon name="edit" size={17} style={{verticalAlign:'-3px', marginRight:4}}/>수정</button>
            <button className="btn btn-sky" style={{ flex:1 }}>
              <Icon name="plus" size={17} style={{verticalAlign:'-3px', marginRight:4}}/>{rec.logs ? '새 회차 추가' : '다시 보기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ProfileScreen, DetailPage };
