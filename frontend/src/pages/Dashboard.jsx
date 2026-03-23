import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

const STATS = { totalExams: 12, avgScore: 74, bestScore: 96, streak: 5 };

const TREND = [
  { attempt:1,  score:58, date:'01 Jan' }, { attempt:2,  score:63, date:'05 Jan' },
  { attempt:3,  score:55, date:'10 Jan' }, { attempt:4,  score:70, date:'14 Jan' },
  { attempt:5,  score:74, date:'18 Jan' }, { attempt:6,  score:80, date:'22 Jan' },
  { attempt:7,  score:78, date:'26 Jan' }, { attempt:8,  score:88, date:'30 Jan' },
  { attempt:9,  score:82, date:'03 Feb' }, { attempt:10, score:91, date:'07 Feb' },
  { attempt:11, score:88, date:'11 Feb' }, { attempt:12, score:96, date:'15 Feb' },
];

const HISTORY = [
  { id:1,  name:'DevReady Assessment #12', date:'15 Feb 2025', score:96, total:100, time:'28m', pass:true  },
  { id:2,  name:'DevReady Assessment #11', date:'11 Feb 2025', score:88, total:100, time:'34m', pass:true  },
  { id:3,  name:'DevReady Assessment #10', date:'07 Feb 2025', score:91, total:100, time:'30m', pass:true  },
  { id:4,  name:'DevReady Assessment #9',  date:'03 Feb 2025', score:82, total:100, time:'38m', pass:true  },
  { id:5,  name:'DevReady Assessment #8',  date:'30 Jan 2025', score:78, total:100, time:'40m', pass:true  },
  { id:6,  name:'DevReady Assessment #7',  date:'26 Jan 2025', score:80, total:100, time:'36m', pass:true  },
  { id:7,  name:'DevReady Assessment #6',  date:'22 Jan 2025', score:74, total:100, time:'42m', pass:true  },
  { id:8,  name:'DevReady Assessment #5',  date:'18 Jan 2025', score:70, total:100, time:'45m', pass:true  },
  { id:9,  name:'DevReady Assessment #4',  date:'14 Jan 2025', score:55, total:100, time:'50m', pass:false },
  { id:10, name:'DevReady Assessment #3',  date:'10 Jan 2025', score:63, total:100, time:'48m', pass:true  },
];

const TOPICS = ['React', 'Python', 'SQL', 'Ethics', 'Viva'];

const NAV = [
  { id:'dashboard', label:'Dashboard', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { id:'exams',     label:'My Exams',  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id:'profile',   label:'Profile',   icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  { id:'settings',  label:'Settings',  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
];

/* ── Animated number ── */
function AnimNum({ to, suffix='' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n=0; const step=Math.ceil(to/28);
    const t=setInterval(()=>{ n+=step; if(n>=to){setV(to);clearInterval(t);}else setV(n); },32);
    return ()=>clearInterval(t);
  }, [to]);
  return <>{v}{suffix}</>;
}

/* ── Sparkline mini chart ── */
function Sparkline({ data, color='#0D9488', width=80, height=28 }) {
  const min=Math.min(...data), max=Math.max(...data);
  const pts = data.map((v,i)=>({
    x: (i/(data.length-1))*width,
    y: height-((v-min)/(max-min||1))*(height-4)-2,
  }));
  const d = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5" fill={color}/>
    </svg>
  );
}

/* ── Full trend chart ── */
function TrendChart({ data }) {
  const [drawn,   setDrawn]   = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setDrawn(true);obs.disconnect();} },{threshold:0.2});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  }, []);
  const W=600, H=160, PL=32, PR=12, PT=14, PB=28;
  const iW=W-PL-PR, iH=H-PT-PB, minS=40, maxS=100;
  const pts=data.map((d,i)=>({ x:PL+(i/(data.length-1))*iW, y:PT+iH-((d.score-minS)/(maxS-minS))*iH, ...d }));
  const line=pts.map((p,i)=>{ if(i===0)return `M${p.x},${p.y}`; const pp=pts[i-1],cx=(pp.x+p.x)/2; return `C${cx},${pp.y} ${cx},${p.y} ${p.x},${p.y}`; }).join(' ');
  const area=`${line} L${pts[pts.length-1].x},${PT+iH} L${pts[0].x},${PT+iH}Z`;
  const ttX=(x)=>x<80?x+8:x>W-90?x-90:x-44;
  return (
    <div ref={ref} style={{width:'100%',overflowX:'auto'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',minWidth:260,cursor:'crosshair'}}
        preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHovered(null)}>
        <defs>
          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity=".1"/>
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[60,70,80,90,100].map(v=>{ const y=PT+iH-((v-minS)/(maxS-minS))*iH; return (
          <g key={v}>
            <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#f0f1f3" strokeWidth="1"/>
            <text x={PL-4} y={y+4} textAnchor="end" fontSize="8" fill="#c5cad6" fontFamily="DM Sans,sans-serif">{v}</text>
          </g>
        ); })}
        {hovered!==null && <line x1={pts[hovered].x} y1={PT} x2={pts[hovered].x} y2={PT+iH} stroke="#0D9488" strokeWidth="1" strokeDasharray="3 3" opacity=".3"/>}
        <path d={area} fill="url(#dg)"/>
        <path d={line} fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{strokeDasharray:1600,strokeDashoffset:drawn?0:1600,transition:drawn?'stroke-dashoffset 1.4s ease 0.1s':'none'}}/>
        {pts.map((p,i)=>(
          <g key={i} onMouseEnter={()=>setHovered(i)} style={{cursor:'pointer'}}>
            <circle cx={p.x} cy={p.y} r="12" fill="transparent"/>
            <circle cx={p.x} cy={p.y} r={hovered===i?5.5:3} fill={hovered===i?'#0D9488':'#fff'} stroke="#0D9488" strokeWidth="2"
              style={{opacity:drawn?1:0,transition:`opacity 0.15s ease ${0.1+i*0.07}s`}}/>
          </g>
        ))}
        {pts.filter((_,i)=>i%3===0).map((p,i)=>(
          <text key={i} x={p.x} y={H-4} textAnchor="middle" fontSize="7.5" fill="#9ba3b4" fontFamily="DM Sans,sans-serif">{p.date}</text>
        ))}
        {hovered!==null&&(()=>{ const p=pts[hovered],prev=pts[hovered-1],delta=prev?p.score-prev.score:null,tx=ttX(p.x),ty=p.y<PT+36?p.y+12:p.y-48; return (
          <g style={{pointerEvents:'none'}}>
            <rect x={tx} y={ty} width="84" height="38" rx="6" fill="white" stroke="#e8eaed" strokeWidth="1" style={{filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.08))'}}/>
            <text x={tx+8} y={ty+16} fontSize="13" fontWeight="800" fill="#0D9488" fontFamily="DM Sans,sans-serif">{p.score}%</text>
            {delta!==null&&<text x={tx+52} y={ty+16} fontSize="10" fontWeight="600" fill={delta>=0?'#0D9488':'#ef4444'} fontFamily="DM Sans,sans-serif">{delta>=0?'↑':'↓'}{Math.abs(delta)}</text>}
            <text x={tx+8} y={ty+30} fontSize="8.5" fill="#9ba3b4" fontFamily="DM Sans,sans-serif">{p.date}</text>
          </g>
        ); })()}
      </svg>
    </div>
  );
}

/* ── Exam table ── */
function ExamTable({ history }) {
  const [page,setPage]=useState(0);
  const PER=8,pages=Math.ceil(history.length/PER),rows=history.slice(page*PER,(page+1)*PER);
  const c=(s)=>s>=80?'#0D9488':s>=60?'#d4a017':'#ef4444';
  return (
    <div>
      <table className="db-table">
        <thead><tr><th>#</th><th>Exam</th><th>Date</th><th>Score</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={r.id} className="db-tr" style={{animationDelay:`${i*28}ms`}}>
              <td className="db-td-dim">{r.id}</td>
              <td className="db-td-name">{r.name}</td>
              <td className="db-td-dim">{r.date}</td>
              <td>
                <span style={{fontWeight:700,color:c(r.score),fontSize:14,fontFamily:'DM Mono,monospace'}}>
                  {r.score}<span style={{fontWeight:400,color:'#c5cad6',fontSize:12}}>/{r.total}</span>
                </span>
              </td>
              <td className="db-td-dim">{r.time}</td>
              <td><span className={`db-pill ${r.pass?'db-pill--pass':'db-pill--fail'}`}>{r.pass?'Pass':'Fail'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages>1&&(
        <div className="db-pager">
          <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>←</button>
          {Array.from({length:pages}).map((_,i)=>(
            <button key={i} className={page===i?'db-pager--on':''} onClick={()=>setPage(i)}>{i+1}</button>
          ))}
          <button disabled={page===pages-1} onClick={()=>setPage(p=>p+1)}>→</button>
        </div>
      )}
    </div>
  );
}

/* ── Profile ── */
function ProfileView({ user }) {
  const [editing,setEditing]=useState(false);
  const [saved,setSaved]=useState(false);
  const [form,setForm]=useState({name:user.name,email:user.email});
  const save=()=>{ setSaved(true);setEditing(false);setTimeout(()=>setSaved(false),2500); };
  const initials=form.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  return (
    <div className="db-profile">
      <div className="db-profile__top">
        <div className="db-profile__ava">{initials}</div>
        <div className="db-profile__info">
          <h2 className="db-profile__name">{form.name}</h2>
          <p  className="db-profile__email">{form.email}</p>
          <div className="db-profile__meta-row">
            <span className="db-chip db-chip--teal">Candidate</span>
            <span className="db-chip">{user.examId}</span>
            <span className="db-chip">Since {user.regDate}</span>
          </div>
        </div>
        <button className="db-outline-btn" onClick={()=>setEditing(e=>!e)}>{editing?'Cancel':'Edit'}</button>
      </div>

      <div className="db-profile__scores">
        {[
          {label:'Exams Given',   val:STATS.totalExams,       spark:null},
          {label:'Average Score', val:`${STATS.avgScore}%`,   spark:TREND.map(d=>d.score)},
          {label:'Best Score',    val:`${STATS.bestScore}%`,  spark:null},
          {label:'Day Streak',    val:`${STATS.streak}d 🔥`,  spark:null},
        ].map((s,i)=>(
          <div key={i} className="db-profile__score-item">
            <span className="db-profile__score-val">{s.val}</span>
            {s.spark && <Sparkline data={s.spark} width={60} height={22}/>}
            <span className="db-profile__score-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {editing&&(
        <div className="db-edit-form">
          <p className="db-edit-form__head">Edit Information</p>
          {[
            {id:'name', label:'Full Name',     type:'text',  key:'name',   ro:false},
            {id:'eml',  label:'Email',          type:'email', key:'email',  ro:false},
            {id:'rid',  label:'Reg ID',         type:'text',  key:'examId', ro:true },
          ].map(f=>(
            <div key={f.id} className="db-field">
              <label>{f.label}</label>
              <input type={f.type} value={f.ro?(user[f.key]||''):(form[f.key]||'')}
                readOnly={f.ro} className={f.ro?'db-field--ro':''}
                onChange={e=>!f.ro&&setForm(p=>({...p,[f.key]:e.target.value}))}/>
            </div>
          ))}
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <button className="db-fill-btn" onClick={save}>Save</button>
            <button className="db-outline-btn" onClick={()=>setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
      {saved&&<p className="db-save-msg">✓ Saved</p>}

      {/* Registration card */}
      <p className="db-section-label" style={{marginTop:8}}>Registration Card</p>
      <div className="db-rc">
        <div className="db-rc__bar"/>
        <div className="db-rc__head">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#0D9488" strokeWidth="1.2"/><circle cx="20" cy="20" r="13" stroke="#0D9488" strokeWidth="0.6"/><text x="20" y="17" textAnchor="middle" fontSize="6" fontWeight="700" fill="#0D9488" fontFamily="serif">ARITH</text><text x="20" y="25" textAnchor="middle" fontSize="6" fontWeight="700" fill="#0D9488" fontFamily="serif">EXAM</text></svg>
          <div><p className="db-rc__org">ArithExam Assessment Board</p><p className="db-rc__title">REGISTRATION CARD</p><p className="db-rc__sess">Session 2024–25</p></div>
        </div>
        <div className="db-rc__sep"/>
        <div className="db-rc__body">
          <div className="db-rc__photo"><svg viewBox="0 0 40 40" fill="none" width="26"><circle cx="20" cy="14" r="7" stroke="rgba(13,148,136,.4)" strokeWidth="1.5"/><path d="M6 36 C6 26 34 26 34 36" stroke="rgba(13,148,136,.4)" strokeWidth="1.5" fill="none"/></svg><span>Photo</span><div className="db-rc__photo-lbl">PHOTO</div></div>
          <div className="db-rc__fields">
            {[{l:'Candidate Name',val:form.name.toUpperCase(),b:true},{l:'Email Address',val:form.email},{l:'Date of Registration',val:user.regDate||'—'}].map((f,i)=>(
              <div key={i} className="db-rc__row"><span className="db-rc__lbl">{f.l}</span><span className={`db-rc__val${f.b?' db-rc__val--b':''}`}>{f.val||'—'}</span></div>
            ))}
          </div>
        </div>
        <div className="db-rc__foot"><span className="db-rc__verified">✓ VERIFIED</span></div>
      </div>
    </div>
  );
}

/* ── Settings ── */
function SettingsView() {
  const [s,setS]=useState([
    {id:1,lbl:'Email Notifications',desc:'Exam result summaries by email',on:true},
    {id:2,lbl:'Daily Reminders',    desc:'Remind me to practice every day', on:false},
    {id:3,lbl:'Score Alerts',       desc:'Alert when a result is available', on:true},
  ]);
  return (
    <div className="db-settings">
      {s.map(item=>(
        <div key={item.id} className="db-setting-row">
          <div><p className="db-setting-row__lbl">{item.lbl}</p><p className="db-setting-row__desc">{item.desc}</p></div>
          <button className={`db-toggle ${item.on?'db-toggle--on':''}`} onClick={()=>setS(p=>p.map(i=>i.id===item.id?{...i,on:!i.on}:i))}>
            <span className="db-toggle__thumb"/>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view,   setView]   = useState('dashboard');
  const [sbOpen, setSbOpen] = useState(false);

  const hour = new Date().getHours();
  const greet = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';

  const ud = {
    name:    user?.name    || 'Demo Student',
    email:   user?.email   || 'demo@arithexam.com',
    examId:  user?.examId  || 'AE-DS-100001',
    regDate: user?.regDate || '15 Feb 2025',
  };
  const initials = ud.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

  const diff   = TREND[TREND.length-1].score - TREND[0].score;
  const recent = TREND[TREND.length-1].score - TREND[TREND.length-2].score;
  const scores = TREND.map(d=>d.score);

  return (
    <div className="db-root">

      {/* ════ SIDEBAR ════ */}
      <aside className={`db-sb ${sbOpen?'db-sb--open':''}`}
        onMouseEnter={()=>setSbOpen(true)} onMouseLeave={()=>setSbOpen(false)}>

        <div className="db-sb__logo">
          <div className="db-sb__mark">
            <svg viewBox="0 0 28 28" fill="none" width="18" height="18">
              <rect width="28" height="28" rx="6" fill="white" fillOpacity=".15"/>
              <text x="14" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="white" fontFamily="sans-serif">AE</text>
            </svg>
          </div>
          <div className="db-sb__brand">
            <span className="db-sb__wordmark">ArithExam</span>
            <span className="db-sb__sub">Assessment Engine</span>
          </div>
        </div>

        <nav className="db-sb__nav">
          <p className="db-sb__group-lbl">Menu</p>
          {NAV.map(n=>(
            <button key={n.id} className={`db-sb__link ${view===n.id?'db-sb__link--on':''}`} onClick={()=>setView(n.id)}>
              <span className="db-sb__ico">{n.icon}</span>
              <span className="db-sb__lbl">{n.label}</span>
              {view===n.id&&<span className="db-sb__pip"/>}
            </button>
          ))}
        </nav>

        {/* Exam snapshot — visible when open */}
        <div className="db-sb__snapshot">
          <p className="db-sb__group-lbl">Next Exam</p>
          <p className="db-sb__snap-name">DevReady Assessment</p>
          <div className="db-sb__snap-topics">
            {TOPICS.map(t=><span key={t} className="db-sb__snap-chip">{t}</span>)}
          </div>
          <div className="db-sb__snap-meta">
            <span>10 questions</span><span>·</span><span>30 min</span>
          </div>
          <button className="db-sb__snap-btn" onClick={()=>navigate('/pre-exam')}>
            Start Now →
          </button>
        </div>

        <div className="db-sb__foot">
          <div className="db-sb__user">
            <div className="db-sb__ava">{initials}</div>
            <div className="db-sb__user-info">
              <p className="db-sb__uname">{ud.name}</p>
              <p className="db-sb__urole">Candidate</p>
            </div>
          </div>
          <button className="db-sb__logout" onClick={logout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <main className="db-main">

        {/* ── DASHBOARD ── */}
        {view==='dashboard'&&(
          <div className="db-view" key="dash">

            {/* Greeting + CTA */}
            <div className="db-head">
              <div>
                <p className="db-greet">{greet}, {ud.name.split(' ')[0]} 👋</p>
                <h1 className="db-title">Your Performance</h1>
              </div>
              <button className="db-cta" onClick={()=>navigate('/pre-exam')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start Exam
              </button>
            </div>

            {/* ── STAT TICKER — editorial strip, NO boxes ── */}
            <div className="db-ticker">
              <div className="db-ticker__item">
                <span className="db-ticker__val"><AnimNum to={STATS.totalExams}/></span>
                <span className="db-ticker__lbl">Exams Taken</span>
                <Sparkline data={scores} width={64} height={22} color="#0D9488"/>
              </div>
              <div className="db-ticker__div"/>
              <div className="db-ticker__item">
                <span className="db-ticker__val db-ticker__val--gold"><AnimNum to={STATS.avgScore} suffix="%"/></span>
                <span className="db-ticker__lbl">Average Score</span>
                <Sparkline data={scores} width={64} height={22} color="#d4a017"/>
              </div>
              <div className="db-ticker__div"/>
              <div className="db-ticker__item">
                <span className="db-ticker__val"><AnimNum to={STATS.bestScore} suffix="%"/></span>
                <span className="db-ticker__lbl">Personal Best</span>
              </div>
              <div className="db-ticker__div"/>
              <div className="db-ticker__item">
                <span className="db-ticker__val db-ticker__val--gold"><AnimNum to={STATS.streak}/><span style={{fontSize:16}}>d 🔥</span></span>
                <span className="db-ticker__lbl">Day Streak</span>
              </div>
            </div>

            {/* ── SCORE TIMELINE — full width, no border ── */}
            <div className="db-chart-section">
              <div className="db-chart-head">
                <div>
                  <p className="db-section-label">Score Trend</p>
                  <p className="db-chart-meta">
                    {TREND.length} attempts · Low {Math.min(...scores)}% · High {Math.max(...scores)}%
                  </p>
                </div>
                <span className={`db-delta ${diff>=0?'db-delta--up':'db-delta--down'}`}>
                  {diff>=0?'↑':' ↓'} {Math.abs(diff)}% overall
                </span>
              </div>
              <TrendChart data={TREND}/>
              <p className={`db-chart-note ${diff>=0?'db-chart-note--up':'db-chart-note--dn'}`}>
                {diff>=0
                  ? `Your score improved by ${diff}% over ${TREND.length} attempts${recent<0?` — but dropped ${Math.abs(recent)}% recently. Push harder!`:' — excellent consistency!'}`
                  : `Score dropped ${Math.abs(diff)}% since your first attempt. Let's turn that around!`}
              </p>
            </div>

            <div className="db-rule"/>

            {/* ── TOPIC PROGRESS — horizontal bars, no boxes ── */}
            <div className="db-topics-section">
              <p className="db-section-label">Topic Coverage</p>
              <div className="db-topic-bars">
                {[
                  {name:'React',   pct:82, color:'#0D9488'},
                  {name:'Python',  pct:68, color:'#d4a017'},
                  {name:'SQL',     pct:75, color:'#0D9488'},
                  {name:'Ethics',  pct:90, color:'#d4a017'},
                  {name:'Viva',    pct:60, color:'#0D9488'},
                ].map((t,i)=>(
                  <TopicBar key={i} {...t}/>
                ))}
              </div>
            </div>

            <div className="db-rule"/>

            {/* ── RECENT EXAMS ── */}
            <div className="db-section">
              <div className="db-section-head">
                <p className="db-section-label">Recent Exams</p>
                <button className="db-link-btn" onClick={()=>setView('exams')}>All exams →</button>
              </div>
              <ExamTable history={HISTORY.slice(0,5)}/>
            </div>
          </div>
        )}

        {/* ── MY EXAMS ── */}
        {view==='exams'&&(
          <div className="db-view" key="exams">
            <div className="db-head">
              <div><p className="db-greet">Your history</p><h1 className="db-title">My Exams</h1></div>
              <button className="db-cta" onClick={()=>navigate('/pre-exam')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start Exam
              </button>
            </div>
            <div className="db-ticker" style={{marginBottom:24}}>
              <div className="db-ticker__item"><span className="db-ticker__val">{HISTORY.length}</span><span className="db-ticker__lbl">Total</span></div>
              <div className="db-ticker__div"/>
              <div className="db-ticker__item"><span className="db-ticker__val">{HISTORY.filter(e=>e.pass).length}</span><span className="db-ticker__lbl">Passed</span></div>
              <div className="db-ticker__div"/>
              <div className="db-ticker__item"><span className="db-ticker__val db-ticker__val--gold">{HISTORY.filter(e=>!e.pass).length}</span><span className="db-ticker__lbl">Failed</span></div>
            </div>
            <div className="db-rule"/>
            <ExamTable history={HISTORY}/>
          </div>
        )}

        {/* ── PROFILE ── */}
        {view==='profile'&&(
          <div className="db-view" key="profile">
            <div className="db-head"><div><p className="db-greet">Your account</p><h1 className="db-title">Profile</h1></div></div>
            <div className="db-rule"/>
            <ProfileView user={ud}/>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {view==='settings'&&(
          <div className="db-view" key="settings">
            <div className="db-head"><div><p className="db-greet">Preferences</p><h1 className="db-title">Settings</h1></div></div>
            <div className="db-rule"/>
            <SettingsView/>
          </div>
        )}

      </main>
    </div>
  );
}

/* ── Animated topic bar ── */
function TopicBar({ name, pct, color }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setTimeout(()=>setW(pct),100);obs.disconnect();} },{threshold:0.3});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  }, [pct]);
  return (
    <div ref={ref} className="db-topic-bar">
      <div className="db-topic-bar__head">
        <span className="db-topic-bar__name">{name}</span>
        <span className="db-topic-bar__pct" style={{color}}>{pct}%</span>
      </div>
      <div className="db-topic-bar__track">
        <div className="db-topic-bar__fill" style={{ width:`${w}%`, background:color }}/>
      </div>
    </div>
  );
} 