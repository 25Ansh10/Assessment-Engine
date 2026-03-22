import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Exam.css";

/* ═══════════════════════════════════════════
   QUESTION BANK
   Section 1 – MCQ      (4 questions, 60s each)
   Section 2 – Coding   (2 questions, 660s each = 11 min)
   Section 3 – Viva     (4 questions, 60s each)
   Total = 4×1 + 2×11 + 4×1 = 26 min  ≈ 30 min
   ═══════════════════════════════════════════ */
const QUESTIONS = [
  // ── Section 1: MCQ ──
  {
    id: 1, type: "mcq",
    section: "Section 1", sectionFull: "Multiple Choice",
    text: "What is the time complexity of searching in a balanced binary search tree?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1, duration: 60,
  },
  {
    id: 2, type: "mcq",
    section: "Section 1", sectionFull: "Multiple Choice",
    text: "Which protocol is used to fetch web pages from a server?",
    options: ["FTP", "SMTP", "HTTP", "SNMP"],
    correct: 2, duration: 60,
  },
  {
    id: 3, type: "mcq",
    section: "Section 1", sectionFull: "Multiple Choice",
    text: "Which of these is NOT a primitive data type in JavaScript?",
    options: ["String", "Number", "Boolean", "Object"],
    correct: 3, duration: 60,
  },
  {
    id: 4, type: "mcq",
    section: "Section 1", sectionFull: "Multiple Choice",
    text: "What does the CSS property 'position: sticky' do?",
    options: [
      "Positions element relative to viewport always",
      "Sticks element within its scroll container",
      "Removes element from document flow",
      "Same as position: fixed",
    ],
    correct: 1, duration: 60,
  },

  // ── Section 2: Coding ──
  {
    id: 5, type: "coding",
    section: "Section 2", sectionFull: "Coding Challenge",
    text: "Write a JavaScript function that returns the nth Fibonacci number. Optimize for large inputs.",
    placeholder: "// Write your solution here...\n\nfunction fibonacci(n) {\n  \n}\n\n// Example: fibonacci(10) → 55",
    duration: 660,
  },
  {
    id: 6, type: "coding",
    section: "Section 2", sectionFull: "Coding Challenge",
    text: "Implement a function that checks if a given string is a valid palindrome (ignoring spaces and case).",
    placeholder: "// Write your solution here...\n\nfunction isPalindrome(str) {\n  \n}\n\n// Example: isPalindrome('A man a plan a canal Panama') → true",
    duration: 660,
  },

  // ── Section 3: Viva ──
  {
    id: 7, type: "viva",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "Explain the concept of 'Closure' in JavaScript with a real-world analogy.",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
  {
    id: 8, type: "viva",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "Describe the difference between Relational and Non-Relational databases. When would you choose each?",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
  {
    id: 9, type: "viva",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "What is event delegation in JavaScript and why is it useful?",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
  {
    id: 10, type: "viva",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "Explain the difference between 'undefined' and 'null' in JavaScript.",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
];

/* Section accent colors */
const SEC_COLOR = {
  "Section 1": "#0D9488",
  "Section 2": "#d4a017",
  "Section 3": "#0D9488",
};

const SECTIONS_META = [
  { key: "Section 1", label: "MCQ",     total: 4, type: "mcq"    },
  { key: "Section 2", label: "Coding",  total: 2, type: "coding" },
  { key: "Section 3", label: "Viva",    total: 4, type: "viva"   },
];

/* ─── Icons ─── */
const Ic = {
  Clock:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Shield: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Code:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Msg:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Warn:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Cam:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
};

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Audio Beep Utility ──
const playBeep = (freq = 660, vol = 0.08, dur = 0.15) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    console.warn("Audio Context blocked or unsupported:", e);
  }
};



/* ═══════════════════════════════════════════
   MAIN EXAM COMPONENT
   ═══════════════════════════════════════════ */
export default function Exam({ onFinish }) {
  const navigate = useNavigate();

  const [current,      setCurrent]      = useState(0);
  const [answers,      setAnswers]      = useState({});
  const [qTimeLeft,    setQTimeLeft]    = useState(QUESTIONS[0].duration);
  const [submitted,    setSubmitted]    = useState(false);
  const [showResult,   setShowResult]   = useState(false);
  const [warning,      setWarning]      = useState(null);
  const [violations,   setViolations]   = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [fsCountdown,  setFsCountdown]  = useState(5);
  const [transitioning,setTransitioning]= useState(false);

  const camRef       = useRef(null);
  const streamRef    = useRef(null);
  const fsRef        = useRef(null);

  /* ── Reset per-question timer when question changes ── */
  useEffect(() => {
    setQTimeLeft(QUESTIONS[current].duration);
  }, [current]);

  /* ── Per-question countdown ── */
  useEffect(() => {
    if (submitted) return;
    if (qTimeLeft <= 0) { goNext(true); return; }

    // Play beep sound for last 5 seconds (5, 4, 3, 2, 1)
    if (qTimeLeft <= 5 && qTimeLeft > 0) {
      playBeep(qTimeLeft === 1 ? 880 : 660, 0.1, 0.2); // Higher pitch for final second
    }

    const t = setInterval(() => setQTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [qTimeLeft, submitted, current]);

  /* ── Security: fullscreen + copy guard ── */
  useEffect(() => {
    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullScreen(inFs);
      if (!inFs && !submitted) {
        setViolations(v => v + 1);
        setWarning("Exit detected — return to fullscreen immediately.");
      } else { setWarning(null); }
    };
    const onCopy = (e) => {
      e.preventDefault();
      setWarning("Copying is strictly prohibited during the exam.");
      setTimeout(() => setWarning(null), 3000);
    };
    const onCtx = (e) => e.preventDefault();
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("copy",  onCopy);
    document.addEventListener("paste", onCopy);
    document.addEventListener("contextmenu", onCtx);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("copy",  onCopy);
      document.removeEventListener("paste", onCopy);
      document.removeEventListener("contextmenu", onCtx);
    };
  }, [submitted]);

  /* ── FS auto-submit countdown ── */
  useEffect(() => {
    if (!isFullScreen && !submitted) {
      setFsCountdown(5);
      fsRef.current = setInterval(() => {
        setFsCountdown(p => {
          if (p <= 1) { clearInterval(fsRef.current); handleSubmit(true); return 0; }
          return p - 1;
        });
      }, 1000);
    } else { clearInterval(fsRef.current); }
    return () => clearInterval(fsRef.current);
  }, [isFullScreen, submitted]);

  useEffect(() => {
    if (violations >= 2)
      setWarning("Final warning — further violations will terminate the exam.");
  }, [violations]);

  /* ── Proctor camera initialization ── */
  useEffect(() => {
    let internalStream = null;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 400, height: 400, facingMode: "user" }, 
          audio: false 
        });
        streamRef.current = s;
        internalStream = s;
        if (camRef.current) {
          camRef.current.srcObject = s;
          camRef.current.play().catch(() => {});
        }
      } catch (err) { console.warn("Init camera error:", err); }
    })();

    // Cleanup
    return () => {
      internalStream?.getTracks().forEach(t => t.stop());
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* ── Ensure camera attaches on any render ── */
  useEffect(() => {
    if (streamRef.current && camRef.current && !camRef.current.srcObject) {
      camRef.current.srcObject = streamRef.current;
      camRef.current.play().catch(() => {});
    }
  }, [current]); // Trigger on question changes to ensure thumb is always active

  /* ── Helpers ── */
  const mcqScore = () =>
    QUESTIONS.reduce((acc, q, i) =>
      q.type === "mcq" && answers[i] === q.correct ? acc + 1 : acc, 0);

  const goNext = useCallback((auto = false) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) setCurrent(c => c + 1);
      else handleSubmit();
      setTransitioning(false);
    }, 180);
  }, [transitioning, current]);

  const handleSubmit = (auto = false) => {
    if (submitted) return;
    setSubmitted(true);
    streamRef.current?.getTracks().forEach(t => t.stop());
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
    setTimeout(() => setShowResult(true), 350);
  };

  /* ── Derived ── */
  const q          = QUESTIONS[current];
  const secColor   = SEC_COLOR[q?.section] ?? "#0D9488";
  const isUrgent   = qTimeLeft <= 10;
  const isWarn     = qTimeLeft <= 20 && !isUrgent;
  const progressPct = (current / QUESTIONS.length) * 100;
  const answeredCount = Object.keys(answers).length;



  /* ════════════════════════════════
     RESULT SCREEN
  ════════════════════════════════ */
  if (showResult) {
    const s        = mcqScore();
    const totalMCQ = QUESTIONS.filter(q => q.type === "mcq").length;

    return (
      <div className="res-shell">
        <div className="res-card">
          <div className="res-seal">
            <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
              <circle cx="40" cy="40" r="37" stroke="#0D9488" strokeWidth="1.5" opacity="0.22"/>
              <circle cx="40" cy="40" r="29" stroke="#0D9488" strokeWidth="1"   opacity="0.38"/>
              <circle cx="40" cy="40" r="20" fill="#0D9488" opacity="0.08"/>
              <polyline points="27 40 35 48 53 32" stroke="#0D9488" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="res-title">Assessment Submitted</h2>
          <p  className="res-sub">Your responses have been securely recorded and are under review.</p>
          <div className="res-divider"/>
          <div className="res-stats">
            <div className="res-stat">
              <span className="res-val">{s}<span className="res-total">/{totalMCQ}</span></span>
              <span className="res-lbl">MCQ Score</span>
            </div>
            <div className="res-stat-sep"/>
            <div className="res-stat">
              <span className="res-val res-val--pending">—</span>
              <span className="res-lbl">Coding</span>
            </div>
            <div className="res-stat-sep"/>
            <div className="res-stat">
              <span className="res-val res-val--pending">—</span>
              <span className="res-lbl">Viva</span>
            </div>
            <div className="res-stat-sep"/>
            <div className="res-stat">
              <span className="res-val">{answeredCount}<span className="res-total">/{QUESTIONS.length}</span></span>
              <span className="res-lbl">Attempted</span>
            </div>
          </div>
          <p className="res-note">Coding and Viva responses are pending manual evaluation by the panel.</p>
          <button className="res-btn" onClick={() => navigate("/results")}>Go to Dashboard →</button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════
     EXAM SCREEN
  ════════════════════════════════ */
  return (
    <>
      {/* ── Fullscreen overlay ── */}
      {!isFullScreen && !submitted && (
        <div className="fs-overlay">
          <div className="fs-card">
            <div className="fs-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="fs-title">Fullscreen Required</h2>
            <p  className="fs-text">Return to fullscreen immediately. Auto-submitting in</p>
            <div className="fs-count">{fsCountdown}</div>
            <button className="fs-btn" onClick={() => document.documentElement.requestFullscreen()}>
              Restore Fullscreen
            </button>
          </div>
        </div>
      )}

      <div className={`ex-shell ${!isFullScreen ? "ex-shell--blurred" : ""}`}>

        {/* Toast */}
        {warning && (
          <div className="ex-toast">
            <Ic.Warn/>{warning}
          </div>
        )}

        {/* ══ TOP BAR ══ */}
        <header className="ex-bar">
          <div className="ex-bar__brand">
            <svg viewBox="0 0 28 28" fill="none" width="26" height="26">
              <rect width="28" height="28" rx="6" fill="#0D9488"/>
              <text x="14" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="white" fontFamily="sans-serif">AE</text>
            </svg>
            <div>
              <div className="ex-bar__name">ArithExam</div>
              <div className="ex-bar__session">Live Assessment</div>
            </div>
          </div>

          <div className="ex-bar__center">
            <div className="ex-bar__prog-wrap">
              <div className="ex-bar__prog-track">
                <div className="ex-bar__prog-fill" style={{ width: `${progressPct}%` }}/>
              </div>
              <span className="ex-bar__prog-label">Question {current + 1} of {QUESTIONS.length}</span>
            </div>
          </div>

          <div className="ex-bar__right">
            {/* Per-question countdown */}
            <div className={`ex-qtimer ${isUrgent ? "ex-qtimer--urgent" : isWarn ? "ex-qtimer--warn" : ""}`}>
              <Ic.Clock/>
              <span className="ex-qtimer__val">{fmt(qTimeLeft)}</span>
            </div>
            {/* Proctor cam thumb */}
            <div className="ex-cam-thumb">
              <video ref={camRef} autoPlay muted playsInline className="ex-cam-thumb__vid"/>
              <div className="ex-cam-thumb__face-guide" />
              <div className="ex-cam-thumb__dot"/>
            </div>
          </div>
        </header>

        {/* ══ BODY ══ */}
        <div className="ex-body">

          {/* ── SIDEBAR ── */}
          <aside className="ex-sidebar">

            <div className="ex-sidebar__block">
              <p className="ex-sidebar__label">Questions</p>
              <div className="ex-sidebar__questions">
                {QUESTIONS.map((que, i) => {
                  const isCur  = i === current;
                  const isDone = answers[i] !== undefined;
                  const col    = SEC_COLOR[que.section];
                  return (
                    <div
                      key={i}
                      className={`ex-qpill ${isCur ? "ex-qpill--active" : ""} ${isDone ? "ex-qpill--done" : ""}`}
                      style={isCur ? { borderColor: col, color: col } : {}}
                      title={`Q${i+1} · ${que.section}`}
                    >
                      {isDone && !isCur
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span>{i + 1}</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ex-sidebar__divider"/>

            <div className="ex-sidebar__block">
              <p className="ex-sidebar__label">Sections</p>
              {SECTIONS_META.map(sec => {
                const done     = QUESTIONS.filter((que, i) => que.section === sec.key && answers[i] !== undefined).length;
                const isActive = q.section === sec.key;
                const col      = SEC_COLOR[sec.key];
                return (
                  <div
                    key={sec.key}
                    className={`ex-sec-item ${isActive ? "ex-sec-item--active" : ""}`}
                    style={isActive ? { borderLeftColor: col } : {}}
                  >
                    <div className="ex-sec-item__icon" style={isActive ? { color: col } : {}}>
                      {sec.type === "mcq"    && <Ic.Check/>}
                      {sec.type === "coding" && <Ic.Code/>}
                      {sec.type === "viva"   && <Ic.Msg/>}
                    </div>
                    <div className="ex-sec-item__info">
                      <span className="ex-sec-item__name">{sec.label}</span>
                      <span className="ex-sec-item__count">{done}/{sec.total} done</span>
                    </div>
                    {isActive && <div className="ex-sec-item__pip" style={{ background: col }}/>}
                  </div>
                );
              })}
            </div>

            <div className="ex-sidebar__divider"/>

            <div className="ex-sidebar__block">
              <p className="ex-sidebar__label">Status</p>
              <div className="ex-status-row">
                <span className="ex-status-dot ex-status-dot--green"/>
                <span className="ex-status-text">System OK</span>
              </div>
              <div className="ex-status-row">
                <span className={`ex-status-dot ${violations > 0 ? "ex-status-dot--red" : "ex-status-dot--green"}`}/>
                <span className="ex-status-text">Violations: {violations}/2</span>
              </div>
              <div className="ex-status-row">
                <span className="ex-status-dot ex-status-dot--teal"/>
                <span className="ex-status-text">Camera active</span>
              </div>
            </div>

          </aside>

          {/* ── MAIN ── */}
          <main className={`ex-main ${transitioning ? "ex-main--fade" : ""}`}>

            {/* Meta */}
            <div className="ex-q-meta">
              <div
                className="ex-q-tag"
                style={{ background:`${secColor}0f`, color:secColor, borderColor:`${secColor}28` }}
              >
                {q.section} · {q.sectionFull}
              </div>
              <div className="ex-q-badge">
                {q.type === "mcq"    && <><Ic.Check/> Multiple Choice</>}
                {q.type === "coding" && <><Ic.Code/>  Coding Challenge</>}
                {q.type === "viva"   && <><Ic.Msg/>   Viva</>}
              </div>
              {/* Time indicator per question */}
              <div className="ex-q-badge" style={{ marginLeft:"auto", color: isUrgent ? "#dc2626" : isWarn ? "#7a5c0a" : "var(--text-3)" }}>
                <Ic.Clock/>
                {q.type === "coding" ? `${q.duration/60} min` : `${q.duration}s`} per question
              </div>
            </div>

            {/* Question */}
            <div className="ex-q-card">
              <div className="ex-q-num" style={{ color: secColor }}>Q{current + 1}</div>
              <p className="ex-q-text">{q.text}</p>
            </div>

            {/* MCQ */}
            {q.type === "mcq" && (
              <div className="ex-options">
                {q.options.map((opt, i) => {
                  const sel = answers[current] === i;
                  return (
                    <button
                      key={i}
                      className={`ex-opt ${sel ? "ex-opt--selected" : ""}`}
                      style={sel ? { borderColor: secColor, background:`${secColor}07` } : {}}
                      onClick={() => setAnswers({ ...answers, [current]: i })}
                    >
                      <span
                        className="ex-opt__letter"
                        style={sel ? { background: secColor, color:"#fff", borderColor: secColor } : {}}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="ex-opt__text">{opt}</span>
                      {sel && (
                        <span className="ex-opt__check" style={{ color: secColor }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Coding / Viva */}
            {(q.type === "coding" || q.type === "viva") && (
              <div className="ex-editor-wrap">
                <div className="ex-editor-bar">
                  <div className="ex-editor-bar__dots"><span/><span/><span/></div>
                  <span className="ex-editor-bar__label">
                    {q.type === "coding" ? "Code Editor" : "Response Area"}
                  </span>
                </div>
                <textarea
                  className={`ex-editor ${q.type === "coding" ? "ex-editor--code" : ""}`}
                  spellCheck={q.type !== "coding"}
                  placeholder={q.placeholder}
                  value={answers[current] || ""}
                  onChange={e => setAnswers({ ...answers, [current]: e.target.value })}
                />
              </div>
            )}

            {/* Footer */}
            <div className="ex-foot">
              <div className="ex-foot__secure">
                <Ic.Shield/>
                <span>Secure — forward navigation only</span>
              </div>
              <button
                className="ex-next-btn"
                style={{ background: secColor }}
                onClick={() => goNext(false)}
                disabled={transitioning}
              >
                {current < QUESTIONS.length - 1 ? "Next Question →" : "Submit Exam ✓"}
              </button>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}