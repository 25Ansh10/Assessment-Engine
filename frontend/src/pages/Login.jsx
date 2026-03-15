import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

/*
  Phase timeline:
  'dark'    → room is dark, only lamp silhouette glows faintly
  'clicked' → user clicks lamp: white flash fires
  'lit'     → teal glow spreads across the room
  'form'    → login card rises up from the lamp base
  Clicking lamp again in lit/form → back to dark (toggle)
*/

export default function Login() {
  const [phase, setPhase]       = useState('dark');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [eyePos, setEyePos]     = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  // const { login } = useAuth();

  /* eyes track cursor */
  useEffect(() => {
    const onMove = (e) => {
      const dx = Math.max(-1, Math.min(1, (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)));
      setEyePos({ x: dx * 5, y: dy * 4 });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* click sequence — toggles dark <-> light on every lamp click */
  const handleLampClick = () => {
    if (phase === 'dark') {
      // dark → flash → lit → form
      setPhase('clicked');
      setTimeout(() => setPhase('lit'),  250);
      setTimeout(() => setPhase('form'), 620);
    } else if (phase === 'lit' || phase === 'form') {
      // light → dark (turn off)
      setPhase('dark');
      setForm({ email: '', password: '' });
      setError('');
    }
    // ignore clicks during 'clicked' transition
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      // await login(form.email, form.password);
      await new Promise((r) => setTimeout(r, 1500));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const isLit   = phase === 'lit'  || phase === 'form';
  const isForm  = phase === 'form';
  const isFlash = phase === 'clicked';

  return (
    <div className={`login-root login-root--${phase}`}>

      {/* white flash on click */}
      <div className={`login__flash${isFlash ? ' login__flash--on' : ''}`} />

      {/* spreading room glow */}
      <div className={`login__room-glow${isLit ? ' login__room-glow--on' : ''}`} />

      {/* warm floor pool under lamp */}
      <div className={`login__floor-pool${isLit ? ' login__floor-pool--on' : ''}`} />

      {/* ════ LAMP ════ */}
      <div
        className={`lamp lamp--${phase}`}
        onClick={handleLampClick}
        role="button"
        aria-label={isLit ? 'Turn off lamp' : 'Turn on lamp'}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleLampClick()}
      >
        {/* cord */}
        <div className="lamp__cord">
          <div className="lamp__cord-cap" />
        </div>

        {/* shade */}
        <div className="lamp__shade">
          <div className="lamp__shade-shine" />
          <div className="lamp__face">
            <div className="lamp__eye lamp__eye--l">
              <div className="lamp__pupil"
                style={{ transform: `translate(${eyePos.x}px,${eyePos.y}px)` }} />
            </div>
            <div className="lamp__eye lamp__eye--r">
              <div className="lamp__pupil"
                style={{ transform: `translate(${eyePos.x}px,${eyePos.y}px)` }} />
            </div>
            <div className={`lamp__mouth${isLit ? ' lamp__mouth--smile' : ''}`} />
            <div className="lamp__blush lamp__blush--l" />
            <div className="lamp__blush lamp__blush--r" />
          </div>
        </div>

        {/* bulb + rays */}
        <div className="lamp__bulb">
          {isLit && [...Array(8)].map((_, i) => (
            <div key={i} className="lamp__ray" style={{ '--r': i }} />
          ))}
        </div>

        {/* stand */}
        <div className="lamp__neck" />
        <div className="lamp__base" />

        {/* hint — only in dark */}
        {phase === 'dark' && (
          <div className="lamp__hint">
            <span>Click me!</span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2v7M3.5 6l3 3 3-3"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* turn-off hint — shown in lit/form */}
        {(phase === 'lit' || phase === 'form') && (
          <div className="lamp__hint lamp__hint--off">
            <span>Click to turn off</span>
          </div>
        )}
      </div>

      {/* ════ LOGIN CARD ════ */}
      <div className={`login__card${isForm ? ' login__card--show' : ''}`} aria-hidden={!isForm}>

        <div className="login__card-shimmer" />

        <div className="login__logo">
          <div className="login__logo-mark">AE</div>
          <div>
            <span className="login__logo-name">ArithExam</span>
            <span className="login__logo-sub">Assessment Platform</span>
          </div>
        </div>

        <h1 className="login__heading">Welcome Back</h1>
        <p  className="login__sub">Sign in to your candidate account</p>

        {error && <p className="login__error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} noValidate className="login__form">

          <div className="login__field">
            <input type="email" name="email" id="login-email"
              placeholder=" " value={form.email}
              onChange={handleChange} autoComplete="email" />
            <label htmlFor="login-email">Email Address</label>
          </div>

          <div className="login__field">
            <input type={showPass ? 'text' : 'password'}
              name="password" id="login-pass"
              placeholder=" " value={form.password}
              onChange={handleChange} autoComplete="current-password" />
            <label htmlFor="login-pass">Password</label>
            <button type="button" className="login__eye-btn"
              onClick={() => setShowPass(!showPass)}
              aria-label="Toggle password">
              {showPass
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
              }
            </button>
          </div>

          <div className="login__forgot-row">
            <a href="#forgot" className="login__link">Forgot Password?</a>
          </div>

          <button type="submit" className="login__submit" disabled={loading}>
            {loading
              ? <><span className="login__spinner" />Signing in…</>
              : 'Sign In'
            }
          </button>
        </form>

        <p className="login__footer">
          Don't have an account?&nbsp;
          <Link to="/register" className="login__link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}