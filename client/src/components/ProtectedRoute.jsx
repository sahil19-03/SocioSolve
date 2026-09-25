import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="avatar" style={{ width: 48, height: 48, margin: '0 auto 16px', fontSize: '1.5rem' }}>⚡</div>
          <p className="text-muted">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card p-8 text-center" style={{ maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛡️</div>
          <h2 style={{ marginBottom: 8 }}>Restricted Access</h2>
          <p className="text-secondary" style={{ marginBottom: 24 }}>
            Your account role (<strong>{user.role}</strong>) does not have authorization to view this management module.
          </p>
          <Navigate to="/explore" />
        </div>
      </div>
    );
  }

  return children;
}
