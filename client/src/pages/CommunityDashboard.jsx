import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MapPin, Star, MessageSquare, CheckCircle2,
  RefreshCw, Compass, Heart, ThumbsUp, X, Sparkles,
  Building2, Users, AlertCircle, ArrowRight, Award,
  ShieldCheck, FileText, Target, PlusCircle
} from 'lucide-react';

export default function CommunityDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState('local'); // 'local' | 'implemented' | 'my_feedback' | 'all'
  const [challenges, setChallenges] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback modal
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [verifiedImpact, setVerifiedImpact] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const userDistrict = user?.district?.trim() || '';
  const userState = user?.state?.trim() || '';

  const loadData = async () => {
    setLoading(true);
    try {
      const [chRes, fbRes] = await Promise.all([
        api.get('/challenges?limit=50'),
        api.get('/challenges/my-community-feedback').catch(() => ({ success: false, data: [] }))
      ]);

      if (chRes.success && Array.isArray(chRes.data)) {
        setChallenges(chRes.data);
      }
      if (fbRes.success && Array.isArray(fbRes.data)) {
        setMyFeedbacks(fbRes.data);
      }
    } catch (err) {
      console.warn('Error loading community data:', err);
      toast.error('Could not load some community data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter challenges
  const localChallenges = challenges.filter(c => {
    if (!userDistrict && !userState) return true;
    const matchDistrict = userDistrict && c.district && c.district.toLowerCase() === userDistrict.toLowerCase();
    const matchState = userState && c.state && c.state.toLowerCase() === userState.toLowerCase();
    return matchDistrict || matchState;
  });

  const implementedChallenges = challenges.filter(c =>
    c.status === 'solved' || c.handoverStatus === 'implemented' || c.handoverDate
  );

  const pendingRatingCount = implementedChallenges.filter(c =>
    !myFeedbacks.some(f => f.challengeId === c.id)
  ).length;

  const avgCommunityScore = myFeedbacks.length > 0
    ? (myFeedbacks.reduce((acc, f) => acc + Number(f.rating || 5), 0) / myFeedbacks.length).toFixed(1)
    : '4.8';

  const activeListCount = tab === 'local'
    ? localChallenges.length
    : tab === 'implemented'
    ? implementedChallenges.length
    : tab === 'my_feedback'
    ? myFeedbacks.length
    : challenges.length;

  const handleOpenFeedbackModal = (challenge) => {
    setFeedbackModal(challenge);
    const existing = myFeedbacks.find(f => f.challengeId === challenge.id);
    if (existing) {
      setRating(existing.rating || 5);
      setFeedbackText(existing.feedback || '');
      setVerifiedImpact(existing.verifiedImpact ?? true);
    } else {
      setRating(5);
      setFeedbackText('');
      setVerifiedImpact(true);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      return toast.error('Please share a few words describing the community impact.');
    }
    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/challenges/${feedbackModal.id}/community-feedback`, {
        rating: Number(rating),
        feedback: feedbackText.trim(),
        verifiedImpact
      });
      if (res.success) {
        toast.success('Your community impact feedback and rating have been recorded!');
        setFeedbackModal(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div
        className="card p-8 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Heart size={12} fill="#10b981" /> Verified Community Resident
              </span>
              {(userDistrict || userState) && (
                <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> {userDistrict ? `${userDistrict}, ` : ''}{userState}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>
              Welcome, {user?.name || 'Community Member'}
            </h1>
            <p className="text-secondary" style={{ maxWidth: 680, lineHeight: 1.6 }}>
              Follow societal challenges in your area, track university solutions from concept to field pilot, and provide verified citizen feedback and impact ratings on completed implementations.
            </p>
          </div>
          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Feed
          </button>
        </div>
      </div>

      {/* ── Evaluator / Community Stats Strip ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Local Area Challenges</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            {loading ? '—' : localChallenges.length}
          </div>
        </div>

        <div className="card p-6" style={{ borderLeft: '4px solid #ef4444' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Awaiting Community Rating</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginTop: 4 }}>
            {loading ? '—' : pendingRatingCount}
          </div>
        </div>

        <div className="card p-6" style={{ borderLeft: '4px solid #10b981' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Implemented Projects</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            {loading ? '—' : implementedChallenges.length}
          </div>
        </div>

        <div className="card p-6" style={{ borderLeft: '4px solid #3b82f6' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Avg Community Rating</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
            {avgCommunityScore} / 5
          </div>
        </div>
      </div>

      {/* ── Discovery & Navigation Hub Cards ────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        <Link to="/explore" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(6,182,212,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                <Compass size={22} />
              </div>
              <span className="badge badge-cyan">Browse All</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Explore Challenges</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Discover problems submitted across different districts and check their live status.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#06b6d4', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            Browse Catalog <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/milestones" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(167,139,250,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(167,139,250,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <Target size={22} />
              </div>
              <span className="badge badge-purple">Live Solutions</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Track Milestones</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              See what university engineering squads are actively building for local challenges.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a78bfa', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            Open Milestone Tracker <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/submit-challenge" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(16,185,129,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <PlusCircle size={22} />
              </div>
              <span className="badge badge-green">Report Issue</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Submit a Problem</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Have a problem in your ward or village? Submit it for students and nodal officers to address.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            Submit Problem <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* ── Main Section Container Card ─────────────────────────────────── */}
      <div className="card p-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Community Civic Hub</h3>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {activeListCount} item{activeListCount === 1 ? '' : 's'} available in this view
            </span>
          </div>

          {/* Consistent Tab Navigation */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              ['local', `📍 Local (${localChallenges.length})`],
              ['implemented', `🎉 Implemented (${implementedChallenges.length})`],
              ['my_feedback', `⭐ My Ratings (${myFeedbacks.length})`],
              ['all', `🔍 All Challenges (${challenges.length})`]
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={tab === id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB 1: Local Challenges ── */}
        {tab === 'local' && (
          <div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <RefreshCw size={28} className="animate-spin text-primary" style={{ margin: '0 auto 12px' }} />
                <p className="text-muted">Loading local area civic challenges...</p>
              </div>
            ) : localChallenges.length === 0 ? (
              <div className="card p-8 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <Award size={40} color="#fbbf24" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: 6 }}>No Local Challenges Currently in Queue</h4>
                <p className="text-secondary" style={{ maxWidth: 520, margin: '0 auto 16px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  No open challenges have been logged yet specifically for {userDistrict ? `${userDistrict}, ` : ''}{userState || 'your area'}. You can explore problems from other regions or report a community challenge.
                </p>
                <button className="btn btn-outline btn-sm" onClick={() => setTab('all')}>
                  Explore All Regional Challenges
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {localChallenges.map(ch => (
                  <div
                    key={ch.id}
                    className="card p-6"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                      <div>
                        {/* Meta Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                          <span className="badge badge-blue">
                            {utils.categoryLabel(ch.category)}
                          </span>
                          <span className="badge badge-emerald">
                            📍 {ch.district ? `${ch.district}, ` : ''}{ch.state}
                          </span>
                          {ch.urgency && (
                            <span className="badge badge-amber">
                              Urgency: {ch.urgency}
                            </span>
                          )}
                          {ch.status && (
                            <span className="badge badge-cyan">
                              Status: {ch.status.replace(/_/g, ' ')}
                            </span>
                          )}
                          {ch.submissionCode && (
                            <span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>
                              #{ch.submissionCode}
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                          {ch.title}
                        </h4>

                        <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 14 }}>
                          {ch.description}
                        </p>

                        {ch.affectedPopulation && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            👥 Estimated affected population: <strong>~{Number(ch.affectedPopulation).toLocaleString()}</strong> residents
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Link to={`/challenge/${ch.id}`} className="btn btn-primary btn-sm" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          View Progress <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Implemented Projects & Community Sign-off ── */}
        {tab === 'implemented' && (
          <div>
            {implementedChallenges.length === 0 ? (
              <div className="card p-8 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <Award size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: 6 }}>No Implemented Projects Yet</h4>
                <p className="text-secondary" style={{ maxWidth: 500, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Once university teams deploy prototypes and nodal officers sign off on handovers, completed projects will appear here for citizen impact ratings.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {implementedChallenges.map(ch => {
                  const userFeedback = myFeedbacks.find(f => f.challengeId === ch.id);
                  return (
                    <div
                      key={ch.id}
                      className="card p-6"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                        <div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                            <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} /> Officially Implemented
                            </span>
                            <span className="badge badge-blue">
                              {utils.categoryLabel(ch.category)}
                            </span>
                            {ch.communityRating && (
                              <span className="badge badge-amber">
                                ⭐ {ch.communityRating} / 5 ({ch.communityRatingCount || 1} ratings)
                              </span>
                            )}
                            <span className="badge badge-cyan">
                              📍 {ch.district ? `${ch.district}, ` : ''}{ch.state}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                            {ch.title}
                          </h4>

                          <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 14 }}>
                            {ch.description}
                          </p>

                          {/* Handover & Beneficiary metrics */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: 12,
                            background: 'rgba(255,255,255,0.03)',
                            padding: '12px 16px',
                            borderRadius: 8,
                            marginBottom: 14
                          }}>
                            {ch.beneficiaryCount > 0 && (
                              <div>
                                <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Verified Beneficiaries</span>
                                <strong style={{ color: '#34d399' }}>👥 {Number(ch.beneficiaryCount).toLocaleString()} residents</strong>
                              </div>
                            )}
                            {ch.handoverNotes && (
                              <div>
                                <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Handover Status</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{ch.handoverNotes}</span>
                              </div>
                            )}
                          </div>

                          {userFeedback && (
                            <div style={{
                              background: 'rgba(251, 191, 36, 0.08)',
                              border: '1px solid rgba(251, 191, 36, 0.25)',
                              padding: '10px 14px',
                              borderRadius: 8
                            }}>
                              <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>
                                Your Impact Rating: {userFeedback.rating} / 5 ⭐
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                "{userFeedback.feedback}"
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                          <button
                            className={userFeedback ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                            onClick={() => handleOpenFeedbackModal(ch)}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            <Star size={14} /> {userFeedback ? 'Update Rating' : 'Give Citizen Rating'}
                          </button>
                          <Link to={`/challenge/${ch.id}`} className="btn btn-outline btn-sm" style={{ textAlign: 'center' }}>
                            Full Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: My Submitted Ratings ── */}
        {tab === 'my_feedback' && (
          <div>
            {myFeedbacks.length === 0 ? (
              <div className="card p-8 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <Award size={40} color="#fbbf24" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: 6 }}>No Citizen Ratings Submitted Yet</h4>
                <p className="text-secondary" style={{ maxWidth: 480, margin: '0 auto 16px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Once implemented solutions are deployed in your district, share your verified feedback to validate their real-world impact.
                </p>
                <button className="btn btn-outline btn-sm" onClick={() => setTab('implemented')}>
                  View Implemented Projects
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myFeedbacks.map(fb => (
                  <div
                    key={fb.id}
                    className="card p-6"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <span className="badge badge-amber" style={{ fontSize: '0.78rem' }}>
                            ⭐ {fb.rating} / 5 Stars
                          </span>
                          {fb.verifiedImpact && (
                            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                              <CheckCircle2 size={12} /> Verified Resident
                            </span>
                          )}
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                            Submitted on {new Date(fb.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.2rem', marginBottom: 6, color: 'var(--text-primary)' }}>
                          {fb.Challenge?.title || 'Civic Challenge'}
                        </h4>

                        <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: '6px 0 10px' }}>
                          "{fb.feedback}"
                        </p>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Location: 📍 {fb.Challenge?.district || userDistrict || 'Local Area'}, {fb.Challenge?.state || userState}
                        </div>
                      </div>

                      {fb.Challenge && (
                        <Link to={`/challenge/${fb.Challenge.id}`} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>
                          View Challenge
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: All Challenges ── */}
        {tab === 'all' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {challenges.map(ch => (
              <div
                key={ch.id}
                className="card p-6"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                      <span className="badge badge-blue">
                        {utils.categoryLabel(ch.category)}
                      </span>
                      <span className="badge badge-cyan">
                        📍 {ch.district ? `${ch.district}, ` : ''}{ch.state}
                      </span>
                      {ch.status && (
                        <span className="badge badge-purple">
                          {ch.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                      {ch.title}
                    </h4>

                    <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {ch.description?.slice(0, 180)}...
                    </p>
                  </div>

                  <Link to={`/challenge/${ch.id}`} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    View Challenge <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Community Feedback Modal ─────────────────────────────────────── */}
      {feedbackModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card p-8" style={{ maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Citizen Impact Rating</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{feedbackModal.title}</div>
                </div>
              </div>
              <button onClick={() => setFeedbackModal(null)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback}>
              <div className="form-group mb-4">
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Satisfaction & Impact Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '2rem', color: s <= rating ? '#fbbf24' : '#475569',
                        padding: '2px 4px', transition: 'transform 0.15s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', marginLeft: 8 }}>
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Resident Impact Testimonial *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  required
                  placeholder="How has this implemented project helped your community or solved the local issue? E.g., improved drinking water quality, reduced power interruptions, enhanced accessibility..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={verifiedImpact}
                    onChange={e => setVerifiedImpact(e.target.checked)}
                  />
                  <span>I confirm I am an affected resident / beneficiary in {userDistrict || userState || 'this locality'}.</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFeedbackModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingFeedback}>
                  {submittingFeedback ? 'Recording...' : 'Submit Citizen Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
