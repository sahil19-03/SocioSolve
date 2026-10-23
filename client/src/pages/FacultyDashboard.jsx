import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Compass, Users, Target, ArrowRight, BookOpen, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/milestones/faculty-teams').catch(() => ({ success: false, data: [] })),
      api.get('/milestones/pending-review').catch(() => ({ success: false, count: 0 })),
    ]).then(([teamsRes, reviewRes]) => {
      const teams = teamsRes.success ? teamsRes.data || [] : [];
      const allMs = teams.flatMap(t => t.milestones || []);
      setStats({
        teams: teams.length,
        pendingReview: reviewRes.success ? reviewRes.count : 0,
        overdue: allMs.filter(m => m.status === 'overdue').length,
        completed: allMs.filter(m => m.status === 'completed').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      icon: <Users size={28} />,
      color: '#818cf8',
      title: 'Student Teams',
      desc: 'View and manage the student squads you are mentoring.',
      to: '/team-formation',
      cta: 'View Teams',
      badge: stats?.teams,
    },
    {
      icon: <Target size={28} />,
      color: '#a78bfa',
      title: 'Milestone Approvals',
      desc: 'Review student-submitted milestone progress and provide validation.',
      to: '/milestones',
      cta: 'Open Tracker',
      badge: stats?.pendingReview > 0 ? `${stats.pendingReview} pending` : null,
      badgeColor: '#f59e0b',
    },
    {
      icon: <Compass size={28} />,
      color: '#06b6d4',
      title: 'Explore Challenges',
      desc: 'Browse all published societal challenges available to student teams.',
      to: '/explore',
      cta: 'Browse',
    },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1100 }}>

        {/* Hero */}
        <div className="card p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(129,140,248,.13) 0%, rgba(167,139,250,.13) 100%)',
          borderColor: 'rgba(129,140,248,.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span className="badge" style={{ background: 'rgba(129,140,248,.2)', color: '#818cf8', border: '1px solid rgba(129,140,248,.35)' }}>
                  <BookOpen size={12} style={{ marginRight: 5 }} />Faculty Mentor
                </span>
                {user?.university && <span className="badge badge-cyan">{user.university}</span>}
              </div>
              <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Welcome, {user?.name?.split(' ')[0] || 'Faculty'} 👋</h1>
              <p className="text-secondary" style={{ maxWidth: 560, margin: 0 }}>
                Supervise your student teams, validate milestone deliverables, and guide innovation proposals to completion.
              </p>
            </div>
            <Link to="/milestones" className="btn btn-primary">
              <Target size={16} /> Review Milestones
            </Link>
          </div>
        </div>

        {/* Stats */}
        {!loading && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div className="card p-5" style={{ borderLeft: '4px solid #818cf8' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Teams Mentored</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>{stats.teams}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>active squads</div>
            </div>
            <div className="card p-5" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Pending Review</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stats.pendingReview > 0 ? '#f59e0b' : '#10b981' }}>{stats.pendingReview}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>milestones to validate</div>
            </div>
            <div className="card p-5" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Approved</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{stats.completed}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>milestones completed</div>
            </div>
            <div className="card p-5" style={{ borderLeft: '4px solid #f43f5e' }}>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Overdue</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stats.overdue > 0 ? '#f43f5e' : '#10b981' }}>{stats.overdue}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>need attention</div>
            </div>
          </div>
        )}

        {/* Cards */}
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
                    <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: 9999, background: `${card.badgeColor || card.color}20`, color: card.badgeColor || card.color }}>
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
