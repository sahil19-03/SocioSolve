import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  PlusCircle, Eye, Users, Lightbulb, MapPin,
  HelpCircle, ArrowRight, RefreshCw, Clock, CheckCircle2,
  Star, MessageSquare, Award, ThumbsUp, X
} from 'lucide-react';

const STATUS_PIPELINE = [
  { key: 'submitted',           label: 'Submitted',          icon: '📬', color: '#94a3b8' },
  { key: 'verified',            label: 'Govt Verified',      icon: '✅', color: '#10b981' },
  { key: 'published',           label: 'Published to HEIs',  icon: '🏛️', color: '#06b6d4' },
  { key: 'assigned',            label: 'University Assigned', icon: '🎓', color: '#818cf8' },
  { key: 'converted_to_project',label: 'In Development',     icon: '🛠️', color: '#a78bfa' },
  { key: 'solved',              label: 'Implemented',        icon: '🌟', color: '#34d399' },
];

function getStatusMeta(status) {
  return (
    STATUS_PIPELINE.find(s => s.key === status) ||
    { key: status, label: status, icon: '📋', color: '#94a3b8' }
  );
}

export default function SubmitterDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phase 10: Community Feedback Modal
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [verifiedImpact, setVerifiedImpact] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadMySubmissions = async () => {
    setLoading(true);
    try {
      // Phase 1: dedicated /my endpoint returns ALL statuses for the logged-in submitter
      const res = await api.get('/challenges/my');
      if (res.success && Array.isArray(res.data)) {
        setMyChallenges(res.data);
      }
    } catch (err) {
      console.warn('Falling back to public challenges list:', err.message);
      try {
        const res2 = await api.get('/challenges?limit=50&status=published');
        if (res2.success && Array.isArray(res2.data)) {
          setMyChallenges(res2.data.filter(c => c.submitterId === user?.id));
        }
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMySubmissions(); }, [user?.id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackModal) return;
    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/challenges/${feedbackModal.id}/community-feedback`, {
        rating: Number(rating),
        feedback: feedbackText,
        verifiedImpact
      });
      if (res.success) {
        toast.success('Your community impact feedback has been recorded! Thank you.');
        setFeedbackModal(null);
        setFeedbackText('');
        loadMySubmissions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const totalTeams     = myChallenges.reduce((a, c) => a + (c.teamCount || 0), 0);
  const totalSolutions = myChallenges.reduce((a, c) => a + (c.solutionCount || 0), 0);
  const solvedCount    = myChallenges.filter(c => c.status === 'solved').length;
  const needsInfoCount = myChallenges.filter(c => c.status === 'needs_information').length;

  return (
    <div className="dashboard-container">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="card p-8 mb-8" style={{
        background: 'linear-gradient(135deg, rgba(6,182,212,.12) 0%, rgba(59,130,246,.12) 100%)',
        borderColor: 'rgba(6,182,212,.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: 12 }}>Phase 1 · Problem Submission Portal</span>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Welcome, {user?.name || 'Problem Submitter'}</h1>
            <p className="text-secondary" style={{ maxWidth: 640 }}>
              Track every challenge you submitted — from community report through government verification to university innovation and real-world implementation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={loadMySubmissions} className="btn btn-outline" disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <Link to="/submit-challenge" className="btn btn-primary">
              <PlusCircle size={16} /> Submit New Challenge
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Submissions', value: myChallenges.length, color: '#38bdf8', sub: 'All statuses' },
          { label: 'Awaiting Your Reply', value: needsInfoCount, color: '#c084fc', sub: 'Govt requested info', alert: needsInfoCount > 0 },
          { label: 'Student Teams Active', value: totalTeams, color: '#a78bfa', sub: 'Across all challenges' },
          { label: 'Solutions Received', value: totalSolutions, color: '#fbbf24', sub: 'Submitted by teams' },
          { label: 'Implemented ✅', value: solvedCount, color: '#34d399', sub: 'Real community impact' },
        ].map(stat => (
          <div key={stat.label} className="card p-6"
            style={{ borderLeft: stat.alert ? `4px solid ${stat.color}` : undefined }}
          >
            <span className="text-muted" style={{ fontSize: '.85rem', fontWeight: 600 }}>{stat.label}</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, marginTop: 4 }}>
              {loading ? '—' : stat.value}
            </div>
            {stat.sub && <div className="text-secondary" style={{ fontSize: '.78rem', marginTop: 4 }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Submissions list ─────────────────────────────────────── */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>My Submitted Challenges — End-to-End Tracker</h3>

      {loading ? (
        <div className="card p-10 text-center">
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p className="text-muted">Loading your challenge submissions…</p>
        </div>
      ) : myChallenges.length === 0 ? (
        <div className="card p-8 text-center">
          <PlusCircle size={40} color="var(--color-primary-400)" style={{ margin: '0 auto 12px' }} />
          <h4>No Challenges Submitted Yet</h4>
          <p className="text-secondary" style={{ marginBottom: 20 }}>
            Report a local problem from your village, panchayat, NGO or community and get university student teams to build a solution.
          </p>
          <Link to="/submit-challenge" className="btn btn-primary btn-sm">Submit Your First Challenge</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {myChallenges.map(c => {
            const sm = getStatusMeta(c.status);
            return (
              <div key={c.id} className="card p-6" style={{ borderLeft: `4px solid ${sm.color}` }}>

                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {c.submissionCode && (
                      <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {c.submissionCode}
                      </span>
                    )}
                    <span className="badge" style={{ background: `${sm.color}22`, color: sm.color, border: `1px solid ${sm.color}55` }}>
                      {sm.icon} {sm.label}
                    </span>
                    <span className="badge badge-blue">{c.category}</span>
                    {c.urgency === 'critical' && (
                      <span className="badge" style={{ background: 'rgba(239,68,68,.2)', color: '#f87171', border: '1px solid rgba(239,68,68,.4)' }}>
                        ⚡ Critical
                      </span>
                    )}
                  </div>
                  <span className="text-muted" style={{ fontSize: '.78rem' }}>
                    Submitted {utils.timeAgo ? utils.timeAgo(c.createdAt) : c.createdAt}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{c.title}</h4>
                <p className="text-secondary" style={{ fontSize: '.9rem', lineHeight: 1.6, marginBottom: 12 }}>
                  {c.description ? c.description.slice(0, 200) + '…' : ''}
                </p>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 18, fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 12, flexWrap: 'wrap' }}>
                  {(c.district || c.state) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={13} color="#10b981" /> {c.district}{c.state ? `, ${c.state}` : ''}
                    </span>
                  )}
                  {c.affectedPopulation && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={13} color="#38bdf8" /> {c.affectedPopulation}
                    </span>
                  )}
                  <span><Eye size={13} style={{ verticalAlign: 'middle' }} /> {c.viewCount || 0} views</span>
                  <span><Users size={13} style={{ verticalAlign: 'middle', color: '#a78bfa' }} /> {c.teamCount || 0} teams</span>
                  <span><Lightbulb size={13} style={{ verticalAlign: 'middle', color: '#fbbf24' }} /> {c.solutionCount || 0} solutions</span>
                </div>

                {/* Nodal notes */}
                {c.nodalNotes && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: '.85rem',
                    background: c.status === 'needs_information' ? 'rgba(168,85,247,.1)' : 'rgba(59,130,246,.08)',
                    borderLeft: `3px solid ${c.status === 'needs_information' ? '#c084fc' : '#3b82f6'}`
                  }}>
                    {c.status === 'needs_information'
                      ? <><strong style={{ color: '#c084fc' }}><HelpCircle size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Govt Requests: </strong>{c.nodalNotes}</>
                      : <><strong>Nodal Officer Note: </strong>{c.nodalNotes}</>
                    }
                  </div>
                )}

                {/* Responsible department */}
                {c.responsibleDepartment && (
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    🏛️ Assigned to: <strong>{c.responsibleDepartment}</strong>
                  </div>
                )}

                {/* Mini phase pipeline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
                  {['submitted', 'verified', 'published', 'assigned', 'solved'].map((phase, i, arr) => {
                    const pMeta = getStatusMeta(phase);
                    const order = ['submitted','verified','published','assigned','converted_to_project','solved'];
                    const isDone = order.indexOf(c.status) >= order.indexOf(phase) && order.indexOf(c.status) >= 0;
                    return (
                      <React.Fragment key={phase}>
                        <span style={{ fontSize: '.72rem', whiteSpace: 'nowrap', color: isDone ? pMeta.color : 'var(--text-muted)', fontWeight: isDone ? 700 : 400 }}>
                          {pMeta.icon} {pMeta.label}
                        </span>
                        {i < arr.length - 1 && <ArrowRight size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    {c.communityRating ? (
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#10b981" color="#10b981" />
                        Community Rating: {c.communityRating}/5 ({c.communityRatingCount})
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>No community ratings yet</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setFeedbackModal(c);
                        setRating(5);
                        setFeedbackText('');
                        setVerifiedImpact(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Star size={13} color="#f59e0b" /> Give Community Feedback
                    </button>
                    <Link to={`/challenge/${c.id}`} className="btn btn-outline btn-sm">Full Dossier →</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phase 10: Citizen Impact Feedback Modal */}
      {feedbackModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card p-8" style={{ maxWidth: 540, width: '100%', position: 'relative' }}>
            <button
              onClick={() => setFeedbackModal(null)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-cyan">Phase 10: Beneficiary Validation</span>
              <span className="badge badge-emerald">Citizen Review</span>
            </div>

            <h2 style={{ fontSize: '1.35rem', marginBottom: 6 }}>Validate Ground Solution Impact</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
              Feedback on: <strong>{feedbackModal.title}</strong>
            </p>

            <form onSubmit={handleFeedbackSubmit}>
              {/* Star Rating */}
              <div className="form-group mb-5">
                <label className="form-label">Community Satisfaction Rating</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <Star
                        size={28}
                        color={star <= rating ? '#fbbf24' : '#64748b'}
                        fill={star <= rating ? '#fbbf24' : 'transparent'}
                      />
                    </button>
                  ))}
                  <strong style={{ marginLeft: 8, color: '#fbbf24', fontSize: '1.1rem' }}>
                    {rating} / 5 Stars
                  </strong>
                </div>
              </div>

              {/* Verified Impact Checkbox */}
              <div className="form-group mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="impactCheck"
                  checked={verifiedImpact}
                  onChange={(e) => setVerifiedImpact(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                />
                <label htmlFor="impactCheck" style={{ margin: 0, fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600 }}>
                  I verify that the deployed solution directly benefited my local community.
                </label>
              </div>

              {/* Feedback Text */}
              <div className="form-group mb-6">
                <label className="form-label">Detailed Ground Experience & Observations</label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  placeholder="e.g. Water pump works smoothly, reduced waiting time from 3 hours to 20 minutes daily for 40 families in our ward..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setFeedbackModal(null)} className="btn btn-outline" disabled={submittingFeedback}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingFeedback} className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                  {submittingFeedback ? 'Submitting...' : 'Submit Citizen Feedback ⭐'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
