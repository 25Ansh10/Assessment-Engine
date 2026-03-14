import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamGuard from '../hooks/useExamGuard';
import useWebcam from '../hooks/useWebcam';
import { mockQuestions } from '../data/mockExams';
import '../styles/Exam.css';

const EXAM_DURATION_SECONDS = 60 * 60; // 60 min

export default function Exam() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const navigate = useNavigate();
  const { videoRef, faceDetected, startWebcam } = useWebcam();
  const timerRef = useRef(null);

  const handleAutoSubmit = useCallback(() => {
    setShowSubmitModal(true);
  }, []);

  const { warnings } = useExamGuard({
    examId: 'EX001',
    onAutoSubmit: handleAutoSubmit,
  });

  // Start webcam
  useEffect(() => {
    startWebcam();
  }, [startWebcam]);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowSubmitModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const questions = mockQuestions;
  const question = questions[currentQ];

  const selectAnswer = (optionId) => {
    setAnswers({ ...answers, [question.id]: optionId });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQ)) newFlagged.delete(currentQ);
    else newFlagged.add(currentQ);
    setFlagged(newFlagged);
  };

  // Timer calculations
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 54;
  const timerProgress = (timeLeft / EXAM_DURATION_SECONDS) * circumference;
  const timerColor = timeLeft <= 300 ? 'red' : timeLeft <= 600 ? 'amber' : 'green';

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    navigate('/results');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (showSubmitModal) {
        if (e.key === 'Escape') setShowSubmitModal(false);
        if (e.key === 'Enter') confirmSubmit();
        return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSubmitModal]);

  return (
    <div className="exam-page" id="exam-interface">
      {/* Warning Toasts */}
      {warnings.length > 0 && (
        <div className="warning-toast-container">
          {warnings.map((w) => (
            <div key={w.id} className="warning-toast">
              <span className="warning-toast__icon">⚠️</span>
              <div className="warning-toast__content">
                <div className="warning-toast__title">{w.type.replace('-', ' ').toUpperCase()}</div>
                <div className="warning-toast__message">{w.message}</div>
              </div>
              <span className="warning-toast__count">{w.count}/{w.max}</span>
            </div>
          ))}
        </div>
      )}

      {/* LEFT: Question Navigator */}
      <div className="question-nav" id="question-nav">
        <div className="question-nav__title">Questions</div>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className={`question-dot ${
              idx === currentQ ? 'current' :
              answers[q.id] ? 'answered' :
              flagged.has(idx) ? 'flagged' :
              'unanswered'
            }`}
            onClick={() => setCurrentQ(idx)}
          >
            {idx + 1}
          </div>
        ))}
      </div>

      {/* CENTER: Question */}
      <div className="question-area">
        <div className="question-area__header">
          <span className="question-area__number">Question {currentQ + 1} of {questions.length}</span>
          <span className="question-area__points">{question.points} pts</span>
        </div>

        <p className="question-area__text">{question.text}</p>

        <div className="options-list">
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className={`option-card ${answers[question.id] === opt.id ? 'selected' : ''}`}
              onClick={() => selectAnswer(opt.id)}
              id={`option-${opt.id}`}
            >
              <div className="option-card__letter">{opt.id}</div>
              <div className="option-card__text">{opt.text}</div>
            </div>
          ))}
        </div>

        <div className="question-footer">
          <button
            className={`question-footer__flag ${flagged.has(currentQ) ? 'flagged' : ''}`}
            onClick={toggleFlag}
          >
            {flagged.has(currentQ) ? '🚩 Flagged' : '🏳️ Flag'}
          </button>

          <div className="question-footer__nav">
            {currentQ > 0 && (
              <button className="question-footer__prev" onClick={() => setCurrentQ(currentQ - 1)}>
                ← Previous
              </button>
            )}
            {currentQ < questions.length - 1 ? (
              <button className="question-footer__next" onClick={() => setCurrentQ(currentQ + 1)}>
                Next →
              </button>
            ) : (
              <button className="question-footer__submit" onClick={handleSubmit} id="submit-exam-btn">
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Sidebar */}
      <div className="exam-sidebar">
        {/* Hex Webcam */}
        <div className="exam-webcam">
          <div className="exam-webcam__hex-wrap">
            <div className={`exam-webcam__hex-border ${!faceDetected ? 'no-face' : ''}`}></div>
            <video ref={videoRef} autoPlay muted playsInline className="exam-webcam__video" />
          </div>
        </div>
        <div className="exam-webcam__label">
          {faceDetected ? '✓ Face verified' : '⚠ Face not detected'}
        </div>

        {/* STITCH 5 — Circular Timer */}
        <div className="exam-timer" id="exam-timer">
          <svg width="130" height="130" className="exam-timer__svg">
            <circle className="exam-timer__bg" cx="65" cy="65" r="54" />
            <circle
              className={`exam-timer__arc ${timerColor}`}
              cx="65"
              cy="65"
              r="54"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - timerProgress}
            />
          </svg>
          <div className="exam-timer__time">{formatTime(timeLeft)}</div>
          <div className="exam-timer__label">Time Remaining</div>
        </div>

        {/* Auto-Save */}
        <div className="autosave-indicator">
          <div className="autosave-dot"></div>
          Auto-saving...
        </div>

        {/* Stats */}
        <div className="exam-stats">
          <div className="exam-stat-row">
            <span className="exam-stat-row__label">Answered</span>
            <span className="exam-stat-row__value">{answeredCount}</span>
          </div>
          <div className="exam-stat-row">
            <span className="exam-stat-row__label">Unanswered</span>
            <span className="exam-stat-row__value">{unansweredCount}</span>
          </div>
          <div className="exam-stat-row">
            <span className="exam-stat-row__label">Flagged</span>
            <span className="exam-stat-row__value">{flagged.size}</span>
          </div>
        </div>
      </div>

      {/* PAGE 9 — Submission Modal */}
      {showSubmitModal && (
        <div className="submission-overlay" id="submission-modal">
          <div className="submission-backdrop"></div>
          <div className="submission-modal">
            <div className="submission-modal__icon">📝</div>
            <h2 className="submission-modal__title">Submit Examination?</h2>
            <p className="submission-modal__desc">
              Review your progress before finalizing your exam submission.
            </p>
            <div className="submission-modal__stats">
              <div className="submission-modal__stat">
                <div className="submission-modal__stat-value submission-modal__stat-value--answered">
                  {answeredCount}
                </div>
                <div className="submission-modal__stat-label">Answered</div>
              </div>
              <div className="submission-modal__stat">
                <div className="submission-modal__stat-value submission-modal__stat-value--unanswered">
                  {unansweredCount}
                </div>
                <div className="submission-modal__stat-label">Unanswered</div>
              </div>
              <div className="submission-modal__stat">
                <div className="submission-modal__stat-value submission-modal__stat-value--flagged">
                  {flagged.size}
                </div>
                <div className="submission-modal__stat-label">Flagged</div>
              </div>
            </div>
            <div className="submission-modal__actions">
              <button
                className="submission-modal__back"
                onClick={() => setShowSubmitModal(false)}
              >
                Go Back
              </button>
              <button
                className="submission-modal__submit"
                onClick={confirmSubmit}
                id="confirm-submit-btn"
              >
                Submit Final
              </button>
            </div>
            <div className="submission-modal__hints">
              <span>Esc to cancel</span>
              <span>Enter to confirm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
