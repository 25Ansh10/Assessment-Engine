import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

/* ─────────────────────────────
   DATA & CONFIG
───────────────────────────── */
const STATS = { totalExams: 15, avgScore: 78, bestScore: 96, streak: 8 };

const TREND = [
  { attempt:1,  score:58, date:'01 Jan' }, { attempt:2,  score:63, date:'05 Jan' },
  { attempt:3,  score:55, date:'10 Jan' }, { attempt:4,  score:70, date:'14 Jan' },
  { attempt:5,  score:74, date:'18 Jan' }, { attempt:6,  score:80, date:'22 Jan' },
  { attempt:7,  score:78, date:'26 Jan' }, { attempt:8,  score:88, date:'30 Jan' },
  { attempt:9,  score:82, date:'03 Feb' }, { attempt:10, score:91, date:'07 Feb' },
  { attempt:11, score:88, date:'11 Feb' }, { attempt:12, score:96, date:'15 Feb' },
];

const TOPICS = [
  { name: 'Arithmetic Logic', pct: 92, color: '#0D9488' },
  { name: 'Quantitative Analysis', pct: 85, color: '#d4a017' },
  { name: 'Statistical Inference', pct: 74, color: '#0D9488' },
  { name: 'Algorithmic Speed', pct: 88, color: '#d4a017' },
];

const NAV = [
  { id: 'dashboard', label: 'Command Center', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg> },
  { id: 'exams', label: 'Assessments', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id: 'profile', label: 'Identity Vault', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
];

/* ─────────────────────────────
   COMPONENTS
───────────────────────────── */

function AnimNum({ to, suffix='' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n=0; const step=Math.ceil(to/30);
    const t=setInterval(()=>{ n+=step; if(n>=to){setV(to);clearInterval(t);}else setV(n); },30);
    return ()=>clearInterval(t);
  }, [to]);
  return <>{v}{suffix}</>;
}

function StatCard({ val, lbl, color, spark }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -(y / (rect.height / 2)) * 6, y: (x / (rect.width / 2)) * 6 });
  };
  return (
    <div className="db-stat-item" onMouseMove={handleMove} onMouseLeave={()=>setTilt({x:0,y:0})}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
      <p className={`db-stat-val ${color==='gold'?'db-stat-val--gold':''}`}>
        <AnimNum to={parseInt(val)} suffix={typeof val==='string'&&val.includes('%')?'%':''} />
      </p>
      <p className="db-stat-lbl">{lbl}</p>
    </div>
  );
}

function TrendChart({ data }) {
  const W=600, H=140, PL=30, PR=10, PT=10, PB=20;
  const iW=W-PL-PR, iH=H-PT-PB, minS=40, maxS=100;
  const pts = data.map((d,i)=>({ x:PL+(i/(data.length-1))*iW, y:PT+iH-((d.score-minS)/(maxS-minS))*iH }));
  const line = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="db-trend-svg">
      <path d={line} fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--teal)"/>)}
    </svg>
  );
}

function SettingsView() {
  const [s,setS]=useState([
    {id:1,lbl:'Biometric Simulation',desc:'Enable proctoring AI check before session',on:true},
    {id:2,lbl:'Email Reports',desc:'Weekly performance PDF sent to inbox', on:false},
    {id:3,lbl:'Real-time Feedback',desc:'Show correctness during assessment', on:true},
  ]);
  return (
    <div className="db-settings">
      {s.map(item=>(
        <div key={item.id} className="db-set-row">
          <div><p className="db-set-lbl">{item.lbl}</p><p className="db-set-desc">{item.desc}</p></div>
          <button className={`db-toggle ${item.on?'db-toggle--on':''}`} onClick={()=>setS(p=>p.map(i=>i.id===item.id?{...i,on:!i.on}:i))}>
            <span className="db-toggle-thumb"/>
          </button>
        </div>
      ))}
    </div>
  );
}

function ProfileView({ user, initials }) {
  return (
    <div className="db-profile">
      <div className="db-p-head">
        <div className="db-p-ava">{initials}</div>
        <div className="db-p-info">
          <h2 className="db-p-name">{user.name}</h2>
          <p className="db-p-email">{user.email}</p>
        </div>
      </div>
      <div className="db-p-meta">
        <div className="db-p-chip">Verified Candidate</div>
        <div className="db-p-chip">ID: AE-29938</div>
      </div>
      <div className="db-rc-preview">
        <p className="db-rc-label">Digital Registration Card</p>
        <div className="db-rc-card">
           <div className="db-rc-bar" />
           <div className="db-rc-row"><span>Candidate:</span><strong>{user.name.toUpperCase()}</strong></div>
           <div className="db-rc-row"><span>Status:</span><strong style={{color:'var(--teal)'}}>AUTHORIZED</strong></div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   MAIN PAGE
───────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');

  const hour = new Date().getHours();
  const greet = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  const ud = { 
    name: user?.name || 'Candidate Pool', 
    email: user?.email || 'verified@arithexam.co' 
  };
  const initials = ud.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  const recentDiff = TREND[TREND.length-1].score - TREND[TREND.length-2].score;

  return (
    <div className="db-root">
      <div className="db-aurora" />

      {/* ── FLOATING TOP NAV ── */}
      <nav className="db-nav-float">
        <div className="db-nav-brand" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="" width="36" height="36" />
          <div className="db-nav-text">
            <span className="db-nav-title">ArithExam</span>
            <span className="db-nav-tag">Precision Engine</span>
          </div>
        </div>

        <div className="db-nav-links">
          {NAV.map(n => (
            <button key={n.id} onClick={()=>setView(n.id)} className={`db-nav-item ${view===n.id?'db-nav-item--on':''}`}>
               {n.icon}
               <span>{n.label}</span>
            </button>
          ))}
        </div>

        <div className="db-nav-user">
          <div className="db-nav-ava" onClick={()=>setView('profile')}>{initials}</div>
          <button className="db-logout-btn" onClick={logout} title="Sign Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── BENTO STAGE ── */}
      <main className="db-stage">
        {view === 'dashboard' && (
          <div className="db-bento-view">
            <header className="db-view-head">
              <div>
                <p className="db-greet-text">{greet}, {ud.name.split(' ')[0]} 👋</p>
                <h1 className="db-main-title">Performance Command</h1>
              </div>
              <button className="db-launch-btn" onClick={() => navigate('/pre-exam')}>
                Launch New Session
              </button>
            </header>

            <div className="db-grid">
              {/* Profile Bento */}
              <div className="db-grid-item db-grid--lg">
                <ProfileView user={ud} initials={initials} />
              </div>

              {/* Stats Bento */}
              <div className="db-grid-group">
                <div className="db-stat-row">
                  <StatCard val={STATS.totalExams} lbl="Total Assessments" />
                  <StatCard val={`${STATS.avgScore}%`} lbl="Efficiency Index" color="gold" />
                </div>
                <div className="db-grid-item">
                  <div className="db-sec-head">
                    <h3 className="db-sec-title">VELOCITY TRENDING</h3>
                    <div className={`db-delta ${recentDiff>=0?'db-delta--up':'db-delta--down'}`}>
                      {recentDiff >= 0 ? '+' : ''}{recentDiff}%
                    </div>
                  </div>
                  <TrendChart data={TREND} />
                </div>
              </div>

              {/* Topics & History */}
              <div className="db-grid-group">
                <div className="db-grid-item">
                  <h3 className="db-sec-title">TOPIC MASTERY</h3>
                  <div className="db-topic-list">
                    {TOPICS.map(t => (
                      <div key={t.name} className="db-topic-row">
                        <div className="db-topic-meta"><span>{t.name}</span><strong>{t.pct}%</strong></div>
                        <div className="db-topic-track"><div className="db-topic-fill" style={{width:`${t.pct}%`, background:t.color}} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="db-grid-item">
                  <h3 className="db-sec-title">VERIFIED LOGS</h3>
                  <div className="db-mini-table">
                    {TREND.slice(-3).reverse().map((ex,i)=>(
                      <div key={i} className="db-log-row">
                        <span className="db-log-date">{ex.date}</span>
                        <span className="db-log-score">{ex.score}%</span>
                        <span className="db-log-status">SECURE</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'exams' && (
          <div className="db-bento-view">
            <h1 className="db-main-title">Assessment Catalog</h1>
            <div className="db-grid-item" style={{marginTop:20}}>
               <p className="db-empty-text">Searching local nodes for available exam protocols…</p>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="db-bento-view">
            <h1 className="db-main-title">Identity & Security</h1>
            <div className="db-grid" style={{marginTop:20}}>
               <div className="db-grid-item"><ProfileView user={ud} initials={initials} /></div>
               <div className="db-grid-item"><SettingsView /></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}