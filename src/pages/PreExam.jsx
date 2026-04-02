import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PreExam.css";

/* ─── Meta ─── */
const EXAM_META = {
  title:    "Unified Subject Assessment",
  code:     "AE-USA-2025",
  date:     "19 Mar 2025",
  duration: 45,
  total:    15,
  marks:    150,
  passing:  40,
};

const RULES = [
  { icon: "⏱", text: "Each question has its own timer — MCQ & Viva get 60 seconds, Coding gets 11 minutes." },
  { icon: "📷", text: "Camera stays active throughout the session for live proctoring." },
  { icon: "🔒", text: "Exam runs in fullscreen — exiting will auto-submit your attempt." },
  { icon: "🚫", text: "No tab switching, no external tools, no assistance of any kind." },
  { icon: "➡️", text: "Navigation is forward-only — you cannot go back to a previous question." },
  { icon: "⚡", text: "Auto-submits when time runs out — no manual action needed." },
];

const TOPICS = ["Python", "React", "Coding", "Interactive Viva"];

const getRegPhoto = () =>
  sessionStorage.getItem("ae_register_photo") ||
  "https://api.dicebear.com/7.x/personas/svg?seed=DevReady&backgroundColor=c0e8e4";

/* ══════════════════════════════════════════════
   PAGE 1 — Instructions + Consent
══════════════════════════════════════════════ */
function PageInstructions({ onNext }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="pe-page pe-page--instructions">

      {/* Exam Info Card */}
      <div className="pe-info-card">
        <div className="pe-info-card__accent" />
        <div className="pe-info-card__body">
          <div className="pe-info-card__left">
            <h1 className="pe-info-card__title">{EXAM_META.title}</h1>
            <p  className="pe-info-card__code">{EXAM_META.code} · {EXAM_META.date}</p>
            <div className="pe-chips">
              <span className="pe-chip pe-chip--teal">Proctored</span>
              <span className="pe-chip pe-chip--slate">No Negative Marking</span>
              <span className="pe-chip pe-chip--slate">MCQ + Coding + Viva</span>
            </div>
            <div className="pe-topics">
              {TOPICS.map(t => <span key={t} className="pe-topic-tag">{t}</span>)}
            </div>
          </div>
          <div className="pe-info-card__stats">
            {[
              { val: EXAM_META.total,          lbl: "Questions" },
              { val: `${EXAM_META.duration}m`, lbl: "Duration"  },
              { val: EXAM_META.marks,           lbl: "Marks"     },
              { val: `${EXAM_META.passing}%`,  lbl: "Passing"   },
            ].map((m, i) => (
              <div key={i} className="pe-stat">
                <span className="pe-stat__val">{m.val}</span>
                <span className="pe-stat__lbl">{m.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="pe-section">
        <h2 className="pe-section__heading">
          <span className="pe-section__line" /> Exam Instructions
        </h2>
        <div className="pe-rules-grid">
          {RULES.map((r, i) => (
            <div key={i} className="pe-rule-card" style={{ animationDelay: `${i * 55}ms` }}>
              <span className="pe-rule-card__icon">{r.icon}</span>
              <span className="pe-rule-card__text">{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Consent + CTA */}
      <div className="pe-consent-row">
        <div
          className={`pe-consent ${agreed ? "pe-consent--on" : ""}`}
          onClick={() => setAgreed(v => !v)}
          role="checkbox"
          aria-checked={agreed}
          tabIndex={0}
          onKeyDown={e => e.key === " " && setAgreed(v => !v)}
        >
          <span className={`pe-consent__box ${agreed ? "pe-consent__box--on" : ""}`}>
            {agreed && <span className="pe-consent__tick">✓</span>}
          </span>
          <span className="pe-consent__text">
            I have read all instructions, consent to proctoring, and agree to abide by the exam rules.
          </span>
        </div>

        <button
          className={`pe-cta-btn ${agreed ? "pe-cta-btn--ready" : "pe-cta-btn--disabled"}`}
          disabled={!agreed}
          onClick={onNext}
        >
          Proceed to Verification →
        </button>
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE 2 — System Check + Face Capture
══════════════════════════════════════════════ */
function PageVerify({ onBegin }) {
  const navigate  = useNavigate();
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* system check */
  const [sysStatus, setSysStatus] = useState({ cam: "wait", mic: "wait", net: "wait" });
  const [sysReady,  setSysReady]  = useState(false);
  const [micLevel,  setMicLevel]  = useState(0);

  /* face capture */
  const [camState,  setCamState]  = useState("idle");
  const [snapshot,  setSnapshot]  = useState(null);
  const [verified,  setVerified]  = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [matchPct,  setMatchPct]  = useState(null);
  const [launching, setLaunching] = useState(false);

  const regPhoto = getRegPhoto();

  /* run system check on mount */
  useEffect(() => {
    runSystemCheck();
    return () => stopStream();
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const runSystemCheck = async () => {
    /* 1. Network */
    await new Promise(r => setTimeout(r, 500));
    setSysStatus(s => ({ ...s, net: "ok" }));

    /* 2. Camera */
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      s.getTracks().forEach(t => t.stop());
      setSysStatus(s => ({ ...s, cam: "ok" }));
    } catch { setSysStatus(s => ({ ...s, cam: "err" })); }

    /* 3. Microphone */
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setSysStatus(s => ({ ...s, mic: "ok" }));

      /* brief level monitor */
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(ms);
      const ana = ctx.createAnalyser();
      ana.fftSize = 256;
      src.connect(ana);
      const buf = new Uint8Array(ana.frequencyBinCount);
      let active = true;
      const tick = () => {
        if (!active) return;
        ana.getByteFrequencyData(buf);
        setMicLevel(buf.reduce((a, b) => a + b, 0) / buf.length);
        requestAnimationFrame(tick);
      };
      tick();
      setTimeout(() => {
        active = false;
        ms.getTracks().forEach(t => t.stop());
        ctx.close();
      }, 3000);
    } catch { setSysStatus(s => ({ ...s, mic: "err" })); }

    setSysReady(true);
  };

  /* ── Open camera for face capture ── */
  const startCamera = async () => {
    stopStream();
    setCamState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          setCamState("live");
        };
      }
    } catch {
      setCamState("error");
    }
  };

  /* ── Capture snapshot ── */
  const doCapture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { setCamState("error"); return; }

    const w = video.videoWidth  || 640;
    const h = video.videoHeight || 480;
    canvas.width  = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    const img = canvas.toDataURL("image/jpeg", 0.92);
    stopStream(); /* stop after drawing */

    setSnapshot(img);
    sessionStorage.setItem("ae_live_photo", img);
    setCamState("captured");

    /* mock verification — always passes */
    setVerifying(true);
    setTimeout(() => {
      setMatchPct(Math.floor(Math.random() * 5) + 94); // 94–98%
      setVerified(true);
      setVerifying(false);
    }, 1500);
  };

  const retake = () => {
    stopStream();
    setSnapshot(null);
    setVerified(false);
    setMatchPct(null);
    setVerifying(false);
    setCamState("idle");
  };

  const handleBegin = async () => {
    if (!verified) return;
    setLaunching(true);
    try { await document.documentElement.requestFullscreen(); } catch {}
    setTimeout(() => {
      if (onBegin) onBegin();
      navigate("/exam");
    }, 800);
  };

  const showVideo = camState === "live";
  const sysOk = sysStatus.cam === "ok" && sysStatus.mic === "ok" && sysStatus.net === "ok";

  const statusIcon = (s) => {
    if (s === "wait") return <span className="pe-sc-spinner" />;
    if (s === "ok")   return <span className="pe-sc-dot pe-sc-dot--ok">✓</span>;
    return                  <span className="pe-sc-dot pe-sc-dot--err">✗</span>;
  };

  return (
    <div className="pe-page pe-page--verify">

      <div className="pe-verify-layout">

        {/* ── LEFT: System Check ── */}
        <div className="pe-verify-left">
          <h2 className="pe-section__heading">
            <span className="pe-section__line" /> System Check
          </h2>

          <div className="pe-sc-list">
            {[
              { key: "net", label: "Network",     detail: sysStatus.net === "ok" ? "Stable connection" : "Checking…" },
              { key: "cam", label: "Camera",      detail: sysStatus.cam === "ok" ? "Accessible" : sysStatus.cam === "err" ? "Access denied" : "Checking…" },
              { key: "mic", label: "Microphone",  detail: sysStatus.mic === "ok" ? "Level detected"   : sysStatus.mic === "err" ? "Blocked / muted" : "Calibrating…" },
            ].map(item => (
              <div key={item.key} className={`pe-sc-row pe-sc-row--${sysStatus[item.key]}`}>
                <div className="pe-sc-row__icon">{statusIcon(sysStatus[item.key])}</div>
                <div className="pe-sc-row__info">
                  <span className="pe-sc-row__name">{item.label}</span>
                  <span className="pe-sc-row__detail">{item.detail}</span>
                  {/* mic level bar */}
                  {item.key === "mic" && sysStatus.mic === "ok" && (
                    <div className="pe-mic-track">
                      <div className="pe-mic-fill" style={{ width: `${Math.min(micLevel * 2.2, 100)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sysReady && !sysOk && (
            <div className="pe-sc-err-box">
              <p>Some permissions are blocked. Check your browser settings and reload.</p>
              <button className="pe-ghost-btn" onClick={() => window.location.reload()}>
                Reload &amp; Retry
              </button>
            </div>
          )}

          {sysReady && sysOk && camState === "idle" && (
            <button className="pe-cta-btn pe-cta-btn--ready pe-cta-btn--full" onClick={startCamera}>
              Open Camera →
            </button>
          )}
        </div>

        {/* ── RIGHT: Face Capture ── */}
        <div className="pe-verify-right">
          <h2 className="pe-section__heading">
            <span className="pe-section__line" /> Identity Verification
          </h2>

          <div className="pe-face-row">

            {/* Registered photo */}
            <div className="pe-face-slot">
              <p className="pe-face-slot__lbl">Registered</p>
              <div className="pe-face-frame pe-face-frame--static">
                <img src={regPhoto} alt="Registered" className="pe-face-img" />
              </div>
            </div>

            {/* Match score / spinner */}
            <div className="pe-face-vs">
              {verifying ? (
                <div className="pe-vs__spinner" />
              ) : matchPct ? (
                <div className="pe-vs__score pe-vs__score--ok">
                  <span className="pe-vs__score-num">{matchPct}%</span>
                  <span className="pe-vs__score-lbl">match</span>
                </div>
              ) : (
                <span className="pe-face-vs__text">vs</span>
              )}
            </div>

            {/* Live capture slot */}
            <div className="pe-face-slot">
              <p className="pe-face-slot__lbl">Live Capture</p>
              <div className={`pe-face-frame ${showVideo ? "pe-face-frame--live" : ""}`}>

                {/* video always mounted */}
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  className="pe-face-video"
                  style={{ display: showVideo ? "block" : "none" }}
                />

                {/* snapshot */}
                {camState === "captured" && snapshot && (
                  <img src={snapshot} alt="Captured" className="pe-face-img" />
                )}

                {/* placeholder */}
                {(camState === "idle" || camState === "requesting" || camState === "error") && (
                  <div className="pe-face-placeholder">
                    {camState === "requesting" && <span className="pe-sc-spinner" />}
                    {camState === "idle"        && <span className="pe-face-idle-ic">📷</span>}
                    {camState === "error"       && <span className="pe-face-idle-ic">🚫</span>}
                  </div>
                )}

                {/* LIVE badge */}
                {camState === "live" && (
                  <div className="pe-live-badge">
                    <span className="pe-live-badge__dot" /> LIVE
                  </div>
                )}

                {/* scan line */}
                {camState === "live" && <div className="pe-scan" />}

                {/* verified overlay */}
                {camState === "captured" && verified && (
                  <div className="pe-verified-badge">✓ VERIFIED</div>
                )}
              </div>
            </div>
          </div>

          {/* hidden canvas */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Action */}
          <div className="pe-face-action">
            {camState === "idle" && (
              <p className="pe-hint">System check must pass before capturing.</p>
            )}
            {camState === "requesting" && (
              <p className="pe-hint">Opening camera…</p>
            )}
            {camState === "error" && (
              <button className="pe-ghost-btn" onClick={startCamera}>🔄 Retry Camera</button>
            )}
            {camState === "live" && (
              <button className="pe-cta-btn pe-cta-btn--ready pe-cta-btn--full" onClick={doCapture}>
                📸 Capture &amp; Verify
              </button>
            )}
            {camState === "captured" && verifying && (
              <p className="pe-hint">Verifying identity…</p>
            )}
            {camState === "captured" && !verifying && verified && (
              <div className="pe-face-done-row">
                <p className="pe-hint pe-hint--ok">✓ Identity confirmed</p>
                <button className="pe-ghost-btn" onClick={retake}>Retake</button>
              </div>
            )}
          </div>

          {/* Begin exam */}
          <button
            className={`pe-begin-btn ${verified ? "pe-begin-btn--ready" : "pe-begin-btn--disabled"}`}
            disabled={!verified || launching}
            onClick={handleBegin}
          >
            {launching
              ? <><span className="pe-btn-spinner" /> Launching…</>
              : "▶  Begin Exam"}
          </button>
          {!verified && (
            <p className="pe-hint" style={{ textAlign: "center", marginTop: 8 }}>
              Complete identity verification to begin.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT — orchestrates pages
══════════════════════════════════════════════ */
export default function PreExam({ onBegin }) {
  const [page, setPage] = useState(1); // 1 = instructions, 2 = verify

  return (
    <div className="pe-root">

      {/* Top bar */}
      <header className="pe-topbar">
        <div className="pe-topbar__brand">
          <div className="pe-topbar__mark">AE</div>
          <span className="pe-topbar__name">ArithExam</span>
          <span className="pe-topbar__tag">Assess Smarter, Perform Better.</span>
        </div>
        <div className="pe-topbar__steps">
          <div className={`pe-step ${page >= 1 ? "pe-step--done" : ""} ${page === 1 ? "pe-step--active" : ""}`}>
            <span className="pe-step__num">{page > 1 ? "✓" : "1"}</span>
            <span className="pe-step__lbl">Instructions</span>
          </div>
          <div className="pe-step__line" />
          <div className={`pe-step ${page >= 2 ? "pe-step--active" : ""}`}>
            <span className="pe-step__num">2</span>
            <span className="pe-step__lbl">Verification</span>
          </div>
        </div>
        <span className="pe-topbar__badge">
          <span className="pe-topbar__badge-dot" /> Secure Session
        </span>
      </header>

      {page === 1 && <PageInstructions onNext={() => setPage(2)} />}
      {page === 2 && <PageVerify onBegin={onBegin} />}

    </div>
  );
}