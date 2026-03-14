import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Register.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setError('');
  };

  const getStrength = () => {
    const p = form.password;
    if (!p) return '';
    if (p.length < 4) return 'weak';
    if (p.length < 6) return 'fair';
    if (p.length < 8) return 'good';
    return 'strong';
  };

  const strengthLabels = { weak: '🔴 Weak', fair: '🟡 Fair', good: '🟢 Good', strong: '🟣 Unbreakable' };
  const strengthColors = { weak: '#FF4444', fair: '#FFAA00', good: '#00CC66', strong: '#6C3AED' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Registration failed');
  };

  return (
    <div className="register-page">
      {/* Left — Brand + Morphing Blobs */}
      <div className="register-left">
        <div className="register-left__lines"></div>
        <div className="register-left__blob register-left__blob--1"></div>
        <div className="register-left__blob register-left__blob--2"></div>
        <div className="register-left__shape register-left__shape--circle"></div>
        <div className="register-left__shape register-left__shape--ring"></div>
        <div className="register-left__shape register-left__shape--square"></div>

        <div className="register-left__brand">
          <div className="register-left__logo">Arit<br/>Exam</div>
          <p className="register-left__tagline">
            Join the next generation of intelligent online assessments. Secure, fair, and beautifully designed.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="register-right">
        <span className="register-right__step">Step 1 of 1</span>
        <h1 className="register-right__title">Create Account</h1>
        <p className="register-right__subtitle">Get started with your free AritExam account</p>

        <form className="register-form" onSubmit={handleSubmit} id="register-form">
          <div className="float-field">
            <input
              type="text"
              id="reg-name"
              placeholder=" "
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <label htmlFor="reg-name">Full Name</label>
          </div>

          <div className="float-field">
            <input
              type="email"
              id="reg-email"
              placeholder=" "
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <label htmlFor="reg-email">Email Address</label>
          </div>

          <div className="float-field">
            <input
              type="password"
              id="reg-password"
              placeholder=" "
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            <label htmlFor="reg-password">Password</label>
          </div>

          {form.password && (
            <>
              <div className="password-strength">
                <div className={`password-strength__fill ${getStrength()}`}></div>
              </div>
              <div className="password-strength__label" style={{ color: strengthColors[getStrength()] }}>
                {strengthLabels[getStrength()]}
              </div>
            </>
          )}

          <div className="float-field">
            <input
              type="password"
              id="reg-confirm"
              placeholder=" "
              value={form.confirm}
              onChange={(e) => handleChange('confirm', e.target.value)}
            />
            <label htmlFor="reg-confirm">Confirm Password</label>
          </div>

          {form.confirm && (
            <div
              className="password-match"
              style={{ color: form.password === form.confirm ? '#00CC66' : '#FF4444' }}
            >
              {form.password === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}

          {error && <div style={{ color: '#FF4444', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</div>}

          <button type="submit" className="register-submit ripple-btn magnetic-btn" id="register-btn">
            Create Account
          </button>

          <div className="register-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
