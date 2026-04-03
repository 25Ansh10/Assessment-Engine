import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Target, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { mockExams } from '../data/mockExams';
import '../styles/JoinTest.css';

export default function JoinTest() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [exam, setExam] = useState(null);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-fill from URL query
  useEffect(() => {
    const preCode = searchParams.get('code');
    if (preCode && preCode.length <= 6) {
      const chars = preCode.toUpperCase().split('');
      const newCode = [...code];
      chars.forEach((c, i) => { if (i < 6) newCode[i] = c; });
      setCode(newCode);
    }
  }, []);

  // Validate code whenever it changes
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      const found = mockExams.find((e) => e.testCode === fullCode);
      if (found) {
        setExam(found);
        setError('');
      } else {
        setExam(null);
        setError('Invalid test code. Please check and try again.');
        triggerShake();
      }
    } else {
      setExam(null);
      setError('');
    }
  }, [code]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleInput = (index, value) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    // Auto-tab forward
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Auto-back on delete
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((c, i) => { if (i < 6) newCode[i] = c; });
    setCode(newCode);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const filledCount = code.filter((c) => c).length;
  const circumference = 2 * Math.PI * 24;
  const progress = (filledCount / 6) * circumference;

  return (
    <div className="join-test-page">
      <div className="join-test-content">
        <div className="join-test-content__icon" style={{display:'flex',justifyContent:'center'}}><Target size={40} color="var(--primary)" strokeWidth={1.5} /></div>
        <h1 className="join-test-content__title">Join an Exam</h1>
        <p className="join-test-content__subtitle">Enter the 6-character test code provided by your instructor</p>

        {/* 6-Box Code Input */}
        <div className="code-input-row" id="code-input">
          {code.map((char, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              className={`code-input-box ${char ? 'filled' : ''} ${shake && !exam ? 'err' : ''}`}
              value={char}
              onChange={(e) => handleInput(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
              maxLength={1}
              autoFocus={idx === 0}
            />
          ))}
        </div>

        {/* Progress Ring */}
        <div className="code-progress">
          <svg width="64" height="64" className="code-progress__ring">
            <circle className="code-progress__circle-bg" cx="32" cy="32" r="24" />
            <circle
              className="code-progress__circle"
              cx="32"
              cy="32"
              r="24"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
            />
            <text
              x="32"
              y="36"
              textAnchor="middle"
              className="code-progress__text"
            >
              {filledCount}/6
            </text>
          </svg>
        </div>

        {error && <div className="join-test-error">{error}</div>}

        {/* Exam Preview Card */}
        {exam && (
          <div className="exam-preview" id="exam-preview">
            <div className="exam-preview__title">{exam.title}</div>
            <div className="exam-preview__meta">
              <div className="exam-preview__meta-item">
                <div className="exam-preview__meta-value">{exam.duration}m</div>
                <div className="exam-preview__meta-label">Duration</div>
              </div>
              <div className="exam-preview__meta-item">
                <div className="exam-preview__meta-value">{exam.totalQuestions}</div>
                <div className="exam-preview__meta-label">Questions</div>
              </div>
              <div className="exam-preview__meta-item">
                <div className="exam-preview__meta-value">{exam.totalMarks}</div>
                <div className="exam-preview__meta-label">Total Marks</div>
              </div>
              <div className="exam-preview__meta-item">
                <div className="exam-preview__meta-value">{exam.subject}</div>
                <div className="exam-preview__meta-label">Subject</div>
              </div>
            </div>
            {exam.proctored && (
              <div className="exam-preview__proctored" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Lock size={14} style={{marginRight:'6px'}}/> AI-Proctored Examination
              </div>
            )}
          </div>
        )}

        {/* Proceed Button */}
        <button
          className={`join-test-proceed ${exam ? 'active' : 'ghosted'}`}
          onClick={() => exam && navigate('/pre-exam')}
          disabled={!exam}
          id="proceed-btn"
        >
          {exam ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>Proceed to Verification <ArrowRight size={16}/></span> : 'Enter Test Code'}
        </button>

        <div className="join-test-back">
          <Link to="/dashboard" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><ArrowLeft size={16}/> Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
