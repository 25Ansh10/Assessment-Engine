import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Register.css';

/* ─────────────────────────────────
   HELPERS
───────────────────────────────── */
const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const getStrength = p => {
  if (!p) return null;
  if (p.length < 4) return { label: 'Weak',   pct: '20%',  color: '#ef4444' };
  if (p.length < 6) return { label: 'Fair',   pct: '45%',  color: '#f59e0b' };
  if (p.length < 8) return { label: 'Good',   pct: '72%',  color: '#10b981' };
  return               { label: 'Strong', pct: '100%', color: '#0D9488' };
};

const makeExamId = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const s = Array.from({ length: 2 }, () => a[Math.floor(Math.random() * a.length)]).join('');
  return `AE-${s}-${Math.floor(100000 + Math.random() * 900000)}`;
};

const todayStr = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ─────────────────────────────────
   REGISTRATION CARD
   Flips in after OTP verified
───────────────────────────────── */
function RegistrationCard({ visible, name, email, examId, regDate, photo }) {
  const [twText, setTwText] = useState('');
  const twRef = useRef(null);

  /* typewriter for examId */
  useRef(() => {
    if (!examId) { setTwText(''); return; }
    setTwText(''); let i = 0;
    clearInterval(twRef.current);
    twRef.current = setInterval(() => {
      i++; setTwText(examId.slice(0, i));
      if (i >= examId.length) clearInterval(twRef.current);
    }, 48);
    return () => clearInterval(twRef.current);
  });

  /* trigger typewriter when examId arrives */
  const prevId = useRef('');
  if (examId && examId !== prevId.current) {
    prevId.current = examId;
    setTwText('');
    let i = 0;
    clearInterval(twRef.current);
    twRef.current = setInterval(() => {
      i++; setTwText(examId.slice(0, i));
      if (i >= examId.length) clearInterval(twRef.current);
    }, 48);
  }

  return (
    <div className={`rc-wrap ${visible ? 'rc-wrap--visible' : ''}`}>
      <div className="rc-scene">
        <div className="rc-card">

          {/* ── FRONT of card ── */}
          <div className="rc-front">

            {/* holographic top strip */}
            <div className="rc-holo" />

            {/* embossed watermark */}
            <div className="rc-watermark" aria-hidden="true">
              <svg viewBox="0 0 180 180" fill="none">
                <circle cx="90" cy="90" r="80" stroke="currentColor" strokeWidth="0.5" opacity="0.12"/>
                <circle cx="90" cy="90" r="60" stroke="currentColor" strokeWidth="0.4" opacity="0.09"/>
                <circle cx="90" cy="90" r="40" stroke="currentColor" strokeWidth="0.4" opacity="0.07"/>
                <path d="M90 18L96 52H132L104 72L114 106L90 88L66 106L76 72L48 52H84Z"
                  stroke="currentColor" strokeWidth="0.5" opacity="0.09"/>
              </svg>
            </div>

            {/* header band */}
            <div className="rc-header">
              <div className="rc-header__seal">
                <svg viewBox="0 0 44 44" fill="none">
                  <circle cx="22" cy="22" r="20" stroke="#0D9488" strokeWidth="1.4"/>
                  <circle cx="22" cy="22" r="15" stroke="#0D9488" strokeWidth="0.6"/>
                  <text x="22" y="19" textAnchor="middle" fontSize="7" fontWeight="700"
                    fill="#0D9488" fontFamily="serif">ARITH</text>
                  <text x="22" y="27" textAnchor="middle" fontSize="7" fontWeight="700"
                    fill="#0D9488" fontFamily="serif">EXAM</text>
                  <path d="M8 33 Q22 38 36 33" stroke="#0D9488" strokeWidth="0.7" fill="none"/>
                </svg>
              </div>
              <div className="rc-header__text">
                <p className="rc-header__inst">ArithExam Assessment Board</p>
                <h3 className="rc-header__title">REGISTRATION CARD</h3>
                <p className="rc-header__session">Session 2024–25</p>
              </div>
            </div>

            {/* gold divider */}
            <div className="rc-divider"/>

            {/* body */}
            <div className="rc-body">

              {/* photo slot */}
              <div className={`rc-photo ${photo ? 'rc-photo--filled' : ''}`}>
                {photo
                  ? <img src={photo} alt="Candidate" className="rc-photo__img"/>
                  : <>
                      <svg viewBox="0 0 40 40" fill="none" className="rc-photo__icon">
                        <circle cx="20" cy="14" r="7" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M6 36 C6 26 34 26 34 36" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                      </svg>
                      <span className="rc-photo__hint">Photo</span>
                    </>
                }
                <div className="rc-photo__stamp">PHOTO</div>
              </div>

              {/* fields */}
              <div className="rc-fields">
                <div className="rc-field-row">
                  <span className="rc-field-lbl">Candidate Name</span>
                  <span className={`rc-field-val rc-field-val--name ${name ? 'rc-field-val--filled' : ''}`}>
                    {name ? name.toUpperCase() : '— — — — — — —'}
                  </span>
                </div>
                <div className="rc-field-row">
                  <span className="rc-field-lbl">Email Address</span>
                  <span className={`rc-field-val ${email ? 'rc-field-val--filled' : ''}`}>
                    {email || '— — — — — — —'}
                  </span>
                </div>
                <div className="rc-field-row">
                  <span className="rc-field-lbl">Date of Registration</span>
                  <span className={`rc-field-val ${regDate ? 'rc-field-val--filled' : ''}`}>
                    {regDate || '— — — — —'}
                  </span>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="rc-footer">
              <div className="rc-footer__sig">
                <div className="rc-footer__line"/>
                <p className="rc-footer__lbl">Controller of Examinations</p>
              </div>
              <div className="rc-footer__badge">
                {photo && examId
                  ? <span className="rc-badge rc-badge--valid">✓ VERIFIED</span>
                  : <span className="rc-badge rc-badge--pending">PENDING</span>
                }
              </div>
              <div className="rc-footer__sig rc-footer__sig--r">
                <div className="rc-footer__line"/>
                <p className="rc-footer__lbl">Candidate Signature</p>
              </div>
            </div>

          </div>{/* /rc-front */}

          {/* ── BACK of card (seen mid-flip) ── */}
          <div className="rc-back">
            <div className="rc-back__stripe rc-back__stripe--1"/>
            <div className="rc-back__stripe rc-back__stripe--2"/>
            <div className="rc-back__stripe rc-back__stripe--3"/>
            <div className="rc-back__center">
              <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
                <circle cx="30" cy="30" r="28" stroke="rgba(212,160,23,0.4)" strokeWidth="1.5"/>
                <text x="30" y="26" textAnchor="middle" fontSize="10" fill="rgba(212,160,23,0.6)"
                  fontWeight="700" fontFamily="serif">AE</text>
                <text x="30" y="36" textAnchor="middle" fontSize="8" fill="rgba(212,160,23,0.5)"
                  fontFamily="serif">EXAM</text>
              </svg>
            </div>
          </div>

        </div>{/* /rc-card */}
      </div>{/* /rc-scene */}
    </div>
  );
}

/* ─────────────────────────────────
   OTP INPUT
───────────────────────────────── */
function OtpInput({ value, onChange, disabled }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      onChange(value.slice(0, i));
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const arr = value.split(''); arr[i] = e.key;
    onChange(arr.join('').slice(0, 6));
    if (i < 5) refs[i + 1].current?.focus();
  };
  return (
    <div className="rg-otp">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={refs[i]}
          className={`rg-otp__b ${value[i] ? 'rg-otp__b--on' : ''}`}
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

/* ─────────────────────────────────
   MIRROR / CAMERA
───────────────────────────────── */
function Mirror({ onCapture, onClose }) {
  const vRef = useRef(null), cRef = useRef(null), sRef = useRef(null), tRef = useRef(null);
  const [phase, setPhase] = useState('loading');
  const [count, setCount] = useState(3);
  const [snap,  setSnap]  = useState(null);

  useRef(() => {
    let m = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        if (!m) { s.getTracks().forEach(t => t.stop()); return; }
        sRef.current = s; vRef.current.srcObject = s;
        vRef.current.onloadedmetadata = () => { vRef.current.play(); setPhase('live'); };
      }).catch(() => setPhase('error'));
    return () => { m = false; sRef.current?.getTracks().forEach(t => t.stop()); clearTimeout(tRef.current); };
  });

  /* init camera on mount */
  useState(() => {
    let m = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        if (!m) { s.getTracks().forEach(t => t.stop()); return; }
        sRef.current = s;
        if (vRef.current) {
          vRef.current.srcObject = s;
          vRef.current.onloadedmetadata = () => { vRef.current.play(); setPhase('live'); };
        }
      }).catch(() => setPhase('error'));
    return () => { m = false; sRef.current?.getTracks().forEach(t => t.stop()); clearTimeout(tRef.current); };
  });

  const capture = useCallback(() => {
    if (phase !== 'live') return;
    setPhase('countdown'); let c = 3; setCount(c);
    const tick = () => {
      c--;
      if (c <= 0) {
        const cv = cRef.current, vd = vRef.current;
        cv.width = vd.videoWidth; cv.height = vd.videoHeight;
        cv.getContext('2d').drawImage(vd, 0, 0);
        const url = cv.toDataURL('image/jpeg', .92);
        setSnap(url); setPhase('done');
        sRef.current?.getTracks().forEach(t => t.stop());
      } else { setCount(c); tRef.current = setTimeout(tick, 1000); }
    };
    tRef.current = setTimeout(tick, 1000);
  }, [phase]);

  useRef(() => {
    if (phase === 'done' && snap) tRef.current = setTimeout(() => onCapture(snap), 900);
  });

  if (phase === 'done' && snap) {
    setTimeout(() => onCapture(snap), 900);
  }

  return (
    <div className="rg-mirror-bg" role="dialog" aria-modal="true">
      <div className="rg-mirror">
        <div className="rg-mirror__crown">◆  Live Mirror  ◆</div>
        <div className="rg-mirror__glass">
          <div className="rg-mirror__sheen"/>
          {phase === 'loading' && (
            <div className="rg-mirror__status">
              <div className="rg-spin-dark"/>Starting camera…
            </div>
          )}
          {phase === 'error' && (
            <div className="rg-mirror__status rg-mirror__status--err">
              🚫 Camera access denied
            </div>
          )}
          <video ref={vRef}
            className={`rg-mirror__video ${phase==='live'||phase==='countdown'?'rg-mirror__video--on':''}`}
            playsInline muted/>
          {phase === 'countdown' && (
            <div className="rg-mirror__count" key={count}><span>{count}</span></div>
          )}
          {phase === 'done' && snap && (
            <div className="rg-mirror__done">
              <img src={snap} alt="" className="rg-mirror__snap"/>
              <div className="rg-mirror__ok">✓  Accepted</div>
            </div>
          )}
          <canvas ref={cRef} style={{ display: 'none' }}/>
        </div>
        <div className="rg-mirror__stand">
          <div className="rg-mirror__pole"/>
          <div className="rg-mirror__base"/>
        </div>
        <div className="rg-mirror__btns">
          {phase === 'live' && (
            <button className="rg-mirror__cap" onClick={capture}>
              <span className="rg-mirror__shutter"/>Capture Photo
            </button>
          )}
          {phase === 'countdown' && <p className="rg-mirror__hint">Hold still 😊</p>}
          {phase === 'done' && <p className="rg-mirror__hint" style={{ color: '#0D9488' }}>✓ Auto-accepting…</p>}
          <button className="rg-mirror__close" onClick={onClose}>✕  Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   FLOAT FIELD
───────────────────────────────── */
function Field({ id, label, type='text', value, onChange, onBlur, ok, err, autoComplete, disabled, readOnly }) {
  return (
    <div className={`rg-field ${ok ? 'rg-field--ok' : err ? 'rg-field--err' : ''}`}>
      <input id={id} type={type} placeholder=" " value={value}
        onChange={e => onChange?.(e.target.value)} onBlur={onBlur}
        autoComplete={autoComplete} disabled={disabled} readOnly={readOnly}/>
      <label htmlFor={id}>{label}</label>
      {ok && (
        <span className="rg-field__check">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────
   PANE wrapper
───────────────────────────────── */
function Pane({ show, children }) {
  return (
    <div className={`rg-pane ${show ? 'rg-pane--in' : 'rg-pane--out'}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────
   CONFETTI
───────────────────────────────── */
function Confetti({ on }) {
  const cols = ['#0D9488','#14B8A6','#d4a017','#f0c040','#6366f1','#f472b6','#22c55e'];
  if (!on) return null;
  return (
    <div className="rg-confetti" aria-hidden>
      {Array.from({ length: 60 }).map((_, i) => (
        <span key={i} className="rg-confetti__p" style={{
          '--x': `${Math.random() * 240 - 120}px`,
          '--y': `${-60 - Math.random() * 160}px`,
          '--r': `${Math.random() * 720}deg`,
          '--d': `${Math.random() * 0.5}s`,
          '--c': cols[i % cols.length],
          left: '50%', top: '50%',
        }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN REGISTER PAGE
   Steps: 0=Name  1=Email  2=OTP  3=Password  4=ID  5=Photo
═══════════════════════════════════════ */
export default function Register() {
  const navigate  = useNavigate();
  const { register } = useAuth();

  /* form data */
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [otp,         setOtp]         = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpErr,      setOtpErr]      = useState('');
  const [otpLoading,  setOtpLoading]  = useState(false);
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [idFile,      setIdFile]      = useState(null);
  const [idPreview,   setIdPreview]   = useState(null);
  const [photo,       setPhoto]       = useState(null);
  const [examId,      setExamId]      = useState('');
  const [regDate,     setRegDate]     = useState('');

  /* ui */
  const [step,       setStep]       = useState(0);
  const [touched,    setTouched]    = useState({});
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [mirrorOpen, setMirrorOpen] = useState(false);

  const fileRef = useRef(null);

  /* derived */
  const nameOk   = name.trim().length >= 2;
  const emailOk  = validateEmail(email);
  const strength = getStrength(password);
  const passOk   = strength && (strength.label === 'Good' || strength.label === 'Strong');
  const matchOk  = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  /* OTP */
  const sendOtp = async () => {
    setOtpLoading(true); setOtpErr('');
    await new Promise(r => setTimeout(r, 900)); // TODO: real API
    setOtpLoading(false);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { setOtpErr('Enter all 6 digits.'); return; }
    setOtpLoading(true); setOtpErr('');
    await new Promise(r => setTimeout(r, 700));
    if (otp !== '123456') {
      setOtpErr('Incorrect OTP — use 123456 for demo.'); setOtpLoading(false); return;
    }
    setOtpVerified(true);
    setExamId(makeExamId());
    setRegDate(todayStr());
    setOtpLoading(false);
    setTimeout(() => { setError(''); setStep(3); }, 600);
  };

  const goNext = () => {
    setError('');
    if (step === 0) {
      if (!nameOk) { setError('Enter your full name (at least 2 characters).'); return; }
      setStep(1);
    } else if (step === 1) {
      if (!emailOk) { setError('Enter a valid email address.'); return; }
      sendOtp().then(() => setStep(2));
    } else if (step === 3) {
      if (!passOk)  { setError('Password must be at least 8 characters.'); return; }
      if (!matchOk) { setError('Passwords do not match.'); return; }
      setStep(4);
    } else if (step === 4) {
      if (!idFile)  { setError('Please upload your identity document.'); return; }
      setStep(5);
    }
  };

  const goBack = () => {
    setError(''); setOtpErr('');
    if (step === 2) { setOtp(''); setOtpVerified(false); setStep(1); return; }
    if (step > 0) setStep(s => s - 1);
  };

  const handleIdUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      setError('Only JPG or PNG accepted.'); return;
    }
    setIdFile(file);
    const r = new FileReader();
    r.onload = ev => setIdPreview(ev.target.result);
    r.readAsDataURL(file);
    setError('');
  };

  const handleCapture = useCallback(url => {
    setPhoto(url); setMirrorOpen(false);
  }, []);

  const handleSubmit = async () => {
    if (!photo) { setError('Please capture your live photo.'); return; }
    setLoading(true);
    try {
      await register({ name, email, password });
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  /* step meta */
  const stepMeta = [
    { h: "What's your name?",       p: "Step 1 of 5 · As it appears on your ID"     },
    { h: "Your email address",       p: "Step 2 of 5 · An OTP will be sent here"     },
    { h: "Verify your email",        p: `Enter the OTP sent to ${email}`             },
    { h: "Create a password",        p: "Step 3 of 5 · Use a strong combination"     },
    { h: "Upload identity proof",    p: "Step 4 of 5 · Passport / Aadhaar / DL"     },
    { h: "Take a live photo",        p: "Step 5 of 5 · Must match your ID document"  },
  ];

  return (
    <>
      {mirrorOpen && <Mirror onCapture={handleCapture} onClose={() => setMirrorOpen(false)}/>}

      <div className="rg-page">
        <div className="rg-page__bg"/>

        <div className="rg-card">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="rg-left">

            {/* ── IMAGE SLOT (top) ── */}
            <div className="rg-img-slot">
              <img 
                src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000" 
                alt="Student taking exam" 
                className="rg-img-slot__img"
              />
              <div className="rg-img-slot__overlay">
                <div className="rg-img-slot__badge">Official Candidate</div>
              </div>
            </div>

            {/* ── REGISTRATION CARD (bottom, flips in after OTP) ── */}
            <RegistrationCard
              visible={true}
              name={name}
              email={otpVerified ? email : ''}
              examId={examId}
              regDate={regDate}
              photo={photo}
            />

          </div>

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="rg-right">
            <div className="rg-right__bar"/>

            {/* logo */}
            <div className="rg-logo">
              <div className="rg-logo__mark">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#0D9488"/>
                  <text x="16" y="21" textAnchor="middle" fontSize="11"
                    fontWeight="800" fill="white" fontFamily="sans-serif">AE</text>
                </svg>
              </div>
              <div>
                <span className="rg-logo__name">ArithExam</span>
                <span className="rg-logo__sub">Assessment Engine</span>
              </div>
            </div>

            {/* progress */}
            <div className="rg-prog">
              <div className="rg-prog__track">
                <div className="rg-prog__fill" style={{ width: `${(step / 5) * 100}%` }}/>
              </div>
              <span className="rg-prog__txt">Step {Math.min(step + 1, 6)} of 6</span>
            </div>

            {/* heading */}
            <div className="rg-step-head" key={step}>
              <h2 className="rg-card__h">{stepMeta[step]?.h}</h2>
              <p  className="rg-card__p">{stepMeta[step]?.p}</p>
            </div>

            {/* ── SUCCESS BIG CARD OVERLAY ── */}
      {done && (
        <div className="rg-success-overlay">
          <div className="rg-success-content">
            <div className="rg-success-badge">
              <span className="rg-success-icon">🎉</span>
              <h2>Registration Successful!</h2>
              <p>Your official card is ready. Redirecting to your dashboard...</p>
            </div>
            <div className="rg-big-card-wrap">
              <RegistrationCard
                visible={true}
                name={name}
                email={email}
                examId={examId}
                regDate={regDate}
                photo={photo}
              />
            </div>
          </div>
        </div>
      )}

            {/* ── Step 0: Name ── */}
            <Pane show={step === 0}>
              <Field id="rg-name" label="Full Name" value={name}
                onChange={v => { setName(v); setTouched(t => ({ ...t, n: 1 })); setError(''); }}
                ok={nameOk && !!touched.n}
                err={!!touched.n && !nameOk && name.length > 0}
                autoComplete="name"/>
              {touched.n && !nameOk && name.length > 0 &&
                <p className="rg-hint rg-hint--e">Min 2 characters required</p>}
              {nameOk && touched.n &&
                <p className="rg-hint rg-hint--ok">✓ Will appear on your registration card</p>}
            </Pane>

            {/* ── Step 1: Email ── */}
            <Pane show={step === 1}>
              <Field id="rg-email" label="Email Address" type="email" value={email}
                onChange={v => { setEmail(v); setTouched(t => ({ ...t, e: 1 })); setError(''); }}
                onBlur={() => setTouched(t => ({ ...t, e: 1 }))}
                ok={emailOk}
                err={!!touched.e && !emailOk && email.length > 0}
                autoComplete="email"/>
              {touched.e && email && !emailOk &&
                <p className="rg-hint rg-hint--e">Enter a valid email address</p>}
              {emailOk &&
                <p className="rg-hint rg-hint--ok">✓ OTP will be sent to this address</p>}
            </Pane>

            {/* ── Step 2: OTP ── */}
            <Pane show={step === 2}>
              <p className="rg-otp-info">
                Enter the 6-digit code sent to <strong>{email}</strong>
                <br/><small className="rg-demo-note">Demo: use 123456</small>
              </p>
              <OtpInput value={otp} onChange={v => { setOtp(v); setOtpErr(''); }} disabled={otpVerified}/>
              {otpErr     && <p className="rg-hint rg-hint--e">{otpErr}</p>}
              {otpVerified && <p className="rg-hint rg-hint--ok">✓ Email verified! Registration card generated.</p>}
              <div className="rg-otp-row">
                <button
                  className={`rg-otp-btn ${otp.length === 6 ? 'rg-otp-btn--rdy' : ''}`}
                  onClick={verifyOtp} disabled={otpLoading || otpVerified}>
                  {otpLoading
                    ? <><span className="rg-spinner"/>Verifying…</>
                    : otpVerified ? '✓ Verified' : 'Verify OTP'}
                </button>
                <button className="rg-resend" onClick={sendOtp} disabled={otpLoading}>
                  Resend OTP
                </button>
              </div>
            </Pane>

            {/* ── Step 3: Password ── */}
            <Pane show={step === 3}>
              <Field id="rg-pw" label="Password" type="password" value={password}
                onChange={v => { setPassword(v); setError(''); }}
                ok={passOk} autoComplete="new-password"/>
              {strength && (
                <div className="rg-bar">
                  <div className="rg-bar__bg">
                    <div className="rg-bar__fill"
                      style={{ width: strength.pct, background: strength.color }}/>
                  </div>
                  <span className="rg-bar__lbl" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
              <Field id="rg-cf" label="Confirm Password" type="password" value={confirm}
                onChange={v => { setConfirm(v); setError(''); }}
                ok={matchOk} err={mismatch} autoComplete="new-password"/>
              {confirm && (
                <p className={`rg-hint ${matchOk ? 'rg-hint--ok' : 'rg-hint--e'}`}>
                  {matchOk ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </Pane>

            {/* ── Step 4: ID Upload ── */}
            <Pane show={step === 4}>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }} onChange={handleIdUpload}/>
              {!idPreview
                ? <button type="button" className="rg-upload"
                    onClick={() => fileRef.current?.click()}>
                    <span className="rg-upload__ic">🪪</span>
                    <span className="rg-upload__tx">Click to upload ID document</span>
                    <span className="rg-upload__sx">JPG or PNG · max 5 MB</span>
                  </button>
                : <div className="rg-prev">
                    <img src={idPreview} alt="ID"/>
                    <div className="rg-prev__ov">
                      <button onClick={() => { setIdFile(null); setIdPreview(null); }}>
                        Change
                      </button>
                    </div>
                    <span className="rg-prev__badge">✓ Uploaded</span>
                  </div>}
              {error && <p className="rg-hint rg-hint--e" style={{ marginTop: 10 }}>{error}</p>}
            </Pane>

            {/* ── Step 5: Live Photo ── */}
            <Pane show={step === 5}>
              {!photo
                ? <button type="button" className="rg-upload rg-upload--cam"
                    onClick={() => setMirrorOpen(true)}>
                    <span className="rg-upload__ic">🪞</span>
                    <span className="rg-upload__tx">Open Live Mirror &amp; Capture</span>
                    <span className="rg-upload__sx">Photo will appear on your registration card</span>
                  </button>
                : <div className="rg-prev rg-prev--photo">
                    <img src={photo} alt="Live"/>
                    <div className="rg-prev__ov">
                      <button onClick={() => { setPhoto(null); setMirrorOpen(true); }}>
                        Retake
                      </button>
                    </div>
                    <span className="rg-prev__badge">✓ Live Photo</span>
                  </div>}
            </Pane>

            {/* error */}
            {error && step !== 4 && <p className="rg-error">{error}</p>}

            {/* nav */}
            <div className="rg-nav">
              {step > 0 && !done && (
                <button className="rg-nav__bk" onClick={goBack}>← Back</button>
              )}
              {step !== 2 && step !== 5 && (
                <button
                  className={`rg-nav__nx ${
                    [nameOk, emailOk, false, passOk && matchOk, !!idFile, !!photo][step]
                      ? 'rg-nav__nx--rdy' : ''
                  }`}
                  onClick={goNext}>
                  Continue →
                </button>
              )}
              {step === 5 && (
                <button
                  className={`rg-nav__sub ${done ? 'rg-nav__sub--done' : ''}`}
                  onClick={handleSubmit}
                  disabled={loading || done}>
                  <Confetti on={done}/>
                  {done
                    ? '🎉 Registration Complete!'
                    : loading
                    ? 'Please wait…'
                    : 'Complete Registration →'}
                </button>
              )}
            </div>

            <p className="rg-footer">
              Already registered?&nbsp;
              <Link to="/login">Sign in here</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}