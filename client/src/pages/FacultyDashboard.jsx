import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap, Users, BookOpen, Target, CheckCircle2,
  ArrowRight, Compass, RefreshCw, Clock, AlertTriangle, Award,
  FileText, Lightbulb, Check, X, ShieldAlert, Flag
} from 'lucide-react';


export default function FacultyDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals', 'milestones', 'challenges'
  const [proposals, setProposals] = useState([]);
  // facultyTeams: [{ teamId, teamName, leader, challenge, milestones: [], stats: {} }]
  const [facultyTeams, setFacultyTeams] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proposal review modal
  const [reviewModalProposal, setReviewModalProposal] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewingProposal, setReviewingProposal] = useState(false);

  // Milestone validation inline state
  const [validatingMs, setValidatingMs] = useState({});
  const [msFeedback, setMsFeedback] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [propRes, msRes, chalRes] = await Promise.all([
        api.get('/solutions/proposals-for-review').catch(() => ({ success: true, data: [] })),
        api.get('/milestones/faculty-teams').catch(() => ({ success: true, data: [] })),
        api.get('/challenges?limit=10').catch(() => ({ success: true, data: [] })),
      ]);

      if (propRes.success) setProposals(propRes.data || []);
      if (msRes.success) setFacultyTeams(msRes.data || []);
      if (chalRes.success) setChallenges(chalRes.data || []);
    } catch (err) {
      console.warn('Faculty dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleProposalReviewSubmit = async () => {
    if (!reviewModalProposal) return;
    setReviewingProposal(true);
    try {
      const res = await api.patch(`/solutions/${reviewModalProposal.id}/proposal-review`, {
        decision: reviewDecision,
        feedback: reviewFeedback
      });
      toast.success(res.message);
      setReviewModalProposal(null);
      setReviewFeedback('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setReviewingProposal(false);
    }
  };

  const handleValidateMilestone = async (milestoneId, action) => {
    const feedback = msFeedback[milestoneId] || '';
    setValidatingMs(prev => ({ ...prev, [milestoneId]: true }));
    try {
      const res = await api.put(`/milestones/${milestoneId}/validate`, { action, mentorFeedback: feedback });
      if (res.success) {
        toast.success(action === 'approve' ? '✅ Milestone approved!' : '🔄 Revision requested');
        // Update local state without full reload
        setFacultyTeams(prev => prev.map(t => ({
          ...t,
          milestones: t.milestones.map(m => m.id === milestoneId ? res.data : m),
          stats: {
            ...t.stats,
            done: t.milestones.filter(m => m.id === milestoneId ? res.data.status === 'completed' : m.status === 'completed').length,
            pending: t.milestones.filter(m => m.id === milestoneId ? false : (m.status === 'pending' || m.status === 'in_progress')).length
          }
        })));
      }
    } catch (err) {
      toast.error(err.message || 'Could not update milestone');
    } finally {
      setValidatingMs(prev => ({ ...prev, [milestoneId]: false }));
    }
  };

  // Computed stats across all faculty teams
  const allMilestones = facultyTeams.flatMap(t => t.milestones || []);
  const pendingMilestones = allMilestones.filter(m => m.status === 'in_progress' || m.status === 'pending');
  const overdueMilestones = allMilestones.filter(m => m.status === 'overdue');
  const approvedMilestones = allMilestones.filter(m => m.status === 'completed');

  return (
    <div className="dashboard-container">

      {/* Welcome Banner */}
      <div className="card p-8 mb-8" style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.12) 100%)',
        borderColor: 'rgba(139,92,246,0.3)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <span className="badge badge-purple">Faculty Reviewer</span>
              <span className="badge badge-blue">Academic Feasibility & Lab Rigour</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>
              Welcome, Prof. {user?.name || 'Faculty Guide'}
            </h1>
            <p className="text-secondary" style={{ maxWidth: 680 }}>
              Review student engineering proposals, validate sensor schematics and technical architecture, and endorse squads for institutional lab resources.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={loadData} className="btn btn-outline btn-sm">
              <RefreshCw size={14} /> Sync Reviews
            </button>
            <Link to="/explore" className="btn btn-primary btn-sm">
              <Compass size={15} /> Innovation Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card p-6" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Proposals Pending</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>
            {loading ? '—' : proposals.length}
          </div>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>awaiting academic validation</span>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #fbbf24' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Milestones</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            {loading ? '—' : pendingMilestones.length}
          </div>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>in progress or pending</span>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #f43f5e' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overdue Milestones</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e', marginTop: 4 }}>
            {loading ? '—' : overdueMilestones.length}
          </div>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>require urgent attention</span>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #34d399' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Milestones Approved</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            {loading ? '—' : approvedMilestones.length}
          </div>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>validated milestones</span>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #06b6d4' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Department Challenges</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', marginTop: 4 }}>
            {loading ? '—' : challenges.length}
          </div>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>open for guidance</span>
        </div>
      </div>


      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', marginBottom: 24, paddingBottom: 8 }}>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`btn ${activeTab === 'proposals' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 20 }}
        >
          Proposal Reviews ({proposals.length})
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`btn ${activeTab === 'milestones' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 20 }}
        >
          Milestone Queue ({pendingMilestones.length})
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`btn ${activeTab === 'challenges' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 20 }}
        >
          Department Challenges ({challenges.length})
        </button>
      </div>

      {/* Tab 1: Proposals Review */}
      {activeTab === 'proposals' && (
        <div>
          {loading ? (
            <div className="card p-12 text-center">
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p className="text-muted">Loading proposal reviews...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px', opacity: 0.8 }} />
              <h3>All Proposals Reviewed</h3>
              <p className="text-secondary" style={{ maxWidth: 480, margin: '8px auto 0' }}>
                No student proposals are currently awaiting faculty mentor review. When teams submit proposals, they will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {proposals.map((prop) => (
                <div key={prop.id} className="card p-6" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span className="badge badge-purple">Faculty Review</span>
                        <span className="badge badge-blue">Team: {prop.Team?.name || 'Student Squad'}</span>
                        {prop.Challenge?.submissionCode && (
                          <span className="badge badge-gray">{prop.Challenge.submissionCode}</span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>{prop.title}</h3>
                      <p className="text-secondary" style={{ fontSize: '0.9rem', margin: '4px 0 0' }}>
                        Target: <strong>{prop.Challenge?.title}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => {
                          setReviewModalProposal(prop);
                          setReviewDecision('approved');
                          setReviewFeedback('');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', background: '#10b981', borderColor: '#10b981' }}
                      >
                        <CheckCircle2 size={15} style={{ marginRight: 6 }} /> Review & Endorse
                      </button>
                    </div>
                  </div>

                  {/* Proposal Summary Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Root Cause Diagnosis</strong>
                      <p style={{ fontSize: '0.88rem', margin: '4px 0 0', lineHeight: 1.5 }}>
                        {prop.rootCauseAnalysis ? prop.rootCauseAnalysis.slice(0, 160) + '...' : 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Technical Architecture</strong>
                      <p style={{ fontSize: '0.88rem', margin: '4px 0 0', lineHeight: 1.5 }}>
                        {prop.technicalArchitecture ? prop.technicalArchitecture.slice(0, 160) + '...' : 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Impact & Timeline</strong>
                      <p style={{ fontSize: '0.88rem', margin: '4px 0 0' }}>
                        Budget: <strong>{prop.budgetEstimate || '₹1,00,000'}</strong> &bull; Timeline: <strong>{prop.timelineWeeks || 8} wks</strong>
                      </p>
                      {prop.techStack && prop.techStack.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                          {prop.techStack.map((t, i) => (
                            <span key={i} className="skill-chip" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Milestones Queue */}
      {activeTab === 'milestones' && (
        <div>
          {facultyTeams.length === 0 ? (
            <div className="card p-12 text-center">
              <Flag size={48} style={{ color: '#64748b', margin: '0 auto 16px', opacity: 0.6 }} />
              <h3>No teams assigned yet</h3>
              <p className="text-secondary" style={{ maxWidth: 480, margin: '8px auto 0' }}>
                Once you are assigned as a faculty mentor to student teams, their milestones will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {facultyTeams.map(teamData => {
                const activeMilestones = (teamData.milestones || []).filter(m => m.status !== 'completed');
                const doneMilestones = (teamData.milestones || []).filter(m => m.status === 'completed');
                const pct = teamData.milestones?.length > 0 ? Math.round((doneMilestones.length / teamData.milestones.length) * 100) : 0;
                return (
                  <div key={teamData.teamId} className="card" style={{ overflow: 'visible' }}>
                    {/* Team Header */}
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                          <span className="badge badge-purple">{teamData.teamName}</span>
                          {teamData.challenge && <span className="badge badge-blue">{teamData.challenge.title?.slice(0, 40)}...</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Leader: {teamData.leader?.name || 'Unknown'} · {teamData.milestones?.length || 0} milestones
                        </div>
                      </div>
                      {/* Mini progress */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 9999, height: 8, width: 120, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius: 9999, transition: 'width 0.8s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct === 100 ? '#10b981' : '#3b82f6' }}>{pct}%</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doneMilestones.length}/{teamData.milestones?.length || 0} done</span>
                      </div>
                    </div>

                    {/* Active Milestones */}
                    <div style={{ padding: '16px 22px' }}>
                      {activeMilestones.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <CheckCircle2 size={24} color="#10b981" style={{ marginBottom: 6 }} />
                          <p>All milestones completed! Great work from this team.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {activeMilestones.map(m => {
                            const statusColors = { pending: '#64748b', in_progress: '#f59e0b', overdue: '#f43f5e' };
                            const sc = statusColors[m.status] || '#64748b';
                            return (
                              <div key={m.id} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, borderLeft: `3px solid ${sc}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sc, textTransform: 'uppercase' }}>{m.status.replace('_', ' ')}</span>
                                      {m.dueDate && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due: {utils.formatDate(m.dueDate)}</span>}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                                      {m.orderIndex > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 6 }}>#{m.orderIndex}</span>}
                                      {m.title}
                                    </div>
                                    {m.deliverables?.length > 0 && (
                                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                        {m.deliverables.slice(0, 3).map((d, i) => (
                                          <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(100,116,139,0.15)', color: 'var(--text-muted)', borderRadius: 4, padding: '2px 6px' }}>{d}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button
                                      className="btn btn-primary btn-sm"
                                      style={{ background: '#10b981', borderColor: '#10b981', fontSize: '0.78rem' }}
                                      disabled={validatingMs[m.id]}
                                      onClick={() => handleValidateMilestone(m.id, 'approve')}>
                                      <CheckCircle2 size={13} /> {validatingMs[m.id] ? '...' : 'Approve'}
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      style={{ fontSize: '0.78rem' }}
                                      disabled={validatingMs[m.id]}
                                      onClick={() => handleValidateMilestone(m.id, 'request_revision')}>
                                      <RefreshCw size={13} /> Revise
                                    </button>
                                  </div>
                                </div>
                                {/* Inline feedback */}
                                <div style={{ marginTop: 10 }}>
                                  <input
                                    className="form-input"
                                    placeholder="Optional feedback for this milestone..."
                                    style={{ fontSize: '0.82rem' }}
                                    value={msFeedback[m.id] || ''}
                                    onChange={e => setMsFeedback(prev => ({ ...prev, [m.id]: e.target.value }))}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Completed summary */}
                      {doneMilestones.length > 0 && (
                        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CheckCircle2 size={16} color="#10b981" />
                          <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>{doneMilestones.length} milestone{doneMilestones.length > 1 ? 's' : ''} completed</span>
                          <Link to="/milestones" style={{ fontSize: '0.78rem', color: '#3b82f6', marginLeft: 'auto' }}>Full Tracker →</Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* Tab 3: Department Challenges */}
      {activeTab === 'challenges' && (
        <div className="card p-8">
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Open Domain Challenges</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {challenges.map((c) => (
              <div key={c.id} className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="badge badge-blue">{utils.categoryLabel(c.category)}</span>
                    <h4 style={{ fontSize: '1.05rem', margin: '4px 0' }}>{c.title}</h4>
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{c.impactArea}</p>
                  </div>
                  <Link to={`/challenge/${c.id}`} className="btn btn-outline btn-sm">
                    Inspect Problem &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal for Proposal */}
      {reviewModalProposal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card p-8" style={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-purple">Faculty Review</span>
                <span className="badge badge-green">Academic Feasibility</span>
              </div>
              <button onClick={() => setReviewModalProposal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>{reviewModalProposal.title}</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
              Submitted by <strong>{reviewModalProposal.Team?.name}</strong> for {reviewModalProposal.Challenge?.title}
            </p>

            {/* Dossier Tabs / Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#818cf8' }}>Root Cause Analysis:</strong>
                <p style={{ fontSize: '0.88rem', margin: '4px 0 0', lineHeight: 1.5 }}>{reviewModalProposal.rootCauseAnalysis}</p>
              </div>

              <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#818cf8' }}>Technical Architecture & Components:</strong>
                <p style={{ fontSize: '0.88rem', margin: '4px 0 0', lineHeight: 1.5 }}>{reviewModalProposal.technicalArchitecture}</p>
              </div>

              <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#818cf8' }}>Social & Community Impact:</strong>
                <p style={{ fontSize: '0.88rem', margin: '4px 0 0', lineHeight: 1.5 }}>{reviewModalProposal.impactMetrics}</p>
              </div>

              {reviewModalProposal.riskMitigation && (
                <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#818cf8' }}>Field Risk Mitigation:</strong>
                  <p style={{ fontSize: '0.88rem', margin: '4px 0 0', lineHeight: 1.5 }}>{reviewModalProposal.riskMitigation}</p>
                </div>
              )}
            </div>

            {/* Review Decision */}
            <div className="form-group mb-4">
              <label className="form-label">Review Decision</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="decision"
                    value="approved"
                    checked={reviewDecision === 'approved'}
                    onChange={() => setReviewDecision('approved')}
                  />
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Approve & Forward to University Review</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="decision"
                    value="revision_required"
                    checked={reviewDecision === 'revision_required'}
                    onChange={() => setReviewDecision('revision_required')}
                  />
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Request Technical Revisions</span>
                </label>
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Faculty Feedback & Guidance Notes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="State remarks on sensor selection, power consumption, circuit safety, or mathematical framing..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setReviewModalProposal(null)}>
                Cancel
              </button>
              <button
                disabled={reviewingProposal}
                onClick={handleProposalReviewSubmit}
                className="btn btn-primary"
                style={{
                  background: reviewDecision === 'approved' ? '#10b981' : '#f59e0b',
                  borderColor: reviewDecision === 'approved' ? '#10b981' : '#f59e0b'
                }}
              >
                {reviewingProposal ? 'Recording...' : reviewDecision === 'approved' ? 'Approve Proposal ✓' : 'Send Revisions Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
