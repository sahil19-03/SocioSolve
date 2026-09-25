import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, utils } from '../services/api';
import { Sparkles, Compass, PlusCircle, LayoutDashboard, LogOut, Sun, Moon, Bell, Handshake, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const { user, isLoggedIn, logout, getDashboardPath } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  // Poll for unread notifications every 30s
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        if (res.success) setUnread(res.count);
      } catch (_) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="logo-wrap">
            <img src="/logo.png" alt="SocioSolve Logo" />
          </div>
          <span className="brand-text">Socio<span>Solve</span></span>
        </Link>

        {/* Center Nav Links */}
        <nav className="nav-links">
          <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Compass size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Explore
          </NavLink>
          <NavLink to="/submit-challenge" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Submit Problem
          </NavLink>
          <NavLink to="/industry" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Handshake size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Industry
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart2 size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
              Analytics
            </NavLink>
          )}
        </nav>

        {/* Right — Notification Bell + Theme Toggle + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Notification Bell */}
          {isLoggedIn && (
            <div style={{ position: 'relative' }}>
              <button className="theme-toggle" title="Notifications" onClick={() => navigate('/dashboard/student')}>
                <Bell size={18} />
              </button>
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#f43f5e', color: '#fff',
                  fontSize: '10px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{unread > 9 ? '9+' : unread}</span>
              )}
            </div>
          )}
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle"
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle colour theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLoggedIn && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to={getDashboardPath()} className="btn btn-secondary btn-sm">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--bg-card)',
                  padding: '4px 12px 4px 6px',
                  borderRadius: 9999,
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(getDashboardPath())}
              >
                <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                  {utils.initials(user.name)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-primary-400)', textTransform: 'capitalize' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Log Out"
                style={{ padding: '6px 10px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <Sparkles size={14} />
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
