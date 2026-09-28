import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass, PlusCircle, Handshake, Info, LayoutDashboard,
  LogOut, BarChart2, Users, User, Menu, X,
  Home, BookMarked, Target, ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, isLoggedIn, logout, getDashboardPath } = useAuth();
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

  // Role-specific workspace tools (strictly tailored for this particular account)
  const getWorkspaceNav = (role) => {
    switch (role) {
      case 'student':
        return [
          { to: '/explore',         icon: <Compass size={18} />,    label: 'Explore Challenges'    },
          { to: '/team-formation',  icon: <Users size={18} />,      label: 'Teams & Collaboration' },
          { to: '/milestones',      icon: <Target size={18} />,     label: 'Milestone Tracker'     },
          { to: '/submit-solution', icon: <BookMarked size={18} />, label: 'Submit Solution'       },
        ];
      case 'citizen':
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'Browse Challenges'    },
          { to: '/submit-challenge', icon: <PlusCircle size={18} />, label: 'Submit Problem'       },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Track Milestones'     },
        ];
      case 'faculty':
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'Explore Challenges'   },
          { to: '/team-formation',   icon: <Users size={18} />,      label: 'Student Teams'        },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Approvals'  },
        ];
      case 'expert':
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'Explore Challenges'   },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Evaluation & Rubrics' },
        ];
      case 'university_admin':
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'Explore Challenges'   },
          { to: '/team-formation',   icon: <Users size={18} />,      label: 'Campus Student Teams' },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestones & Progress'},
          { to: '/analytics',        icon: <BarChart2 size={18} />,  label: 'HEI Analytics'        },
        ];
      case 'nodal_officer':
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'Challenge Catalog'    },
          { to: '/analytics',        icon: <BarChart2 size={18} />,  label: 'State Impact Analytics'},
        ];
      case 'admin':
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'All Challenges'        },
          { to: '/team-formation',   icon: <Users size={18} />,      label: 'Teams & Collaboration' },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Tracker'     },
          { to: '/submit-challenge', icon: <PlusCircle size={18} />, label: 'Submit Problem'        },
          { to: '/analytics',        icon: <BarChart2 size={18} />,  label: 'Platform Analytics'    },
        ];
      case 'industry_partner':
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'Browse Challenges'     },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Tracker'     },
        ];
      default:
        return [
          { to: '/explore',          icon: <Compass size={18} />,    label: 'Explore Challenges'    },
          { to: '/milestones',       icon: <Target size={18} />,     label: 'Milestone Tracker'     },
        ];
    }
  };

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

        {/* Logo + Brand (Navigates to role dashboard if logged in, or / if visitor) */}
        <Link
          to={isLoggedIn && user ? getDashboardPath(user.role) : '/'}
          className="sb-brand"
          onClick={closeOnMobile}
          title={isLoggedIn ? 'Go to your dashboard' : 'SocioSolve Home'}
        >
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
              {/* Account Workspace: Particular Dashboard & Tools Only */}
              <div className="sb-section-label">Account Workspace</div>
              <SidebarLink {...getParticularDashboard(user.role)} />
              {getWorkspaceNav(user.role).map(item => (
                <SidebarLink key={item.to + item.label} {...item} />
              ))}
              <SidebarLink to="/profile" icon={<User size={18} />} label="My Profile & Settings" />
            </>
          ) : (
            <>
              {/* Public Visitor Navigation (Before Login) */}
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

        {/* ── Bottom Section ───────────────────────────── */}
        <div className="sb-bottom">
          {isLoggedIn && user ? (
            <button
              onClick={handleLogout}
              className="sb-logout-btn"
              title="Sign out of your account"
            >
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
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
          )}
        </div>
      </aside>
    </>
  );
}
