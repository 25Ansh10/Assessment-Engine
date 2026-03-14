import { useEffect, useState } from 'react';
import '../styles/SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('logo');   // logo → ring → exit
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState('');

  const tagline = 'Secure. Intelligent. Beautiful.';

  // Phase 1 — Logo fades in (0–800ms), then typewriter starts (800ms)
  // Phase 2 — Ring fills (1600–2800ms)
  // Phase 3 — Exit wipe (2800–3200ms)

  useEffect(() => {
    // Typewriter
    const typeDelay = 800;
    let i = 0;
    const typer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayText(tagline.slice(0, i));
        if (i >= tagline.length) clearInterval(interval);
      }, 42);
    }, typeDelay);

    // Ring fill
    const ringStart = 1500;
    let raf;
    const ringTimer = setTimeout(() => {
      const startTime = Date.now();
      const duration = 1100;
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setProgress(Math.round(ease * 100));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setPhase('exit');
      };
      setPhase('ring');
      raf = requestAnimationFrame(tick);
    }, ringStart);

    // Transition to landing
    const exitTimer = setTimeout(() => {
      onComplete?.();
    }, 3400);

    return () => {
      clearTimeout(typeDelay);
      clearTimeout(ringTimer);
      clearTimeout(exitTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const circumference = 2 * Math.PI * 44; // r=44
  const dashOffset = circumference * (1 - progress / 100);

  const statusMap = [
    { label: 'Camera module', done: progress >= 30 },
    { label: 'Secure channel', done: progress >= 58 },
    { label: 'AI proctoring', done: progress >= 82 },
  ];

  return (
    <div className={`splash ${phase === 'exit' ? 'splash--exit' : ''}`}>

      {/* Animated orbs — reuse Landing palette exactly */}
      <div className="splash__orb splash__orb--1" />
      <div className="splash__orb splash__orb--2" />

      {/* Animated grid — mirrors .landing-hero__right-bg::after */}
      <div className="splash__grid" />

      <div className="splash__center">

        {/* Logo */}
        <div className="splash__logo-wrap">
          <span className="splash__logo">AritExam</span>
          <div className="splash__badge">
            <span className="splash__badge-dot" />
            AI-Powered Assessments
          </div>
        </div>

        {/* Typewriter tagline */}
        <p className="splash__tagline">
          {displayText}
          <span className="splash__cursor" />
        </p>

        {/* Progress ring */}
        <div className={`splash__ring-wrap ${phase === 'ring' || phase === 'exit' ? 'splash__ring-wrap--visible' : ''}`}>
          <svg className="splash__ring-svg" viewBox="0 0 100 100">
            {/* Track */}
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
            />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a4fff" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
            {/* Percentage */}
            <text
              x="50" y="50"
              textAnchor="middle"
              dominantBaseline="central"
              className="splash__ring-pct"
            >
              {progress}%
            </text>
          </svg>

          {/* Check list */}
          <div className="splash__checks">
            {statusMap.map(({ label, done }) => (
              <div key={label} className={`splash__check ${done ? 'splash__check--done' : ''}`}>
                <span className="splash__check-icon">
                  {done ? (
                    <svg viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#00e5ff" strokeWidth="1.5" />
                      <path d="M5 8l2 2 4-4" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    </svg>
                  )}
                </span>
                <span className="splash__check-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Skip hint */}
      <button
        className="splash__skip"
        onClick={() => onComplete?.()}
      >
        Press any key to skip
      </button>

    </div>
  );
}