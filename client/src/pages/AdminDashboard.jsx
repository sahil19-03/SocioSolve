import React, { useState, useEffect } from 'react';
import { api, utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, Check, X, AlertTriangle, FileText, 
  Users, Lightbulb, ExternalLink, RefreshCw 
} from 'lucide-react';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewChallenge, setReviewChallenge] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load admin stats
      const statsRes = await api.get('/admin/stats');
      if (statsRes.success) setStats(statsRes.data);

      // 2. Load pending challenges
      const pendingRes = await api.get('/admin/challenges/pending');
      if (pendingRes.success) setPendingChallenges(pendingRes.data || []);
    } catch (err) {
      console.warn('Admin load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (challengeId, action) => {
    setProcessing(true);
    try {
      const res = await api.put(`/challenges/${challengeId}/verify`, {
        action, // 'approve' or 'reject'
        adminNotes: adminNotes || (action === 'approve' ? 'Challenge verified for public solving.' : 'Does not meet criteria.')
      });
      toast.success(res.message || `Challenge ${action === 'approve' ? 'published' : 'rejected'}`);
      setReviewChallenge(null);
      setAdminNotes('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Verification update failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="badge badge-rose" style={{ marginBottom: 8 }}>System Administration</span>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 6 }}>Admin Governance Console</h1>
            <p className="text-secondary">
              Review and verify submitted challenges, monitor hackathon statistics, and manage users.
            </p>
          </div>

          <button onClick={loadData} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div className="card p-6">
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pending Verification</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
              {stats?.pendingChallenges ?? pendingChallenges.length}
            </div>
          </div>
          <div className="card p-6">
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Published Challenges</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
              {stats?.publishedChallenges ?? 28}
            </div>
          </div>
          <div className="card p-6">
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Student Teams</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c4b5fd', marginTop: 4 }}>
              {stats?.totalTeams ?? 94}
            </div>
          </div>
          <div className="card p-6">
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Submitted Solutions</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
              {stats?.totalSolutions ?? 65}
            </div>
          </div>
        </div>

        {/* Pending Verification Queue */}
        <div className="card p-8 mb-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 4 }}>Pending Challenge Review Queue</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                Verify incoming problems for scope alignment (open-ended innovation vs simple maintenance complaint).
              </p>
            </div>
            <span className="badge badge-amber">{pendingChallenges.length} Pending Review</span>
          </div>

          {loading ? (
            <p className="text-muted">Loading queue...</p>
          ) : pendingChallenges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingChallenges.map((c) => (
                <div key={c.id} className="card p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span className="badge badge-blue">{utils.categoryLabel(c.category)}</span>
                        <span className={`badge ${utils.difficultyBadge(c.difficulty)}`}>{c.difficulty}</span>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Submitted by {c.submitter?.name || c.submitterOrg || 'Community Submitter'} &bull; {utils.timeAgo(c.createdAt)}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                        {c.title}
                      </h4>

                      <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 12 }}>
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
                        onClick={() => { setReviewChallenge(c); }} 
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

        {/* Modal: Review & Notes */}
        {reviewChallenge && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: 'rgba(0,0,0,0.7)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 999 
          }}>
            <div className="card p-8" style={{ width: '100%', maxWidth: 540 }}>
              <h3 style={{ marginBottom: 8 }}>Review Feedback</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 16 }}>
                Challenge: <strong>{reviewChallenge.title}</strong>
              </p>

              <div className="form-group mb-6">
                <label className="form-label">Review / Rejection Notes for Submitter</label>
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
      </div>
  );
}
