import { useEffect, useState, useCallback, useRef } from 'react';
import '../styles/SplashScreen.css';
import studentScan from '../assets/student_scan.png';

export default function SplashScreen({ onComplete }) {
  const [scene, setScene] = useState(0); // 0=entry, 1=laptop, 2=scan, 3=verified, 4=exit
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [typedText, setTypedText] = useState('');

  const handleSkip = useCallback(() => {
    setScene(4);
    setTimeout(() => onComplete?.(), 600);
  }, [onComplete]);

  // Keyboard skip
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' || e.key === ' ') handleSkip(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [handleSkip]);

  // Background Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.3 + 0.05,
            color: Math.random() > 0.5 ? '26, 79, 255' : '0, 185, 107',
        });
    }

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(26, 79, 255, ${0.05 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            ctx.fill();
        });
        animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
        cancelAnimationFrame(animFrameRef.current);
        window.removeEventListener('resize', onResize);
    };
  }, []);

  // Animation Timeline
  useEffect(() => {
    const timers = [];

    // Overall Progress
    const progStart = Date.now();
    const progInt = setInterval(() => {
      const elapsed = Date.now() - progStart;
      const p = Math.min(elapsed / 3000, 1);
      setProgress(Math.round(p * 100));
      if (p >= 1) clearInterval(progInt);
    }, 16);

    // Sequence
    timers.push(setTimeout(() => setScene(1), 100));

    timers.push(setTimeout(() => {
      setScene(2);
      let sp = 0;
      const scanInt = setInterval(() => {
        sp += 2;
        setScanProgress(Math.min(sp, 100));
        if (sp >= 100) clearInterval(scanInt);
      }, 20); // Slower progress for 1.5s feel
    }, 1100));

    timers.push(setTimeout(() => {
      setScene(3);
      const text = "Secure AI Assessment Platform";
      let i = 0;
      const typeInt = setInterval(() => {
        setTypedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(typeInt);
      }, 40);
    }, 2800)); // 1100 + 1500 (extra time for scan) + 200 buffer

    timers.push(setTimeout(() => setScene(4), 4000));
    timers.push(setTimeout(() => onComplete?.(), 4800));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progInt);
    };
  }, [onComplete]);

  return (
    <div className={`sp ${scene === 4 ? 'sp--exit' : ''}`}>
      <canvas ref={canvasRef} className="sp__canvas" />
      <div className="sp__overlay" />

      <div className="sp__content">
        {/* LOGO HEADER */}
        <div className="sp__header reveal-down">
          <div className="sp__logo">
            <span className="sp__logo-box">A</span>
            <span className="sp__logo-text">Arith<span className="accent">Exam</span></span>
          </div>
        </div>

        <div className="sp__stage">
          {/* SCENE 1: Laptop Entrance */}
          <div className={`sp__scene sp__scene-1 ${scene === 1 ? 'active' : ''} ${scene > 1 ? 'done' : ''}`}>
            <div className="sp__laptop-3d">
              <div className="sp__laptop-lid">
                <div className="sp__portal-mock">
                  <div className="sp__portal-head">
                    <div className="win-dots"><span/><span/><span/></div>
                    <span>Assessment Portal</span>
                  </div>
                  <div className="sp__portal-body">
                    <div className="sp__portal-loading">
                      <div className="dot-pulse"></div>
                      <span>Initializing Exam Environment...</span>
                    </div>
                    <div className="sp__portal-fields">
                      <div className="fld"></div>
                      <div className="fld" style={{width: '70%'}}></div>
                      <div className="btn">Secure Login</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sp__laptop-base"></div>
            </div>
          </div>

          {/* SCENE 2: AI Face Scan */}
          <div className={`sp__scene sp__scene-2 ${scene === 2 ? 'active' : ''} ${scene > 2 ? 'done' : ''}`}>
            <div className="sp__scan-container">
              <div className="sp__scan-frame">
                <img src={studentScan} alt="Student" className="sp__student-img" />
                <div className="sp__scan-overlay">
                  <div className="sp__scan-line"></div>
                  <div className="sp__hud-corners">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <div className="sp__hud-data">
                    <div className="hud-label">BIOMETRIC SCAN</div>
                    <div className="hud-val">ID: ARITH-{Math.floor(Math.random()*9000)+1000}</div>
                  </div>
                </div>
              </div>
              <div className="sp__scan-bottom">
                <div className="sp__scan-progress-bar">
                  <div className="fill" style={{width: `${scanProgress}%`}}></div>
                </div>
                <div className="sp__scan-status">
                  {scanProgress < 100 ? `VERIFYING IDENTITY... ${scanProgress}%` : "IDENTITY VERIFIED"}
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 3: Verified + Platform Text */}
          <div className={`sp__scene sp__scene-3 ${scene === 3 ? 'active' : ''}`}>
            <div className="sp__verified-box">
              <div className="sp__verified-check">
                <svg viewBox="0 0 52 52">
                  <circle className="check-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="check-mark" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h1 className="sp__final-text">
                {typedText}
                <span className="cursor">|</span>
              </h1>
            </div>
          </div>
        </div>

        {/* MASTER LOADING BAR */}
        <div className="sp__master-loading">
          <div className="sp__master-fill" style={{width: `${progress}%`}}></div>
          <div className="sp__master-info">
            <span>{scene === 1 ? 'Environment Setup' : scene === 2 ? 'AI Security Check' : 'Launching Platform'}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      <div className="sp__footer">
        <span>© 2026 ARITHWISE TECHNOLOGIES</span>
        <span>ADVANCED ASSESSMENT ENGINE</span>
      </div>
    </div>
  );
}