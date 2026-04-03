import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/PreExam.css";
import { 
  Globe, Video, Mic, Clock, Lock, 
  ShieldAlert, ChevronRight, Zap, 
  ShieldCheck, RefreshCw, Wifi, Camera
} from "lucide-react";

/* ─── Meta ─── */
const EXAM_META = {
  title: "Assessment",
  code: "AE-USA-2025",
  date: "19 Mar 2025",
  duration: 30,
  total: 10,
};

const RULES = [
  { icon: <Clock size={20} />, text: "Keep an eye on the timer. Each question auto-submits when time runs out." },
  { icon: <Lock size={20} />, text: "Fullscreen mode is mandatory. Do not switch tabs or minimize the window." },
  { icon: <Video size={20} />, text: "Stay centered in the camera frame for the entire duration of the exam." },
  { icon: <ChevronRight size={20} />, text: "You can only go forward. Choose carefully — no going back to previous answers." },
  { icon: <ShieldAlert size={20} />, text: "External resources, notes, or secondary devices are strictly prohibited." },
  { icon: <Globe size={20} />, text: "Ensure a stable internet connection throughout. Disconnections may auto-submit." },
  { icon: <Zap size={20} />, text: "Results are generated instantly after submission. Review your performance immediately." },
  { icon: <Mic size={20} />, text: "Microphone access is required for the Interactive Viva section of the assessment." },
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
      <div className="pe-balanced-layout">
        
        {/* Left — Exam Overview */}
        <div className="pe-panel-left">
          <h1 className="pe-title-main">{EXAM_META.title}</h1>
          <p className="pe-subtitle">Online proctored assessment with interactive viva</p>
          
          <div className="pe-divider" />

          <div className="pe-meta-group">
            <span className="pe-meta-label">Topics Covered</span>
            <p className="pe-tag-list">{TOPICS.join(" · ")}</p>
          </div>

          <div className="pe-meta-group">
            <span className="pe-meta-label">Exam Structure</span>
            <div className="pe-param-list">
              <div className="pe-param-row">
                <span className="pe-param-lbl">MCQ</span>
                <span className="pe-param-val">4 questions · 1 min each</span>
              </div>
              <div className="pe-param-row">
                <span className="pe-param-lbl">Coding</span>
                <span className="pe-param-val">2 questions · 11 min each</span>
              </div>
              <div className="pe-param-row">
                <span className="pe-param-lbl">Viva</span>
                <span className="pe-param-val">4 questions · 1 min each</span>
              </div>
            </div>
          </div>

          <div className="pe-meta-group">
            <span className="pe-meta-label">Time</span>
            <div className="pe-param-list">
              <div className="pe-param-row">
                <span className="pe-param-lbl">Total Duration</span>
                <span className="pe-param-val">30 min</span>
              </div>
              <div className="pe-param-row">
                <span className="pe-param-lbl">Total Questions</span>
                <span className="pe-param-val">10</span>
              </div>
            </div>
          </div>

          <div className="pe-badge-group">
            <div className="pe-badge-item">
              <ShieldCheck size={14} /> Proctored & Monitored
            </div>
          </div>
        </div>

        {/* Right — Rules */}
        <div className="pe-panel-right">
          <h2 className="pe-content-h">Exam Rules</h2>
          <div className="pe-steps-flow">
            {RULES.map((r, i) => (
              <div key={i} className="pe-step-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="pe-step-icon-wrap">{r.icon}</div>
                <p className="pe-step-desc">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="pe-fixed-footer">
        <div className="pe-footer-inner">
          <div className={`pe-consent-bar ${agreed ? "is-on" : ""}`} onClick={() => setAgreed(!agreed)}>
            <div className="pe-check-box">{agreed && "✓"}</div>
            <span className="pe-check-text">I have read all the rules and agree to follow them during the exam.</span>
          </div>

          <button
            className={`pe-primary-btn ${agreed ? "is-ready" : "is-off"}`}
            disabled={!agreed}
            onClick={onNext}
          >
            Continue to Verification →
          </button>
        </div>
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
    return () => { clearIntermediate(); stopStream(); };
  }, []);

  const clearIntermediate = () => { if (window._micInt) clearInterval(window._micInt); };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const runSystemCheck = async () => {
    await new Promise(r => setTimeout(r, 800));
    setSysStatus(s => ({ ...s, net: "ok" }));

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setSysStatus(prev => ({ ...prev, cam: "ok", mic: "ok" }));
      setupMic(s);
      s.getTracks().forEach(t => t.stop());
    } catch {
      setSysStatus(prev => ({ ...prev, cam: "err", mic: "err" }));
    } finally {
      setSysReady(true);
    }
  };

  const setupMic = (stream) => {
    clearIntermediate();
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const ana = ctx.createAnalyser();
      ana.fftSize = 256;
      src.connect(ana);
      const buf = new Uint8Array(ana.frequencyBinCount);
      window._micInt = setInterval(() => {
        ana.getByteFrequencyData(buf);
        setMicLevel(buf.reduce((a, b) => a + b, 0) / buf.length);
      }, 100);
    } catch {}
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setCamState("live");
      setupMic(s);
    } catch { setCamState("error"); }
  };

  const doCapture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext("2d");
    c.width = v.videoWidth; c.height = v.videoHeight;
    ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    const data = c.toDataURL("image/webp");
    setSnapshot(data);
    sessionStorage.setItem("ae_live_photo", data);
    setCamState("captured");
    setVerifying(true);
    setTimeout(() => {
      setMatchPct(Math.floor(Math.random() * 5) + 94);
      setVerified(true);
      setVerifying(false);
    }, 1800);
  };

  const retake = () => {
    setSnapshot(null); setVerified(false); setMatchPct(null);
    setCamState("live");
  };

  const handleBegin = async () => {
    setLaunching(true);
    try { await document.documentElement.requestFullscreen(); } catch {}
    setTimeout(() => {
      if (onBegin) onBegin();
      navigate("/exam");
    }, 1200);
  };

  const isSysOk = sysStatus.net === "ok" && sysStatus.cam === "ok" && sysStatus.mic === "ok";

  return (
    <div className="pe-page pe-page--verify">
      <div className="pe-balanced-layout">
        
        {/* Left — System Check */}
        <div className="pe-panel-left">
          <h2 className="pe-pipeline-h">System Check</h2>
          <p className="pe-subtitle">We need to verify your hardware before you start.</p>
          <div className="pe-pipeline-list">
            {[
              { id: "net", lbl: "Internet", desc: "Stable connection", s: sysStatus.net, ic: <Wifi size={20} /> },
              { id: "cam", lbl: "Camera",   desc: "Video access",     s: sysStatus.cam, ic: <Camera size={20} /> },
              { id: "mic", lbl: "Microphone", desc: "Audio input",    s: sysStatus.mic, ic: <Mic size={20} /> },
            ].map(row => (
              <div key={row.id} className={`pe-pipe-row is-${row.s}`}>
                <div className="pe-pipe-lead">{row.ic}</div>
                <div className="pe-pipe-body">
                  <span className="pe-pipe-lbl">{row.lbl}</span>
                  <span className="pe-pipe-status">
                    {row.s === "ok" ? "Connected" : row.s === "err" ? "Not available" : "Checking..."}
                  </span>
                  {row.id === "mic" && row.s === "ok" && (
                    <div className="pe-mic-track"><div className="pe-mic-fill" style={{ width: `${micLevel * 2}%` }} /></div>
                  )}
                </div>
                <div className="pe-pipe-trail">
                  {row.s === "ok" ? "✓" : row.s === "err" ? "✗" : "…"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Face Verification */}
        <div className="pe-panel-right">
          <h2 className="pe-matrix-h">Face Verification</h2>
          <div className="pe-comparison">
            <div className="pe-bio-box">
              <span className="pe-bio-lbl">Your Photo</span>
              <div className="pe-bio-frame"><img src={regPhoto} alt="Registered" /></div>
            </div>

            <div className="pe-bio-vs">
              {verifying
                ? <div className="pe-vs-spin" />
                : verified
                  ? <div className="pe-vs-score"><span>{matchPct}%</span><small>Match</small></div>
                  : <div className="pe-vs-dot" />
              }
            </div>

            <div className="pe-bio-box">
              <span className="pe-bio-lbl">Live Camera</span>
              <div className={`pe-bio-frame ${camState === "live" ? "is-live" : ""}`}>
                <video ref={videoRef} autoPlay muted playsInline style={{ display: camState === "live" ? "block" : "none" }} />
                {snapshot && <img src={snapshot} alt="Captured" />}
                {camState === "idle" && <div className="pe-cam-msg">Camera is off</div>}
                {(camState === "live" || verifying) && <div className="pe-scan-bar" />}
              </div>
            </div>
          </div>

          <div className="pe-matrix-foot">
            {isSysOk && camState === "idle" && (
              <button className="pe-action-btn" onClick={startCamera}>
                <Camera size={18} /> Turn On Camera
              </button>
            )}
            {camState === "live" && (
              <button className="pe-action-btn is-call" onClick={doCapture}>
                <ShieldCheck size={18} /> Take Photo & Verify
              </button>
            )}
            {verified && !verifying && (
              <div className="pe-success-bar">
                <span>✓ Identity Verified</span>
                <button onClick={retake}><RefreshCw size={14} /> Retake</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pe-fixed-footer">
        <div className="pe-footer-inner centered">
          <button
            className={`pe-primary-btn big ${verified ? "is-ready" : "is-off"}`}
            disabled={!verified || launching}
            onClick={handleBegin}
          >
            {launching ? "Starting Exam..." : "Start Exam →"}
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT — orchestrates pages
══════════════════════════════════════════════ */
export default function PreExam({ onBegin }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  return (
    <div className="pe-root">

      {/* Top bar — Brand left, Steps center, Secure Session right */}
      <header className="pe-topbar">
        <div className="pe-topbar__brand">
          <img src="/logo.png" alt="ArithExam" width="28" height="28" style={{ borderRadius: '6px' }} />
          <span className="pe-topbar__name">ArithExam</span>
        </div>

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
          <div className="pe-step">
            <span className="pe-step__num">3</span>
            <span className="pe-step__lbl">Exam</span>
          </div>
        </div>

        <div className="pe-topbar__badge">
          <span className="pe-topbar__badge-dot" /> Secure Session
        </div>
      </header>

      {page === 1 && <PageInstructions onNext={() => setPage(2)} />}
      {page === 2 && <PageVerify onBegin={onBegin} />}

    </div>
  );
}