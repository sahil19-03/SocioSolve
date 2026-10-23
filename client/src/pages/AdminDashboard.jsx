import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck, Check, X, AlertTriangle, FileText,
  Users, Lightbulb, ExternalLink, RefreshCw,
  BarChart2, Handshake, Search, UserCheck, UserX,
  Filter, Eye, CheckCircle2, Clock, Building, Award,
  Target, Compass, PlusCircle, ArrowRight
} from 'lucide-react';

const ROLE_COLORS = {
  admin: 'badge-rose',
  student: 'badge-blue',
  citizen: 'badge-amber',
  nodal_officer: 'badge-purple',
  university_admin: 'badge-cyan',
  faculty: 'badge-indigo',
  expert: 'badge-emerald',
  industry_partner: 'badge-pink',
  community: 'badge-teal'
};

const PARTNERSHIP_STATUS_BADGE = {
  proposed:     { class: 'badge-blue',    label: 'Proposed' },
  under_review: { class: 'badge-amber',   label: 'Under Review' },
  accepted:     { class: 'badge-emerald', label: 'Accepted' },
  active:       { class: 'badge-cyan',    label: 'Active' },
  completed:    { class: 'badge-purple',  label: 'Completed' },
  rejected:     { class: 'badge-rose',    label: 'Rejected' },
};

export default function AdminDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState('challenges'); // 'challenges' | 'users' | 'partnerships' | 'analytics'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // 1. Pending Challenges
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [reviewChallenge, setReviewChallenge] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // 2. Users Management
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [togglingUserId, setTogglingUserId] = useState(null);

  // 3. Industry Partnerships
  const [partnerships, setPartnerships] = useState([]);
  const [partnershipsLoading, setPartnershipsLoading] = useState(false);
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('');
  const [partnerModal, setPartnerModal] = useState(null); // { partnership, action }
  const [partnerActionNotes, setPartnerActionNotes] = useState('');
  const [processingPartner, setProcessingPartner] = useState(false);

  // 4. Analytics
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [analyticsDomain, setAnalyticsDomain] = useState([]);
  const [analyticsState, setAnalyticsState] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Initial load: stats and pending challenges
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ success: false })),
        api.get('/admin/challenges/pending').catch(() => ({ success: false, data: [] }))
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (pendingRes.success) setPendingChallenges(pendingRes.data || []);
    } catch (err) {
      console.warn('Initial admin load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load Users when switching to users tab or when filters change
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '50');
      if (userRoleFilter) params.append('role', userRoleFilter);
      if (userSearch) params.append('search', userSearch);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Partnerships
  const loadPartnerships = async () => {
    setPartnershipsLoading(true);
    try {
      const params = new URLSearchParams();
      if (partnerStatusFilter) params.append('status', partnerStatusFilter);

      const res = await api.get(`/industry/partnerships?${params.toString()}`);
      if (res.success && Array.isArray(res.data)) {
        setPartnerships(res.data);
      }
    } catch (err) {
      toast.error('Failed to load industry partnerships.');
    } finally {
      setPartnershipsLoading(false);
    }
  };

  // Load Analytics
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [ovRes, domRes, stRes] = await Promise.all([
        api.get('/admin/analytics/overview').catch(() => ({ success: false })),
        api.get('/admin/analytics/by-domain').catch(() => ({ success: false, data: [] })),
        api.get('/admin/analytics/by-state').catch(() => ({ success: false, data: [] }))
      ]);
      if (ovRes.success) setAnalyticsOverview(ovRes.data);
      if (domRes.success) setAnalyticsDomain(domRes.data || []);
      if (stRes.success) setAnalyticsState(stRes.data || []);
    } catch (err) {
      console.warn('Analytics load error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'partnerships') loadPartnerships();
    if (tab === 'analytics') loadAnalytics();
  }, [tab, userRoleFilter, partnerStatusFilter]);

  // Handle Challenge Verification
  const handleVerify = async (challengeId, action) => {
    setProcessing(true);
    try {
      const res = await api.put(`/admin/challenges/${challengeId}/verify`, {
        action,
        reason: adminNotes || (action === 'reject' ? 'Does not meet program criteria.' : ''),
        adminNotes: adminNotes || (action === 'approve' ? 'Challenge verified for public solving.' : 'Does not meet criteria.')
      });
      toast.success(res.message || `Challenge ${action === 'approve' ? 'published' : 'rejected'}`);
      setReviewChallenge(null);
      setAdminNotes('');
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Verification update failed');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Toggle User Account
  const handleToggleUser = async (userId, currentStatus) => {
    setTogglingUserId(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      if (res.success) {
        toast.success(res.message || `User account ${res.data?.isActive ? 'activated' : 'deactivated'}.`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: res.data?.isActive ?? !currentStatus } : u));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    } finally {
      setTogglingUserId(null);
    }
  };

  // Handle Update Partnership Status
  const handleUpdatePartnership = async (partnershipId, newStatus, notes = '') => {
    setProcessingPartner(true);
    try {
      const res = await api.put(`/industry/partnerships/${partnershipId}`, {
        status: newStatus,
        notes: notes || undefined
      });
      if (res.success) {
        toast.success(`Partnership status updated to "${newStatus}".`);
        setPartnerModal(null);
        setPartnerActionNotes('');
        loadPartnerships();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update partnership.');
    } finally {
      setProcessingPartner(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Banner */}
      <div
        className="card p-8 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
          borderColor: 'rgba(244, 63, 94, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="badge badge-rose" style={{ marginBottom: 12 }}>System Administration & Governance</span>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Admin Governance Console</h1>
            <p className="text-secondary" style={{ maxWidth: 680, lineHeight: 1.6 }}>
              Review challenge submissions, manage user accounts across all 9 roles, oversee corporate CSR partnerships, and monitor platform metrics.
            </p>
          </div>

          <button onClick={() => { loadInitialData(); if (tab === 'users') loadUsers(); if (tab === 'partnerships') loadPartnerships(); if (tab === 'analytics') loadAnalytics(); }} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Top Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pending Review</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            {stats?.pendingChallenges ?? pendingChallenges.length}
          </div>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #ef4444' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Registered Users</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginTop: 4 }}>
            {stats?.totalUsers ?? '—'}
          </div>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #10b981' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Published Challenges</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            {stats?.publishedChallenges ?? '—'}
          </div>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #3b82f6' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Student Teams</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
            {stats?.totalTeams ?? '—'}
          </div>
        </div>
      </div>

      {/* ── Discovery & Navigation Hub Cards ────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        <Link to="/explore" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(6,182,212,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                <Compass size={22} />
              </div>
              <span className="badge badge-cyan">Catalog</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>All Challenges</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Browse the complete repository of submitted and published societal problems.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#06b6d4', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            Explore Challenges <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/team-formation" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(129,140,248,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(129,140,248,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                <Users size={22} />
              </div>
              <span className="badge badge-purple">Collaboration</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Teams & Squads</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Oversee multi-university student teams, invitations, and faculty mentorships.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#818cf8', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            View Squads <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/milestones" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(167,139,250,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(167,139,250,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <Target size={22} />
              </div>
              <span className="badge badge-blue">Deliverables</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Milestone Tracker</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Track live milestone deliverables, faculty validations, and deployment rubrics.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a78bfa', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            Open Milestone Tracker <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/analytics" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(16,185,129,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <BarChart2 size={22} />
              </div>
              <span className="badge badge-green">State & National</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Full Analytics Hub</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Comprehensive state-by-state, domain-wise, and SDG alignment reports.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            View Full Analytics <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 0, overflowX: 'auto' }}>
        {[
          ['challenges', `📬 Challenge Review Queue (${pendingChallenges.length})`],
          ['users', `👥 User Management (${stats?.totalUsers || 'All'})`],
          ['partnerships', `🤝 Industry & CSR Partnerships`],
          ['analytics', `📊 Platform Analytics & Scope`]
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: tab === id ? '2px solid var(--color-primary-500)' : '2px solid transparent',
              color: tab === id ? 'var(--color-primary-400)' : 'var(--text-secondary)',
              fontWeight: tab === id ? 700 : 500,
              paddingBottom: 12,
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ──────────────── TAB 1: PENDING CHALLENGES ──────────────── */}
      {tab === 'challenges' && (
        <div className="card p-6 mb-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Pending Challenge Review Queue</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Verify incoming problems for societal scope alignment, duplicate prevention, and university feasibility.
              </p>
            </div>
            <span className="badge badge-amber">{pendingChallenges.length} Pending</span>
          </div>

          {loading ? (
            <p className="text-muted">Loading queue...</p>
          ) : pendingChallenges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingChallenges.map((c) => (
                <div key={c.id} className="card p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{utils.categoryLabel(c.category)}</span>
                        <span className={`badge ${utils.difficultyBadge(c.difficulty)}`}>{c.difficulty}</span>
                        {c.state && <span className="badge badge-cyan">📍 {c.district ? `${c.district}, ` : ''}{c.state}</span>}
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Submitted by {c.submitter?.name || c.submitterOrg || 'Community Submitter'} &bull; {utils.timeAgo(c.createdAt)}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.15rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                        {c.title}
                      </h4>

                      <p className="text-secondary" style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 12 }}>
                        {c.description}
                      </p>

                      {c.requiredSkills && c.requiredSkills.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.requiredSkills.map((s, i) => (
                            <span key={i} className="skill-chip">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        onClick={() => handleVerify(c.id, 'approve')}
                        disabled={processing}
                        className="btn btn-primary btn-sm"
                        style={{ background: '#10b981', borderColor: '#10b981' }}
                      >
                        <Check size={14} /> Publish Challenge
                      </button>
                      <button
                        onClick={() => { setReviewChallenge(c); setAdminNotes(''); }}
                        className="btn btn-danger btn-sm"
                      >
                        <X size={14} /> Reject / Notes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <ShieldCheck size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h4>Verification Queue is Clear</h4>
              <p className="text-secondary">All submitted challenges have been reviewed and published.</p>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 2: USER MANAGEMENT ──────────────── */}
      {tab === 'users' && (
        <div className="card p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Platform User Accounts</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Activate, deactivate, and search users across all 9 institutional and community roles.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 34, height: 38, width: 220, fontSize: '0.85rem' }}
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadUsers()}
                />
                <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              </div>

              <select
                className="form-select"
                style={{ height: 38, fontSize: '0.85rem', width: 170 }}
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="citizen">Citizen Submitter</option>
                <option value="nodal_officer">Nodal Officer</option>
                <option value="university_admin">University Admin</option>
                <option value="faculty">Faculty Mentor</option>
                <option value="expert">Domain Expert</option>
                <option value="industry_partner">Industry / CSR</option>
                <option value="community">Community Member</option>
                <option value="admin">Platform Admin</option>
              </select>

              <button className="btn btn-outline btn-sm" onClick={loadUsers}>
                Search
              </button>
            </div>
          </div>

          {usersLoading ? (
            <p className="text-muted">Loading users...</p>
          ) : users.length === 0 ? (
            <div className="card p-8 text-center">
              <Users size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h4>No Users Found</h4>
              <p className="text-muted">Try adjusting your search query or role filter.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>User</th>
                    <th style={{ padding: '12px 14px' }}>Role</th>
                    <th style={{ padding: '12px 14px' }}>Affiliation / University</th>
                    <th style={{ padding: '12px 14px' }}>Location</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const roleBadgeClass = ROLE_COLORS[u.role] || 'badge-blue';
                    const isToggling = togglingUserId === u.id;
                    const isActive = u.isActive ?? true;

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.72rem' }}>
                            {u.role?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                          {u.university || u.organization || '—'}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {u.state ? `${u.district ? u.district + ', ' : ''}${u.state}` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${isActive ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.72rem' }}>
                            {isActive ? '● Active' : '○ Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <button
                            className={isActive ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            disabled={isToggling || u.id === stats?.currentUserId}
                            onClick={() => handleToggleUser(u.id, isActive)}
                          >
                            {isToggling ? '...' : isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 3: INDUSTRY PARTNERSHIPS ──────────────── */}
      {tab === 'partnerships' && (
        <div className="card p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Industry & CSR Proposals</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Review and approve corporate partnerships for mentoring, prototype grants, CSR adoption, and field pilots.
              </p>
            </div>

            <select
              className="form-select"
              style={{ height: 38, fontSize: '0.85rem', width: 170 }}
              value={partnerStatusFilter}
              onChange={e => setPartnerStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="proposed">Proposed</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {partnershipsLoading ? (
            <p className="text-muted">Loading partnerships...</p>
          ) : partnerships.length === 0 ? (
            <div className="card p-8 text-center">
              <Handshake size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h4>No Partnerships Found</h4>
              <p className="text-muted">No industry proposals currently match the filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {partnerships.map(p => {
                const badge = PARTNERSHIP_STATUS_BADGE[p.status] || PARTNERSHIP_STATUS_BADGE.proposed;
                return (
                  <div key={p.id} className="card p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                          <span className={`badge ${badge.class}`} style={{ fontSize: '0.75rem' }}>{badge.label}</span>
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>Type: {p.type?.replace(/_/g, ' ')}</span>
                          {p.fundingAmount && (
                            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                              ₹{Number(p.fundingAmount).toLocaleString('en-IN')}
                            </span>
                          )}
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                            By {p.industryPartner?.name || 'Partner'} ({p.industryPartner?.organization || 'Company'})
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', marginBottom: 6 }}>
                          Challenge: {p.Challenge?.title || 'Open Challenge'}
                        </h4>

                        <p className="text-secondary" style={{ fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 8 }}>
                          {p.proposal}
                        </p>

                        {p.notes && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '6px 10px', borderRadius: 6, display: 'inline-block' }}>
                            <strong>Admin Note:</strong> {p.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {p.status !== 'accepted' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10b981', borderColor: '#10b981' }}
                            onClick={() => { setPartnerModal({ partnership: p, action: 'accepted' }); setPartnerActionNotes(''); }}
                          >
                            <Check size={14} /> Accept Proposal
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => { setPartnerModal({ partnership: p, action: 'rejected' }); setPartnerActionNotes(''); }}
                          >
                            <X size={14} /> Reject Proposal
                          </button>
                        )}
                        {p.status === 'accepted' && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleUpdatePartnership(p.id, 'active', 'Activated partnership for pilot/collaboration')}
                          >
                            Mark Active
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 4: PLATFORM ANALYTICS ──────────────── */}
      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {analyticsLoading ? (
            <p className="text-muted">Loading analytics...</p>
          ) : (
            <>
              {/* Overview Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="card p-5">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Challenges Pipeline</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                    {analyticsOverview?.challenges?.total || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {analyticsOverview?.challenges?.published || 0} published &bull; {analyticsOverview?.challenges?.solved || 0} implemented
                  </div>
                </div>

                <div className="card p-5">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Student Innovator Teams</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                    {analyticsOverview?.teams?.total || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {analyticsOverview?.teams?.active || 0} active in sprints
                  </div>
                </div>

                <div className="card p-5">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Solutions & Prototypes</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
                    {analyticsOverview?.solutions?.total || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {analyticsOverview?.solutions?.approved || 0} certified prototypes
                  </div>
                </div>

                <div className="card p-5">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Industry Partnerships</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: 4 }}>
                    {analyticsOverview?.partnerships?.active || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Mentoring, CSR & pilots
                  </div>
                </div>
              </div>

              {/* Domain & State Distribution Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                {/* Domain Distribution */}
                <div className="card p-6">
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Challenges by Focus Domain</h4>
                  {analyticsDomain.length === 0 ? (
                    <p className="text-muted">No domain data available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {analyticsDomain.map(d => (
                        <div key={d.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                            <span>{utils.categoryLabel(d.category)}</span>
                            <span style={{ fontWeight: 600 }}>{d.count}</span>
                          </div>
                          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (Number(d.count) / Math.max(1, analyticsOverview?.challenges?.total || 1)) * 100)}%`,
                              height: '100%',
                              background: '#38bdf8',
                              borderRadius: 4
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* State Distribution */}
                <div className="card p-6">
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 16 }}>State Representation</h4>
                  {analyticsState.length === 0 ? (
                    <p className="text-muted">No state data available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {analyticsState.slice(0, 8).map(st => (
                        <div key={st.state}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                            <span>📍 {st.state}</span>
                            <span style={{ fontWeight: 600 }}>{st.count} challenges</span>
                          </div>
                          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (Number(st.count) / Math.max(1, analyticsOverview?.challenges?.total || 1)) * 100)}%`,
                              height: '100%',
                              background: '#10b981',
                              borderRadius: 4
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal: Challenge Review / Rejection Notes */}
      {reviewChallenge && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
        }}>
          <div className="card p-8" style={{ width: '100%', maxWidth: 540 }}>
            <h3 style={{ marginBottom: 8 }}>Review Feedback & Notes</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 16 }}>
              Challenge: <strong>{reviewChallenge.title}</strong>
            </p>

            <div className="form-group mb-6">
              <label className="form-label">Review / Rejection Reason</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Explain why this challenge was rejected or needs refinement (e.g. Needs clearer technological scope, duplicates existing problem)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setReviewChallenge(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                className="btn btn-danger"
                onClick={() => handleVerify(reviewChallenge.id, 'reject')}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Partnership Review Action */}
      {partnerModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
        }}>
          <div className="card p-8" style={{ width: '100%', maxWidth: 520 }}>
            <h3 style={{ marginBottom: 8 }}>
              {partnerModal.action === 'accepted' ? 'Accept Partnership' : 'Reject Partnership'}
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 16 }}>
              Proposal from: <strong>{partnerModal.partnership?.industryPartner?.name || 'Partner'}</strong>
            </p>

            <div className="form-group mb-6">
              <label className="form-label">
                {partnerModal.action === 'accepted' ? 'Acceptance & Terms Note (Optional)' : 'Rejection Reason (will be notified to partner)'}
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder={partnerModal.action === 'accepted' ? 'Terms of engagement, assigned coordinator, etc.' : 'Reason for rejection...'}
                value={partnerActionNotes}
                onChange={e => setPartnerActionNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setPartnerModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={processingPartner}
                className={partnerModal.action === 'accepted' ? 'btn btn-primary' : 'btn btn-danger'}
                onClick={() => handleUpdatePartnership(partnerModal.partnership.id, partnerModal.action, partnerActionNotes)}
              >
                {processingPartner ? 'Processing...' : partnerModal.action === 'accepted' ? 'Confirm Acceptance' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
