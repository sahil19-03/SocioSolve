import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2, Users, BookOpen, CheckCircle2, ArrowRight,
  BarChart3, Globe, Layers, ExternalLink, Compass, MapPin,
  Handshake, Sparkles, RefreshCw, Search, Filter, X, Clock,
  AlertCircle, ChevronRight, Award, Target, FileText, Check, AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  { id: '',                     label: 'All Domains' },
  { id: 'water',                label: '💧 Water' },
  { id: 'healthcare',           label: '🏥 Healthcare' },
  { id: 'agriculture',         label: '🌾 Agriculture' },
  { id: 'energy',               label: '🔋 Energy' },
  { id: 'education',            label: '🎓 Education' },
  { id: 'environment',          label: '🌱 Environment' },
  { id: 'smart_city',           label: '🏙️ Smart City' },
  { id: 'rural_livelihoods',    label: '🌻 Rural Livelihoods' },
  { id: 'urban_infrastructure', label: '🏗️ Urban Infra' },
  { id: 'public_administration',label: '🏛️ Public Admin' },
  { id: 'accessibility',        label: '♿ Accessibility' },
];

function UrgencyBadge({ urgency }) {
  const map = {
    critical: { bg: 'rgba(239,68,68,.2)', color: '#f87171', label: '⚡ Critical' },
    high:     { bg: 'rgba(249,115,22,.2)',color: '#fb923c', label: '🔴 High' },
    medium:   { bg: 'rgba(59,130,246,.2)',color: '#60a5fa', label: '🟡 Medium' },
    low:      { bg: 'rgba(16,185,129,.2)',color: '#34d399', label: '🟢 Low' },
  };
  const m = map[urgency] || map.medium;
  return (
    <span className="badge" style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}44` }}>
      {m.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    published:           { color: '#06b6d4', label: 'Published' },
    verified:            { color: '#10b981', label: 'Govt Verified' },
    assigned:            { color: '#818cf8', label: '⏳ Pending Govt Approval' },
    converted_to_project:{ color: '#a78bfa', label: '✅ Project Confirmed' },
  };
  const m = map[status] || { color: '#94a3b8', label: status };
  return (
    <span className="badge" style={{ background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}44` }}>
      {m.label}
    </span>
  );
}

export default function UniversityAdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [campusTeams, setCampusTeams] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Claim modal state
  const [claimTarget, setClaimTarget] = useState(null);
  const [claimNote, setClaimNote] = useState('');
  const [claiming, setClaiming] = useState(false);

  // Proposal review modal state
  const [reviewProposal, setReviewProposal] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewing, setReviewing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (catFilter) params.set('category', catFilter);

      const [avRes, clRes, tmRes, propRes] = await Promise.all([
        api.get(`/challenges/available-for-hei?${params}`).catch(() => ({ success: true, data: [] })),
        api.get('/challenges/claimed-by-hei').catch(() => ({ success: true, data: [] })),
        api.get('/teams/university').catch(() => ({ success: true, data: [] })),
        api.get('/solutions/proposals-for-review').catch(() => ({ success: true, data: [] }))
      ]);

      setAvailable(avRes.success ? avRes.data : []);
      setClaimed(clRes.success ? clRes.data : []);
      setCampusTeams(tmRes.success ? tmRes.data : []);
      setProposals(propRes.success ? propRes.data : []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, catFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleClaimSubmit = async () => {
    if (!claimTarget) return;
    setClaiming(true);
    try {
      const res = await api.post(`/challenges/${claimTarget.id}/express-interest`, {
        note: claimNote || undefined
      });
      if (res.success) {
        toast.success(res.message);
        setClaimTarget(null);
        setClaimNote('');
        setActiveTab('claimed');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to claim challenge');
    } finally {
      setClaiming(false);
    }
  };

  const handleApproveTeam = async (teamId) => {
    try {
      const res = await api.patch(`/teams/${teamId}/approve`, {
        coordinatorNotes: `Institutional constitution approved by ${user?.organization || 'HEI Coordinator'}. Lab access authorized.`
      });
      toast.success(res.message || 'Team constitution approved!');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve team');
    }
  };

  const handleProposalReviewSubmit = async () => {
    if (!reviewProposal) return;
    setReviewing(true);
    try {
      const res = await api.patch(`/solutions/${reviewProposal.id}/proposal-review`, {
        decision: reviewDecision,
        feedback: reviewFeedback
      });
      toast.success(res.message);
      setReviewProposal(null);
      setReviewFeedback('');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  // Skill match score
  function matchScore(challenge) {
    const uniSkills = (user?.skills || []).map(s => s.toLowerCase());
    const chalSkills = (challenge.requiredSkills || []).map(s => s.toLowerCase());
    if (!uniSkills.length || !chalSkills.length) return null;
    const matched = chalSkills.filter(s => uniSkills.some(u => u.includes(s) || s.includes(u)));
    return Math.round((matched.length / chalSkills.length) * 100);
  }

  const confirmedProjects = claimed.filter(c => c.status === 'converted_to_project');
  const pendingApproval   = claimed.filter(c => c.status === 'assigned' && !c.assignedUniversityId);

  return (
    <div className="dashboard-container" style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1200 }}>

        {/* ── HEI Hero ─────────────────────────────────────────────── */}
        <div className="card p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(129,140,248,.14) 0%, rgba(167,139,250,.14) 100%)',
          borderColor: 'rgba(129,140,248,.35)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(129,140,248,.25)', color: '#818cf8', border: '1px solid rgba(129,140,248,.4)' }}>
                  <Building2 size={13} style={{ marginRight: 5 }} />HEI Coordinator Portal
                </span>
                <span className="badge badge-cyan">Match & Endorsement</span>
              </div>
              <h1 style={{ fontSize: '2.1rem', marginBottom: 8 }}>{user?.organization || 'University Dashboard'}</h1>
              <p className="text-secondary" style={{ maxWidth: 680, margin: 0 }}>
                Claim public challenges, supervise multidisciplinary student teams, and review engineering proposals for institutional support.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleRefresh} disabled={refreshing} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Syncing…' : 'Sync Portal'}
              </button>
            </div>
          </div>
        </div>

        {/* ── 4 Key Metric Tiles ───────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18, marginBottom: 32 }}>
          <div className="card p-6" style={{ borderLeft: '4px solid #06b6d4' }}>
            <span className="text-muted" style={{ fontSize: '.85rem', fontWeight: 600 }}>Available Challenges</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', marginTop: 4 }}>
              {loading ? '—' : available.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '.78rem', marginTop: 4 }}>Open for institutional claims</div>
          </div>

          <div className="card p-6" style={{ borderLeft: '4px solid #a78bfa' }}>
            <span className="text-muted" style={{ fontSize: '.85rem', fontWeight: 600 }}>Confirmed Projects</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>
              {loading ? '—' : confirmedProjects.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '.78rem', marginTop: 4 }}>Active projects under development</div>
          </div>

          <div className="card p-6" style={{ borderLeft: '4px solid #818cf8' }}>
            <span className="text-muted" style={{ fontSize: '.85rem', fontWeight: 600 }}>Campus Student Squads</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8', marginTop: 4 }}>
              {loading ? '—' : campusTeams.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '.78rem', marginTop: 4 }}>Student Formations</div>
          </div>

          <div className="card p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span className="text-muted" style={{ fontSize: '.85rem', fontWeight: 600 }}>Proposals Pending</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
              {loading ? '—' : proposals.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '.78rem', marginTop: 4 }}>Awaiting HEI Endorsement</div>
          </div>
        </div>

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-color)', marginBottom: 24, paddingBottom: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'available', label: `Available Challenges (${available.length})` },
            { key: 'claimed',   label: `Claimed Challenges (${claimed.length})` },
            { key: 'teams',     label: `Campus Squads (${campusTeams.length})` },
            { key: 'proposals', label: `Proposal Reviews (${proposals.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 20 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Available Challenges ────────────────── */}
        {activeTab === 'available' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, district, state…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 36 }}
                />
              </div>
              <select
                className="form-control"
                style={{ flex: '0 1 200px' }}
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              {(search || catFilter) && (
                <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setCatFilter(''); }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            {loading ? (
              <div className="card p-10 text-center">
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <p className="text-muted">Loading available challenges…</p>
              </div>
            ) : available.length === 0 ? (
              <div className="card p-10 text-center">
                <Compass size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <h3>No challenges match your filters</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {available.map(c => {
                  const score = matchScore(c);
                  const alreadyClaimed = claimed.some(cl => cl.id === c.id);
                  return (
                    <div key={c.id} className="card p-6" style={{
                      borderLeft: c.urgency === 'critical' ? '4px solid #f87171' : c.priorityScore >= 9 ? '4px solid #fbbf24' : undefined
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {c.submissionCode && (
                            <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{c.submissionCode}</span>
                          )}
                          <StatusBadge status={c.status} />
                          <span className="badge badge-purple">{c.category}</span>
                          {c.urgency && <UrgencyBadge urgency={c.urgency} />}
                          {score !== null && (
                            <span className="badge badge-green">{score}% Skill Match</span>
                          )}
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{c.title}</h3>
                      <p className="text-secondary" style={{ fontSize: '.9rem', lineHeight: 1.6, marginBottom: 14 }}>
                        {c.description ? c.description.slice(0, 200) + '…' : ''}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
                        <Link to={`/challenge/${c.id}`} target="_blank" className="btn btn-outline btn-sm">
                          <ExternalLink size={13} /> Full Dossier
                        </Link>
                        {alreadyClaimed ? (
                          <span className="badge badge-green" style={{ padding: '6px 14px' }}>✅ Already Claimed</span>
                        ) : (
                          <button
                            onClick={() => { setClaimTarget(c); setClaimNote(''); }}
                            className="btn btn-primary"
                            style={{ padding: '7px 20px', fontSize: '.9rem' }}
                          >
                            <Handshake size={15} style={{ marginRight: 6 }} /> Claim for {user?.organization?.split(' ')[0] || 'HEI'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: Claimed Challenges ────────────────────────────── */}
        {activeTab === 'claimed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {claimed.length === 0 ? (
              <div className="card p-10 text-center">
                <Award size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <h3>No challenges claimed yet</h3>
              </div>
            ) : (
              claimed.map(c => (
                <div key={c.id} className="card p-6" style={{
                  borderLeft: c.status === 'converted_to_project' ? '4px solid #a78bfa' : '4px solid #f59e0b'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className="badge badge-blue">{c.submissionCode}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{c.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <Link to={`/team-formation?challengeId=${c.id}`} className="btn btn-primary btn-sm">
                      <Users size={14} style={{ marginRight: 6 }} /> Form Squad
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: Campus Teams ────────────────────────── */}
        {activeTab === 'teams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {campusTeams.length === 0 ? (
              <div className="card p-10 text-center">
                <Users size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <h3>No Student Squads Formed Yet</h3>
                <p className="text-secondary">Students can form teams under your HEI's claimed challenges.</p>
              </div>
            ) : (
              campusTeams.map(t => (
                <div key={t.id} className="card p-6" style={{ borderLeft: '4px solid #818cf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span className="badge badge-purple">Squad</span>
                        {t.isApprovedByCoordinator ? (
                          <span className="badge badge-green"><CheckCircle2 size={11} style={{ marginRight: 4 }} /> Constitution Approved</span>
                        ) : (
                          <span className="badge badge-amber"><Clock size={11} style={{ marginRight: 4 }} /> Pending Approval</span>
                        )}
                        <span className="badge badge-blue">{t.members?.length || 1} / {t.maxMembers} Members</span>
                      </div>
                      <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{t.name}</h3>
                      <p className="text-secondary" style={{ fontSize: '.88rem', margin: '4px 0 0' }}>
                        Challenge: <strong>{t.Challenge?.title}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Link to={`/team-formation?teamId=${t.id}`} className="btn btn-outline btn-sm">
                        View Dossier
                      </Link>
                      {!t.isApprovedByCoordinator && (
                        <button
                          onClick={() => handleApproveTeam(t.id)}
                          className="btn btn-primary btn-sm"
                          style={{ background: '#10b981', borderColor: '#10b981' }}
                        >
                          <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Approve Constitution
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '.85rem' }}>
                    <div>Leader: <strong>{t.leader?.name}</strong> ({t.leader?.email})</div>
                    <div>Faculty Mentor: <strong>{t.facultyMentor ? t.facultyMentor.name : 'Pending Assignment'}</strong></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: Proposal Reviews ──────────────── */}
        {activeTab === 'proposals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {proposals.length === 0 ? (
              <div className="card p-10 text-center">
                <CheckCircle2 size={40} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3>No Proposal Reviews Awaiting Endorsement</h3>
                <p className="text-secondary">Proposals appear here once they pass faculty mentor review.</p>
              </div>
            ) : (
              proposals.map(p => (
                <div key={p.id} className="card p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span className="badge badge-amber">Institutional Review</span>
                        <span className="badge badge-green">Faculty Review: Approved ✓</span>
                      </div>
                      <h3 style={{ fontSize: '1.3rem' }}>{p.title}</h3>
                      <p className="text-secondary" style={{ fontSize: '.88rem', margin: '4px 0 0' }}>
                        Squad: <strong>{p.Team?.name}</strong> &bull; Challenge: <strong>{p.Challenge?.title}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => { setReviewProposal(p); setReviewDecision('approved'); setReviewFeedback(''); }}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', background: '#818cf8', borderColor: '#818cf8' }}
                    >
                      <CheckCircle2 size={15} style={{ marginRight: 6 }} /> Institutional Endorsement
                    </button>
                  </div>

                  <div style={{ padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '.85rem' }}>
                    <div style={{ marginBottom: 6 }}><strong>Faculty Mentor Feedback:</strong> {p.facultyFeedback || 'Validated by academic guide.'}</div>
                    <div>Budget: <strong>{p.budgetEstimate}</strong> &bull; Execution: <strong>{p.timelineWeeks} weeks</strong></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Claim Modal ──────────────────────────────────────────── */}
        {claimTarget && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div className="card p-8" style={{ maxWidth: 560, width: '100%', position: 'relative' }}>
              <button onClick={() => setClaimTarget(null)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>

              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <Handshake size={22} color="#818cf8" />
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Express Institutional Interest</h2>
              </div>

              <div className="card p-4" style={{ background: 'var(--bg-secondary)', marginBottom: 20, borderRadius: 8 }}>
                <div className="badge badge-blue" style={{ fontFamily: 'monospace', marginBottom: 6 }}>{claimTarget.submissionCode}</div>
                <div style={{ fontWeight: 700 }}>{claimTarget.title}</div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Institutional Commitment Note</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={claimNote}
                  onChange={e => setClaimNote(e.target.value)}
                  placeholder={`State department expertise and lab readiness...`}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setClaimTarget(null)} className="btn btn-outline" disabled={claiming}>Cancel</button>
                <button onClick={handleClaimSubmit} className="btn btn-primary" disabled={claiming}>
                  {claiming ? 'Submitting…' : '🏛️ Confirm Institutional Interest'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tier 2 Proposal Review Modal ─────────────────────────── */}
        {reviewProposal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div className="card p-8" style={{ maxWidth: 640, width: '100%', position: 'relative' }}>
              <button onClick={() => setReviewProposal(null)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>

              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <Building2 size={22} color="#818cf8" />
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Institutional Lab Endorsement</h2>
              </div>

              <p className="text-secondary" style={{ fontSize: '.9rem', marginBottom: 16 }}>
                Proposal: <strong>{reviewProposal.title}</strong> by <strong>{reviewProposal.Team?.name}</strong>
              </p>

              <div className="form-group mb-4">
                <label className="form-label">Endorsement Decision</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={reviewDecision === 'approved'}
                      onChange={() => setReviewDecision('approved')}
                    />
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Endorse & Forward for Government Review</span>
                  </label>
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Coordinator Institutional Clearance Notes</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Confirm lab access, safety clearance, and resource backing..."
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setReviewProposal(null)} className="btn btn-outline" disabled={reviewing}>Cancel</button>
                <button onClick={handleProposalReviewSubmit} className="btn btn-primary" disabled={reviewing}>
                  {reviewing ? 'Submitting…' : 'Confirm Endorsement ✓'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
