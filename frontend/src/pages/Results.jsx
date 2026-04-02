import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Results.css';

/* ─────────────────────────────
   REPORT COMPONENTS
   ───────────────────────────── */

function AnimMetric({ val, lbl, sub, icon, color='teal' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n=0; const step=Math.ceil(val/25);
    const t=setInterval(()=>{ n+=step; if(n>=val){setV(val);clearInterval(t);}else setV(n); },40);
    return ()=>clearInterval(t);
  }, [val]);

  return (
    <div className={`res-m-card res-m-card--${color}`}>
      <div className="res-m-icon">{icon}</div>
      <div className="res-m-info">
        <p className="res-m-lbl">{lbl}</p>
        <h2 className="res-m-val">{v}</h2>
        <p className="res-m-sub">{sub}</p>
      </div>
    </div>
  );
}

function DiffCard({ lvl, solved, total, color }) {
  const pct = Math.round((solved / total) * 100) || 0;
  return (
    <div className="res-d-item">
      <div className="res-d-head">
        <span className="res-d-lvl">{lvl}</span>
        <span className="res-d-pct" style={{color}}>{pct}%</span>
      </div>
      <div className="res-d-track">
        <div className="res-d-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="res-d-foot">
        <span><b>{solved}</b> Solved</span>
        <span><b>{total}</b> Total</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   MAIN RESULTS PAGE
   ───────────────────────────── */

export default function Results() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("latestExamResults");
    if (saved) {
      const data = JSON.parse(saved);
      setResults(data);
      // Anim final score
      let n=0; const step=Math.ceil(data.percentage/30);
      const t=setInterval(()=>{ n+=step; if(n>=data.percentage){setScore(data.percentage);clearInterval(t);}else setScore(n); },30);
      return ()=>clearInterval(t);
    }
  }, []);

  if (!results) return <div className="res-loading">Analyzing Performance...</div>;

  const circ = 2 * Math.PI * 90;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="res-root">
      <div className="res-aurora" />
      
      {/* ── HEADER ── */}
      <header className="res-nav">
        <div className="res-nav-brand">
          <img src="/logo.png" alt="" width="36" height="36" />
          <span className="res-nav-title">ArithExam <small>Engineered for Precision. Deciphering Potential.</small></span>
        </div>
        <button className="res-back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </header>

      <main className="res-content">
        
        {/* ── SCORE HERO ── */}
        <section className="res-hero">
          <div className="res-score-box">
             <svg width="220" height="220" viewBox="0 0 200 200">
               <circle cx="100" cy="100" r="90" className="res-ring-bg" />
               <circle cx="100" cy="100" r="90" className="res-ring-fill" 
                 style={{ strokeDasharray: circ, strokeDashoffset: offset }} />
             </svg>
             <div className="res-score-inner">
               <span className="res-score-num">{score}</span>
               <span className="res-score-pct">%</span>
               <p className="res-score-lbl">OVERALL SCORE</p>
             </div>
          </div>
          
          <div className="res-hero-text">
            <h1 className="res-title">Submission Successful</h1>
            <p className="res-subtitle">Your performance analysis has been finalized by our precision engine.</p>
            <div className="res-tag-row">
              <span className="res-tag">ID: {results.rank < 10 ? 'AE-00' : 'AE-0'}{results.rank}</span>
              <span className={`res-tag ${results.passed ? 'res-tag--pass' : 'res-tag--warn'}`}>
                {results.passed ? 'VERIFIED PASS' : 'NEEDS PRACTICE'}
              </span>
            </div>
          </div>
        </section>

        {/* ── METRICS GRID ── */}
        <div className="res-grid-wrap">
          <div className="res-metrics">
            <AnimMetric 
              lbl="Solved" 
              val={results.correctAnswers + results.incorrectAnswers} 
              sub="Questions Attempted" 
              color="teal"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
            />
            <AnimMetric 
              lbl="Unsolved" 
              val={results.unattempted} 
              sub="Left Blank" 
              color="gold"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            />
            <AnimMetric 
              lbl="Efficiency" 
              val={Math.round((results.correctAnswers / (results.correctAnswers + results.incorrectAnswers || 1)) * 100)}
              sub="Accuracy Ratio" 
              color="teal"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            />
          </div>

          {/* ── DIFFICULTY ANALYSIS ── */}
          <div className="res-analysis">
             <div className="res-card-head">
               <h3>DIFFICULTY BREAKDOWN</h3>
               <p>Performance segmented by cognitive complexity levels.</p>
             </div>
             
             <div className="res-diff-list">
               {results.levelStats.map(stat => (
                 <DiffCard 
                   key={stat.level}
                   lvl={stat.level} 
                   solved={stat.solved} 
                   total={stat.total}
                   color={stat.level === 'Easy' ? '#0D9488' : stat.level === 'Medium' ? '#d4a017' : '#ef4444'}
                 />
               ))}
             </div>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <footer className="res-footer">
           <button className="res-cta res-cta--sec" onClick={() => navigate('/dashboard')}>
             Back to Dashboard
           </button>
           <button className="res-cta res-cta--pri" onClick={() => window.print()}>
             Download PDF Report
           </button>
        </footer>

      </main>
    </div>
  );
}
