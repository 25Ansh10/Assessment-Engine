import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

/* ─────────────────────────────
   HELPERS
───────────────────────────── */
const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const getInitials = (email) => {
  if (!email) return '';
  const local = email.split('@')[0];
  const parts = local.split(/[._\-+]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '— — — — — — —';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return local[0] + '•'.repeat(Math.min(local.length - 2, 5)) + local[local.length - 1] + '@' + domain;
};

const TODAY = new Date().toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

/* ─────────────────────────────
   FLOAT FIELD — same as Register
───────────────────────────── */
function Field({ id, label, type = 'text', value, onChange, onBlur, ok, err, autoComplete, children }) {
  return (
    <div className={`lg-field ${ok ? 'lg-field--ok' : err ? 'lg-field--err' : ''}`}>
      <input id={id} type={type} placeholder={label} value={value}
        onChange={e => onChange?.(e.target.value)}
        onBlur={onBlur} autoComplete={autoComplete}/>
      {ok && (
        <span className="lg-field__check">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      {children}
    </div>
  );
}

/* ─────────────────────────────
   LIVE ACCESS CARD
   Mirrors Registration Card exactly —
   same gold border, holo strip,
   watermark, Cinzel font, structure
───────────────────────────── */
function AccessCard({ email, emailOk }) {
  const initials = getInitials(email);
  const masked   = maskEmail(email);

  return (
    <div className="lc-wrap">
      <div className="lc-scene">
        <div className="lc-card">
          {/* ── FRONT ── */}
          <div className="lc-front">
            {/* holographic strip */}
            <div className="lc-holo"/>
            {/* ... rest of card ... */}
            <div className="lc-header">
              <div className="lc-seal"><img src="/logo.png" alt="" width="50" height="50" /></div>
              <div className="lc-header__text">
                <p className="lc-header__inst">ArithExam Assessment Board</p>
                <h3 className="lc-header__title">ACCESS CARD</h3>
                <div className="lc-header__chip">VIRTUAL ACCESS</div>
              </div>
              <div className="lc-header__icon">🔒</div>
            </div>
            <div className="lc-divider"/>
            <div className="lc-body">
              <div className={`lc-avatar ${email ? 'lc-avatar--filled' : ''}`}>
                {email ? <span className="lc-avatar__initials">{initials}</span> : <svg viewBox="0 0 40 40" fill="none" width="28" height="28"><circle cx="20" cy="14" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M6 36 C6 26 34 26 34 36" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>}
                <div className="lc-avatar__stamp">PHOTO</div>
              </div>
              <div className="lc-fields">
                <div className="lc-field-row"><span className="lc-field-lbl">Email Address</span><span className={`lc-field-val ${email ? 'lc-field-val--filled' : ''}`}>{email ? masked : '— — — — — — —'}</span></div>
                <div className="lc-field-row"><span className="lc-field-lbl">Access Role</span><span className="lc-field-val lc-field-val--filled lc-field-val--role">CANDIDATE</span></div>
                <div className="lc-field-row"><span className="lc-field-lbl">Date of Access</span><span className="lc-field-val lc-field-val--filled">{TODAY}</span></div>
              </div>
            </div>
            <div className="lc-footer">
              <span className={`lc-badge ${emailOk ? 'lc-badge--valid' : 'lc-badge--pending'}`}>{emailOk ? '✓ VERIFIED' : 'PENDING'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   WELCOME SCREEN
───────────────────────────── */
function WelcomeScreen({ email }) {
  const initials = getInitials(email);
  return (
    <div className="lg-welcome">
      <div className="lg-welcome__card">
        <div className="lg-welcome__holo"/>
        {/* confetti */}
        <div className="lg-welcome__confetti" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="lg-welcome__dot" style={{
              '--x': `${(Math.random() * 220 - 110)}px`,
              '--y': `${-(Math.random() * 130 + 60)}px`,
              '--r': `${Math.random() * 540}deg`,
              '--d': `${Math.random() * .4}s`,
              '--c': ['#0D9488','#14B8A6','#d4a017','#f0c040','#6366f1'][i % 5],
              left: '50%', top: '38%',
            }}/>
          ))}
        </div>
        <div className="lg-welcome__avatar">{initials || '👋'}</div>
        <p className="lg-welcome__greeting">Welcome back 👋</p>
        <p className="lg-welcome__email">{email}</p>
        <span className="lg-welcome__role">Candidate</span>
        <div className="lg-welcome__bar-wrap">
          <div className="lg-welcome__bar"/>
        </div>
        <p className="lg-welcome__msg">Launching dashboard…</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN LOGIN PAGE
═══════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [touched,  setTouched]  = useState({});
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  const emailOk = validateEmail(email);
  const passOk  = password.length >= 8;

  /* load remembered email */
  useEffect(() => {
    const saved = localStorage.getItem('ae_remembered_email');
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ e: 1, p: 1 });
    if (!emailOk || !passOk) { setError('Please fill in all fields correctly.'); return; }
    setLoading(true); setError('');
    try {
      if (remember) localStorage.setItem('ae_remembered_email', email);
      else          localStorage.removeItem('ae_remembered_email');
      await login(email, password);
      setWelcomed(true);
      setTimeout(() => navigate('/dashboard'), 2600);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  if (welcomed) return <WelcomeScreen email={email}/>;

  return (
    <div className="lg-page">
      <div className="lg-page__bg"/>

      <div className="lg-card">

        {/* ══ LEFT — only the card ══ */}
        <div className="lg-left">
          <AccessCard email={email} emailOk={emailOk}/>
        </div>

        {/* ══ RIGHT — form ══ */}
        <div className="lg-right">
          <div className="lg-right__bar"/>

          {/* logo */}
          <div className="lg-logo">
            <img src="/logo.png" alt="ArithExam" width="48" height="48" style={{ borderRadius: '12px' }} />
            <div>
              <span className="lg-logo__name">ArithExam</span>
              <span className="lg-logo__sub">Assess Smarter, Perform Better.</span>
            </div>
          </div>

          <div className="lg-head">
            <h2 className="lg-heading">Welcome back</h2>
            <p  className="lg-sub">Sign in to continue your assessment journey</p>
          </div>

          {error && <p className="lg-error" role="alert">{error}</p>}

          <form onSubmit={handleSubmit} noValidate className="lg-form">

            {/* email */}
            <Field id="lg-email" label="Email Address" type="email"
              value={email}
              onChange={v => { setEmail(v); setError(''); }}
              onBlur={() => setTouched(t => ({ ...t, e: 1 }))}
              ok={emailOk && !!touched.e}
              err={!!touched.e && !emailOk && email.length > 0}
              autoComplete="email"/>
            {touched.e && email && !emailOk &&
              <p className="lg-hint lg-hint--e">Enter a valid email address</p>}
            {emailOk && touched.e &&
              <p className="lg-hint lg-hint--ok">✓ Card updating live</p>}

            {/* password */}
            <Field id="lg-pass" label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={v => { setPassword(v); setError(''); }}
              onBlur={() => setTouched(t => ({ ...t, p: 1 }))}
              ok={passOk && !!touched.p}
              err={!!touched.p && !passOk && password.length > 0}
              autoComplete="current-password">
              <button type="button" className="lg-eye"
                onClick={() => setShowPass(s => !s)}
                aria-label="Toggle password">
                {showPass
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                }
              </button>
            </Field>
            {touched.p && password && !passOk &&
              <p className="lg-hint lg-hint--e">Minimum 8 characters required (strong password recommended)</p>}

            {/* remember + forgot */}
            <div className="lg-util-row">
              <button type="button" className="lg-remember"
                onClick={() => setRemember(r => !r)}>
                <span className={`lg-toggle ${remember ? 'lg-toggle--on' : ''}`}>
                  <span className="lg-toggle__thumb"/>
                </span>
                <span>Remember me</span>
              </button>
              <Link to="/forgot-password" className="lg-forgot">
                Forgot Password?
              </Link>
            </div>

            {/* submit */}
            <button type="submit" className="lg-submit" disabled={loading}>
              {loading
                ? <><span className="lg-spinner"/>Signing in…</>
                : <><span>Sign In</span><span className="lg-submit__arrow">→</span></>
              }
            </button>
          </form>

          {/* divider */}
          <div className="lg-or">
            <span className="lg-or__line"/>
            <span className="lg-or__text">or</span>
            <span className="lg-or__line"/>
          </div>


          <p className="lg-footer">
            Don't have an account?&nbsp;
            <Link to="/register" className="lg-link">Create Account</Link>
          </p>
        </div>

      </div>
    </div>
  );
}