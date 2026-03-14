import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/AdminLogin.css';

export default function AdminLogin() {
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
      setError('Please enter admin credentials');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password, true);
      navigate('/dashboard');
    } catch {
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* STITCH 2 Variant — Navy Vault Left */}
      <div className="admin-left">
        <div className="admin-left__lines"></div>
        <div className="admin-left__shield">🛡️</div>
        <h1 className="admin-left__title">Administrator<br />Portal</h1>
        <p className="admin-left__subtitle">
          Secure access for authorized personnel only
        </p>
      </div>

      {/* Right: Form */}
      <div className="admin-right">
        <div className="admin-badge">
          <span>🔒</span> Restricted Access
        </div>

        <h1 className="admin-right__title">Admin Sign In</h1>
        <p className="admin-right__subtitle">Enter your administrator credentials</p>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-float-field">
            <input
              type="email"
              id="admin-email"
              name="email"
              className="admin-float-field__input"
              placeholder=" "
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <label htmlFor="admin-email" className="admin-float-field__label">Admin Email</label>
          </div>

          <div className="admin-float-field">
            <input
              type="password"
              id="admin-password"
              name="password"
              className="admin-float-field__input"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <label htmlFor="admin-password" className="admin-float-field__label">Admin Password</label>
          </div>

          <button
            type="submit"
            className="admin-submit ripple-btn"
            id="admin-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access Portal'}
          </button>
        </form>

        <div className="admin-disclaimer">
          <p>
            ⚠ This is the only admin-facing page in AritExam. There is no admin dashboard,
            candidate management, or analytics panel. This login form is a standalone
            authentication interface for administrative verification only.
          </p>
        </div>

        <div className="admin-back-link">
          <Link to="/login">← Back to Candidate Login</Link>
        </div>
      </div>
    </div>
  );
}
