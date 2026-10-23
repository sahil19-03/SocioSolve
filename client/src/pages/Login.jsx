import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Lock, Mail, Eye, EyeOff, ChevronDown } from 'lucide-react';

// Demo panel: only the email is pre-filled. Password must always be entered manually.

const demoRoles = [
  { label: 'Admin', email: 'admin@example.invalid' },
  { label: 'Student', email: 'student.one@example.invalid' },
  { label: 'Problem Submitter', email: 'citizen@example.invalid' },
  { label: 'Nodal Officer', email: 'nodal.officer@example.invalid' },
  { label: 'University Admin', email: 'university.admin@example.invalid' },
  { label: 'Faculty', email: 'faculty@example.invalid' },
  { label: 'Domain Expert', email: 'expert@example.invalid' },
  { label: 'Industry Partner', email: 'industry.partner@example.invalid' },
  { label: 'CSR Partner', email: 'csr.partner@example.invalid' },
  { label: 'MSME Partner', email: 'msme.partner@example.invalid' },
  { label: 'Community Member', email: 'community.member@example.invalid' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user?.name || 'Innovator'}!`);
      // Always open the dashboard for the logged-in role,
      // never follow a stale redirect from a previous role's session.
      navigate(getDashboardPath(res.user?.role), { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Only the email is filled — password must be entered manually.
  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow" />

      <div className="card auth-card auth-card--login">
        {/* Brand & Emblem Header */}
        <div className="auth-header">
          <Link to="/" className="auth-brand-link" title="SocioSolve National Platform">
            <div className="auth-logo-badge">
              <img src="/logo.png" alt="SocioSolve Emblem" />
            </div>
            <div className="auth-brand-title">
              Socio<span>Solve</span>
            </div>
            <span className="auth-brand-pill">
              National Innovation Network
            </span>
          </Link>

          <h1 className="auth-heading">Welcome Back</h1>
          <p className="auth-lead">
            Sign in to access your challenges, team collaborations, and prototype evaluations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-5">
            <label className="form-label" htmlFor="loginEmail">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <Mail size={18} />
              </span>
              <input
                id="loginEmail"
                type="email"
                className="auth-input"
                placeholder="name@university.edu or domain.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" htmlFor="loginPassword" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-input-action"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
            style={{ padding: '13px', fontSize: '0.98rem' }}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo accounts — email only. Password is never exposed in the UI. */}
        <details className="auth-demo-hint" style={{ marginTop: 20 }}>
          <summary>
            <ChevronDown size={14} style={{ transition: 'transform 0.2s' }} />
            Sign in with a demo account
          </summary>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {demoRoles.map(({ label, email: demoEmail }) => (
              <button
                key={demoEmail}
                type="button"
                className="auth-demo-pill"
                onClick={() => fillDemoAccount(demoEmail)}
                title={`Use ${label} account`}
              >
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            Click a role to fill the email address, then enter the password manually and sign in.
          </p>
        </details>


        {/* Footer info */}
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: '0.9rem' }}>
          <span className="text-secondary">New to <span style={{ color: 'var(--color-primary-400)', fontWeight: 700 }}>SocioSolve</span>? </span>
          <Link to="/register" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
