import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

/* ── mock data — replace with API ── */
const MOCK_STATS = { totalExams:12, avgScore:74, bestScore:96, streak:5 };

const MOCK_TREND = [
  {attempt:1, score:58, date:'01 Jan'},{attempt:2, score:63, date:'05 Jan'},
  {attempt:3, score:55, date:'10 Jan'},{attempt:4, score:70, date:'14 Jan'},
  {attempt:5, score:74, date:'18 Jan'},{attempt:6, score:80, date:'22 Jan'},
  {attempt:7, score:78, date:'26 Jan'},{attempt:8, score:88, date:'30 Jan'},
  {attempt:9, score:82, date:'03 Feb'},{attempt:10,score:91, date:'07 Feb'},
  {attempt:11,score:88, date:'11 Feb'},{attempt:12,score:96, date:'15 Feb'},
];

const MOCK_HISTORY = [
  {id:1, name:'Practice Test #12',date:'15 Feb 2025',score:96,total:100,time:'28m',pass:true },
  {id:2, name:'Practice Test #11',date:'11 Feb 2025',score:88,total:100,time:'34m',pass:true },
  {id:3, name:'Practice Test #10',date:'07 Feb 2025',score:91,total:100,time:'30m',pass:true },
  {id:4, name:'Practice Test #9', date:'03 Feb 2025',score:82,total:100,time:'38m',pass:true },
  {id:5, name:'Practice Test #8', date:'30 Jan 2025',score:78,total:100,time:'40m',pass:true },
  {id:6, name:'Practice Test #7', date:'26 Jan 2025',score:80,total:100,time:'36m',pass:true },
  {id:7, name:'Practice Test #6', date:'22 Jan 2025',score:74,total:100,time:'42m',pass:true },
  {id:8, name:'Practice Test #5', date:'18 Jan 2025',score:70,total:100,time:'45m',pass:true },
  {id:9, name:'Practice Test #4', date:'14 Jan 2025',score:55,total:100,time:'50m',pass:false},
  {id:10,name:'Practice Test #3', date:'10 Jan 2025',score:63,total:100,time:'48m',pass:true },
];

/* ── score trend chart — interactive hover tooltip ── */
function TrendChart({ data }) {
  const [drawn,   setDrawn]   = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setDrawn(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const W=560, H=140, PL=32, PR=10, PT=10, PB=26;
  const iW=W-PL-PR, iH=H-PT-PB;
  const minS=40, maxS=100;

  const pts = data.map((d,i) => ({
    x: PL+(i/(data.length-1))*iW,
    y: PT+iH-((d.score-minS)/(maxS-minS))*iH,
    ...d,
  }));

  const line = pts.map((p,i) => {
    if (i===0) return `M${p.x},${p.y}`;
    const pp=pts[i-1], cx=(pp.x+p.x)/2;
    return `C${cx},${pp.y} ${cx},${p.y} ${p.x},${p.y}`;
  }).join(' ');

  const area=`${line} L${pts[pts.length-1].x},${PT+iH} L${pts[0].x},${PT+iH}Z`;
  const ttX = (x) => x < 80 ? x+8 : x > W-80 ? x-88 : x-40;

  return (
    <div ref={ref} style={{width:'100%',overflowX:'auto'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',minWidth:260,cursor:'crosshair'}}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0D9488" stopOpacity=".1"/>
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[60,70,80,90,100].map(v => {
          const y=PT+iH-((v-minS)/(maxS-minS))*iH;
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
              <text x={PL-4} y={y+3.5} textAnchor="end" fontSize="8"
                fill="#cbd5e1" fontFamily="DM Sans,sans-serif">{v}</text>
            </g>
          );
        })}
        {hovered !== null && (
          <line x1={pts[hovered].x} y1={PT} x2={pts[hovered].x} y2={PT+iH}
            stroke="#0D9488" strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
        )}
        <path d={area} fill="url(#cg)"/>
        <path d={line} fill="none" stroke="#0D9488" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{strokeDasharray:1400,strokeDashoffset:drawn?0:1400,
            transition:drawn?'stroke-dashoffset 1.4s ease 0.1s':'none'}}/>
        {pts.map((p,i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} style={{cursor:'pointer'}}>
            <circle cx={p.x} cy={p.y} r="12" fill="transparent"/>
            <circle cx={p.x} cy={p.y}
              r={hovered===i ? 5.5 : 3.5}
              fill={hovered===i ? '#0D9488' : '#fff'}
              stroke="#0D9488" strokeWidth="2"
              style={{opacity:drawn?1:0,transition:`opacity 0.15s ease ${0.1+i*0.08}s`}}
            />
          </g>
        ))}
        {pts.filter((_,i)=>i%3===0).map((p,i) => (
          <text key={i} x={p.x} y={H-4} textAnchor="middle"
            fontSize="7.5" fill="#94a3b8" fontFamily="DM Sans,sans-serif">{p.date}</text>
        ))}
        {hovered !== null && (() => {
          const p=pts[hovered], prev=pts[hovered-1];
          const delta=prev?p.score-prev.score:null;
          const tx=ttX(p.x);
          const ty=p.y < PT+30 ? p.y+12 : p.y-46;
          return (
            <g style={{pointerEvents:'none'}}>
              <rect x={tx} y={ty} width="80" height="36" rx="5"
                fill="white" stroke="#e2e8f0" strokeWidth="0.8"
                style={{filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.09))'}}/>
              <text x={tx+8} y={ty+14} fontSize="11" fontWeight="700"
                fill="#0D9488" fontFamily="DM Sans,sans-serif">{p.score}%</text>
              {delta !== null && (
                <text x={tx+46} y={ty+14} fontSize="9" fontWeight="600"
                  fill={delta>=0?'#0D9488':'#ef4444'}
                  fontFamily="DM Sans,sans-serif">
                  {delta>=0?'↑':'↓'}{Math.abs(delta)}
                </text>
              )}
              <text x={tx+8} y={ty+27} fontSize="8"
                fill="#94a3b8" fontFamily="DM Sans,sans-serif">{p.date}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ── score indicator per row ── */
function ScorePill({ score, total }) {
  const pct = Math.round((score/total)*100);
  const color = pct>=80?'#0D9488':pct>=60?'#f59e0b':'#ef4444';
  return (
    <span className="db-score-pill" style={{'--c':color}}>
      {score}<span className="db-score-pill__total">/{total}</span>
    </span>
  );
}

/* ── exam history table ── */
function ExamTable({ history }) {
  const [page, setPage] = useState(0);
  const PER=8, pages=Math.ceil(history.length/PER);
  const rows=history.slice(page*PER,(page+1)*PER);
  return (
    <div>
      <table className="db-table">
        <thead>
          <tr>
            <th>#</th><th>Exam</th><th>Date</th>
            <th>Score</th><th>Time</th><th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={r.id} style={{animationDelay:`${i*30}ms`}} className="db-table__row">
              <td className="db-td-muted">{r.id}</td>
              <td className="db-td-name">{r.name}</td>
              <td className="db-td-muted">{r.date}</td>
              <td><ScorePill score={r.score} total={r.total}/></td>
              <td className="db-td-muted">{r.time}</td>
              <td>
                <span className={`db-result ${r.pass?'db-result--pass':'db-result--fail'}`}>
                  {r.pass?'Pass':'Fail'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages>1 && (
        <div className="db-pager">
          <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          {Array.from({length:pages}).map((_,i)=>(
            <button key={i} className={page===i?'on':''} onClick={()=>setPage(i)}>{i+1}</button>
          ))}
          <button disabled={page===pages-1} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

/* ── profile section ── */
function ProfileView({ user }) {
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form, setForm] = useState({ name:user.name, email:user.email });

  const save = () => {
    setSaved(true); setEditing(false);
    setTimeout(()=>setSaved(false),2200);
  };

  return (
    <div className="db-profile">
      <div className="db-profile__top">
        <div className="db-profile__ava">
          {user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
        </div>
        <div className="db-profile__meta">
          <h2 className="db-profile__name">{form.name}</h2>
          <p  className="db-profile__email">{form.email}</p>
          <div className="db-profile__ids">
            <span><span className="db-label">Reg ID</span>{user.examId||'AE-XX-000000'}</span>
            <span><span className="db-label">Since</span>{user.regDate||'—'}</span>
            <span><span className="db-label">Role</span>Candidate</span>
          </div>
        </div>
        <button className="db-edit-btn" onClick={()=>setEditing(e=>!e)}>
          {editing?'Cancel':'Edit'}
        </button>
      </div>

      <div className="db-profile__summary">
        <div className="db-summary-item">
          <span className="db-summary-val">{MOCK_STATS.totalExams}</span>
          <span className="db-summary-lbl">Exams Given</span>
        </div>
        <div className="db-summary-sep"/>
        <div className="db-summary-item">
          <span className="db-summary-val">{MOCK_STATS.avgScore}%</span>
          <span className="db-summary-lbl">Average Score</span>
        </div>
        <div className="db-summary-sep"/>
        <div className="db-summary-item">
          <span className="db-summary-val">{MOCK_STATS.bestScore}%</span>
          <span className="db-summary-lbl">Best Score</span>
        </div>
        <div className="db-summary-sep"/>
        <div className="db-summary-item">
          <span className="db-summary-val">{MOCK_STATS.streak} days</span>
          <span className="db-summary-lbl">Streak</span>
        </div>
      </div>

      {editing && (
        <div className="db-profile__form">
          <div className="db-field">
            <label>Full Name</label>
            <input type="text" value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div className="db-field">
            <label>Email Address</label>
            <input type="email" value={form.email}
              onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          </div>
          <div className="db-field">
            <label>Registration ID <span className="db-field__note">(cannot be changed)</span></label>
            <input type="text" value={user.examId||'AE-XX-000000'} readOnly
              className="db-field__readonly"/>
          </div>
          <div className="db-profile__form-row">
            <button className="db-btn-primary" onClick={save}>Save Changes</button>
            <button className="db-btn-ghost"    onClick={()=>setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      {saved && <p className="db-toast">✓ Profile updated</p>}

      <div className="db-profile__card-heading">Registration Card</div>
      <div className="db-rc">
        <div className="db-rc__holo"/>
        <div className="db-rc__header">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#0D9488" strokeWidth="1.2"/>
            <circle cx="20" cy="20" r="13" stroke="#0D9488" strokeWidth="0.6"/>
            <text x="20" y="17" textAnchor="middle" fontSize="6" fontWeight="700"
              fill="#0D9488" fontFamily="serif">ARITH</text>
            <text x="20" y="25" textAnchor="middle" fontSize="6" fontWeight="700"
              fill="#0D9488" fontFamily="serif">EXAM</text>
          </svg>
          <div className="db-rc__head-info">
            <p className="db-rc__org">ArithExam Assessment Board</p>
            <p className="db-rc__title">REGISTRATION CARD</p>
            <p className="db-rc__session">Session 2024–25</p>
          </div>
        </div>
        <div className="db-rc__divider"/>
        <div className="db-rc__body">
          <div className="db-rc__photo">
            <svg viewBox="0 0 40 40" fill="none" width="26">
              <circle cx="20" cy="14" r="7" stroke="rgba(13,148,136,.35)" strokeWidth="1.5"/>
              <path d="M6 36 C6 26 34 26 34 36" stroke="rgba(13,148,136,.35)" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>Photo</span>
            <div className="db-rc__photo-label">PHOTO</div>
          </div>
          <div className="db-rc__fields">
            {[
              {lbl:'Candidate Name',       val:form.name.toUpperCase(), cls:'bold'},
              {lbl:'Email Address',        val:form.email},
              {lbl:'Date of Registration', val:user.regDate||'—'},
            ].map((f,i)=>(
              <div key={i} className="db-rc__row">
                <span className="db-rc__lbl">{f.lbl}</span>
                <span className={`db-rc__val ${f.cls||''}`}>{f.val||'—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="db-rc__footer">
          <span className="db-rc__badge">✓ VERIFIED</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 'dashboard' | 'exams' | 'profile' | 'settings'
  const [view,   setView]   = useState('dashboard');
  const [sbOpen, setSbOpen] = useState(false);

  const hour     = new Date().getHours();
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';

  const userData = {
    name:    user?.name    || 'Demo Student',
    email:   user?.email   || 'demo@arithexam.com',
    examId:  user?.examId  || 'AE-DS-100001',
    regDate: user?.regDate || '15 Feb 2025',
  };

  const nav = [
    {id:'dashboard', label:'Dashboard'},
    {id:'exams',     label:'My Exams'},
    {id:'profile',   label:'Profile'},
    {id:'settings',  label:'Settings'},
  ];

  /* ── Normal dashboard layout ── */
  return (
    <div className="db-layout">

      {/* SIDEBAR */}
      <aside
        className={`db-sb ${sbOpen?'db-sb--open':''}`}
        onMouseEnter={()=>setSbOpen(true)}
        onMouseLeave={()=>setSbOpen(false)}
      >
        <div className="db-sb__logo">
          <div className="db-sb__mark">AE</div>
          <span className="db-sb__wordmark">ArithExam</span>
        </div>

        <nav className="db-sb__nav">
          {nav.map(n=>(
            <button key={n.id}
              className={`db-sb__link ${view===n.id?'db-sb__link--on':''}`}
              onClick={()=>setView(n.id)}>
              <span className="db-sb__dot"/>
              <span className="db-sb__link-text">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="db-sb__foot">
          <div className="db-sb__user-row">
            <div className="db-sb__ava">
              {userData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div className="db-sb__user-info">
              <p className="db-sb__user-name">{userData.name}</p>
              <p className="db-sb__user-role">Candidate</p>
            </div>
          </div>
          <button className="db-sb__logout" onClick={logout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="db-main">

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="db-view">
            <div className="db-page-head">
              <div>
                <p className="db-greet">{greeting}</p>
                <h1 className="db-title">{userData.name.split(' ')[0]}'s Dashboard</h1>
              </div>
              {/* ▶ Now opens the proctored ExamStartFlow */}
              <button className="db-start" onClick={() => navigate('/pre-exam')}>
                ▶ Start Exam
              </button>
            </div>

            <div className="db-inline-stats">
              <span className="db-is-item">
                <strong>{MOCK_STATS.totalExams}</strong> exams given
              </span>
              <span className="db-is-sep">·</span>
              <span className="db-is-item">
                avg score <strong>{MOCK_STATS.avgScore}%</strong>
              </span>
              <span className="db-is-sep">·</span>
              <span className="db-is-item">
                best <strong>{MOCK_STATS.bestScore}%</strong>
              </span>
              <span className="db-is-sep">·</span>
              <span className="db-is-item">
                <strong>{MOCK_STATS.streak}-day</strong> streak 🔥
              </span>
            </div>

            {(() => {
              const badges = [];
              if (MOCK_STATS.totalExams >= 1)  badges.push({ icon:'✓', text:'First Exam' });
              if (MOCK_STATS.streak    >= 3)  badges.push({ icon:'🔥', text:`${MOCK_STATS.streak}-Day Streak` });
              if (MOCK_STATS.bestScore >= 90) badges.push({ icon:'🎯', text:'Scored 90+' });
              if (MOCK_STATS.totalExams >= 10) badges.push({ icon:'💪', text:'10 Exams Done' });
              if (MOCK_STATS.avgScore  >= 75) badges.push({ icon:'📈', text:'Avg 75+' });
              return badges.length > 0 ? (
                <div className="db-badges">
                  {badges.map((b,i) => (
                    <span key={i} className="db-badge">{b.icon} {b.text}</span>
                  ))}
                </div>
              ) : null;
            })()}

            <div className="db-divider"/>

            <div className="db-section">
              <div className="db-section__head">
                <h2 className="db-section__title">Score Trend</h2>
                <span className="db-section__meta">
                  Last {MOCK_TREND.length} attempts ·
                  Low {Math.min(...MOCK_TREND.map(d=>d.score))}% ·
                  High {Math.max(...MOCK_TREND.map(d=>d.score))}%
                </span>
              </div>
              <TrendChart data={MOCK_TREND}/>
              {(() => {
                const first = MOCK_TREND[0].score;
                const last  = MOCK_TREND[MOCK_TREND.length-1].score;
                const diff  = last - first;
                const lastTwo = MOCK_TREND.slice(-2);
                const recent  = lastTwo[1].score - lastTwo[0].score;
                if (diff > 0) return (
                  <p className="db-improvement db-improvement--up">
                    ↑ Your score improved by {diff}% over {MOCK_TREND.length} attempts
                    {recent < 0 ? ` — but dropped ${Math.abs(recent)}% last time. Try again?` : " — keep it up!"}
                  </p>
                );
                return (
                  <p className="db-improvement db-improvement--down">
                    ↓ Score dropped {Math.abs(diff)}% from your first attempt. You can do better!
                  </p>
                );
              })()}
            </div>

            <div className="db-divider"/>

            <div className="db-section">
              <div className="db-section__head">
                <h2 className="db-section__title">Recent Exams</h2>
                <button className="db-link-btn" onClick={()=>setView('exams')}>
                  View all →
                </button>
              </div>
              <ExamTable history={MOCK_HISTORY.slice(0,5)}/>
            </div>
          </div>
        )}

        {/* MY EXAMS VIEW */}
        {view === 'exams' && (
          <div className="db-view">
            <div className="db-page-head">
              <div>
                <p className="db-greet">Your history</p>
                <h1 className="db-title">My Exams</h1>
              </div>
              <button className="db-start" onClick={() => navigate('/pre-exam')}>
                ▶ Start Exam
              </button>
            </div>
            <div className="db-inline-stats">
              <span className="db-is-item">
                <strong>{MOCK_HISTORY.length}</strong> total attempts
              </span>
              <span className="db-is-sep">·</span>
              <span className="db-is-item">
                <strong>{MOCK_HISTORY.filter(e=>e.pass).length}</strong> passed
              </span>
              <span className="db-is-sep">·</span>
              <span className="db-is-item">
                <strong>{MOCK_HISTORY.filter(e=>!e.pass).length}</strong> failed
              </span>
            </div>
            <div className="db-divider"/>
            <ExamTable history={MOCK_HISTORY}/>
          </div>
        )}

        {/* PROFILE VIEW */}
        {view === 'profile' && (
          <div className="db-view">
            <div className="db-page-head">
              <div>
                <p className="db-greet">Your account</p>
                <h1 className="db-title">Profile</h1>
              </div>
            </div>
            <div className="db-divider"/>
            <ProfileView user={userData}/>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {view === 'settings' && (
          <div className="db-view">
            <div className="db-page-head">
              <div>
                <p className="db-greet">Preferences</p>
                <h1 className="db-title">Settings</h1>
              </div>
            </div>
            <div className="db-divider"/>
            <div className="db-settings">
              {[
                {lbl:'Email Notifications', desc:'Receive exam result summaries by email', on:true},
                {lbl:'Daily Reminders',     desc:'Remind me to practice every day',       on:false},
              ].map((s,i)=>(
                <div key={i} className="db-setting">
                  <div>
                    <p className="db-setting__lbl">{s.lbl}</p>
                    <p className="db-setting__desc">{s.desc}</p>
                  </div>
                  <label className="db-toggle">
                    <input type="checkbox" defaultChecked={s.on}/>
                    <span className="db-toggle__track">
                      <span className="db-toggle__thumb"/>
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}