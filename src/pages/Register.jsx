import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Register.css';
import { Check, X, ArrowLeft, ArrowRight, Ban, Camera as CameraIcon, IdCard, PartyPopper } from 'lucide-react';

/* ─────────────────────────────────
   HELPERS
───────────────────────────────── */
const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const getStrength = p => {
  if (!p) return null;
  if (p.length < 5) return { label: 'Weak',   pct: '20%',  color: '#ef4444' };
  if (p.length < 8) return { label: 'Fair',   pct: '45%',  color: '#f59e0b' };
  if (p.length < 10) return { label: 'Good',   pct: '72%',  color: '#10b981' };
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
───────────────────────────────── */
function RegistrationCard({ visible, name, email, examId, regDate, photo }) {
  return (
    <div className={`rc-wrap ${visible ? 'rc-wrap--visible' : ''}`}>
      <div className="rc-scene">
        <div className="rc-card">
          <div className="rc-front">
            <div className="rc-holo" />
            <div className="rc-header">
              <div className="rc-header__seal">
                <img src="/logo.png" alt="" width="50" height="50" />
              </div>
              <div className="rc-header__text">
                <p className="rc-header__inst">ArithExam Assessment Board</p>
                <h3 className="rc-header__title">REGISTRATION CARD</h3>
                <div className="rc-header__chip">DIGITAL ID VERIFIED</div>
              </div>
            </div>
            <div className="rc-divider"/>
            <div className="rc-body">
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
              <div className="rc-fields">
                <div className="rc-field-row">
                  <span className="rc-field-lbl">Candidate Name</span>
                  <span className={`rc-field-val rc-field-val--name ${name ? 'rc-field-val--filled' : ''}`}>
                    {name ? name.toUpperCase() : 'Awaiting Input'}
                  </span>
                </div>
                <div className="rc-field-row">
                  <span className="rc-field-lbl">Email Address</span>
                  <span className={`rc-field-val ${email ? 'rc-field-val--filled' : ''}`}>
                    {email || 'Awaiting Input'}
                  </span>
                </div>
                <div className="rc-field-row">
                  <span className="rc-field-lbl">Registration Date</span>
                  <span className={`rc-field-val ${regDate ? 'rc-field-val--filled' : ''}`}>
                    {regDate || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className="rc-footer">
              <div className="rc-footer__badge">
                {photo && examId
                  ? <span className="rc-badge rc-badge--valid" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><Check size={14} style={{marginRight:'4px'}}/> VERIFIED</span>
                  : <span className="rc-badge rc-badge--pending">PENDING</span>
                }
              </div>
            </div>
          </div>
          <div className="rc-back">
            <div className="rc-back__stripe rc-back__stripe--1"/>
            <div className="rc-back__stripe rc-back__stripe--2"/>
            <div className="rc-back__stripe rc-back__stripe--3"/>
            <div className="rc-back__center">
              <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
                <circle cx="30" cy="30" r="28" stroke="rgba(212,160,23,0.4)" strokeWidth="1.5"/>
                <text x="30" y="26" textAnchor="middle" fontSize="10" fill="rgba(212,160,23,0.6)" fontWeight="700">AE</text>
                <text x="30" y="36" textAnchor="middle" fontSize="8" fill="rgba(212,160,23,0.5)">EXAM</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   OTP INPUT
───────────────────────────────── */
function OtpInput({ value, onChange, disabled }) {
  const inputRefs = useRef([]);

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i, e) => {
    const val = e.target.value.slice(-1); // Only take the last character entered
    if (!/^\d$/.test(val) && val !== '') return;

    const currentArr = value.split('');
    currentArr[i] = val;
    const finalStr = currentArr.join('').slice(0, 6);
    onChange(finalStr);

    if (val !== '' && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  return (
    <div className="rg-otp" style={{ opacity: 1, visibility: 'visible', display: 'flex' }}>
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          className={`rg-otp__b ${value[i] ? 'rg-otp__b--on' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          value={value[i] || ''}
          disabled={disabled}
          onKeyDown={e => handleKeyDown(i, e)}
          onChange={e => handleChange(i, e)}
          onFocus={e => e.target.select()}
          style={{ opacity: 1, visibility: 'visible' }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────
   OTP MODAL
───────────────────────────────── */
function OtpModal({ email, onVerified, onClose }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async () => {
    if (otp.length !== 6) { setError('Enter 6 digits'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    if (otp !== '123456') {
      setError('Invalid code. Use 123456 for demo.');
      setLoading(false);
      return;
    }
    onVerified();
  };

  return (
    <div className="rg-mirror-bg" style={{ zIndex: 999999 }}>
      <div className="rg-otp-modal" onClick={e => e.stopPropagation()} style={{ margin: 'auto' }}>
        <div className="rg-otp-modal__head">
          <h3>Verify Your Email</h3>
          <p>A 6-digit code has been sent to:<br/><strong>{email}</strong></p>
        </div>
        <div className="rg-otp-modal__body">
          <OtpInput value={otp} onChange={v => { setOtp(v); setError(''); }} />
          {error && <p className="rg-hint rg-hint--e" style={{ textAlign: 'center', marginTop: 14 }}>{error}</p>}
          <div className="rg-demo-box">
            <span className="rg-demo-lbl">DEMO:</span>
            <span className="rg-demo-val">123456</span>
          </div>
        </div>
        <div className="rg-otp-modal__foot" style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button type="button" className="rg-nav__bk" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button 
            type="button" 
            className={`rg-otp-btn ${otp.length === 6 ? 'rg-otp-btn--rdy' : ''}`}
            onClick={verify} 
            disabled={loading} 
            style={{ flex: 1.6, opacity: 1, visibility: 'visible' }}
          >
            {loading ? <span className="rg-spinner"/> : 'Verify & Continue'}
          </button>
        </div>
      </div>
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

  useEffect(() => {
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
  }, []);

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
        setTimeout(() => onCapture(url), 1200);
      } else { setCount(c); tRef.current = setTimeout(tick, 1000); }
    };
    tRef.current = setTimeout(tick, 1000);
  }, [phase, onCapture]);

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
              <Ban size={16} style={{marginRight:'8px'}}/> Camera access denied
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
              <div className="rg-mirror__ok" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><Check size={16} style={{marginRight:'6px'}}/> Accepted</div>
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
          {phase === 'countdown' && <p className="rg-mirror__hint">Hold still</p>}
          {phase === 'done' && <p className="rg-mirror__hint" style={{ color: '#0D9488', display:'flex', alignItems:'center', justifyContent:'center' }}><Check size={14} style={{marginRight:'4px'}}/> Auto-accepting…</p>}
          <button className="rg-mirror__close" onClick={onClose} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><X size={16}/> Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   FLOAT FIELD
───────────────────────────────── */
function Field({ id, label, type='text', value, onChange, onBlur, ok, err, autoComplete, disabled, readOnly, children, className }) {
  return (
    <div className={`rg-field ${ok ? 'rg-field--ok' : err ? 'rg-field--err' : ''} ${className || ''}`}>
      <input id={id} type={type} placeholder={label} value={value}
        onChange={e => onChange?.(e.target.value)} onBlur={onBlur}
        autoComplete={autoComplete} disabled={disabled} readOnly={readOnly}/>
      {ok && (
        <span className="rg-field__check">
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

/* ─────────────────────────────────
   PANE wrapper
───────────────────────────────── */
function Pane({ show, children }) {
  if (!show) return null;
  return (
    <div className="rg-pane rg-pane--in">
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
   Steps: 0=Account Setup  1=Identity Proof
═══════════════════════════════════════ */
export default function Register() {
  const navigate  = useNavigate();
  const { register } = useAuth();

  /* form data */
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
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
  const [showOtp,    setShowOtp]    = useState(false);

  const fileRef = useRef(null);

  /* derived */
  const nameOk   = name.trim().length >= 2;
  const emailOk  = validateEmail(email);
  const strength = getStrength(password);
  const passOk   = strength && (strength.label === 'Strong' || strength.label === 'Good');
  const matchOk  = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  const step0Complete = nameOk && emailOk && otpVerified && passOk && matchOk;
  const step1Complete = !!idFile && !!photo;

  const handleOtpVerified = () => {
    setOtpVerified(true);
    setExamId(makeExamId());
    setRegDate(todayStr());
    setShowOtp(false);
  };

  const goNext = () => {
    setError('');
    if (step === 0) {
      if (!nameOk) { setError('Enter your full name.'); return; }
      if (!emailOk) { setError('Enter a valid email.'); return; }
      if (!otpVerified) { setError('Please verify your email address.'); return; }
      if (!passOk) { setError('Create a stronger password.'); return; }
      if (!matchOk) { setError('Passwords do not match.'); return; }
      setStep(1);
    }
  };

  const goBack = () => {
    setError('');
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
    if (!idFile) { setError('Please upload your ID proof.'); return; }
    setLoading(true);
    try {
      await register({ name, email, password, photo, examId, regDate });
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  /* step meta */
  const stepMeta = [
    { h: "Create Your Account",    p: "Step 1 of 2 · Basic details" },
    { h: "Digital Identity",      p: "Step 2 of 2 · ID & Live verification" }
  ];

  return (
    <>
      <div className="rg-page">
        {mirrorOpen && <Mirror onCapture={handleCapture} onClose={() => setMirrorOpen(false)}/>}
        {showOtp && <OtpModal email={email} onVerified={handleOtpVerified} onClose={() => setShowOtp(false)} />}
        
        {done && (
          <div className="rg-success-overlay">
            <div className="rg-success-content">
              <div className="rg-success-badge">
                <span className="rg-success-icon"><PartyPopper size={36} color="var(--primary)"/></span>
                <h2>Registration Successful!</h2>
                <p>Your official card is ready. Redirecting soon...</p>
              </div>
              <div className="rg-big-card-wrap">
                <RegistrationCard
                  visible={true} name={name} email={email}
                  examId={examId} regDate={regDate} photo={photo}
                />
              </div>
            </div>
          </div>
        )}

        <div className="rg-page__bg"/>

        <div className="rg-card">
          <div className="rg-left">
            <div className="rg-left__card-container">
              <RegistrationCard
                visible={true} name={name}
                email={otpVerified ? email : ''}
                examId={examId} regDate={regDate} photo={photo}
              />
            </div>
          </div>

          <div className="rg-right">
            <div className="rg-right__bar"/>
            <div className="rg-logo">
              <img src="/logo.png" alt="ArithExam" width="40" height="40" style={{ borderRadius: '10px' }} />
              <div>
                <span className="rg-logo__name">ArithExam Registration</span>
                <span className="rg-logo__sub">Assess Smarter, Perform Better.</span>
              </div>
            </div>

            <div className="rg-prog">
              <div className="rg-prog__track">
                <div className="rg-prog__fill" style={{ width: `${((step + 1) / 2) * 100}%` }}/>
              </div>
              <span className="rg-prog__txt">Page {step + 1} of 2</span>
            </div>

            <div className="rg-step-head" key={step}>
              <h2 className="rg-card__h">{stepMeta[step]?.h}</h2>
              <p  className="rg-card__p">{stepMeta[step]?.p}</p>
            </div>

            <Pane show={step === 0}>
              <Field id="rg-name" label="Full Name" value={name}
                onChange={v => { setName(v); setTouched(t => ({ ...t, n: 1 })); setError(''); }}
                ok={nameOk && !!touched.n} />
              
              <div className="rg-email-verify-group" style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <Field id="rg-email" label="Email Address" type="email" value={email}
                  onChange={v => { setEmail(v); setOtpVerified(false); setTouched(t => ({ ...t, e: 1 })); setError(''); }}
                  ok={otpVerified} className="rg-email-field" style={{ flex: 1 }} />
                {!otpVerified && emailOk && (
                  <button type="button" className="rg-verify-btn" 
                    style={{ 
                      padding: '0 20px', borderRadius: '12px', border: 'none', 
                      background: 'var(--t)', color: '#fff', fontWeight: 600, cursor: 'pointer',
                      height: '52px', marginTop: '0'
                    }}
                    onClick={() => setShowOtp(true)}>
                    Verify
                  </button>
                )}
              </div>

              <div className="rg-form-row" style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <Field id="rg-pw" label="Password" type="password" value={password}
                    onChange={v => { setPassword(v); setError(''); }}
                    ok={passOk} autoComplete="new-password"/>
                </div>
                <div style={{ flex: 1 }}>
                  <Field id="rg-cf" label="Confirm" type="password" value={confirm}
                    onChange={v => { setConfirm(v); setError(''); }}
                    ok={matchOk} err={mismatch} autoComplete="new-password"/>
                </div>
              </div>
              {strength && (
                <div className="rg-bar" style={{ marginTop: '-8px' }}>
                  <div className="rg-bar__bg"><div className="rg-bar__fill" style={{ width: strength.pct, background: strength.color }}/></div>
                  <span className="rg-bar__lbl" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </Pane>

            <Pane show={step === 1}>
              <div className="rg-identity-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="rg-identity-item">
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>ID Upload</span>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }} onChange={handleIdUpload}/>
                  {!idPreview
                    ? <button type="button" className="rg-upload" onClick={() => fileRef.current?.click()}>
                        <span style={{ fontSize: '1.5rem', display:'flex' }}><IdCard size={28} color="var(--teal)" /></span>
                        <span>Upload ID</span>
                      </button>
                    : <div className="rg-prev">
                        <img src={idPreview} alt="ID" style={{ maxHeight: '100px' }}/>
                        <div className="rg-prev__ov"><button onClick={() => { setIdFile(null); setIdPreview(null); }}>Change</button></div>
                        <span className="rg-prev__badge" style={{display:'flex',alignItems:'center'}}><Check size={12} style={{marginRight:'2px'}}/> ID</span>
                      </div>}
                </div>

                <div className="rg-identity-item">
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Live Photo</span>
                  {!photo
                    ? <button type="button" className="rg-upload rg-upload--cam" onClick={() => setMirrorOpen(true)}>
                        <span style={{ fontSize: '1.5rem', display:'flex' }}><CameraIcon size={28} color="var(--teal)" /></span>
                        <span>Live Mirror</span>
                      </button>
                    : <div className="rg-prev rg-prev--photo">
                        <img src={photo} alt="Live" style={{ maxHeight: '100px' }}/>
                        <div className="rg-prev__ov"><button onClick={() => { setPhoto(null); setMirrorOpen(true); }}>Retake</button></div>
                        <span className="rg-prev__badge" style={{display:'flex',alignItems:'center'}}><Check size={12} style={{marginRight:'2px'}}/> Photo</span>
                      </div>}
                </div>
              </div>
            </Pane>

            {error && <p className="rg-error">{error}</p>}

            <div className="rg-nav" style={{ marginTop: '20px' }}>
              {step > 0 && !done && (
                <button className="rg-nav__bk" onClick={goBack} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><ArrowLeft size={16}/> Back</button>
              )}
              {step === 0 && (
                <button className={`rg-nav__nx ${step0Complete ? 'rg-nav__nx--rdy' : ''}`}
                  onClick={goNext} disabled={!step0Complete}>
                  <span style={{display:'flex',alignItems:'center',gap:'6px'}}>Continue <ArrowRight size={16}/></span>
                </button>
              )}
              {step === 1 && (
                <button className={`rg-nav__sub ${done ? 'rg-nav__sub--done' : ''}`}
                  onClick={handleSubmit} disabled={loading || done || !step1Complete}>
                  <Confetti on={done}/>
                  {done ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><PartyPopper size={16}/> Success!</span> : loading ? 'Please wait…' : <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>Complete Registration <ArrowRight size={16}/></span>}
                </button>
              )}
            </div>

            <p className="rg-footer" style={{ marginTop: '20px' }}>
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
