import React, { useState, useEffect } from 'react';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, MapPin, Layers, Users, CheckCircle2, Handshake } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#84cc16', '#a78bfa', '#22d3ee', '#fb7185', '#fbbf24', '#34d399', '#60a5fa', '#c4b5fd', '#67e8f9'];

export default function Analytics() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [byState, setByState] = useState([]);
  const [byDomain, setByDomain] = useState([]);
  const [byScope, setByScope] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, st, dm, sc] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/analytics/by-state'),
          api.get('/admin/analytics/by-domain'),
          api.get('/admin/analytics/by-scope'),
        ]);
        if (ov.success) setOverview(ov.data);
        if (st.success) setByState(st.data.map(d => ({ name: d.state, count: parseInt(d.count) })));
        if (dm.success) setByDomain(dm.data.map(d => ({ name: utils.categoryLabel(d.category).replace(/^\S+\s/, ''), count: parseInt(d.count) })));
        if (sc.success) setByScope(sc.data.map(d => ({ name: d.impactScope, value: parseInt(d.count) })));
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 200, height: 32, margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: 400, height: 20, margin: '0 auto' }} />
      </div>
    );
  }

  const statCards = overview ? [
    { label: 'Total Challenges', value: overview.challenges.total, color: '#60a5fa', icon: '📋' },
    { label: 'Published',        value: overview.challenges.published, color: '#34d399', icon: '✅' },
    { label: 'Pending Review',   value: overview.challenges.pending, color: '#fbbf24', icon: '⏳' },
    { label: 'Solved',           value: overview.challenges.solved, color: '#c4b5fd', icon: '🏆' },
    { label: 'Active Teams',     value: overview.teams.active, color: '#67e8f9', icon: '👥' },
    { label: 'Solutions',        value: overview.solutions.total, color: '#fb7185', icon: '💡' },
    { label: 'Total Users',      value: overview.users.total, color: '#84cc16', icon: '👤' },
    { label: 'Partnerships',     value: overview.partnerships.active, color: '#a78bfa', icon: '🤝' },
  ] : [];

  return (
    <div className="dashboard-container">
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span className="badge badge-purple" style={{ marginBottom: 12 }}>Admin Analytics</span>
          <h1 style={{ fontSize: '2.4rem', marginBottom: 10 }}>National Innovation Dashboard</h1>
          <p className="text-secondary">Real-time insights across India's societal innovation ecosystem.</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18, marginBottom: 48 }}>
          {statCards.map(card => (
            <div key={card.label} className="card p-6" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: card.color, fontFamily: 'var(--font-outfit)' }}>{card.value}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Challenges by Domain */}
          <div className="card p-6">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>
              <Layers size={18} style={{ display: 'inline', marginRight: 8, color: '#8b5cf6' }} />
              Challenges by Domain
            </h3>
            {byDomain.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byDomain} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted" style={{ textAlign: 'center', padding: 40 }}>No domain data yet</div>
            )}
          </div>

          {/* Impact Scope */}
          <div className="card p-6">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>
              <TrendingUp size={18} style={{ display: 'inline', marginRight: 8, color: '#06b6d4' }} />
              Impact Scope Distribution
            </h3>
            {byScope.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byScope} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {byScope.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted" style={{ textAlign: 'center', padding: 40 }}>No scope data yet</div>
            )}
          </div>
        </div>

        {/* Challenges by State */}
        <div className="card p-6">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>
            <MapPin size={18} style={{ display: 'inline', marginRight: 8, color: '#10b981' }} />
            Challenges by Indian State
          </h3>
          {byState.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byState}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {byState.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <MapPin size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <p className="text-muted">No location data yet. Challenges need state/district fields filled to appear here.</p>
            </div>
          )}
        </div>
    </div>
  );
}
