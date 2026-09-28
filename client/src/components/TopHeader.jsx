import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, utils } from '../services/api';
import {
  Sun, Moon, Bell, Sparkles, CheckCheck, X, Users,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink
} from 'lucide-react';

export default function TopHeader() {
  const { user, isLoggedIn } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [filterTab, setFilterTab] = useState('unread'); // 'unread' | 'all'
  const [activePopup, setActivePopup] = useState(null); // Floating pop-up notification
  const notifRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Poll notifications when logged in & detect incoming messages
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotifications = async () => {
      try {
        const [countRes, listRes] = await Promise.all([
          api.get('/notifications/unread-count'),
          api.get('/notifications?limit=15')
        ]);

        if (countRes.success) {
          setUnread(countRes.count);
        }

        if (listRes.success && listRes.data) {
          const freshList = listRes.data;
          setNotifications(freshList);

          // Find newly arrived unread notifications that haven't been popped up
          const unreadItems = freshList.filter(n => !n.isRead);

          if (isInitialLoadRef.current) {
            // On very first mount, pop up the most recent unread notification if it is recent
            unreadItems.forEach(n => seenIdsRef.current.add(n.id));
            if (unreadItems.length > 0) {
              const newest = unreadItems[0];
              setActivePopup(newest);
            }
            isInitialLoadRef.current = false;
          } else {
            // On subsequent polls, find brand new unread notification
            const brandNew = unreadItems.find(n => !seenIdsRef.current.has(n.id));
            if (brandNew) {
              seenIdsRef.current.add(brandNew.id);
              setActivePopup(brandNew);
            }
          }
        }
      } catch (_) {}
    };

    fetchNotifications();

    // Listen for custom trigger (e.g. from team creation/join)
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('notification-refresh', handleRefresh);

    // Poll every 10 seconds for real-time responsiveness
    const interval = setInterval(fetchNotifications, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-refresh', handleRefresh);
    };
  }, [isLoggedIn]);

  // Auto-dismiss the live pop-up after 6 seconds ("this info is for short time")
  useEffect(() => {
    if (!activePopup) return;
    const timer = setTimeout(() => {
      setActivePopup(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activePopup]);

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
      const res = await api.get('/notifications?limit=25');
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

  // Mark all notifications as read -> they vanish from the unread section
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (activePopup) setActivePopup(null);
    } catch (_) {}
  };

  // Mark single notification as read & navigate to its context
  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setUnread(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (_) {}
    }

    if (activePopup?.id === notif.id) {
      setActivePopup(null);
    }

    // Determine target route based on notification metadata
    setShowNotifications(false);
    if (notif.relatedType === 'team' || notif.type?.includes('team')) {
      navigate(`/team-formation${notif.relatedId ? `?teamId=${notif.relatedId}` : ''}`);
    } else if (notif.relatedType === 'milestone' || notif.type?.includes('milestone')) {
      navigate('/milestones');
    } else if (notif.relatedType === 'solution' || notif.type?.includes('solution') || notif.type?.includes('evaluation')) {
      navigate('/milestones');
    } else if (notif.relatedType === 'challenge' && notif.relatedId) {
      navigate(`/challenge/${notif.relatedId}`);
    } else if (notif.link) {
      navigate(notif.link);
    }
  };

  // Dismiss a notification directly from list (marks it read so it vanishes immediately)
  const handleDismissNotification = async (e, notif) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${notif.id}/read`);
      setUnread(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    } catch (_) {}
  };

  const getNotificationIcon = (type = '') => {
    if (type.includes('team')) {
      return <Users size={16} color="#60a5fa" />;
    }
    if (type.includes('milestone') || type.includes('project')) {
      return <CheckCircle2 size={16} color="#34d399" />;
    }
    if (type.includes('evaluation') || type.includes('solution')) {
      return <Sparkles size={16} color="#f59e0b" />;
    }
    return <Bell size={16} color="#a78bfa" />;
  };

  const displayedNotifications = filterTab === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

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
    <>
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

          {/* Right: Notification Bell, Theme Toggle & User Info */}
          <div className="top-header-right">
            {/* Notification bell (for logged-in users) */}
            {isLoggedIn && (
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  className={`top-header-icon-btn${showNotifications ? ' top-header-icon-btn--active' : ''}`}
                  title={unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'Notifications'}
                  onClick={toggleNotifications}
                  aria-label="View notifications"
                  aria-expanded={showNotifications}
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="top-header-notif-dot top-header-notif-dot--pulse">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {/* Notification Popover Dropdown */}
                {showNotifications && (
                  <div className="top-notif-dropdown">
                    <div className="top-notif-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          className={`top-notif-tab${filterTab === 'unread' ? ' top-notif-tab--active' : ''}`}
                          onClick={() => setFilterTab('unread')}
                        >
                          Unread {unread > 0 && `(${unread})`}
                        </button>
                        <button
                          className={`top-notif-tab${filterTab === 'all' ? ' top-notif-tab--active' : ''}`}
                          onClick={() => setFilterTab('all')}
                        >
                          All ({notifications.length})
                        </button>
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
                          Checking notifications...
                        </div>
                      ) : displayedNotifications.length === 0 ? (
                        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                            {filterTab === 'unread' ? 'All caught up!' : 'No notifications'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {filterTab === 'unread'
                              ? 'All unread notifications have vanished from this view.'
                              : 'No notification records exist yet.'}
                          </div>
                        </div>
                      ) : (
                        <div className="top-notif-list">
                          {displayedNotifications.map(n => (
                            <div
                              key={n.id}
                              className={`top-notif-item${!n.isRead ? ' top-notif-item--unread' : ''}`}
                              onClick={() => handleNotificationClick(n)}
                              title="Click to view details and mark read"
                            >
                              <div className="top-notif-indicator">
                                {getNotificationIcon(n.type)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                  <div className="top-notif-item-title">
                                    {n.title}
                                  </div>
                                  {!n.isRead && (
                                    <button
                                      onClick={(e) => handleDismissNotification(e, n)}
                                      className="top-notif-close-btn"
                                      title="Mark read & dismiss"
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}
                                    >
                                      <X size={13} />
                                    </button>
                                  )}
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

          {/* Auth Controls: Avatar with Name Initials + Defined Role (No logout button here) */}
          {isLoggedIn && user ? (
            <Link
              to="/profile"
              className="top-user-pill"
              title={`${user.name} • View Profile & Settings`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                color: 'inherit',
                padding: '4px 12px 4px 5px',
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {utils.initials(user.name)}
                </div>
              )}
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-400)',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                }}
              >
                {getRoleBadge(user.role)}
              </span>
            </Link>
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

    {/* ── Real-Time Floating Notification Toast Pop-Up ("vanishes after short time") ── */}
    {activePopup && (
      <div className="notif-toast-popup" role="alert">
        <div className="notif-toast-popup-header">
          <span className="notif-toast-badge">
            {getNotificationIcon(activePopup.type)}
            <span>Update Alert</span>
          </span>
          <button
            onClick={() => setActivePopup(null)}
            className="notif-toast-close"
            title="Dismiss notification"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="notif-toast-title">
          {activePopup.title}
        </div>

        <div className="notif-toast-message">
          {activePopup.message}
        </div>

        <div className="notif-toast-actions">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {utils.timeAgo(activePopup.createdAt)}
          </span>
          <button
            onClick={() => handleNotificationClick(activePopup)}
            className="btn btn-primary notif-toast-btn"
          >
            View Details <ArrowRight size={13} style={{ marginLeft: 3 }} />
          </button>
        </div>

        <div className="notif-toast-timer" />
      </div>
    )}
    </>
  );
}
