import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Compass, Users, Target, BookMarked, BarChart3,
  ArrowRight, Zap, Trophy, Clock, CheckCircle2, AlertTriangle, Sparkles
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/milestones/my-team').catch(() => ({ success: false })),
      api.get('/teams/my-team').catch(() => ({ success: false })),
    ]).then(([msRes, teamRes]) => {
      const ms = msRes.success ? msRes.data || [] : [];
      setStats({
        milestones: {
          total: msRes.stats?.total || ms.length,
          done: msRes.stats?.done || ms.filter(m => m.status === 'completed').length,
          overdue: ms.filter(m => m.status === 'overdue').length,
          pct: msRes.stats?.completionPct || 0,
        },
        hasTeam: !!(teamRes.success && teamRes.data),
        teamName: teamRes.data?.name || null,
        challenge: msRes.challenge?.title || null,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      icon: <Compass size={28} />,
      color: '#06b6d4',
      title: 'Explore Challenges',
      desc: 'Browse societal challenges published by government nodal officers.',
      to: '/explore',
      cta: 'Browse Challenges',
    },
    {
      icon: <Users size={28} />,
      color: '#818cf8',
      title: 'Team & Collaboration',
      desc: 'Form your squad, invite members, and request a faculty mentor.',
      to: '/team-formation',
      cta: 'Go to Teams',
    },
    {
      icon: <Target size={28} />,
      color: '#a78bfa',
      title: 'Milestone Tracker',
      desc: 'Track deliverables, report progress, and view faculty approvals.',
      to: '/milestones',
      cta: 'Open Tracker',
      badge: stats?.milestones?.overdue > 0 ? `${stats.milestones.overdue} overdue` : null,
      badgeColor: '#f43f5e',
    },
    {
      icon: <BookMarked size={28} />,
      color: '#10b981',
      title: 'Submit Solution',
      desc: 'Submit your structured 5-part innovation proposal for review.',
      to: '/submit-solution',
      cta: 'Submit Now',
    },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1100 }}>

        {/* Hero */}
        <div className="card p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,.13) 0%, rgba(139,92,246,.13) 100%)',
          borderColor: 'rgba(99,102,241,.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(99,102,241,.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,.35)' }}>
                  <Zap size={12} style={{ marginRight: 5 }} />Student Innovator
                </span>
                {stats?.challenge && (
                  <span className="badge badge-cyan" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🎯 {stats.challenge}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>
                Welcome back, {user?.name?.split(' ')[0] || 'Innovator'} 👋
              </h1>
              <p className="text-secondary" style={{ maxWidth: 580, margin: 0 }}>
                {stats?.teamName
                  ? `You're working with team "${stats.teamName}". Use the tools below to keep moving forward.`
                  : 'Join or form a team to start working on a societal challenge.'}
              </p>
            </div>
            <Link to="/milestones" className="btn btn-primary" style={{ gap: 8 }}>
              <Target size={16} /> My Milestones
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        {!loading && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div className="card p-5" style={{ borderLeft: '4px solid #a78bfa' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Milestone Progress</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa' }}>{stats.milestones.pct}%</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{stats.milestones.done}/{stats.milestones.total} done</div>
            </div>
            <div className="card p-5" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Completed</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{stats.milestones.done}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>milestones approved</div>
            </div>
            <div className="card p-5" style={{ borderLeft: '4px solid #f43f5e' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Overdue</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stats.milestones.overdue > 0 ? '#f43f5e' : '#10b981' }}>{stats.milestones.overdue}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>need attention</div>
            </div>
            <div className="card p-5" style={{ borderLeft: '4px solid #818cf8' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Team Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stats.hasTeam ? '#10b981' : '#f59e0b', marginTop: 6 }}>
                {stats.hasTeam ? '✓ Active' : '⚠ No Team'}
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{stats.teamName || 'Join a team to start'}</div>
            </div>
          </div>
        )}

        {/* Navigation cards */}
        <h2 style={{ fontSize: '1.1rem', marginBottom: 18, color: 'var(--text-secondary)', fontWeight: 600 }}>Your Workspace</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {cards.map(card => (
            <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
              <div className="card p-6" style={{ height: '100%', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${card.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: 16 }}>
                  {card.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>{card.title}</h3>
                  {card.badge && (
                    <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: 9999, background: `${card.badgeColor}20`, color: card.badgeColor }}>
                      {card.badge}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>{card.desc}</p>
                <span style={{ fontSize: '.82rem', fontWeight: 700, color: card.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {card.cta} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
