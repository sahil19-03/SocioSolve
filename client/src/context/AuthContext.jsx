import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sociosolve_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('sociosolve_token');
      const savedUser = localStorage.getItem('sociosolve_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token freshness with /api/auth/me
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('sociosolve_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('sociosolve_token', res.token);
      localStorage.setItem('sociosolve_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('sociosolve_token', res.token);
      localStorage.setItem('sociosolve_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sociosolve_token');
    localStorage.removeItem('sociosolve_user');
  };

  const updateUser = (newUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('sociosolve_user', JSON.stringify(updated));
      return updated;
    });
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const getDashboardPath = (role = user?.role) => {
    switch (role) {
      case 'student':           return '/dashboard/student';
      case 'citizen':           return '/dashboard/submitter';
      case 'faculty':           return '/dashboard/faculty';
      case 'expert':            return '/dashboard/expert';
      case 'admin':             return '/dashboard/admin';
      case 'university_admin':  return '/dashboard/university'; // dedicated HEI dashboard
      case 'nodal_officer':     return '/dashboard/nodal';      // dedicated Government Nodal Officer dashboard
      case 'industry_partner':  return '/industry';             // goes to industry portal
      case 'community':         return '/explore';              // community voters browse challenges
      default:                  return '/explore';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        hasRole,
        getDashboardPath,
        isLoggedIn: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
