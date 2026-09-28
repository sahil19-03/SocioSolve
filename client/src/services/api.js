/**
 * SocioSolve — API Service Client
 * Handles HTTP requests, JWT token injection, and platform utilities
 */

const API_BASE = '/api';

export const api = {
  async request(method, endpoint, data = null, isFormData = false) {
    const token = localStorage.getItem('sociosolve_token');
    const headers = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : null
    };

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, config);
    } catch (netErr) {
      throw new Error('Unable to connect to server. Please check your network connection.');
    }

    let json;
    try {
      json = await response.json();
    } catch (parseErr) {
      if (!response.ok) {
        throw new Error(`Server error (${response.status}). Please ensure the backend server is running on port 5000.`);
      }
      throw new Error('Received unexpected empty or non-JSON response from server.');
    }

    if (!response.ok) {
      throw new Error(json.message || `HTTP error ${response.status}`);
    }

    return json;
  },

  get: (endpoint) => api.request('GET', endpoint),
  post: (endpoint, data) => api.request('POST', endpoint, data),
  put: (endpoint, data) => api.request('PUT', endpoint, data),
  patch: (endpoint, data) => api.request('PATCH', endpoint, data),
  delete: (endpoint) => api.request('DELETE', endpoint),
  postForm: (endpoint, formData) => api.request('POST', endpoint, formData, true),
  putForm: (endpoint, formData) => api.request('PUT', endpoint, formData, true),
};

export const utils = {
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return utils.formatDate(dateStr);
  },

  categoryLabel(cat) {
    const labels = {
      smart_city: '🏙️ Smart City',
      environment: '🌱 Environment',
      water: '💧 Water & Sanitation',
      agriculture: '🌾 Agriculture',
      healthcare: '🏥 Healthcare',
      education: '🎓 Education',
      accessibility: '♿ Accessibility',
      waste_management: '🚮 Waste Mgmt',
      public_safety: '🚦 Public Safety',
      energy: '🔋 Clean Energy',
      social_welfare: '👴 Social Welfare',
      digital_services: '🌐 Digital Services'
    };
    return labels[cat] || cat;
  },

  categoryColor(cat) {
    const colors = {
      smart_city: '#3b82f6',
      environment: '#10b981',
      water: '#06b6d4',
      agriculture: '#84cc16',
      healthcare: '#f43f5e',
      education: '#8b5cf6',
      accessibility: '#f59e0b',
      waste_management: '#6b7280',
      public_safety: '#ef4444',
      energy: '#fbbf24',
      social_welfare: '#a78bfa',
      digital_services: '#22d3ee'
    };
    return colors[cat] || '#3b82f6';
  },

  initials(name) {
    if (!name) return '?';
    const honorifics = new Set([
      'dr', 'doctor',
      'shri', 'shree', 'sri', 'shrimati', 'smt',
      'prof', 'professor',
      'mr', 'mrs', 'ms', 'miss',
      'er', 'engineer',
      'adv', 'advocate',
      'hon', 'honourable', 'honorable'
    ]);
    const words = name.trim().split(/\s+/).filter(Boolean);
    // Filter out honorifics like Dr., Shri, Shree, Prof., etc.
    const cleanWords = words.filter(w => !honorifics.has(w.toLowerCase().replace(/[^a-z0-9]/g, '')));
    const target = cleanWords.length > 0 ? cleanWords : words;
    if (target.length === 1) {
      return target[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '?';
    }
    const first = target[0].replace(/[^a-zA-Z0-9]/g, '')[0] || '';
    const last = target[target.length - 1].replace(/[^a-zA-Z0-9]/g, '')[0] || '';
    return (first + last).toUpperCase() || '?';
  },

  difficultyBadge(level) {
    const map = {
      beginner: 'badge-emerald',
      intermediate: 'badge-amber',
      advanced: 'badge-rose'
    };
    return map[level] || 'badge-blue';
  }
};
