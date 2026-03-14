import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" id="login-card">

        {/* Logo — class names match CSS exactly */}
        <div className="login-card__logo">ArithExam</div>
        <div className="login-card__platform">Assessment Platform</div>

        <h1 className="login-card__heading">Welcome Back</h1>
        <p className="login-card__subheading">Sign in to your candidate account</p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>

          <div className="login-float-field">
            <input
              type="email"
              id="login-email"
              name="email"
              className="login-float-field__input"
              placeholder=" "
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <label htmlFor="login-email" className="login-float-field__label">
              Email Address
            </label>
          </div>

          <div className="login-float-field">
            <input
              type="password"
              id="login-password"
              name="password"
              className="login-float-field__input"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <label htmlFor="login-password" className="login-float-field__label">
              Password
            </label>
          </div>

          <button
            type="submit"
            className="login-submit"
            id="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <div className="login-links">
          <Link to="/register">Create Account</Link>
          <a href="#forgot">Forgot Password?</a>
        </div>

        <div className="login-divider">or</div>

        {/* Admin link — Link is the direct styled element, no wrapper div */}
        <Link to="/admin-login" className="login-admin-link">
          Sign in as Administrator →
        </Link>

      </div>
    </div>
  );
}