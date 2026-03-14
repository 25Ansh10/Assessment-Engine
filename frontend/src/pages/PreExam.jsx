import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useWebcam from '../hooks/useWebcam';
import '../styles/PreExam.css';

const STEPS = [
  { id: 1, label: 'Face Capture', desc: 'Verify your identity' },
  { id: 2, label: 'System Check', desc: 'Ensure compatibility' },
  { id: 3, label: 'Rules & Consent', desc: 'Read exam rules' },
  { id: 4, label: 'Permissions', desc: 'Grant access' },
];

const RULES = [
  { icon: '🖥️', title: 'Fullscreen Required', desc: 'The exam will run in fullscreen mode. Exiting fullscreen counts as a violation.' },
  { icon: '📷', title: 'Camera Always On', desc: 'Your webcam must remain active throughout the exam for identity verification.' },
  { icon: '🚫', title: 'No Tab Switching', desc: 'Switching tabs or windows will trigger a warning. 3 warnings = auto-submit.' },
  { icon: '📋', title: 'No Copy/Paste', desc: 'Clipboard actions (Ctrl+C, Ctrl+V) are disabled during the exam.' },
  { icon: '⏱️', title: 'Timed Assessment', desc: 'The timer starts when you begin. Unanswered questions remain unanswered.' },
  { icon: '💾', title: 'Auto-Save', desc: 'Your answers are automatically saved every 60 seconds.' },
  { icon: '🔒', title: 'One Attempt Only', desc: 'You cannot re-take the exam once submitted.' },
];

export default function PreExam() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [systemChecks, setSystemChecks] = useState([]);
  const [consent, setConsent] = useState(false);
  const [permissions, setPermissions] = useState({ camera: 'pending', mic: 'pending', fullscreen: 'pending', notifications: 'pending' });
  const { videoRef, isActive, faceDetected, startWebcam } = useWebcam();
  const navigate = useNavigate();
  const rulesRef = useRef(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  // Start webcam on step 1
  useEffect(() => {
    if (currentStep === 1 && !isActive) {
      startWebcam();
    }
  }, [currentStep, isActive, startWebcam]);

  // Animate system checks on step 2
  useEffect(() => {
    if (currentStep === 2 && systemChecks.length === 0) {
      const checks = [
        { id: 'camera', name: 'Camera', icon: '📷', status: 'checking' },
        { id: 'mic', name: 'Microphone', icon: '🎤', status: 'checking' },
        { id: 'internet', name: 'Internet Speed', icon: '🌐', status: 'checking' },
        { id: 'browser', name: 'Browser', icon: '🖥️', status: 'checking' },
      ];
      setSystemChecks(checks);

      checks.forEach((check, i) => {
        setTimeout(() => {
          setSystemChecks((prev) =>
            prev.map((c) => (c.id === check.id ? { ...c, status: 'pass', visible: true } : c))
          );
        }, 800 * (i + 1));
      });
    }
  }, [currentStep]);

  const handleCapture = () => {
    setFaceCaptured(true);
  };

  const handleRulesScroll = () => {
    if (rulesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = rulesRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setScrolledToBottom(true);
      }
    }
  };

  const handleGrantPermission = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: 'granted' }));
  };

  const completeStep = () => {
    setCompletedSteps((prev) => [...prev, currentStep]);
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const canAdvance = () => {
    if (currentStep === 1) return faceCaptured;
    if (currentStep === 2) return systemChecks.every((c) => c.status === 'pass');
    if (currentStep === 3) return consent;
    if (currentStep === 4) return permissions.camera === 'granted' && permissions.mic === 'granted';
    return false;
  };

  const handleStartExam = () => {
    navigate('/exam');
  };

  return (
    <div className="preexam-page">
      {/* STITCH 8 — Launch Sequence Stepper */}
      <div className="stepper-panel">
        <div className="stepper-panel__title">Launch Sequence</div>
        <div className="stepper-list">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`step-item ${currentStep === step.id ? 'active' : ''} ${completedSteps.includes(step.id) ? 'completed' : ''}`}
            >
              <div className="step-item__indicator">
                <div className="step-item__circle">
                  {completedSteps.includes(step.id) ? '✓' : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="step-item__line">
                    <div className="step-item__line-fill"></div>
                  </div>
                )}
              </div>
              <div className="step-item__content">
                <div className="step-item__label">{step.label}</div>
                <div className="step-item__desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="step-content-panel">
        <div className="step-content-panel__header">
          <div className="step-content-panel__step-label">Step {currentStep} of 4</div>
          <h1 className="step-content-panel__title">{STEPS[currentStep - 1].label}</h1>
        </div>

        {/* Step 1: Face Capture */}
        {currentStep === 1 && (
          <div className="face-capture" id="face-capture">
            <div className="hex-webcam-wrap">
              <div className={`hex-webcam-border ${faceDetected ? 'detected' : ''}`}></div>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="hex-webcam-video"
              />
              <div className="face-capture__brackets"></div>
            </div>
            <div className={`face-capture__status ${faceDetected ? 'ok' : ''}`}>
              {faceDetected ? '✓ Face detected' : '⏳ Position your face in the frame'}
            </div>
            <button
              className="face-capture__btn ripple-btn"
              onClick={handleCapture}
              disabled={!faceDetected || faceCaptured}
              id="capture-btn"
            >
              {faceCaptured ? '✓ Identity Verified' : 'Capture & Verify'}
            </button>
          </div>
        )}

        {/* Step 2: System Check */}
        {currentStep === 2 && (
          <div className="system-checks" id="system-checks">
            {systemChecks.map((check) => (
              <div key={check.id} className={`check-card ${check.visible ? 'visible' : ''} ${check.status}`}>
                <div className="check-card__icon">{check.icon}</div>
                <div className="check-card__info">
                  <div className="check-card__name">{check.name}</div>
                  <div className="check-card__status">
                    {check.status === 'checking' ? 'Checking...' : check.status === 'pass' ? 'Compatible' : 'Issue found'}
                  </div>
                </div>
                <div className="check-card__result">
                  {check.status === 'checking' ? '⏳' : check.status === 'pass' ? '✅' : '❌'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Rules */}
        {currentStep === 3 && (
          <div>
            <div className="rules-list" ref={rulesRef} onScroll={handleRulesScroll}>
              {RULES.map((rule, i) => (
                <div key={i} className="rule-card">
                  <div className="rule-card__icon">{rule.icon}</div>
                  <div className="rule-card__content">
                    <h4>{rule.title}</h4>
                    <p>{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="consent-check" id="consent-check">
              <input
                type="checkbox"
                id="consent-input"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <label htmlFor="consent-input">
                I have read and agree to all exam rules and anti-cheat policies
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Permissions */}
        {currentStep === 4 && (
          <div className="permissions-grid" id="permissions-grid">
            {[
              { key: 'camera', icon: '📷', name: 'Camera' },
              { key: 'mic', icon: '🎤', name: 'Microphone' },
              { key: 'fullscreen', icon: '🖥️', name: 'Fullscreen' },
              { key: 'notifications', icon: '🔔', name: 'Notifications' },
            ].map((perm) => (
              <div key={perm.key} className="perm-card">
                <div className="perm-card__icon">{perm.icon}</div>
                <div className="perm-card__name">{perm.name}</div>
                {permissions[perm.key] === 'pending' ? (
                  <button
                    className="perm-card__btn perm-card__btn--grant"
                    onClick={() => handleGrantPermission(perm.key)}
                  >
                    Grant Access
                  </button>
                ) : permissions[perm.key] === 'granted' ? (
                  <span className="perm-card__btn perm-card__btn--granted">✓ Granted</span>
                ) : (
                  <span className="perm-card__btn perm-card__btn--denied">✗ Denied</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step Navigation */}
        <div className="step-nav">
          {currentStep > 1 ? (
            <button className="step-nav__back" onClick={() => setCurrentStep(currentStep - 1)}>
              ← Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <button
              className="step-nav__next"
              onClick={completeStep}
              disabled={!canAdvance()}
              id="next-step-btn"
            >
              Next Step →
            </button>
          ) : (
            <button
              className="step-nav__start"
              onClick={handleStartExam}
              disabled={!canAdvance()}
              id="start-exam-btn"
            >
              🚀 Start Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
