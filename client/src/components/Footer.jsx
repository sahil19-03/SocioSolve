import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand Col */}
          <div>
            <Link to="/" className="brand" style={{ marginBottom: 16, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div className="footer-logo-wrap">
                <img src="/logo.png" alt="SocioSolve Logo" />
              </div>
              <span className="brand-text" style={{ color: 'var(--color-primary-400)', fontSize: '1.3rem', fontWeight: 800 }}>
                Socio<span style={{ color: 'var(--color-primary-400)' }}>Solve</span>
              </span>
            </Link>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              An open collaborative platform connecting communities and innovators to tackle real-world societal challenges through technology.
            </p>
            <span className="badge badge-blue">Community-Powered Innovation</span>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: 16, color: '#f8fafc' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
              <li><Link to="/explore" style={{ textDecoration: 'none', color: '#cbd5e1' }}>Browse Challenges</Link></li>
              <li><Link to="/submit-challenge" style={{ textDecoration: 'none', color: '#cbd5e1' }}>Submit a Problem</Link></li>
              <li><Link to="/about" style={{ textDecoration: 'none', color: '#cbd5e1' }}>How It Works</Link></li>
              <li><Link to="/register" style={{ textDecoration: 'none', color: '#cbd5e1' }}>Join as Mentor / Expert</Link></li>
            </ul>
          </div>

          {/* Problem Categories */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: 16, color: '#f8fafc' }}>Domains</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
              <li><Link to="/explore?category=smart_city" style={{ textDecoration: 'none', color: '#cbd5e1' }}>🏙️ Smart City & Mobility</Link></li>
              <li><Link to="/explore?category=water" style={{ textDecoration: 'none', color: '#cbd5e1' }}>💧 Water & Sanitation</Link></li>
              <li><Link to="/explore?category=healthcare" style={{ textDecoration: 'none', color: '#cbd5e1' }}>🏥 Healthcare & Wellness</Link></li>
              <li><Link to="/explore?category=agriculture" style={{ textDecoration: 'none', color: '#cbd5e1' }}>🌾 AgriTech & Farming</Link></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: 16, color: '#f8fafc' }}>Built With</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>
              Node.js · Express · PostgreSQL · Supabase · React · Vite. Featuring AI-powered skill matching and community-reviewed progress tracking.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-purple" style={{ fontSize: 10 }}>PostgreSQL</span>
              <span className="badge badge-cyan" style={{ fontSize: 10 }}>Supabase</span>
              <span className="badge badge-emerald" style={{ fontSize: 10 }}>React · Vite</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            © {new Date().getFullYear()} <span style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>SocioSolve</span> — Bridging communities and innovators for a better world.
          </p>
          <div style={{ display: 'flex', gap: 20, fontSize: '0.825rem' }}>
            <span style={{ color: '#64748b' }}>Status: Operational</span>
            <span style={{ color: '#64748b' }}>Version 2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
