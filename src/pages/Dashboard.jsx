import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';
const QUESTION_API = import.meta.env.VITE_QUESTION_API;
/* ─────────────────────────────
   DATA & CONFIG
───────────────────────────── */
const STATS = { totalExams: 15, avgScore: 78, bestScore: 96, streak: 8 };

const TREND = [
  { attempt: 1, score: 58, date: '01 Jan' }, { attempt: 2, score: 63, date: '05 Jan' },
  { attempt: 3, score: 55, date: '10 Jan' }, { attempt: 4, score: 70, date: '14 Jan' },
  { attempt: 5, score: 74, date: '18 Jan' }, { attempt: 6, score: 80, date: '22 Jan' },
  { attempt: 7, score: 78, date: '26 Jan' }, { attempt: 8, score: 88, date: '30 Jan' },
  { attempt: 9, score: 82, date: '03 Feb' }, { attempt: 10, score: 91, date: '07 Feb' },
  { attempt: 11, score: 88, date: '11 Feb' }, { attempt: 12, score: 96, date: '15 Feb' },
];

const TOPICS = [
  { name: 'Python', pct: 92, color: '#0D9488' },
  { name: 'React ', pct: 85, color: '#d4a017' },
  { name: 'Algorithmic Coding', pct: 74, color: '#0D9488' },
  { name: 'System Design', pct: 88, color: '#d4a017' },
];

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg> },
  { id: 'topics', label: 'Topic Mastery', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 20v-6M6 20V10M18 20V4" /></svg> },
  { id: 'profile', label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg> },
];

/* ─────────────────────────────
   COMPONENTS
───────────────────────────── */

function AnimNum({ to, suffix = '' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0; const step = Math.ceil(to / 30);
    const t = setInterval(() => { n += step; if (n >= to) { setV(to); clearInterval(t); } else setV(n); }, 30);
    return () => clearInterval(t);
  }, [to]);
  return <>{v}{suffix}</>;
}

function StatCard({ val, lbl }) {
  return (
    <div className="db-stat-item">
      <p className="db-stat-val">
        <AnimNum to={parseInt(val)} suffix={typeof val === 'string' && val.includes('%') ? '%' : ''} />
      </p>
      <p className="db-stat-lbl">{lbl}</p>
    </div>
  );
}

function TrendChart({ data }) {
  const W = 600, H = 180, PL = 40, PR = 20, PT = 20, PB = 30;
  const iW = W - PL - PR, iH = H - PT - PB;
  const pts = data.map((d, i) => ({ x: PL + (i / (data.length - 1)) * iW, y: PT + iH - (d.score / 100) * iH }));
  const line = pts.map((p, i) => i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${PT + iH} L${pts[0].x},${PT + iH} Z`;

  return (
    <div className="db-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="db-trend-svg">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={PL} y1={PT + iH - (v / 100) * iH} x2={W - PR} y2={PT + iH - (v / 100) * iH} stroke="#edf2f7" strokeWidth="1" />
            <text x={PL - 10} y={PT + iH - (v / 100) * iH + 4} textAnchor="end" fontSize="11" fill="#a0aec0" fontWeight="600">{v}%</text>
          </g>
        ))}
        <path d={area} fill="url(#chartGrad)" />
        <path d={line} fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke="var(--teal)" strokeWidth="2.5" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="var(--teal)" fontWeight="800">{data[i].score}%</text>
          </g>
        ))}
        {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map((d, i) => {
          const x = PL + (data.indexOf(d) / (data.length - 1)) * iW;
          return <text key={i} x={x} y={H - 5} textAnchor="middle" fontSize="11" fill="#a0aec0" fontWeight="600">{d.date}</text>
        })}
      </svg>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="db-settings">
      <div className="db-set-row">
        <div><p className="db-set-lbl">System Preference</p><p className="db-set-desc">Theme is currently locked to Standard Light Mode for optimal precision.</p></div>
      </div>
    </div>
  );
}

function RegistrationCard({ user, initials, hideEdit }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -(y / (rect.height / 2)) * 10, y: (x / (rect.width / 2)) * 10 });
  };

  return (
    <div className="drc-wrap" onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="drc-card" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
        <div className="drc-holo" />
        <div className="drc-header">
          <div className="drc-seal"><img src="/logo.png" alt="" width="32" height="32" /></div>
          <div className="drc-h-text">
            <p className="drc-inst">ArithExam Assessment Board</p>
            <h3 className="drc-title">REGISTRATION CARD</h3>
            <div className="drc-chip">DIGITAL IDENTITY</div>
          </div>
          {!hideEdit && (
            <div className="drc-actions">
              <button className="drc-edit-btn" onClick={() => setEditing(!editing)}>
                {editing ? 'SAVE' : 'EDIT'}
              </button>
            </div>
          )}
        </div>

        <div className="drc-body">
          <div className="drc-photo-box">
            <div className="drc-ava">{initials}</div>
            <div className="drc-stamp">CANDIDATE</div>
          </div>
          <div className="drc-fields">
            <div className="drc-row">
              <label>NAME</label>
              {editing ? (
                <input className="drc-input" value={name} onChange={e => setName(e.target.value)} autoFocus onBlur={() => setEditing(false)} />
              ) : (
                <strong>{name.toUpperCase()}</strong>
              )}
            </div>
            <div className="drc-row">
              <label>EMAIL</label>
              <span>{user.email}</span>
            </div>
            <div className="drc-row">
              <label>CANDIDATE ID</label>
              <span className="drc-id-val">AE-SR-299381</span>
            </div>
          </div>
        </div>

        <div className="drc-footer">
          <div className="drc-f-left">
            <div className="drc-status-badge">✓ VERIFIED</div>
            <div className="drc-meta-info">Status: ACTIVE</div>
          </div>
          <div className="drc-f-right">
            <div className="drc-security-stamp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              SECURE IDENTITY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user, initials, hideEdit }) {
  return (
    <div className="db-profile">
      <div className="profile-hero">
        <RegistrationCard user={user} initials={initials} hideEdit={hideEdit} />
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
  useEffect(() => {
    document.body.classList.remove('dark-theme');
    localStorage.removeItem('theme');
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const ud = {
    name: user?.name || 'Candidate Pool',
    email: user?.email || 'verified@arithexam.co'
  };
  const initials = ud.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const recentDiff = TREND[TREND.length - 1].score - TREND[TREND.length - 2].score;
  const startTestAndNavigate = () => {

    // 🔥 Call backend WITHOUT waiting
    console.log("USER:", user);
    fetch(`${QUESTION_API}/start-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ user_id: 1 }),
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("examSession", JSON.stringify(data));
        console.log("Session ready");
      })
      .catch(err => console.error(err));

    // ✅ Navigate instantly
    navigate("/pre-exam");
  };
  return (
    <div className="db-root">
      <div className="db-aurora" />

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="db-sidebar">
        <div className="db-side-top">
          <div className="db-nav-brand" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="" width="42" height="42" />
            <div className="db-nav-text">
              <span className="db-nav-title">ArithExam</span>
            </div>
          </div>

          <div className="db-side-links">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setView(n.id)} className={`db-side-item ${view === n.id ? 'db-side-item--on' : ''}`}>
                {n.icon}
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="db-side-foot">
          <div className="db-side-user" onClick={() => setView('profile')}>
            <div className="db-side-ava">{initials}</div>
            <div className="db-side-user-info">
              <p className="db-side-user-name">{ud.name.split(' ')[0]}</p>
              <p className="db-side-user-role">Candidate</p>
            </div>
          </div>
          <button className="db-side-logout" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── BENTO STAGE ── */}
      <main className="db-stage">
        {view === 'dashboard' && (
          <div className="db-bento-view">
            <header className="db-view-head">
              <div>
                <p className="db-greet-text">{greet}, {ud.name.split(' ')[0]} 👋</p>
                <h1 className="db-main-title">Candidate Dashboard</h1>
              </div>
              <button className="db-launch-btn" onClick={startTestAndNavigate}>
                Start Exam
              </button>
            </header>

            <div className="db-grid">
              {/* Profile Bento */}
              <div className="db-grid-profile">
                <ProfileView user={ud} initials={initials} hideEdit={true} />
              </div>

              {/* Stats Bento */}
              <div className="db-grid-group">
                <div className="db-stat-row">
                  <StatCard val={STATS.totalExams} lbl="Total Tests" />
                  <StatCard val={`${STATS.avgScore}%`} lbl="Avg Score" />
                </div>
                <div className="db-grid-item">
                  <div className="db-sec-head">
                    <h3 className="db-sec-title">PERFORMANCE TREND</h3>
                    <div className={`db-delta ${recentDiff >= 0 ? 'db-delta--up' : 'db-delta--down'}`}>
                      {recentDiff >= 0 ? '+' : ''}{recentDiff}%
                    </div>
                  </div>
                  <TrendChart data={TREND} />
                </div>
              </div>

              {/* History */}
              <div className="db-grid-group">
                <div className="db-grid-item">
                  <h3 className="db-sec-title">RECENT ACTIVITY</h3>
                  <div className="db-mini-table">
                    {TREND.slice(-3).reverse().map((ex, i) => (
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

        {view === 'topics' && (
          <div className="db-bento-view">
            <h1 className="db-main-title">Topic Mastery</h1>
            <p className="db-sub-explain">Deep dive into your performance across specific technical domains and subject bundles.</p>
            <div className="db-grid" style={{ marginTop: 24 }}>
              <div className="db-grid-item db-grid--full">
                <h3 className="db-sec-title">Topic Expertise</h3>
                <div className="db-topic-list" style={{ marginTop: 24 }}>
                  {TOPICS.map(t => (
                    <div key={t.name} className="db-topic-row">
                      <div className="db-topic-meta"><span>{t.name}</span><strong>{t.pct}%</strong></div>
                      <div className="db-topic-track"><div className="db-topic-fill" style={{ width: `${t.pct}%`, background: t.color }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="db-bento-view">
            <h1 className="db-main-title">Profile & Settings</h1>
            <div className="db-profile-layout" style={{ marginTop: 20 }}>
              {/* Left: Big Registration Card */}
              <div className="db-profile-card-col">
                <div className="db-grid-item db-profile-card-item">
                  <ProfileView user={ud} initials={initials} />
                </div>
              </div>

              {/* Right: Settings + Account Info */}
              <div className="db-profile-settings-col">

                <div className="db-grid-item db-settings-card">
                  <h3 className="db-sec-title">ACCOUNT</h3>
                  <div className="db-account-rows">
                    <div className="db-account-row">
                      <span className="db-account-label">Full Name</span>
                      <span className="db-account-value">{ud.name}</span>
                    </div>
                    <div className="db-account-row">
                      <span className="db-account-label">Email</span>
                      <span className="db-account-value">{ud.email}</span>
                    </div>
                    <div className="db-account-row">
                      <span className="db-account-label">Candidate ID</span>
                      <span className="db-account-value db-account-value--id">AE-SR-299381</span>
                    </div>
                    <div className="db-account-row">
                      <span className="db-account-label">Status</span>
                      <span className="db-account-badge">✓ Verified</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}