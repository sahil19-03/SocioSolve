import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, utils } from '../services/api';
import { Sun, Moon, Bell, LogOut, Sparkles, CheckCheck } from 'lucide-react';

export default function TopHeader() {
  const { user, isLoggedIn, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef(null);

  // Poll notifications when logged in
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

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const loadNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await api.get('/notifications?limit=8');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (_) {}
    finally {
      setLoadingNotifs(false);
    }
  };

  const toggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setUnread(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (_) {}
    }
    if (notif.link) {
      setShowNotifications(false);
      navigate(notif.link);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = (path) => {
    if (path.startsWith('/profile')) return 'My Profile & Account';
    if (path.startsWith('/dashboard/student')) return 'Student Portal';
    if (path.startsWith('/dashboard/admin')) return 'Admin Console';
    if (path.startsWith('/dashboard/submitter')) return 'Submitter Portal';
    if (path.startsWith('/dashboard/faculty')) return 'Faculty Guide';
    if (path.startsWith('/dashboard/expert')) return 'Expert Evaluator';
    if (path.startsWith('/dashboard/nodal')) return 'Govt Nodal Governance';
    if (path.startsWith('/dashboard/university')) return 'University HEI';
    if (path.startsWith('/team-formation')) return 'Team Collaboration';
    if (path.startsWith('/milestones')) return 'Milestone Tracker';
    if (path.startsWith('/submit-solution')) return 'Submit Solution';
    if (path.startsWith('/submit-challenge')) return 'Submit Problem';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/industry')) return 'Industry Portal';
    if (path.startsWith('/explore')) return 'Explore Challenges';
    if (path.startsWith('/about')) return 'About SocioSolve';
    if (path === '/') return 'Command Center';
    return 'Workspace';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student': return 'Student';
      case 'admin': return 'System Admin';
      case 'faculty': return 'Faculty Guide';
      case 'expert': return 'Expert Evaluator';
      case 'university_admin': return 'University HEI';
      case 'nodal_officer': return 'Govt Nodal Officer';
      case 'citizen': return 'Submitter';
      case 'industry_partner': return 'Industry Partner';
      default: return 'Member';
    }
  };

  return (
    <header className="top-header">
      <div className="top-header-inner" style={{ justifyContent: isLoggedIn && user ? 'space-between' : 'flex-end' }}>
        {/* Left: Role Context (only for logged-in users) */}
        {isLoggedIn && user && (
          <div className="top-header-left">
            <span className="top-header-badge">{getRoleBadge(user.role)}</span>
            <span className="top-header-separator">/</span>
            <span className="top-header-title">{getPageTitle(location.pathname)}</span>
          </div>
        )}


        {/* Right: Get Started, Sign In, and Theme Toggle */}
        <div className="top-header-right">
          {/* Notification bell (for logged-in users) */}
          {isLoggedIn && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className={`top-header-icon-btn${showNotifications ? ' top-header-icon-btn--active' : ''}`}
                title="Notifications"
                onClick={toggleNotifications}
                aria-label="View notifications"
                aria-expanded={showNotifications}
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="top-header-notif-dot">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="top-notif-dropdown">
                  <div className="top-notif-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        Notifications
                      </span>
                      {unread > 0 && (
                        <span className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                          {unread} new
                        </span>
                      )}
                    </div>
                    {unread > 0 && (
                      <button
                        className="top-notif-mark-btn"
                        onClick={markAllAsRead}
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="top-notif-body">
                    {loadingNotifs ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Loading updates...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                          All caught up!
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          No notifications right now.
                        </div>
                      </div>
                    ) : (
                      <div className="top-notif-list">
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            className={`top-notif-item${!n.isRead ? ' top-notif-item--unread' : ''}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className="top-notif-indicator">
                              <span className={`top-notif-dot-marker${!n.isRead ? ' top-notif-dot-marker--active' : ''}`} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="top-notif-item-title">
                                {n.title}
                              </div>
                              <div className="top-notif-item-msg">
                                {n.message}
                              </div>
                              <div className="top-notif-item-time">
                                {utils.timeAgo(n.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle (Dark & Light mode) */}
          <button
            id="top-theme-toggle"
            className="top-header-icon-btn"
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle colour theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* Auth Controls */}
          {isLoggedIn && user ? (
            <div className="top-user-pill" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  color: 'inherit'
                }}
                title="View & Edit Profile"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                    {utils.initials(user.name)}
                  </div>
                )}
                <div className="top-user-info">
                  <span className="top-user-name">{user.name.split(' ')[0]}</span>
                  <span className="top-user-role">{user.role.replace(/_/g, ' ')}</span>
                </div>
              </Link>
              <button
                className="top-logout-btn"
                onClick={handleLogout}
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="top-auth-group">
              <Link to="/login" className="btn btn-ghost btn-sm top-signin-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm top-getstarted-btn">
                <Sparkles size={14} /> Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
