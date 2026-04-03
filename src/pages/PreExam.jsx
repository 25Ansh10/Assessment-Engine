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
  { icon: <Ic.Time/>, text: "Keep an eye on the timer! Each question auto-submits when time runs out." },
  { icon: <Ic.Lock/>, text: "Fullscreen mode is required. Do not switch tabs or minimize the browser window." },
  { icon: <Ic.Cam/>, text: "Stay centered in the camera frame for the entire duration of the assessment." },
  { icon: <Ic.ArrowRight/>, text: "You can only go forward. Choose carefully, as you cannot go back to previous answers." },
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
              { val: EXAM_META.total, lbl: "Questions" },
              { val: `${EXAM_META.duration}m`, lbl: "Duration" },
              { val: "1m", lbl: "per MCQ" },
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
        <h2 className="pe-section__heading pe-section__heading--center">
          Exam Instructions
        </h2>
        <div className="pe-rules-minimal">
          {RULES.map((r, i) => (
            <div key={i} className="pe-rule-item" style={{ animationDelay: `${i * 55}ms` }}>
              <span className="pe-rule-item__icon">{r.icon}</span>
              <span className="pe-rule-item__text">{r.text}</span>
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
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const statusIcon = (s) => {
    if (s === "wait") return <span className="pe-sc-spinner" />;
    if (s === "ok") return (
      <span className="pe-sc-status-badge pe-sc-status-badge--ok">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Ready
      </span>
    );
    return (
      <span className="pe-sc-status-badge pe-sc-status-badge--err">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Error
      </span>
    );
  };

  return (
    <div className="pe-page pe-page--verify">

      <div className="pe-verify-layout">

        {/* ── LEFT: System Check ── */}
        <div className="pe-verify-left">
          <h2 className="pe-section__heading">
            System Check
          </h2>

          <div className="pe-sc-list">
            {[
              { key: "net", icon: <Ic.Network/>, label: "Network", detail: sysStatus.net === "ok" ? "Stable connection" : "Checking…" },
              { key: "cam", icon: <Ic.Cam/>, label: "Camera", detail: sysStatus.cam === "ok" ? "Accessible" : sysStatus.cam === "err" ? "Access denied" : "Checking…" },
              { key: "mic", icon: <Ic.Mic/>, label: "Microphone", detail: sysStatus.mic === "ok" ? "Level detected" : sysStatus.mic === "err" ? "Blocked / muted" : "Calibrating…" },
            ].map(item => (
              <div key={item.key} className={`pe-sc-row pe-sc-row--${sysStatus[item.key]}`}>
                <div className="pe-sc-row__icon">{statusIcon(sysStatus[item.key])}</div>
                <div className="pe-sc-row__info">
                  <div className="pe-sc-row__name">
                    <span className="pe-sc-row__vec">{item.icon}</span> 
                    {item.label}
                  </div>
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
             Identity Verification
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
                    {camState === "idle" && <span className="pe-face-idle-ic">📷</span>}
                    {camState === "error" && <span className="pe-face-idle-ic">🚫</span>}
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