import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user?.name || 'Innovator'}!`);
      if (redirect) {
        navigate(redirect);
      } else {
        navigate(getDashboardPath(res.user?.role));
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '40px 36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="brand-icon" style={{ margin: '0 auto 16px', width: 48, height: 48, fontSize: '1.6rem' }}>⚡</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Welcome Back</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Sign in to SocioSolve to access your projects and challenges
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="name@university.edu or domain.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-full"
            style={{ padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer info */}
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: '0.875rem' }}>
          <span className="text-secondary">New to SocioSolve? </span>
          <Link to="/register" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
