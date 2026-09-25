import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, utils } from '../services/api';
import {
  Compass, PlusCircle, Handshake, Info, LayoutDashboard,
  LogOut, Sun, Moon, Bell, BarChart2, Users, User, Menu, X,
  Home, Flag, BookMarked, Sparkles, Target, ShieldCheck, ClipboardList
} from 'lucide-react';

export default function Sidebar() {
  const { user, isLoggedIn, logout, getDashboardPath } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeOnMobile = () => setMobileOpen(false);

  const publicNav = [
    { to: '/',                icon: <Home size={18} />,           label: 'Home',             exact: true },
    { to: '/explore',         icon: <Compass size={18} />,        label: 'Explore'           },
    { to: '/about',           icon: <Info size={18} />,           label: 'About'             },
    { to: '/industry',        icon: <Handshake size={18} />,      label: 'Industry'          },
  ];

  // Map each role to their respective particular dashboard
  const getParticularDashboard = (role) => {
    switch (role) {
      case 'student':
        return { to: '/dashboard/student', icon: <LayoutDashboard size={18} />, label: 'Student Dashboard', exact: true };
      case 'citizen':
        return { to: '/dashboard/submitter', icon: <LayoutDashboard size={18} />, label: 'Submitter Dashboard', exact: true };
      case 'nodal_officer':
        return { to: '/dashboard/nodal', icon: <ShieldCheck size={18} />, label: 'Govt Verification Console', exact: true };
      case 'faculty':
        return { to: '/dashboard/faculty', icon: <LayoutDashboard size={18} />, label: 'Faculty Dashboard', exact: true };
      case 'expert':
        return { to: '/dashboard/expert', icon: <LayoutDashboard size={18} />, label: 'Expert Dashboard', exact: true };
      case 'university_admin':
        return { to: '/dashboard/university', icon: <LayoutDashboard size={18} />, label: 'University Dashboard', exact: true };
      case 'admin':
        return { to: '/dashboard/admin', icon: <LayoutDashboard size={18} />, label: 'Admin Console', exact: true };
      case 'industry_partner':
        return { to: '/industry', icon: <LayoutDashboard size={18} />, label: 'Industry Portal', exact: true };
      default:
        return { to: '/dashboard/student', icon: <LayoutDashboard size={18} />, label: 'My Dashboard', exact: true };
    }
  };

  // Role-specific workspace tools
  const getWorkspaceNav = (role) => {
    switch (role) {
      case 'student':
        return [
          { to: '/team-formation',  icon: <Users size={18} />,      label: 'Teams & Collaboration' },
          { to: '/milestones',      icon: <Target size={18} />,     label: 'Milestone Tracker'     },
          { to: '/submit-solution', icon: <BookMarked size={18} />, label: 'Submit Solution'       },
        ];
      case 'citizen':
        return [
          { to: '/submit-challenge', icon: <PlusCircle size={18} />, label: 'Submit Problem'       },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Track Milestones'     },
        ];
      case 'faculty':
        return [
          { to: '/team-formation',   icon: <Users size={18} />,      label: 'Student Teams'        },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Approvals'  },
        ];
      case 'expert':
        return [
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Evaluation & Rubrics' },
        ];
      case 'university_admin':
        return [
          { to: '/team-formation',   icon: <Users size={18} />,      label: 'Campus Student Teams' },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestones & Progress'},
          { to: '/analytics',        icon: <BarChart2 size={18} />,  label: 'HEI Analytics'        },
        ];
      case 'nodal_officer':
        return [
          { to: '/explore',          icon: <Compass size={18} />,     label: 'Public Challenge Catalog' },
          { to: '/analytics',        icon: <BarChart2 size={18} />,   label: 'State Impact Analytics'   },
        ];
      case 'admin':
        return [
          { to: '/team-formation',   icon: <Users size={18} />,      label: 'Teams & Collaboration' },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Tracker'     },
          { to: '/submit-challenge', icon: <PlusCircle size={18} />, label: 'Submit Problem'        },
          { to: '/analytics',        icon: <BarChart2 size={18} />,  label: 'Platform Analytics'    },
        ];
      case 'industry_partner':
        return [
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Tracker'     },
        ];
      default:
        return [
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Tracker'     },
        ];
    }
  };

  // Admin access to all dashboards
  const allDashboards = [
    { to: '/dashboard/admin',      label: '🛡️ Admin Console' },
    { to: '/dashboard/nodal',      label: '🏛️ Nodal Officer' },
    { to: '/dashboard/student',    label: '🎓 Student Portal' },
    { to: '/dashboard/submitter',  label: '📢 Submitter Portal' },
    { to: '/dashboard/faculty',    label: '🔬 Faculty Guide' },
    { to: '/dashboard/expert',     label: '⭐ Expert Evaluator' },
    { to: '/dashboard/university', label: '🏫 University HEI' },
  ];

  const SidebarLink = ({ to, icon, label, exact, badge }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={closeOnMobile}
      className={({ isActive }) => `sb-link${isActive ? ' sb-link--active' : ''}`}
    >
      <span className="sb-link-icon">
        {icon}
        {badge > 0 && <span className="sb-badge">{badge > 9 ? '9+' : badge}</span>}
      </span>
      <span className="sb-link-label">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* ── Mobile hamburger ─────────────────────────────── */}
      <button
        className="sb-mobile-btn"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ── Overlay (mobile) ─────────────────────────────── */}
      {mobileOpen && (
        <div className="sb-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>

        {/* Logo + Brand (Prominent & Clean) */}
        <Link to="/" className="sb-brand" onClick={closeOnMobile}>
          <div className="sb-logo-wrap">
            <img src="/logo.png" alt="SocioSolve Logo" />
          </div>
          <div className="sb-brand-info">
            <div className="sb-brand-name">Socio<span>Solve</span></div>
            <div className="sb-tagline">National Innovation Network</div>
          </div>
        </Link>

        <div className="sb-divider" />

        {/* ── Navigation ───────────────────────────────── */}
        <nav className="sb-nav">
          {isLoggedIn && user ? (
            <>
              {/* ── Workspace (Includes Respective Particular Dashboard) ── */}
              <div className="sb-section-label">Workspace</div>
              <SidebarLink {...getParticularDashboard(user.role)} />
              {getWorkspaceNav(user.role).map(item => (
                <SidebarLink key={item.to + item.label} {...item} />
              ))}
              <SidebarLink to="/profile" icon={<User size={18} />} label="My Profile & Settings" />

              {/* Admin Switcher for all 6 dashboards */}
              {user.role === 'admin' && (
                <>
                  <div className="sb-section-label" style={{ marginTop: 18 }}>All 6 Dashboards</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 4 }}>
                    {allDashboards.map(dash => (
                      <NavLink
                        key={dash.to}
                        to={dash.to}
                        onClick={closeOnMobile}
                        className={({ isActive }) => `sb-link sb-sublink${isActive ? ' sb-link--active' : ''}`}
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      >
                        <span className="sb-link-label">{dash.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* ── Public Visitor Navigation ── */}
              <div className="sb-section-label">Navigation</div>
              {publicNav.map(item => (
                <SidebarLink key={item.to + item.label} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <div className="sb-divider" />

        {/* ── Bottom Network Status ───────────────────── */}
        <div className="sb-bottom">
          <div className="sb-status-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sb-status-pulse" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Innovation Mesh Active
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              AI Engine &bull; Real-time
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
