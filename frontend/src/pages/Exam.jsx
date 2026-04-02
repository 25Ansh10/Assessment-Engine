import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Exam.css";

const QUESTIONS = [
  {
    id: 1, type: "mcq", level: "Easy",
    section: "Section 1", sectionFull: "Multiple Choice",
    text: "What is the time complexity of searching in a balanced binary search tree?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1, duration: 60,
  },
  {
    id: 2, type: "mcq", level: "Easy",
    section: "Section 1", sectionFull: "Multiple Choice",
    text: "Which protocol is used to fetch web pages from a server?",
    options: ["FTP", "SMTP", "HTTP", "SNMP"],
    correct: 2, duration: 60,
  },
  {
    id: 3, type: "mcq", level: "Medium",
    section: "Section 1", sectionFull: "Multiple Choice",
    text: "Which of these is NOT a primitive data type in JavaScript?",
    options: ["String", "Number", "Boolean", "Object"],
    correct: 3, duration: 60,
  },
  {
    id: 4, type: "mcq", level: "Hard",
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
  {
    id: 5, type: "coding", level: "Hard",
    section: "Section 2", sectionFull: "Coding Challenge",
    text: "Write a JavaScript function that returns the nth Fibonacci number. Optimize for large inputs.",
    placeholder: "// Write your solution here...\n\nfunction fibonacci(n) {\n  \n}\n\n// Example: fibonacci(10) → 55",
    duration: 660,
  },
  {
    id: 6, type: "coding", level: "Medium",
    section: "Section 2", sectionFull: "Coding Challenge",
    text: "Implement a function that checks if a given string is a valid palindrome (ignoring spaces and case).",
    placeholder: "// Write your solution here...\n\nfunction isPalindrome(str) {\n  \n}\n\n// Example: isPalindrome('A man a plan a canal Panama') → true",
    duration: 660,
  },
  {
    id: 7, type: "viva", level: "Easy",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "Explain the concept of 'Closure' in JavaScript with a real-world analogy.",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
  {
    id: 8, type: "viva", level: "Medium",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "Describe the difference between Relational and Non-Relational databases. When would you choose each?",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
  {
    id: 9, type: "viva", level: "Medium",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "What is event delegation in JavaScript and why is it useful?",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
  {
    id: 10, type: "viva", level: "Hard",
    section: "Section 3", sectionFull: "Viva & Reasoning",
    text: "Explain the difference between 'undefined' and 'null' in JavaScript.",
    placeholder: "Type your explanation here...",
    duration: 60,
  },
];

const SEC_COLOR = {
  "Section 1": "#0D9488",
  "Section 2": "#d4a017",
  "Section 3": "#0D9488",
};

const SECTIONS_META = [
  { key: "Section 1", label: "MCQ", total: 4, type: "mcq" },
  { key: "Section 2", label: "Coding", total: 2, type: "coding" },
  { key: "Section 3", label: "Viva", total: 4, type: "viva" },
];

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const MAX_VIOLATIONS = 2;

/* ─── Icons ─── */
const Ic = {
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Shield: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Code: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  Msg: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Warn: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Eye: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
};

/* ═══════════════════════════════════════════
   EXAM COMPONENT
   ═══════════════════════════════════════════ */
export default function Exam({ onFinish }) {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [qTimeLeft, setQTimeLeft] = useState(QUESTIONS[0].duration);
  const [submitted, setSubmitted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [toast, setToast] = useState(null); // { msg, type: 'warn'|'critical' }
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [fsCountdown, setFsCountdown] = useState(5);
  const [transitioning, setTransitioning] = useState(false);
  const [tabWarning, setTabWarning] = useState(false); // overlay when tab hidden

  const camRef = useRef(null);
  const streamRef = useRef(null);
  const fsRef = useRef(null);
  const toastTimer = useRef(null);
  const violationRef = useRef(0); // sync ref for use inside event handlers
  const submittedRef = useRef(false);

  /* keep refs in sync */
  useEffect(() => { violationRef.current = violations; }, [violations]);
  useEffect(() => { submittedRef.current = submitted; }, [submitted]);

  const [confirmSubmit, setConfirmSubmit] = useState(false);

  /* ─── Toast helper — shows message, auto-clears ─── */
  const showToast = useCallback((msg, type = "warn") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    if (type !== "critical") {
      toastTimer.current = setTimeout(() => setToast(null), 4000);
    }
  }, []);

  /* ─── Record violation — auto-submit on 2nd strike ─── */
  const recordViolation = useCallback((reason) => {
    if (submittedRef.current) return;
    const next = violationRef.current + 1;
    setViolations(next);
    violationRef.current = next;

    if (next >= MAX_VIOLATIONS) {
      showToast(`🛑 Exam auto-submitted: ${reason}`, "critical");
      setTimeout(() => doSubmit(true), 1500);
    } else {
      showToast(`⚠️ Warning ${next}/${MAX_VIOLATIONS}: ${reason} — one more violation will auto-submit.`, "warn");
    }
  }, [showToast]);

  /* ── Reset timer on question change ── */
  useEffect(() => {
    setQTimeLeft(QUESTIONS[current].duration);
  }, [current]);

  /* ── Per-question countdown ── */
  useEffect(() => {
    if (submitted) return;
    if (qTimeLeft <= 0) { goNext(true); return; }
    const t = setInterval(() => setQTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [qTimeLeft, submitted, current]);

  /* ══════════════════════════════════════════
     ANTI-CHEAT: ALL DETECTION HOOKS
  ══════════════════════════════════════════ */
  useEffect(() => {
    if (submitted) return;

    /* 1. Fullscreen exit */
    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullScreen(inFs);
      if (!inFs && !submittedRef.current) {
        recordViolation("Exited fullscreen");
      } else {
        setToast(null);
      }
    };

    /* 2. Tab switch / window hidden (Page Visibility API) */
    const onVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        setTabWarning(true);
        recordViolation("Switched tab or minimized window");
      } else {
        setTabWarning(false);
      }
    };

    /* 3. Window loses focus (Alt+Tab, three-finger swipe, mission control) */
    const onBlur = () => {
      if (!submittedRef.current) {
        recordViolation("Window lost focus (possible screen switch)");
      }
    };

    /* 4. Copy / Cut / Paste */
    const onCopy = (e) => {
      e.preventDefault();
      recordViolation("Attempted to copy text");
    };
    const onPaste = (e) => {
      e.preventDefault();
      recordViolation("Attempted to paste text");
    };
    const onCut = (e) => {
      e.preventDefault();
      recordViolation("Attempted to cut text");
    };

    /* 5. Right-click context menu */
    const onContext = (e) => {
      e.preventDefault();
      showToast("Right-click is disabled during the exam.", "warn");
    };

    /* 6. Keyboard shortcuts — block all cheating combos */
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      /* Block: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+F */
      if (ctrl && ["c", "v", "x", "a", "s", "p", "f", "u"].includes(key)) {
        e.preventDefault();
        if (["c", "v", "x"].includes(key)) {
          recordViolation(`Keyboard shortcut blocked (${e.ctrlKey ? "Ctrl" : "Cmd"}+${key.toUpperCase()})`);
        } else {
          showToast(`Shortcut ${e.ctrlKey ? "Ctrl" : "Cmd"}+${key.toUpperCase()} is disabled.`, "warn");
        }
        return;
      }

      /* Block: PrintScreen */
      if (key === "printscreen") {
        e.preventDefault();
        recordViolation("Screenshot attempt detected");
        return;
      }

      /* Block: F12 DevTools */
      if (key === "f12") {
        e.preventDefault();
        showToast("Developer tools are disabled during the exam.", "warn");
        return;
      }

      /* Block: Ctrl+Shift+I/J/C (DevTools) */
      if (ctrl && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        showToast("Developer tools are disabled.", "warn");
        return;
      }

      /* Block: Escape (exits fullscreen) */
      if (key === "escape") {
        e.preventDefault();
        return;
      }
    };

    /* 7. Detect DevTools open via window size change */
    const onResize = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        showToast("Developer tools detected. Close them to continue.", "warn");
      }
    };

    /* 8. Block text selection via mouse */
    const onSelectStart = (e) => {
      /* allow selection inside textarea for typing */
      if (e.target.tagName === "TEXTAREA") return;
      e.preventDefault();
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("selectstart", onSelectStart);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("selectstart", onSelectStart);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
    };
  }, [submitted, recordViolation, showToast]);

  /* ── FS auto-submit countdown ── */
  useEffect(() => {
    if (!isFullScreen && !submitted) {
      setFsCountdown(5);
      fsRef.current = setInterval(() => {
        setFsCountdown(p => {
          if (p <= 1) { clearInterval(fsRef.current); doSubmit(true); return 0; }
          return p - 1;
        });
      }, 1000);
    } else {
      clearInterval(fsRef.current);
    }
    return () => clearInterval(fsRef.current);
  }, [isFullScreen, submitted]);

  /* ── Proctor camera thumbnail ── */
  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = s;
        if (camRef.current) { camRef.current.srcObject = s; camRef.current.play(); }
      } catch { }
    })();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  /* ── Helpers ── */
  const mcqScore = () =>
    QUESTIONS.reduce((acc, q, i) =>
      q.type === "mcq" && answers[i] === q.correct ? acc + 1 : acc, 0);

  const goNext = useCallback((auto = false) => {
    if (transitioning) return;
    if (!auto && current === QUESTIONS.length - 1) {
      setConfirmSubmit(true);
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) setCurrent(c => c + 1);
      else doSubmit();
      setTransitioning(false);
    }, 180);
  }, [transitioning, current]);

  const doSubmit = (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    streamRef.current?.getTracks().forEach(t => t.stop());
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch { }

    // Group performance by level
    const levels = ["Easy", "Medium", "Hard"];
    const levelStats = levels.map(lvl => {
      const levelQs = QUESTIONS.filter(q => q.level === lvl);
      const solved = levelQs.filter(q => {
        const idx = QUESTIONS.indexOf(q);
        const ans = answers[idx];
        return ans !== undefined && ans !== "" && !(Array.isArray(ans) && ans.length === 0);
      }).length;
      return {
        level: lvl,
        solved: solved,
        unsolved: levelQs.length - solved,
        total: levelQs.length
      };
    });

    // Calculate real stats
    const totalQuestions = QUESTIONS.length;
    let correctAnswers = 0;
    let unattempted = 0;
    let incorrectAnswers = 0;

    QUESTIONS.forEach((q, i) => {
      const ans = answers[i];
      if (ans === undefined || ans === "" || (Array.isArray(ans) && ans.length === 0)) {
        unattempted++;
      } else if (q.type === "mcq") {
        if (ans === q.correct) correctAnswers++;
        else incorrectAnswers++;
      } else {
        // For coding/viva, assume correct if answered for this demo
        correctAnswers++;
      }
    });

    const resultsData = {
      examTitle: "Live Assessment",
      totalScore: correctAnswers * 10,
      totalMarks: totalQuestions * 10,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      passed: (correctAnswers / totalQuestions) >= 0.4,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      timeTaken: `${Math.floor((Date.now() - startTime) / 60000)} min ${Math.floor(((Date.now() - startTime) % 60000) / 1000)} sec`,
      rank: Math.floor(Math.random() * 20) + 1,
      totalCandidates: 156,
      levelStats,
      topicBreakdown: SECTIONS_META.map(sec => {
        const secQs = QUESTIONS.filter(que => que.section === sec.key);
        const secDone = secQs.filter(que => {
          const idx = QUESTIONS.indexOf(que);
          const ans = answers[idx];
          return ans !== undefined && ans !== "" && !(Array.isArray(ans) && ans.length === 0);
        }).length;
        return {
          topic: sec.label,
          total: secQs.length,
          correct: secDone,
          percentage: Math.round((secDone / secQs.length) * 100),
          color: SEC_COLOR[sec.key]
        };
      })
    };

    localStorage.setItem("latestExamResults", JSON.stringify(resultsData));
    
    // Smooth transition
    setTimeout(() => {
      navigate("/results");
    }, 1200);
  };

  /* ── Derived ── */
  const q = QUESTIONS[current];
  const secColor = SEC_COLOR[q?.section] ?? "#0D9488";
  const isUrgent = qTimeLeft <= 10;
  const isWarn = qTimeLeft <= 20 && !isUrgent;
  const progressPct = (current / QUESTIONS.length) * 100;
  const answeredCount = Object.keys(answers).length;


  /* ════════════════════════════════
     EXAM SCREEN
  ════════════════════════════════ */
  return (
    <>
      {/* ── Tab switch overlay ── */}
      {tabWarning && !submitted && (
        <div className="tab-overlay">
          <div className="tab-overlay__card">
            <div className="tab-overlay__icon">👁️</div>
            <h2 className="tab-overlay__title">Tab Switch Detected</h2>
            <p className="tab-overlay__text">
              You left the exam window. This has been recorded as a violation.
            </p>
            <div className="tab-overlay__badge">
              Violation {violations}/{MAX_VIOLATIONS}
            </div>
            <button
              className="tab-overlay__btn"
              onClick={() => { setTabWarning(false); window.focus(); }}
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* ── Fullscreen overlay ── */}
      {!isFullScreen && !submitted && (
        <div className="fs-overlay">
          <div className="fs-card">
            <div className="fs-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="fs-title">Fullscreen Required</h2>
            <p className="fs-text">
              Exited fullscreen — this is a violation ({violations}/{MAX_VIOLATIONS}).
              Auto-submitting in
            </p>
            <div className="fs-count">{fsCountdown}</div>
            <button className="fs-btn" onClick={() => document.documentElement.requestFullscreen()}>
              Restore Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* ── Submit confirmation ── */}
      {confirmSubmit && (
        <SubmitModal count={answeredCount} onCancel={() => setConfirmSubmit(false)} onConfirm={() => doSubmit()} />
      )}

      <div className={`ex-shell ${(!isFullScreen || tabWarning) ? "ex-shell--blurred" : ""}`}>

        {/* ── Toast ── */}
        {toast && (
          <div className={`ex-toast ex-toast--${toast.type}`}>
            {toast.type === "critical" ? "🛑" : <Ic.Warn />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* ── TOP BAR ── */}
        <header className="ex-bar">
          <div className="ex-bar__brand">
            <img src="/logo.png" alt="ArithExam Logo" width="32" height="32" style={{ borderRadius: '8px', filter: 'drop-shadow(0 0 4px rgba(13,148,136,0.3))' }} />
            <div>
              <div className="ex-bar__name">ArithExam</div>
              <div className="ex-bar__session">Live Assessment</div>
            </div>
          </div>

          <div className="ex-bar__center">
            <div className="ex-bar__prog-wrap">
              <div className="ex-bar__prog-track">
                <div className="ex-bar__prog-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="ex-bar__prog-label">Question {current + 1} of {QUESTIONS.length}</span>
            </div>
          </div>

          <div className="ex-bar__right">
            {/* Violation counter */}
            <div className={`ex-violation-badge ${violations > 0 ? "ex-violation-badge--active" : ""}`}>
              <Ic.Eye />
              <span>{violations}/{MAX_VIOLATIONS} warnings</span>
            </div>

            {/* Timer */}
            <div className={`ex-qtimer ${isUrgent ? "ex-qtimer--urgent" : isWarn ? "ex-qtimer--warn" : ""}`}>
              <Ic.Clock />
              <span className="ex-qtimer__val">{fmt(qTimeLeft)}</span>
            </div>

            {/* Proctor cam */}
            <div className="ex-cam-thumb">
              <video ref={camRef} autoPlay muted playsInline className="ex-cam-thumb__vid" />
              <div className="ex-cam-thumb__dot" />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="ex-body">

          {/* ── SIDEBAR ── */}
          <aside className="ex-sidebar">

            {/* Question map */}
            <div className="ex-sidebar__block">
              <p className="ex-sidebar__label">Questions</p>
              <div className="ex-sidebar__questions">
                {QUESTIONS.map((que, i) => {
                  const isCur = i === current;
                  const isDone = answers[i] !== undefined;
                  const col = SEC_COLOR[que.section];
                  return (
                    <div
                      key={i}
                      className={`ex-qpill ${isCur ? "ex-qpill--active" : ""} ${isDone ? "ex-qpill--done" : ""}`}
                      style={isCur ? { borderColor: col, color: col } : {}}
                      title={`Q${i + 1} · ${que.section}`}
                    >
                      {isDone && !isCur
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        : <span>{i + 1}</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ex-sidebar__divider" />

            {/* Sections */}
            <div className="ex-sidebar__block">
              <p className="ex-sidebar__label">Sections</p>
              {SECTIONS_META.map(sec => {
                const done = QUESTIONS.filter((que, i) => que.section === sec.key && answers[i] !== undefined).length;
                const isActive = q.section === sec.key;
                const col = SEC_COLOR[sec.key];
                return (
                  <div
                    key={sec.key}
                    className={`ex-sec-item ${isActive ? "ex-sec-item--active" : ""}`}
                    style={isActive ? { borderLeftColor: col } : {}}
                  >
                    <div className="ex-sec-item__icon" style={isActive ? { color: col } : {}}>
                      {sec.type === "mcq" && <Ic.Check />}
                      {sec.type === "coding" && <Ic.Code />}
                      {sec.type === "viva" && <Ic.Msg />}
                    </div>
                    <div className="ex-sec-item__info">
                      <span className="ex-sec-item__name">{sec.label}</span>
                      <span className="ex-sec-item__count">{done}/{sec.total} done</span>
                    </div>
                    {isActive && <div className="ex-sec-item__pip" style={{ background: col }} />}
                  </div>
                );
              })}
            </div>

            <div className="ex-sidebar__divider" />

            {/* Status */}
            <div className="ex-sidebar__block">
              <p className="ex-sidebar__label">Proctoring</p>
              <div className="ex-status-row">
                <span className="ex-status-dot ex-status-dot--green" />
                <span className="ex-status-text">System OK</span>
              </div>
              <div className="ex-status-row">
                <span className={`ex-status-dot ${violations >= MAX_VIOLATIONS ? "ex-status-dot--red" : violations > 0 ? "ex-status-dot--amber" : "ex-status-dot--green"}`} />
                <span className="ex-status-text">Violations: {violations}/{MAX_VIOLATIONS}</span>
              </div>
              <div className="ex-status-row">
                <span className="ex-status-dot ex-status-dot--teal" />
                <span className="ex-status-text">Camera active</span>
              </div>
              <div className="ex-status-row">
                <span className="ex-status-dot ex-status-dot--teal" />
                <span className="ex-status-text">Screen monitored</span>
              </div>
            </div>

          </aside>

          {/* ── MAIN ── */}
          <main className={`ex-main ${transitioning ? "ex-main--fade" : ""}`}>

            <div className="ex-q-meta">
              <div className="ex-q-tag" style={{ background: `${secColor}0f`, color: secColor, borderColor: `${secColor}28` }}>
                {q.section} · {q.sectionFull}
              </div>
              <div className="ex-q-badge">
                {q.type === "mcq" && <><Ic.Check /> Multiple Choice</>}
                {q.type === "coding" && <><Ic.Code />  Coding Challenge</>}
                {q.type === "viva" && <><Ic.Msg />   Viva</>}
              </div>
              <div className="ex-q-badge" style={{ marginLeft: "auto", color: isUrgent ? "#dc2626" : isWarn ? "#7a5c0a" : "var(--text-3)" }}>
                <Ic.Clock />
                {q.type === "coding" ? `${q.duration / 60} min` : `${q.duration}s`} per question
              </div>
            </div>

            <div className="ex-q-card">
              <div className="ex-q-num" style={{ color: secColor }}>Q{current + 1}</div>
              <p className="ex-q-text">{q.text}</p>
            </div>

            {q.type === "mcq" && (
              <div className="ex-options">
                {q.options.map((opt, i) => {
                  const sel = answers[current] === i;
                  return (
                    <button
                      key={i}
                      className={`ex-opt ${sel ? "ex-opt--selected" : ""}`}
                      style={sel ? { borderColor: secColor, background: `${secColor}07` } : {}}
                      onClick={() => setAnswers({ ...answers, [current]: i })}
                    >
                      <span className="ex-opt__letter" style={sel ? { background: secColor, color: "#fff", borderColor: secColor } : {}}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="ex-opt__text">{opt}</span>
                      {sel && (
                        <span className="ex-opt__check" style={{ color: secColor }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {(q.type === "coding" || q.type === "viva") && (
              <div className="ex-editor-wrap">
                <div className="ex-editor-bar">
                  <div className="ex-editor-bar__dots"><span /><span /><span /></div>
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

            <div className="ex-foot">
              <div className="ex-foot__secure">
                <Ic.Shield />
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

function SubmitModal({ count, onCancel, onConfirm }) {
  return (
    <div className="tab-overlay">
      <div className="tab-overlay__card" style={{ maxWidth: 400 }}>
        <div className="tab-overlay__icon" style={{ background: 'rgba(13,148,136,0.1)', color: 'var(--teal)' }}>✓</div>
        <h2 className="tab-overlay__title" style={{ fontFamily: 'var(--header-font)' }}>Ready to Submit?</h2>
        <p className="tab-overlay__text">
          You have answered <strong>{count}</strong> out of <strong>{QUESTIONS.length}</strong> questions.
          You cannot change your answers after submission.
        </p>
        <div className="ex-modal-btns" style={{ display: 'flex', gap: 12, width: '100%', marginTop: 24 }}>
          <button className="ex-btn-cancel" onClick={onCancel}>Keep Reviewing</button>
          <button className="ex-btn-confirm" onClick={onConfirm}>Submit Now</button>
        </div>
      </div>
    </div>
  );
}