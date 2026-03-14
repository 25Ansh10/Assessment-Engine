import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockExams, mockLeaderboard, mockMetrics } from '../data/mockExams';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');

  const sparkData = [
    [12, 18, 14, 22, 16, 20, 24],
    [8, 12, 10, 15, 18, 14, 16],
    [20, 14, 18, 12, 16, 22, 15],
    [5, 8, 6, 10, 8, 12, 9],
  ];

  const handleJoinTest = () => {
    if (testCode.trim().length >= 3) {
      navigate(`/join-test?code=${testCode.trim()}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoinTest();
  };

  return (
    <div className="dashboard-page">
      {/* STITCH 4 — Icon-Rail Sidebar */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar__logo">
          <span className="sidebar__logo-short">AE</span>
          <span className="sidebar__logo-full">ArithExam</span>
        </div>

        <nav className="sidebar__nav">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'exams', icon: '📝', label: 'My Exams' },
            { id: 'results', icon: '🏆', label: 'Results' },
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map((item) => (
            <div
              key={item.id}
              className={`sidebar__item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="sidebar__item-icon">{item.icon}</span>
              <span className="sidebar__item-label">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <div className="sidebar__item" onClick={logout}>
            <span className="sidebar__item-icon">🚪</span>
            <span className="sidebar__item-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Test Code Pill */}
        <div className="test-code-pill" id="test-code-pill">
          <input
            type="text"
            className="test-code-pill__input"
            placeholder="Enter test code to join an exam..."
            value={testCode}
            onChange={(e) => setTestCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={6}
          />
          <button className="test-code-pill__btn" onClick={handleJoinTest}>
            Join Test
          </button>
        </div>

        {/* Welcome */}
        <div className="dashboard-header">
          <div className="dashboard-header__greeting">Good Evening</div>
          <h1 className="dashboard-header__name">Welcome back, {user?.name || 'Student'}</h1>
        </div>

        {/* STITCH 1 — Bento Grid */}
        <div className="bento-grid" id="bento-grid">
          {/* Metric Tiles */}
          {[
            { key: 'metric1', label: 'Exams Completed', value: mockMetrics.examsCompleted, idx: 0 },
            { key: 'metric2', label: 'Average Score', value: `${mockMetrics.averageScore}%`, idx: 1 },
            { key: 'metric3', label: 'Class Rank', value: `#${mockMetrics.classRank}`, idx: 2 },
            { key: 'metric4', label: 'Active Exams', value: mockMetrics.activeExams, idx: 3 },
          ].map((m) => (
            <div key={m.key} className={`metric-tile metric-tile--${m.idx + 1}`}>
              <div className="metric-tile__label">{m.label}</div>
              <div className="metric-tile__value">{m.value}</div>
              <div className="metric-tile__spark">
                {sparkData[m.idx].map((h, i) => (
                  <div
                    key={i}
                    className="metric-tile__spark-bar"
                    style={{ height: `${(h / 24) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Exam Cards */}
          {mockExams.map((exam, idx) => (
            <div
              key={exam.id}
              className={`exam-card exam-card--${idx + 1} exam-card--${exam.status}`}
            >
              <div className="exam-card__stripe"></div>
              <div className="exam-card__header">
                <div className="exam-card__title">{exam.title}</div>
                <span className={`exam-card__badge exam-card__badge--${exam.status}`}>
                  {exam.status}
                </span>
              </div>
              <div className="exam-card__subject">{exam.subject}</div>
              <div className="exam-card__meta">
                <div className="exam-card__meta-item">
                  <strong>{exam.duration}m</strong> Duration
                </div>
                <div className="exam-card__meta-item">
                  <strong>{exam.totalQuestions}</strong> Questions
                </div>
                <div className="exam-card__meta-item">
                  <strong>{exam.totalMarks}</strong> Marks
                </div>
              </div>
              {exam.status === 'live' && (
                <button
                  className="exam-card__action ripple-btn"
                  onClick={() => navigate(`/join-test?code=${exam.testCode}`)}
                >
                  Join Now →
                </button>
              )}
            </div>
          ))}

          {/* Leaderboard Strip */}
          <div className="leaderboard-strip" id="leaderboard">
            <div className="leaderboard-strip__title">🏆 Leaderboard</div>
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`leaderboard-strip__item ${entry.name === 'Demo User' ? 'you' : ''}`}
              >
                <span className="leaderboard-strip__rank">#{entry.rank}</span>
                <span className="leaderboard-strip__avatar">{entry.avatar}</span>
                <div className="leaderboard-strip__info">
                  <div className="leaderboard-strip__name">
                    {entry.name}{entry.name === 'Demo User' ? ' (You)' : ''}
                  </div>
                  <div className="leaderboard-strip__score">{entry.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
