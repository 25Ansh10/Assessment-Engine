import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { mockResults } from '../data/mockResults';
import { mockLeaderboard } from '../data/mockExams';
import '../styles/Results.css';

// Generate confetti pieces
const CONFETTI_COLORS = ['#FF6B5A', '#0066FF', '#00CC66', '#FFB340', '#CC33FF', '#00D4FF', '#FF88AA'];
const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  tx: `${(Math.random() - 0.5) * 600}px`,
  ty: `${(Math.random() - 0.5) * 400}px`,
  delay: `${Math.random() * 0.5}s`,
  shape: Math.random() > 0.5 ? '50%' : '3px',
  size: 8 + Math.random() * 10,
}));

export default function Results() {
  const [displayScore, setDisplayScore] = useState(0);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const animRef = useRef(null);
  const results = mockResults;

  // STITCH 7 — Count-up score animation
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const target = results.percentage;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(target * ease));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Trigger confetti after score animation
        if (results.passed) {
          setConfettiActive(true);
        }
      }
    };

    animRef.current = requestAnimationFrame(animate);

    // Animate bars with delay
    setTimeout(() => setBarsAnimated(true), 800);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const circumference = 2 * Math.PI * 80;
  const scoreOffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="results-page" id="results-page">
      {/* STITCH 10 — Confetti Burst */}
      <div className={`confetti-container ${confettiActive ? 'confetti-active' : ''}`}>
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              width: piece.size,
              height: piece.size,
              background: piece.color,
              borderRadius: piece.shape,
              animationDelay: piece.delay,
              '--tx': piece.tx,
              '--ty': piece.ty,
            }}
          />
        ))}
      </div>

      {/* Score Hero */}
      <div className="results-hero" id="score-hero">
        <div className="results-hero__label">{results.examTitle}</div>

        {/* STITCH 7 — Score Ring + Counter */}
        <div className="results-score-wrap">
          <svg width="200" height="200" className="results-score-svg">
            <defs>
              <linearGradient id="scoreGradientPass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00CC66" />
                <stop offset="100%" stopColor="#00FF88" />
              </linearGradient>
              <linearGradient id="scoreGradientFail" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4444" />
                <stop offset="100%" stopColor="#FF8888" />
              </linearGradient>
            </defs>
            <circle className="results-score-bg" cx="100" cy="100" r="80" />
            <circle
              className={`results-score-arc ${results.passed ? 'pass' : 'fail'}`}
              cx="100"
              cy="100"
              r="80"
              strokeDasharray={circumference}
              strokeDashoffset={scoreOffset}
            />
          </svg>
          <div className="results-score-value">
            <div className="results-score-number">{displayScore}</div>
            <div className="results-score-percent">/ 100</div>
          </div>
        </div>

        <div className={`results-hero__verdict ${results.passed ? 'pass' : 'fail'}`}>
          {results.passed ? '🎉 Congratulations! You Passed!' : '📚 Keep Practicing!'}
        </div>
        <p className="results-hero__message">
          {results.passed
            ? `Excellent performance! You scored ${results.totalScore} out of ${results.totalMarks} marks and ranked #${results.rank} among ${results.totalCandidates} candidates.`
            : `You scored ${results.totalScore} out of ${results.totalMarks}. Review the topic breakdown below and focus on areas for improvement.`
          }
        </p>
      </div>

      {/* Stat Bar */}
      <div className="results-stat-bar" id="stat-bar">
        <div className="results-stat-item">
          <div className="results-stat-item__value results-stat-item__value--correct">{results.correctAnswers}</div>
          <div className="results-stat-item__label">Correct</div>
        </div>
        <div className="results-stat-item">
          <div className="results-stat-item__value results-stat-item__value--incorrect">{results.incorrectAnswers}</div>
          <div className="results-stat-item__label">Incorrect</div>
        </div>
        <div className="results-stat-item">
          <div className="results-stat-item__value results-stat-item__value--unattempted">{results.unattempted}</div>
          <div className="results-stat-item__label">Unattempted</div>
        </div>
        <div className="results-stat-item">
          <div className="results-stat-item__value results-stat-item__value--time">{results.timeTaken}</div>
          <div className="results-stat-item__label">Time Taken</div>
        </div>
        <div className="results-stat-item">
          <div className="results-stat-item__value results-stat-item__value--rank">#{results.rank}</div>
          <div className="results-stat-item__label">Class Rank</div>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="results-topics" id="topic-breakdown">
        <h2 className="results-topics__title">Topic Performance</h2>
        {results.topicBreakdown.map((topic) => (
          <div key={topic.topic} className="topic-row">
            <div className="topic-row__name">{topic.topic}</div>
            <div className="topic-row__bar-wrap">
              <div
                className="topic-row__bar"
                style={{
                  width: barsAnimated ? `${topic.percentage}%` : '0%',
                  background: topic.color,
                }}
              >
                <span className="topic-row__bar-label">{topic.percentage}%</span>
              </div>
            </div>
            <div className="topic-row__score">{topic.correct}/{topic.total}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="results-leaderboard" id="results-leaderboard">
        <h2 className="results-leaderboard__title">🏆 Class Leaderboard</h2>
        <div className="leaderboard-list">
          {mockLeaderboard.slice(0, 5).map((entry) => (
            <div
              key={entry.rank}
              className={`leaderboard-row ${entry.name === 'Demo User' ? 'you' : ''}`}
            >
              <span className="leaderboard-row__medal">{entry.avatar}</span>
              <span className="leaderboard-row__rank">#{entry.rank}</span>
              <span className="leaderboard-row__name">
                {entry.name}{entry.name === 'Demo User' ? ' (You)' : ''}
              </span>
              <span className="leaderboard-row__score">{entry.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="results-cta">
        <Link to="/dashboard">
          <button className="results-cta__dashboard ripple-btn" id="back-dashboard-btn">
            Back to Dashboard
          </button>
        </Link>
        <button className="results-cta__review" id="view-review-btn">
          View Detailed Review
        </button>
      </div>
    </div>
  );
}
