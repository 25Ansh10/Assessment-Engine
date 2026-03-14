import { useEffect, useState, useCallback } from 'react';
import '../styles/SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('entry');   // entry → typing → loading → exit
  const [displayText, setDisplayText] = useState('');
  const [progress, setProgress] = useState(0);
  const [particlesReady, setParticlesReady] = useState(false);

  const tagline = 'Secure · Intelligent · Beautiful';

  const handleSkip = useCallback(() => {
    setPhase('exit');
    setTimeout(() => onComplete?.(), 600);
  }, [onComplete]);

  // Skip on any key
  useEffect(() => {
    const fn = (e) => { if (e.key) handleSkip(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [handleSkip]);

  // Animation sequence
  useEffect(() => {
    // Particles come alive after 200ms
    const particleTimer = setTimeout(() => setParticlesReady(true), 200);

    // Typewriter starts at 600ms
    const typeDelay = 600;
    let i = 0;
    const typer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayText(tagline.slice(0, i));
        if (i >= tagline.length) clearInterval(interval);
      }, 50);
    }, typeDelay);

    // Loading phase at 1800ms
    let raf;
    const loadTimer = setTimeout(() => {
      setPhase('loading');
      const startTime = Date.now();
      const duration = 1400;
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setProgress(Math.round(ease * 100));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setPhase('exit');
      };
      raf = requestAnimationFrame(tick);
    }, 1800);

    // Transition out
    const exitTimer = setTimeout(() => {
      onComplete?.();
    }, 3800);

    return () => {
      clearTimeout(particleTimer);
      clearTimeout(typer);
      clearTimeout(loadTimer);
      clearTimeout(exitTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const modules = [
    { label: 'Assessment Engine', done: progress >= 25 },
    { label: 'AI Proctoring', done: progress >= 50 },
    { label: 'Analytics Core', done: progress >= 75 },
    { label: 'Secure Channel', done: progress >= 95 },
  ];

  return (
    <div className={`splash-v2 ${phase === 'exit' ? 'splash-v2--exit' : ''}`}>

      {/* Animated light mesh background */}
      <div className="splash-v2__mesh" />

      {/* Floating geometric shapes */}
      <div className={`splash-v2__shapes ${particlesReady ? 'splash-v2__shapes--active' : ''}`}>
        <div className="splash-v2__shape splash-v2__shape--1" />
        <div className="splash-v2__shape splash-v2__shape--2" />
        <div className="splash-v2__shape splash-v2__shape--3" />
        <div className="splash-v2__shape splash-v2__shape--4" />
        <div className="splash-v2__shape splash-v2__shape--5" />
      </div>

      {/* Grid pattern */}
      <div className="splash-v2__grid" />

      {/* Center content */}
      <div className="splash-v2__center">

        {/* Logo mark */}
        <div className="splash-v2__logo-group">
          <div className="splash-v2__logo-mark">
            <span className="splash-v2__logo-letter">A</span>
            <div className="splash-v2__logo-ring" />
          </div>
          <h1 className="splash-v2__logo-text">AritExam</h1>
          <div className="splash-v2__badge">
            <span className="splash-v2__badge-dot" />
            AI-Powered Assessment Platform
          </div>
        </div>

        {/* Typewriter */}
        <p className="splash-v2__tagline">
          {displayText}
          <span className="splash-v2__cursor" />
        </p>

        {/* Loading bar */}
        <div className={`splash-v2__loader ${phase === 'loading' || phase === 'exit' ? 'splash-v2__loader--visible' : ''}`}>
          <div className="splash-v2__loader-track">
            <div className="splash-v2__loader-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="splash-v2__loader-pct">{progress}%</div>
        </div>

        {/* Module check list */}
        <div className={`splash-v2__modules ${phase === 'loading' || phase === 'exit' ? 'splash-v2__modules--visible' : ''}`}>
          {modules.map(({ label, done }) => (
            <div key={label} className={`splash-v2__module ${done ? 'splash-v2__module--done' : ''}`}>
              <span className="splash-v2__module-icon">
                {done ? (
                  <svg viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#1a4fff" strokeWidth="1.5" fill="rgba(26,79,255,0.08)" />
                    <path d="M5 8l2 2 4-4" stroke="#1a4fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#d1d5db" strokeWidth="1.5" />
                  </svg>
                )}
              </span>
              <span className="splash-v2__module-label">{label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Skip button */}
      <button className="splash-v2__skip" onClick={handleSkip}>
        Press any key to skip
      </button>
    </div>
  );
}