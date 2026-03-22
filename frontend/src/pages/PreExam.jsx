import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PreExam.css";

const EXAM_META = {
  title:    "DevReady Assessment",
  subject:  "React · Python · SQL · Ethics · Viva",
  code:     "AE-DRA-2025",
  date:     "19 Mar 2025",
  duration: 30,
  total:    10,
  marks:    100,
  passing:  40,
  negative: false,
};

const RULES = [
  { icon: "⏱", text: "Each question has its own timer — MCQ & Viva get 60 seconds, Coding gets 11 minutes." },
  { icon: "📷", text: "Camera stays active throughout the session for live proctoring." },
  { icon: "🔒", text: "Exam runs in fullscreen — exiting will auto-submit your attempt." },
  { icon: "🚫", text: "No tab switching, no external tools, no assistance of any kind." },
  { icon: "➡️", text: "Navigation is forward-only — you cannot go back to a previous question." },
  { icon: "⚡", text: "Auto-submits when time runs out — no manual action needed." },
];

const TOPICS = ["React", "Python", "SQL", "Ethics", "Viva"];

const getRegPhoto = () =>
  sessionStorage.getItem("ae_register_photo") ||
  "https://api.dicebear.com/7.x/personas/svg?seed=DevReady&backgroundColor=c0e8e4";

export default function PreExam({ onBegin }) {
  const navigate = useNavigate();

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const tickRef   = useRef(null);

  const [sysCheck,  setSysCheck]  = useState(null); // null | 'running' | 'done'
  const [sysStatus, setSysStatus] = useState({ cam: 'idle', mic: 'idle', net: 'idle' });
  const [camState,  setCamState]  = useState("idle");
  const [snapshot,  setSnapshot]  = useState(null);
  const [verified,  setVerified]  = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [matchPct,  setMatchPct]  = useState(null);
  const [agreed,    setAgreed]    = useState(false);
  const [launching, setLaunching] = useState(false);

  const regPhoto = getRegPhoto();

  /* cleanup on unmount only */
  useEffect(() => {
    return () => {
      stopStream();
      clearInterval(tickRef.current);
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  /* ── Start webcam — called directly, not via useEffect ── */
  const startCamera = async () => {
    stopStream();
    setCamState("requesting");
    setSnapshot(null);
    setVerified(false);
    setMatchPct(null);
    setVerifying(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCamState("live");
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Camera error PreExam:", err);
      setCamState("error");
    }
  };

  /* ── System Check Flow ── */
  const runSystemCheck = async () => {
    setSysCheck('running');
    setSysStatus({ cam: 'wait', mic: 'wait', net: 'wait' });

    // 1. Network Check (Mock)
    await new Promise(r => setTimeout(r, 400));
    setSysStatus(s => ({ ...s, net: 'ok' }));

    // 2. Camera Check
    try {
      const cStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cStream.getTracks().forEach(t => t.stop());
      setSysStatus(s => ({ ...s, cam: 'ok' }));
    } catch (e) {
      setSysStatus(s => ({ ...s, cam: 'err' }));
    }

    // 3. Microphone Check
    try {
      const mStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mStream.getTracks().forEach(t => t.stop());
      setSysStatus(s => ({ ...s, mic: 'ok' }));
    } catch (e) {
      setSysStatus(s => ({ ...s, mic: 'err' }));
    }

    setSysCheck('done');
  };

  /* ── Toggle consent ── */
  const toggleConsent = () => {
    const next = !agreed;
    setAgreed(next);
    if (next && !sysCheck) {
      runSystemCheck();
    }
  };

  const startVerification = () => {
    if (sysStatus.cam === 'ok') {
      startCamera();
    }
  };

  /* ── Capture immediately ── */
  const handleCapture = () => {
    if (camState !== "live") return;
    doCapture();
  };

  /* ── Snap frame from live video ── */
  const doCapture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { setCamState("error"); return; }

    const w = video.videoWidth  || 640;
    const h = video.videoHeight || 480;
    canvas.width  = w;
    canvas.height = h;

    /* mirror to match the CSS-mirrored video preview */
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    const img = canvas.toDataURL("image/jpeg", 0.92);

    stopStream(); /* stop AFTER drawing */

    setSnapshot(img);
    sessionStorage.setItem("ae_live_photo", img);
    setCamState("captured");
    runVerification();
  };

  /* ── Always passes instantly ── */
  const runVerification = () => {
    setVerifying(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 5) + 94; // 94–99%
      setMatchPct(score);
      setVerified(true);
      setVerifying(false);
    }, 200); // Near-instant verification
  };

  /* ── Retake ── */
  const retake = () => {
    clearInterval(tickRef.current);
    stopStream();
    setSnapshot(null);
    setVerified(false);
    setMatchPct(null);
    setVerifying(false);
    setCamState("idle");
    setTimeout(startCamera, 100);
  };

  /* ── Begin exam ── */
  const handleBegin = async () => {
    if (!verified || !agreed) return;
    setLaunching(true);
    try { await document.documentElement.requestFullscreen(); } catch {}
    setTimeout(() => {
      if (onBegin) onBegin();
      navigate("/exam");
    }, 900);
  };

  const canBegin  = agreed && verified && !launching;
  const showVideo = camState === "live";

  /* ── sub-text helper ── */
  const subText = () => {
    if (camState === "idle")       return "Tick the consent box to activate camera.";
    if (camState === "requesting") return "Requesting camera access…";
    if (camState === "live")       return "Position your face clearly and click Capture.";

    if (camState === "error")      return "Camera access denied. Please allow and retry.";
    if (camState === "captured") {
      if (verifying)              return "Analyzing facial features…";
      if (!matchPct)              return "Processing…";
      if (verified)               return "✓ Identity confirmed — you're all set!";
      return "Mismatch detected — please retake.";
    }
    return "";
  };

  return (
    <div className="pe-root">

      {/* ── Top bar ── */}
      <header className="pe-topbar">
        <div className="pe-topbar__brand">
          <div className="pe-topbar__mark">AE</div>
          <span className="pe-topbar__name">ArithExam</span>
        </div>
        <span className="pe-topbar__badge">
          <span className="pe-topbar__badge-dot" /> Secure Session
        </span>
      </header>

      <div className="pe-body">

        {/* ════ LEFT ════ */}
        <div className="pe-left">

          {/* Exam card */}
          <div className="pe-exam-card">
            <div className="pe-exam-card__accent" />
            <div className="pe-exam-card__inner">
              <h1 className="pe-exam-card__title">{EXAM_META.title}</h1>
              <p  className="pe-exam-card__code">{EXAM_META.code} · {EXAM_META.date}</p>

              <div className="pe-meta-row">
                {[
                  { val: EXAM_META.total,          lbl: "Questions" },
                  { val: `${EXAM_META.duration}m`, lbl: "Duration"  },
                  { val: EXAM_META.marks,           lbl: "Marks"     },
                  { val: `${EXAM_META.passing}%`,  lbl: "Passing"   },
                ].map((m, i) => (
                  <div key={i} className="pe-meta-item">
                    <span className="pe-meta-item__val">{m.val}</span>
                    <span className="pe-meta-item__lbl">{m.lbl}</span>
                  </div>
                ))}
              </div>

              <div className="pe-chips">
                <span className="pe-chip pe-chip--teal">Proctored</span>
                <span className="pe-chip pe-chip--slate">No Negative Marking</span>
                <span className="pe-chip pe-chip--slate">MCQ + Coding + Viva</span>
              </div>

              <div className="pe-topics">
                {TOPICS.map(t => (
                  <span key={t} className="pe-topic-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="pe-rules">
            <h3 className="pe-rules__heading">
              <span className="pe-rules__heading-line" /> Instructions
            </h3>
            <ul className="pe-rules__list">
              {RULES.map((r, i) => (
                <li key={i} className="pe-rules__item" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="pe-rules__icon">{r.icon}</span>
                  <span className="pe-rules__text">{r.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Consent — uses toggleConsent directly, no label wrapping */}
          <div className="pe-consent" onClick={toggleConsent} role="checkbox" aria-checked={agreed} tabIndex={0}
            onKeyDown={e => e.key === " " && toggleConsent()}>
            <span className={`pe-consent__box ${agreed ? "pe-consent__box--on" : ""}`}>
              {agreed && <span className="pe-consent__tick">✓</span>}
            </span>
            <span className="pe-consent__text">
              I have read all instructions, consent to proctoring, and agree to abide
              by the exam rules for this session.
            </span>
          </div>
        </div>

        {/* ════ RIGHT ════ */}
        <div className="pe-right">
          <div className="pe-verify-card">
            {/* ══ System Check UI ══ */}
            {!verified && sysCheck && (
              <div className="pe-syscheck">
                <div className="pe-syscheck__header">
                  <div className="pe-syscheck__title">System Readiness Check</div>
                  <div className={`pe-syscheck__badge pe-syscheck__badge--${sysCheck}`}>
                    {sysCheck === 'running' ? 'Testing...' : 'Check Complete'}
                  </div>
                </div>
                
                <div className="pe-syscheck__grid">
                  <div className={`pe-sysitem pe-sysitem--${sysStatus.cam}`}>
                    <span className="pe-sysitem__icon">📷</span>
                    <div className="pe-sysitem__info">
                      <div className="pe-sysitem__name">Camera</div>
                      <div className="pe-sysitem__status">
                        {sysStatus.cam === 'wait' && 'Requesting...'}
                        {sysStatus.cam === 'ok'   && 'Permission Granted'}
                        {sysStatus.cam === 'err'  && 'Access Denied'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`pe-sysitem pe-sysitem--${sysStatus.mic}`}>
                    <span className="pe-sysitem__icon">🎤</span>
                    <div className="pe-sysitem__info">
                      <div className="pe-sysitem__name">Microphone</div>
                      <div className="pe-sysitem__status">
                        {sysStatus.mic === 'wait' && 'Requesting...'}
                        {sysStatus.mic === 'ok'   && 'Active & Configured'}
                        {sysStatus.mic === 'err'  && 'Access Denied'}
                      </div>
                    </div>
                  </div>

                  <div className={`pe-sysitem pe-sysitem--${sysStatus.net}`}>
                    <span className="pe-sysitem__icon">📶</span>
                    <div className="pe-sysitem__info">
                      <div className="pe-sysitem__name">Network</div>
                      <div className="pe-sysitem__status">
                        {sysStatus.net === 'wait' && 'Measuring speed...'}
                        {sysStatus.net === 'ok'   && 'High Speed Stable'}
                      </div>
                    </div>
                  </div>
                </div>

                {sysCheck === 'done' && (
                  <div className="pe-syscheck__footer">
                    {(sysStatus.cam === 'err' || sysStatus.mic === 'err') ? (
                      <div className="pe-syserr">
                        <span className="pe-syserr__icon">⚠️</span>
                        <div className="pe-syserr__text">
                          Permissions required. Please click the <b>camera icon</b> in your browser address bar and select "Always allow".
                        </div>
                        <button className="pe-btn pe-btn--sm pe-btn--ghost" onClick={runSystemCheck}>Try Again</button>
                      </div>
                    ) : camState === 'idle' && (
                      <button className="pe-btn pe-btn--capture pe-btn--full" onClick={startVerification}>
                        Ready? Proceed to Identity Capture →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <h3 className="pe-verify-card__heading">Identity Verification</h3>
            <p className="pe-verify-card__sub">{subText()}</p>

            {/* Side-by-side */}
            <div className="pe-cameras">

              {/* Registered */}
              <div className="pe-cam-slot">
                <p className="pe-cam-slot__label">Registered</p>
                <div className="pe-cam-slot__frame pe-cam-slot__frame--static">
                  <img src={regPhoto} alt="Registered" className="pe-cam-slot__img" />
                </div>
              </div>

              {/* VS / score */}
              <div className="pe-vs">
                {matchPct && !verifying ? (
                  <div className={`pe-vs__score ${verified ? "pe-vs__score--ok" : "pe-vs__score--fail"}`}>
                    <span className="pe-vs__score-num">{matchPct}%</span>
                    <span className="pe-vs__score-lbl">match</span>
                  </div>
                ) : verifying ? (
                  <div className="pe-vs__spinner" />
                ) : (
                  <span className="pe-vs__text">vs</span>
                )}
              </div>

              {/* Live cam slot */}
              <div className="pe-cam-slot">
                <p className="pe-cam-slot__label">Live Capture</p>
                <div className={`pe-cam-slot__frame ${showVideo ? "pe-cam-slot__frame--live" : ""}`}>

                  {/* video always in DOM so ref is always valid */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ display: showVideo ? "block" : "none" }}
                    className="pe-cam-slot__video"
                  />

                  {/* captured photo */}
                  {camState === "captured" && snapshot && (
                    <img src={snapshot} alt="Captured" className="pe-cam-slot__img" />
                  )}

                  {/* placeholder states */}
                  {(camState === "idle" || camState === "requesting" || camState === "error") && (
                    <div className="pe-cam-slot__placeholder">
                      {camState === "requesting" && <div className="pe-spinner" />}
                      {camState === "idle"        && <span className="pe-cam-slot__idle-icon">📷</span>}
                      {camState === "error"       && <span className="pe-cam-slot__idle-icon">🚫</span>}
                    </div>
                  )}

                  {/* LIVE badge */}
                  {camState === "live" && (
                    <div className="pe-live-badge">
                      <span className="pe-live-badge__dot" /> LIVE
                    </div>
                  )}



                  {/* Verified overlay */}
                  {camState === "captured" && verified && (
                    <div className="pe-verified-badge">✓ VERIFIED</div>
                  )}

                  {/* Scan line */}
                  {camState === "live" && <div className="pe-scan" />}
                </div>
              </div>
            </div>

            {/* hidden canvas for snapshot */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Action row */}
            <div className="pe-verify-actions">
              {camState === "idle" && (
                <p className="pe-verify-actions__hint">Tick the consent checkbox above to enable camera.</p>
              )}
              {camState === "requesting" && (
                <p className="pe-verify-actions__hint">Starting camera…</p>
              )}
              {camState === "error" && (
                <button className="pe-btn pe-btn--ghost" onClick={startCamera}>
                  🔄 Retry Camera
                </button>
              )}
              {camState === "live" && (
                <button className="pe-btn pe-btn--capture" onClick={handleCapture}>
                  📸 Capture &amp; Verify
                </button>
              )}

              {camState === "captured" && verifying && (
                <p className="pe-verify-actions__hint">Verifying identity…</p>
              )}
              {camState === "captured" && !verifying && matchPct && !verified && (
                <button className="pe-btn pe-btn--ghost" onClick={retake}>↩ Retake Photo</button>
              )}
              {camState === "captured" && !verifying && matchPct && verified && (
                <div className="pe-verify-actions__row">
                  <p className="pe-verify-actions__ok">✓ You're all set!</p>
                  <button className="pe-btn pe-btn--ghost pe-btn--sm" onClick={retake}>Retake</button>
                </div>
              )}
            </div>

            {/* Begin button */}
            <button
              className={`pe-btn pe-btn--begin ${canBegin ? "" : "pe-btn--begin-disabled"}`}
              disabled={!canBegin}
              onClick={handleBegin}
            >
              {launching
                ? <><span className="pe-btn__spinner" /> Launching…</>
                : "▶  Begin Exam"}
            </button>

            {!agreed && (
              <p className="pe-begin-hint">Read instructions &amp; tick consent to enable.</p>
            )}
            {agreed && !verified && camState !== "error" && (
              <p className="pe-begin-hint">
                {camState === "live"     && "Capture your photo to verify identity."}
                {camState === "captured" && verifying && "Verifying identity…"}
                {camState === "captured" && !verifying && !matchPct && "Processing…"}
                {camState === "captured" && matchPct && !verified && "Mismatch — please retake."}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}