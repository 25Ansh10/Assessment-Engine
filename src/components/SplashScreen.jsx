import { useEffect, useState } from 'react';
import '../styles/SplashScreen.css';

/**
 * ARITH-EXAM SPLASH SCREEN V9.0
 * - Logo matches logo.png: "A" compass with gold infinity ribbon BEHIND the legs
 * - No sound — clean silent animation
 * - Scenes: 0=blank | 1=compass draws | 2=infinity weaves | 3=text reveals | 4=fade out
 */
export default function SplashScreen({ onComplete }) {
  const [scene, setScene] = useState(0);

  /* ── Scene timeline ─────────────────────────────────────────── */
  useEffect(() => {
    const t = [];
    t.push(setTimeout(() => setScene(1), 300));
    t.push(setTimeout(() => setScene(2), 1800));
    t.push(setTimeout(() => setScene(3), 3000));
    t.push(setTimeout(() => setScene(4), 6500));
    t.push(setTimeout(() => onComplete?.(), 7200));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  /* ── Class name helpers ─────────────────────────────────────── */
  const vis = (min) => scene >= min ? 'sp-visible' : '';
  const drwn = (min) => scene >= min ? 'sp-drawn' : '';

  return (
    <div className={`sp-container ${scene === 4 ? 'sp-fade-out' : ''}`}>

      {/* Engineering dot-grid background */}
      <div className="sp-grid-bg" />

      {/* ════════════════════════════════════════════════
          LOGO SVG — matches logo.png exactly
          Render order: infinity FIRST (back), then legs ON TOP
      ════════════════════════════════════════════════ */}
      <svg
        className="sp-logo-svg"
        viewBox="0 0 400 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold shimmer gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8a6d2c" />
            <stop offset="30%" stopColor="#c9a84c" />
            <stop offset="50%" stopColor="#e0c06a" />
            <stop offset="70%" stopColor="#c5a044" />
            <stop offset="100%" stopColor="#8a6d2c" />
          </linearGradient>

          {/* Teal depth gradient for legs */}
          <linearGradient id="tealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a8c82" />
            <stop offset="50%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#144541" />
          </linearGradient>

          {/* Darker teal for inner leg edge */}
          <linearGradient id="tealGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#0b524a" />
          </linearGradient>

          {/* Soft drop-shadow on compass legs */}
          <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="3" result="blur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.25" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Gold glow on infinity */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ══════════════════════════════════════════════════════════
            LAYER 1 (BOTTOM): Gold infinity ribbon — rendered FIRST
            so it sits BEHIND the compass legs
        ══════════════════════════════════════════════════════════ */}
        <path
          className={`sp-infinity ${drwn(2)}`}
          d="M 200,220
             C 185,180  130,165  105,195
             C  78,228   95,268  125,270
             C 155,272  180,248  200,220
             C 220,192  245,168  275,170
             C 305,172  322,208  295,240
             C 272,268  245,275  220,258
             C 205,248  200,235  200,220 Z"
          stroke="url(#goldGrad)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#goldGlow)"
        />

        {/* ══════════════════════════════════════════════════════════
            LAYER 2 (TOP): Compass legs — rendered AFTER infinity
            so they appear IN FRONT of the ribbon
        ══════════════════════════════════════════════════════════ */}

        {/* ── LEFT COMPASS LEG ── */}
        <g className={`sp-leg-group ${vis(1)}`} filter="url(#dropShadow)">
          <polygon
            className={`sp-leg-fill ${drwn(1)}`}
            points="188,72 100,345 130,345 208,72"
            fill="url(#tealGrad)"
          />
          <line
            className={`sp-leg-line ${drwn(1)}`}
            x1="200" y1="72" x2="120" y2="345"
            stroke="url(#tealGradDark)" strokeWidth="3" strokeLinecap="butt"
            opacity="0.4"
          />
          {/* Adjustment block */}
          <rect
            className={`sp-adj-block ${vis(1)}`}
            x="128" y="174" width="42" height="22" rx="3"
            fill="#144541" transform="rotate(-18, 149, 185)"
          />
          <line className={`sp-screw-tick ${vis(1)}`} x1="136" y1="178" x2="136" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(-18, 136, 184)" />
          <line className={`sp-screw-tick ${vis(1)}`} x1="145" y1="178" x2="145" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(-18, 145, 184)" />
          <line className={`sp-screw-tick ${vis(1)}`} x1="154" y1="178" x2="154" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(-18, 154, 184)" />
          <line className={`sp-screw-tick ${vis(1)}`} x1="163" y1="178" x2="163" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(-18, 163, 184)" />
          {/* Arrow tip */}
          <polygon
            className={`sp-arrow-tip ${vis(1)}`}
            points="115,342 90,378 140,378" fill="#0b6b63"
          />
        </g>

        {/* ── RIGHT COMPASS LEG ── */}
        <g className={`sp-leg-group sp-leg-right-group ${vis(1)}`} filter="url(#dropShadow)">
          <polygon
            className={`sp-leg-fill ${drwn(1)}`}
            points="212,72 300,345 270,345 192,72"
            fill="url(#tealGrad)"
          />
          <line
            className={`sp-leg-right-line ${drwn(1)}`}
            x1="200" y1="72" x2="280" y2="345"
            stroke="url(#tealGradDark)" strokeWidth="3" strokeLinecap="butt"
            opacity="0.4"
          />
          {/* Adjustment block */}
          <rect
            className={`sp-adj-block ${vis(1)}`}
            x="230" y="174" width="42" height="22" rx="3"
            fill="#144541" transform="rotate(18, 251, 185)"
          />
          <line className={`sp-screw-tick ${vis(1)}`} x1="237" y1="178" x2="237" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(18, 237, 184)" />
          <line className={`sp-screw-tick ${vis(1)}`} x1="246" y1="178" x2="246" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(18, 246, 184)" />
          <line className={`sp-screw-tick ${vis(1)}`} x1="255" y1="178" x2="255" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(18, 255, 184)" />
          <line className={`sp-screw-tick ${vis(1)}`} x1="264" y1="178" x2="264" y2="190"
            stroke="#7ab8b3" strokeWidth="2" transform="rotate(18, 264, 184)" />
          {/* Arrow tip */}
          <polygon
            className={`sp-arrow-tip ${vis(1)}`}
            points="285,342 260,378 310,378" fill="#0b6b63"
          />
        </g>

        {/* ── Hinge / joint at apex (topmost layer) ── */}
        <circle className={`sp-joint-outer ${vis(1)}`} cx="200" cy="72" r="20" fill="#144541" />
        <circle className={`sp-joint-inner ${vis(1)}`} cx="200" cy="72" r="10" fill="#0b6b63" />
        <circle className={`sp-joint-screw ${vis(1)}`} cx="200" cy="72" r="4" fill="#8a6d2c" />
      </svg>

      {/* ── Text block ─────────────────────────────────────────── */}
      <div className={`sp-text-block ${vis(3)}`}>
        <h1 className="sp-wordmark">
          Arith<span className="sp-wordmark-accent">Exam</span>
        </h1>
        <div className={`sp-divider ${vis(3)}`} />
        <p className={`sp-tagline ${vis(3)}`}>
          Assess Smarter, Perform Better
        </p>
      </div>

    </div>
  );
}