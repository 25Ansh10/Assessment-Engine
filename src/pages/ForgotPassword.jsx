import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

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

const getStrength = p => {
  if (!p) return null;
  if (p.length < 4) return { label: 'Weak',   pct: '20%',  color: '#ef4444' };
  if (p.length < 6) return { label: 'Fair',   pct: '45%',  color: '#f59e0b' };
  if (p.length < 8) return { label: 'Good',   pct: '72%',  color: '#10b981' };
  return               { label: 'Strong', pct: '100%', color: '#0D9488' };
};

/* ─────────────────────────────
   FLOAT FIELD — same as Login
───────────────────────────── */
function Field({ id, label, type = 'text', value, onChange, onBlur, ok, err, autoComplete, children }) {
  return (
    <div className={`fp-field ${ok ? 'fp-field--ok' : err ? 'fp-field--err' : ''}`}>
      <input id={id} type={type} placeholder=" " value={value}
        onChange={e => onChange?.(e.target.value)}
        onBlur={onBlur} autoComplete={autoComplete}/>
      <label htmlFor={id}>{label}</label>
      {ok && (
        <span className="fp-field__check">
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
   OTP INPUT — 6-digit boxes
───────────────────────────── */
function OtpInput({ value, onChange, disabled }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const arr = value.split('');
      arr[i] = '';
      onChange(arr.join('').replace(/\s/g, ''));
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const arr = value.split(''); arr[i] = e.key;
    onChange(arr.join('').slice(0, 6));
    if (i < 5) refs[i + 1].current?.focus();
  };
  return (
    <div className="fp-otp">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={refs[i]}
          className={`fp-otp__b ${value[i] ? 'fp-otp__b--on' : ''}`}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''} readOnly={disabled}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => e.target.select()}
          onChange={() => {}}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────
   RECOVERY CARD — gold theme card
   Shows recovery status as user progresses
───────────────────────────── */
function RecoveryCard({ step, email, emailOk, resetDone }) {
  const initials = getInitials(email);
  const masked   = maskEmail(email);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -(y / (rect.height / 2)) * 10, y: (x / (rect.width / 2)) * 10 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const statusLabel = step === 0 ? 'IDENTIFY' :
                      step === 1 ? 'VERIFY' :
                      step === 2 ? 'RESET' : 'RECOVERED';
  const statusColor = step === 3 ? '#15803d' : '#0D9488';

  return (
    <div className="fc-wrap" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="fc-scene" style={{ 
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 ? 'transform 0.5s ease' : 'none'
      }}>
        {/* Sheen overlay */}
        <div className="fc-sheen" style={{
          transform: `translate(${-tilt.y * 8}px, ${-tilt.x * 8}px)`,
          opacity: tilt.x === 0 ? 0 : 0.12
        }} />

        <div className="fc-card">
          {/* ── FRONT ── */}
          <div className="fc-front">
            <div className="fc-holo"/>
            <div className="fc-header">
              <div className="fc-seal">
                <img src="/logo.png" alt="" width="36" height="36" />
              </div>
              <div className="fc-header__text">
                <p className="fc-header__inst">ArithExam Assessment Board</p>
                <h3 className="fc-header__title">RECOVERY CARD</h3>
                <div className="fc-header__chip">SECURE RECOVERY</div>
              </div>
              <div className="fc-role-badge" style={{ background: statusColor }}>
                {statusLabel}
              </div>
            </div>
            <div className="fc-divider"/>
            <div className="fc-body">
              <div className={`fc-avatar ${email ? 'fc-avatar--filled' : ''}`}>
                {email ? <span className="fc-avatar__initials">{initials}</span> : <svg viewBox="0 0 40 40" fill="none" width="28" height="28"><circle cx="20" cy="14" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M6 36 C6 26 34 26 34 36" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>}
                <div className="fc-avatar__lock"><svg viewBox="0 0 24 24" fill="none" width="12" height="12"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2"/></svg></div>
              </div>
              <div className="fc-fields">
                <div className="fc-field-row"><span className="fc-field-lbl">Recovery Email</span><span className={`fc-field-val ${email ? 'fc-field-val--filled' : ''}`}>{email ? masked : '— — — — — — —'}</span></div>
                <div className="fc-field-row"><span className="fc-field-lbl">Recovery Status</span><span className="fc-field-val fc-field-val--filled fc-field-val--status">{step === 0 && 'AWAITING EMAIL'}{step === 1 && 'OTP SENT'}{step === 2 && 'VERIFIED — SET NEW PASSWORD'}{step === 3 && '✓ PASSWORD RESET COMPLETE'}</span></div>
                <div className="fc-field-row">
                  <span className="fc-field-lbl">Security Level</span>
                  <div className="fc-security-dots">{[0, 1, 2, 3].map(i => (<span key={i} className={`fc-security-dot ${i <= step ? 'fc-security-dot--on' : ''}`} />))}<span className="fc-security-label">{step === 0 ? 'Level 1' : step === 1 ? 'Level 2' : step === 2 ? 'Level 3' : 'Complete'}</span></div>
                </div>
              </div>
            </div>
            <div className="fc-footer">
              <span className={`fc-badge ${resetDone ? 'fc-badge--valid' : step > 0 ? 'fc-badge--progress' : 'fc-badge--pending'}`}>{resetDone ? '✓ RECOVERED' : step > 0 ? 'IN PROGRESS' : 'PENDING'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   COUNTDOWN TIMER for OTP resend
───────────────────────────── */
function ResendTimer({ onResend }) {
  const [seconds, setSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleResend = () => {
    setCanResend(false);
    setSeconds(30);
    onResend();
  };

  return canResend
    ? <button className="fp-resend fp-resend--active" onClick={handleResend}>Resend OTP</button>
    : <span className="fp-resend fp-resend--wait">Resend in {seconds}s</span>;
}


/* ─────────────────────────────
   SUCCESS SCREEN
───────────────────────────── */
function SuccessScreen() {
  return (
    <div className="fp-success">
      <div className="fp-success__card">
        <div className="fp-success__holo"/>
        {/* confetti */}
        <div className="fp-success__confetti" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="fp-success__dot" style={{
              '--x': `${(Math.random() * 220 - 110)}px`,
              '--y': `${-(Math.random() * 130 + 60)}px`,
              '--r': `${Math.random() * 540}deg`,
              '--d': `${Math.random() * .4}s`,
              '--c': ['#0D9488','#14B8A6','#d4a017','#f0c040','#6366f1'][i % 5],
              left: '50%', top: '38%',
            }}/>
          ))}
        </div>
        <div className="fp-success__icon">
          <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <circle cx="32" cy="32" r="30" stroke="#0D9488" strokeWidth="2" opacity="0.3"/>
            <circle cx="32" cy="32" r="23" stroke="#0D9488" strokeWidth="1.5" opacity="0.2"/>
            <polyline points="20 32 28 40 44 26" stroke="#0D9488" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="fp-success__title">Password Reset Complete!</h2>
        <p className="fp-success__text">Your password has been updated successfully.</p>
        <div className="fp-success__bar-wrap">
          <div className="fp-success__bar"/>
        </div>
        <p className="fp-success__msg">Redirecting to login…</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN FORGOT PASSWORD PAGE
   Steps: 0=Email  1=OTP  2=New Password  3=Done
═══════════════════════════════════════ */
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(0);
  const [email,      setEmail]      = useState('');
  const [otp,        setOtp]        = useState('');
  const [otpErr,     setOtpErr]     = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [touched,    setTouched]    = useState({});
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [otpSent,    setOtpSent]    = useState(false);

  const emailOk  = validateEmail(email);
  const strength = getStrength(password);
  const passOk   = strength && (strength.label === 'Good' || strength.label === 'Strong');
  const matchOk  = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  /* Step 0 → send OTP */
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setTouched({ e: 1 });
    if (!emailOk) { setError('Please enter a valid email address.'); return; }
    setLoading(true); setError('');
    // mock API call
    await new Promise(r => setTimeout(r, 900));
    setOtpSent(true);
    setLoading(false);
    setStep(1);
  };

  /* Step 1 → verify OTP */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpErr('Enter all 6 digits.'); return; }
    setLoading(true); setOtpErr('');
    await new Promise(r => setTimeout(r, 700));
    if (otp !== '123456') {
      setOtpErr('Incorrect OTP — use 123456 for demo.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep(2);
  };

  /* Step 2 → reset password */
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!passOk) { setError('Password must be at least 8 characters (Good or Strong).'); return; }
    if (!matchOk) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    setStep(3);
    setTimeout(() => navigate('/login'), 3500);
  };

  /* Resend OTP */
  const handleResendOtp = async () => {
    await new Promise(r => setTimeout(r, 500));
    setOtp('');
    setOtpErr('');
  };

  if (done) return <SuccessScreen />;

  const stepMeta = [
    { h: 'Forgot your password?',  p: 'Enter the email linked to your account and we\'ll send a recovery code.' },
    { h: 'Verify your identity',    p: `Enter the 6-digit code sent to ${maskEmail(email)}` },
    { h: 'Create new password',     p: 'Choose a strong password to secure your account.' },
  ];

  return (
    <div className="fp-page">
      <div className="fp-page__bg"/>

      <div className="fp-card">

        {/* ══ LEFT — Recovery Card ══ */}
        <div className="fp-left">
          <RecoveryCard step={step} email={email} emailOk={emailOk} resetDone={done}/>
        </div>

        {/* ══ RIGHT — Form ══ */}
        <div className="fp-right">
          <div className="fp-right__bar"/>

          {/* logo */}
          <div className="fp-logo">
            <img src="/logo.png" alt="ArithExam" width="40" height="40" style={{ borderRadius: '10px' }} />
            <div>
              <span className="fp-logo__name">ArithExam</span>
              <span className="fp-logo__sub">Assess Smarter, Perform Better.</span>
            </div>
          </div>

          {/* progress stepper */}
          <div className="fp-stepper">
            {['Email', 'Verify', 'Reset'].map((label, i) => (
              <div key={i} className="fp-stepper__step-wrap">
                {i > 0 && <div className={`fp-stepper__line ${step >= i ? 'fp-stepper__line--done' : ''}`}/>}
                <div className={`fp-stepper__dot ${step > i ? 'fp-stepper__dot--done' : step === i ? 'fp-stepper__dot--active' : ''}`}>
                  {step > i
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span>{i + 1}</span>
                  }
                </div>
                <span className={`fp-stepper__label ${step >= i ? 'fp-stepper__label--active' : ''}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* heading */}
          <div className="fp-head" key={step}>
            <h2 className="fp-heading">{stepMeta[step]?.h}</h2>
            <p  className="fp-sub">{stepMeta[step]?.p}</p>
          </div>

          {error && <p className="fp-error" role="alert">{error}</p>}

          {/* ── Step 0: Email ── */}
          {step === 0 && (
            <form onSubmit={handleSendOtp} noValidate className="fp-form">
              <Field id="fp-email" label="Email Address" type="email"
                value={email}
                onChange={v => { setEmail(v); setError(''); }}
                onBlur={() => setTouched(t => ({ ...t, e: 1 }))}
                ok={emailOk && !!touched.e}
                err={!!touched.e && !emailOk && email.length > 0}
                autoComplete="email"/>
              {touched.e && email && !emailOk &&
                <p className="fp-hint fp-hint--e">Enter a valid email address</p>}
              {emailOk && touched.e &&
                <p className="fp-hint fp-hint--ok">✓ Recovery card updating live</p>}

              <button type="submit" className="fp-submit" disabled={loading}>
                {loading
                  ? <><span className="fp-spinner"/>Sending OTP…</>
                  : <><span>Send Recovery Code</span><span className="fp-submit__arrow">→</span></>
                }
              </button>
            </form>
          )}

          {/* ── Step 1: OTP ── */}
          {step === 1 && (
            <div className="fp-form">
              <p className="fp-otp-info">
                We've sent a 6-digit code to <strong>{maskEmail(email)}</strong>
                <br/><small className="fp-demo-note">Demo: use 123456</small>
              </p>
              <OtpInput value={otp} onChange={v => { setOtp(v); setOtpErr(''); }} disabled={false}/>
              {otpErr && <p className="fp-hint fp-hint--e">{otpErr}</p>}
              {otp.length === 6 && !otpErr &&
                <p className="fp-hint fp-hint--ok">✓ Ready to verify</p>}

              <div className="fp-otp-actions">
                <button
                  className={`fp-submit ${otp.length === 6 ? '' : 'fp-submit--dim'}`}
                  onClick={handleVerifyOtp} disabled={loading}>
                  {loading
                    ? <><span className="fp-spinner"/>Verifying…</>
                    : 'Verify Code →'
                  }
                </button>
                <ResendTimer onResend={handleResendOtp}/>
              </div>
            </div>
          )}

          {/* ── Step 2: New Password ── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} noValidate className="fp-form">
              <Field id="fp-newpass" label="New Password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={v => { setPassword(v); setError(''); }}
                ok={passOk}
                autoComplete="new-password">
                <button type="button" className="fp-eye"
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
              {strength && (
                <div className="fp-bar">
                  <div className="fp-bar__bg">
                    <div className="fp-bar__fill"
                      style={{ width: strength.pct, background: strength.color }}/>
                  </div>
                  <span className="fp-bar__lbl" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}

              <Field id="fp-confirm" label="Confirm New Password"
                type={showConf ? 'text' : 'password'}
                value={confirm}
                onChange={v => { setConfirm(v); setError(''); }}
                ok={matchOk} err={mismatch}
                autoComplete="new-password">
                <button type="button" className="fp-eye"
                  onClick={() => setShowConf(s => !s)}
                  aria-label="Toggle password">
                  {showConf
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
              {confirm && (
                <p className={`fp-hint ${matchOk ? 'fp-hint--ok' : 'fp-hint--e'}`}>
                  {matchOk ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              <button type="submit" className="fp-submit" disabled={loading}>
                {loading
                  ? <><span className="fp-spinner"/>Resetting…</>
                  : <><span>Reset Password</span><span className="fp-submit__arrow">→</span></>
                }
              </button>
            </form>
          )}

          {/* Back + Security Trust */}
          <div className="fp-bottom">
            {step > 0 && step < 3 && (
              <button className="fp-back" onClick={() => { setStep(s => s - 1); setError(''); setOtpErr(''); }}>
                ← Back
              </button>
            )}

            {/* security trust strip */}
            <div className="fp-trust">
              <div className="fp-trust__item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span>256-bit SSL</span>
              </div>
              <div className="fp-trust__sep"/>
              <div className="fp-trust__item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Secure Recovery</span>
              </div>
              <div className="fp-trust__sep"/>
              <div className="fp-trust__item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Verified Platform</span>
              </div>
            </div>

            <p className="fp-footer-text">
              Remember your password?&nbsp;
              <Link to="/login" className="fp-link">Sign In</Link>
              &nbsp;·&nbsp;
              <Link to="/register" className="fp-link">Create Account</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
