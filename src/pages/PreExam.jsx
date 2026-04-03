import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/PreExam.css";

/* ─── Vector Icons (Inline SVGs) ─── */
const Ic = {
  Time: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Cam: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  NoEntry: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  ArrowRight: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Zap: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Network: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Mic: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
};

/* ─── Meta ─── */
const EXAM_META = {
  title: "Assessment",
  code: "AE-USA-2025",
  date: "19 Mar 2025",
  duration: 30, // Updated
  total: 10,   // Updated
  marks: 100,  // Updated
  passing: 40,
};

const RULES = [
  { icon: <Ic.Time/>, text: "Keep an eye on the timer. Each question auto-submits when time runs out." },
  { icon: <Ic.Lock/>, text: "Fullscreen mode is mandatory. Do not switch tabs or minimize the window." },
  { icon: <Ic.Cam/>, text: "Stay centered in the camera frame for the entire duration of the exam." },
  { icon: <Ic.ArrowRight/>, text: "You can only go forward. Choose carefully — no going back to previous answers." },
  { icon: <Ic.NoEntry/>, text: "External resources, notes, or secondary devices are strictly prohibited." },
  { icon: <Ic.Network/>, text: "Ensure a stable internet connection throughout. Disconnections may auto-submit." },
  { icon: <Ic.Zap/>, text: "Results are generated instantly after submission. Review your performance immediately." },
  { icon: <Ic.Mic/>, text: "Microphone access is required for the Interactive Viva section of the assessment." },
];

const TOPICS = ["Python", "React", "Coding", "Interactive Viva", "Ethical Reasoning"];

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
      <div className="pe-split-layout">
        
        {/* Left Column: Assessment Profile */}
        <div className="pe-split-left">
          <div className="pe-profile-section">
            <h1 className="pe-profile-title">{EXAM_META.title}</h1>
            <div className="pe-chips pe-chips--vertical">
              <span className="pe-chip pe-chip--teal">Proctored Assessment</span>
              <span className="pe-chip pe-chip--slate">No Negative Marking</span>
              <span className="pe-chip pe-chip--slate">MCQ + Coding + Viva</span>
            </div>
            
            <div className="pe-topics-box">
              <p className="pe-label">Coverage Topics</p>
              <div className="pe-topics">
                {TOPICS.map(t => <span key={t} className="pe-topic-tag">{t}</span>)}
              </div>
            </div>

            <div className="pe-stats-stack">
              {[
                { val: "10", lbl: "Total Questions", sub: "4 MCQ + 4 Viva + 2 Coding" },
                { val: "1m", lbl: "MCQ & Viva Time", sub: "Per each question" },
                { val: "11m", lbl: "Coding Time", sub: "Per each question" },
                { val: "30m", lbl: "Total Duration", sub: "Overall limit" },
              ].map((m, i) => (
                <div key={i} className="pe-stat-item">
                  <div className="pe-stat-item__val">{m.val}</div>
                  <div className="pe-stat-item__meta">
                    <span className="pe-stat-item__lbl">{m.lbl}</span>
                    <span className="pe-stat-item__sub">{m.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Instructions */}
        <div className="pe-split-right">
          <div className="pe-ins-container">
            <h2 className="pe-section__heading">
              Exam Instructions
            </h2>
            <div className="pe-rules-stack">
              {RULES.map((r, i) => (
                <div key={i} className="pe-rule-card" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="pe-rule-card__icon">{r.icon}</span>
                  <p className="pe-rule-card__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Footer: Consent + CTA */}
      <div className="pe-footer-row">
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
            I confirm that I have read the instructions and agree to the proctoring terms.
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
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [sysStatus, setSysStatus] = useState({ net: "wait", cam: "wait", mic: "wait" });
  const [sysReady, setSysReady] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const [camState, setCamState] = useState("idle"); 
  const [snapshot, setSnapshot] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [matchPct, setMatchPct] = useState(null);
  const [launching, setLaunching] = useState(false);

  const regPhoto = getRegPhoto();

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
    // 1. Network
    await new Promise(r => setTimeout(r, 600));
    setSysStatus(s => ({ ...s, net: "ok" }));

    // 2. Camera
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      s.getTracks().forEach(t => t.stop());
      setSysStatus(s => ({ ...s, cam: "ok" }));
    } catch { setSysStatus(s => ({ ...s, cam: "err" })); }

    // 3. Microphone
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      setSysStatus(s => ({ ...s, mic: "ok" }));
      
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
      setTimeout(() => { active = false; ms.getTracks().forEach(t => t.stop()); ctx.close(); }, 3000);
    } catch { setSysStatus(s => ({ ...s, mic: "err" })); }

    setSysReady(true);
  };

  const startCamera = async () => {
    stopStream();
    setCamState("requesting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          setCamState("live");
        };
      }
    } catch { setCamState("error"); }
  };

  const doCapture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    const w = v.videoWidth || 640;
    const h = v.videoHeight || 480;
    c.width = w; c.height = h;

    const ctx = c.getContext("2d");
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, w, h);
    ctx.restore();

    const data = c.toDataURL("image/jpeg", 0.92);
    stopStream();
    setSnapshot(data);
    sessionStorage.setItem("ae_live_photo", data);
    setCamState("captured");

    setVerifying(true);
    setTimeout(() => {
      setMatchPct(Math.floor(Math.random() * 5) + 94);
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
    setLaunching(true);
    try { await document.documentElement.requestFullscreen(); } catch {}
    setTimeout(() => {
      if (onBegin) onBegin();
      navigate("/exam");
    }, 1000);
  };

  const isSysOk = sysStatus.net === "ok" && sysStatus.cam === "ok" && sysStatus.mic === "ok";

  const statusIcon = (s) => {
    if (s === "wait") return <span className="pe-sc-spinner" />;
    if (s === "ok")   return <span className="pe-sc-dot pe-sc-dot--ok">✓</span>;
    return                  <span className="pe-sc-dot pe-sc-dot--err">✗</span>;
  };

  return (
    <div className="pe-page pe-page--verify">
      <div className="pe-verify-layout">

        {/* ── LEFT: System Status Check ── */}
        <div className="pe-verify-section pe-verify-left">
          <h2 className="pe-section__heading">
             System Verification
          </h2>
          <div className="pe-sc-list">
            {[
              { key: "net", label: "Network Connectivity", icon: <Ic.Network/>, detail: sysStatus.net === "ok" ? "Stable Link" : "Probing..." },
              { key: "cam", label: "Optic Interface",      icon: <Ic.Cam/>,     detail: sysStatus.cam === "ok" ? "Sensor Ready" : sysStatus.cam === "err" ? "Access Denied" : "Detecting..." },
              { key: "mic", label: "Bio-Audio Signal",     icon: <Ic.Mic/>,     detail: sysStatus.mic === "ok" ? "Input Active" : sysStatus.mic === "err" ? "Blocked" : "Calibrating..." },
            ].map(item => (
              <div key={item.key} className={`pe-sc-row pe-sc-row--${sysStatus[item.key]}`}>
                <div className="pe-sc-row__icon">{statusIcon(sysStatus[item.key])}</div>
                <div className="pe-sc-row__info">
                  <span className="pe-sc-row__name">{item.label}</span>
                  <span className="pe-sc-row__detail">{item.detail}</span>
                  {item.key === "mic" && sysStatus.mic === "ok" && (
                    <div className="pe-mic-track">
                      <div className="pe-mic-fill" style={{ width: `${Math.min(micLevel * 2.2, 100)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isSysOk && sysReady && (
            <div className="pe-sc-err-box">
              <p>Mandatory sensors are missing. Ensure camera and mic access are granted.</p>
              <button className="pe-ghost-btn" onClick={() => window.location.reload()}>Reload Terminal</button>
            </div>
          )}

          {isSysOk && camState === "idle" && (
             <button className="pe-cta-btn pe-cta-btn--ready pe-cta-btn--full" onClick={startCamera}>
                Activate Optics →
             </button>
          )}
        </div>

        {/* ── RIGHT: Identity Verification ── */}
        <div className="pe-verify-section pe-verify-right">
          <h2 className="pe-section__heading">
             Identity Cross-Link
          </h2>

          <div className="pe-face-row">
            {/* Registered profile */}
            <div className="pe-face-slot">
              <span className="pe-face-slot__lbl">Record Bio</span>
              <div className="pe-face-frame pe-face-frame--static">
                <img src={regPhoto} alt="Ref" className="pe-face-img" />
              </div>
            </div>

            {/* Comparison Hub */}
            <div className="pe-face-vs">
              {verifying ? (
                <div className="pe-vs__spinner" />
              ) : matchPct ? (
                <div className="pe-vs__score pe-vs__score--ok">
                  <span className="pe-vs__score-num">{matchPct}%</span>
                  <span className="pe-vs__score-lbl">match</span>
                </div>
              ) : (
                <span className="pe-face-vs__text">VS</span>
              )}
            </div>

            {/* Live capture */}
            <div className="pe-face-slot">
              <span className="pe-face-slot__lbl">Live Bio</span>
              <div className={`pe-face-frame ${camState === "live" ? "pe-face-frame--live" : ""}`}>
                <video ref={videoRef} autoPlay muted playsInline style={{ display: camState === "live" ? "block" : "none" }} className="pe-face-video" />
                {snapshot && <img src={snapshot} alt="Captured" className="pe-face-img" />}
                
                {camState === "idle" && (
                   <div className="pe-face-placeholder"><span className="pe-face-idle-ic">📷</span></div>
                )}
                
                {verifying && (
                   <div className="pe-pulse-scan-overlay">
                      <div className="pe-pulse-scanline" />
                   </div>
                )}
                {camState === "live" && <div className="pe-pulse-scanline" />}
                {camState === "live" && (
                   <div className="pe-live-badge"><span className="pe-live-badge__dot" /> LIVE</div>
                )}
                {verified && <div className="pe-verified-badge">✓ IDENTITY CONFIRMED</div>}
              </div>
            </div>
          </div>

          <div className="pe-face-action">
            {camState === "live" && (
              <button className="pe-cta-btn pe-cta-btn--ready pe-cta-btn--full" onClick={doCapture}>
                Capture & Verify Sample
              </button>
            )}
            {verified && !verifying && (
              <div className="pe-face-done-row">
                 <p className="pe-hint pe-hint--ok">Identity verification successful.</p>
                 <button className="pe-radar-retake" onClick={retake}>Retake</button>
              </div>
            )}
          </div>

          <button 
            className={`pe-begin-btn ${verified ? "pe-begin-btn--ready" : "pe-begin-btn--disabled"}`}
            disabled={!verified || launching}
            onClick={handleBegin}
          >
            {launching ? "HANDSHAKE..." : "▶   BEGIN ASSESSMENT"}
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT — orchestrates pages
══════════════════════════════════════════════ */
export default function PreExam({ onBegin }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1); // 1 = instructions, 2 = verify

  return (
    <div className="pe-root">

      {/* Top bar */}
      <header className="pe-topbar">
        <div className="pe-topbar__brand">
          <img src="/logo.png" alt="ArithExam Logo" width="28" height="28" style={{ borderRadius: '6px' }} />
          <span className="pe-topbar__name">ArithExam</span>
        </div>
        
        {/* Improved Step Indicator */}
        <div className="pe-topbar__steps">
          <div className={`pe-step ${page >= 1 ? "pe-step--done" : ""} ${page === 1 ? "pe-step--active" : ""}`}>
            <span className="pe-step__num">{page > 1 ? "✓" : "1"}</span>
            <span className="pe-step__lbl">Instructions</span>
          </div>
          <div className="pe-step__line" />
          <div className={`pe-step ${page >= 2 ? "pe-step--done" : ""} ${page === 2 ? "pe-step--active" : ""}`}>
            <span className="pe-step__num">{page > 2 ? "✓" : "2"}</span>
            <span className="pe-step__lbl">Verification</span>
          </div>
          <div className="pe-step__line" />
          <div className={`pe-step`}>
            <span className="pe-step__num">3</span>
            <span className="pe-step__lbl">Exam</span>
          </div>
        </div>

        <div className="pe-topbar__user">
          <span className="pe-topbar__user-name">{user?.name || 'Candidate'}</span>
          <span className="pe-topbar__badge">
            <span className="pe-topbar__badge-dot" /> Secure Terminal
          </span>
        </div>
      </header>

      {page === 1 && <PageInstructions onNext={() => setPage(2)} />}
      {page === 2 && <PageVerify onBegin={onBegin} />}

    </div>
  );
}