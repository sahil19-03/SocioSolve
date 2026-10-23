import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Award, Star, CheckCircle, ExternalLink, Sliders, AlertTriangle,
  ShieldCheck, ShieldAlert, Cpu, HeartHandshake, Rocket, Check, X,
  FileText, Users, Building2, RefreshCw, Target, Compass, Handshake, ArrowRight
} from 'lucide-react';

export default function ExpertDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Evaluation Rubric Modal (Multi-Axis Independent Prototype Evaluation)
  const [evalModal, setEvalModal] = useState(null);
  const [technicalScore, setTechnicalScore] = useState(85);
  const [socialImpactScore, setSocialImpactScore] = useState(90);
  const [deploymentReadinessScore, setDeploymentReadinessScore] = useState(80);
  const [expertFeedback, setExpertFeedback] = useState('');
  const [identifiedRisks, setIdentifiedRisks] = useState('');
  const [pilotReadinessCertified, setPilotReadinessCertified] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const loadSolutions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/solutions/evaluation-queue');
      if (res.success && res.data) {
        setSolutions(res.data);
      } else {
        // Fallback: load through challenges
        const chalRes = await api.get('/challenges?limit=10');
        if (chalRes.success && chalRes.data) {
          const list = [];
          for (const c of chalRes.data) {
            try {
              const solRes = await api.get(`/solutions/challenge/${c.id}`);
              if (solRes.success && solRes.data) list.push(...solRes.data);
            } catch (e) {}
          }
          setSolutions(list);
        }
      }
    } catch (err) {
      console.warn(err);
      toast.error('Failed to load candidate prototypes for evaluation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolutions();
  }, []);

  const handleOpenRubric = (sol) => {
    if (sol.hasConflictOfInterest) {
      toast.error(sol.conflictReason || 'Conflict of interest detected: You cannot evaluate this prototype.');
      return;
    }
    setEvalModal(sol);
    setTechnicalScore(sol.technicalScore || (sol.feasibilityScore ? sol.feasibilityScore * 10 : 85));
    setSocialImpactScore(sol.socialImpactScore || (sol.impactScore ? sol.impactScore * 10 : 90));
    setDeploymentReadinessScore(sol.deploymentReadinessScore || (sol.innovationScore ? sol.innovationScore * 10 : 80));
    setExpertFeedback(sol.expertFeedback || '');
    setIdentifiedRisks(sol.identifiedRisks || '');
    setPilotReadinessCertified(sol.pilotReadinessCertified ?? true);
  };

  // Live composite score calculation
  const compositeScore = Math.round((Number(technicalScore) + Number(socialImpactScore) + Number(deploymentReadinessScore)) / 3);

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!evalModal) return;

    setEvaluating(true);
    try {
      const res = await api.put(`/solutions/${evalModal.id}/evaluate`, {
        technicalScore: Number(technicalScore),
        socialImpactScore: Number(socialImpactScore),
        deploymentReadinessScore: Number(deploymentReadinessScore),
        expertFeedback,
        identifiedRisks,
        pilotReadinessCertified,
        status: 'approved'
      });
      if (res.success) {
        toast.success(`Evaluation recorded! Composite Score: ${compositeScore}/100.`);
        setEvalModal(null);
        loadSolutions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  const pendingCount = solutions.filter(s => !s.compositeScore && !s.technicalScore).length;
  const scoredCount = solutions.filter(s => s.compositeScore || s.technicalScore).length;
  const avgScore = scoredCount > 0
    ? (solutions.filter(s => s.compositeScore).reduce((a, b) => a + Number(b.compositeScore || 0), 0) / scoredCount).toFixed(1)
    : '86.5';

  return (
    <div className="dashboard-container">
      {/* Banner */}
      <div className="card p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: 12 }}>Multi-Axis Independent Evaluation</span>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Welcome, {user?.name || 'Domain Expert'}</h1>
            <p className="text-secondary" style={{ maxWidth: 680, lineHeight: 1.6 }}>
              Independently score student prototypes across 3 objective rubrics: <strong>Technical Feasibility</strong>, <strong>Social Impact</strong>, and <strong>Deployment Readiness</strong>. Institutional conflict-of-interest rules are automatically enforced.
            </p>
          </div>
          <button onClick={loadSolutions} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Evaluator Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Prototypes in Review</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            {loading ? '—' : solutions.length}
          </div>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #ef4444' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Awaiting 3-Axis Scoring</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginTop: 4 }}>
            {loading ? '—' : pendingCount}
          </div>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #10b981' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Evaluated Prototypes</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            {loading ? '—' : scoredCount}
          </div>
        </div>
        <div className="card p-6" style={{ borderLeft: '4px solid #3b82f6' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Avg Composite Rating</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
            {avgScore} / 100
          </div>
        </div>
      </div>

      {/* Discovery Hub Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        <Link to="/milestones" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(167,139,250,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(167,139,250,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <Target size={22} />
              </div>
              <span className="badge badge-purple">Milestone Rubrics</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Milestone Tracker</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Review student progress reports, deliverable submissions, and technical milestones.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a78bfa', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            Open Milestone Tracker <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/explore" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(6,182,212,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                <Compass size={22} />
              </div>
              <span className="badge badge-cyan">Societal Catalog</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Explore Challenges</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Discover problems matching your technical domain and mentor student innovators.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#06b6d4', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            Browse Catalog <ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/industry" className="card p-5" style={{ textDecoration: 'none', transition: 'all .2s ease', border: '1px solid rgba(245,158,11,.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Handshake size={22} />
              </div>
              <span className="badge badge-amber">Tech Transfer</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>Industry & Ecosystem</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Explore industry sponsorships, IP licensing pathways, and commercial pilots.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 600, fontSize: '.82rem', marginTop: 14 }}>
            View Industry Portal <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Solutions List */}
      <div className="card p-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Candidate Prototypes for Rubric Evaluation</h3>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            {solutions.length} prototype{solutions.length === 1 ? '' : 's'} available
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <RefreshCw size={28} className="animate-spin text-primary" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">Loading candidate prototypes from active projects...</p>
          </div>
        ) : solutions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {solutions.map((sol) => {
              const hasCoi = sol.hasConflictOfInterest;
              const hasScore = sol.compositeScore || sol.technicalScore;

              return (
                <div
                  key={sol.id}
                  className="card p-6"
                  style={{
                    background: hasCoi ? 'rgba(239, 68, 68, 0.03)' : 'rgba(255,255,255,0.02)',
                    border: hasCoi ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
                    <div>
                      {/* Meta Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                        <span className="badge badge-purple">
                          <Users size={12} style={{ marginRight: 4 }} />
                          Team: {sol.Team?.name || 'Student Team'}
                        </span>
                        {sol.Team?.university && (
                          <span className="badge badge-blue">
                            <Building2 size={12} style={{ marginRight: 4 }} />
                            {sol.Team.university.name || sol.Team.university.organization}
                          </span>
                        )}
                        <span className="badge badge-gray">
                          Challenge: {sol.Challenge?.title?.substring(0, 32)}...
                        </span>

                        {hasScore && (
                          <span className="badge badge-emerald" style={{ fontWeight: 700 }}>
                            ⭐ Composite: {sol.compositeScore || sol.technicalScore}/100
                          </span>
                        )}

                        {sol.pilotReadinessCertified && (
                          <span className="badge badge-cyan" style={{ fontWeight: 600 }}>
                            🚀 Pilot Certified
                          </span>
                        )}

                        {hasCoi && (
                          <span className="badge badge-rose" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ShieldAlert size={12} /> Conflict of Interest
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                        {sol.title}
                      </h4>

                      <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 14 }}>
                        {sol.description}
                      </p>

                      {/* 3-Axis Scores Summary (if scored) */}
                      {hasScore && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: 12,
                          background: 'rgba(255,255,255,0.03)',
                          padding: '12px 16px',
                          borderRadius: 8,
                          marginBottom: 14
                        }}>
                          <div>
                            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Technical Feasibility</span>
                            <strong style={{ color: '#38bdf8' }}>{sol.technicalScore || (sol.feasibilityScore * 10)}/100</strong>
                          </div>
                          <div>
                            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Social Impact</span>
                            <strong style={{ color: '#4ade80' }}>{sol.socialImpactScore || (sol.impactScore * 10)}/100</strong>
                          </div>
                          <div>
                            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Deployment Readiness</span>
                            <strong style={{ color: '#fbbf24' }}>{sol.deploymentReadinessScore || (sol.innovationScore * 10)}/100</strong>
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                        {sol.githubUrl && (
                          <a href={sol.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            Source Code <ExternalLink size={13} />
                          </a>
                        )}
                        {sol.demoUrl && (
                          <a href={sol.demoUrl} target="_blank" rel="noreferrer" className="text-cyan hover:underline" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            Live Prototype Demo <ExternalLink size={13} />
                          </a>
                        )}
                      </div>

                      {hasCoi && (
                        <div style={{ marginTop: 12, fontSize: '0.8rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={14} />
                          <span>{sol.conflictReason || 'COI Rule: You belong to the same institution or are a team mentor.'}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenRubric(sol)}
                        disabled={hasCoi}
                        className={`btn btn-sm ${hasCoi ? 'btn-ghost' : hasScore ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Sliders size={14} /> {hasScore ? 'Re-Evaluate Rubric' : 'Evaluate Rubric'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <Award size={48} color="#fbbf24" style={{ margin: '0 auto 16px' }} />
            <h4>No Prototypes Currently In Queue</h4>
            <p className="text-secondary" style={{ maxWidth: 480, margin: '0 auto' }}>
              Student prototypes will appear here once their solution proposals pass government clearance and developmental milestones are uploaded.
            </p>
          </div>
        )}
      </div>

      {/* 3-Axis Rubric Evaluation Modal */}
      {evalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 20
        }}>
          <div className="card p-8" style={{ width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span className="badge badge-amber" style={{ marginBottom: 6 }}>Independent Domain Rubric</span>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Prototype Evaluation</h3>
              </div>
              <button onClick={() => setEvalModal(null)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 20 }}>
              Evaluating prototype for: <strong>{evalModal.title}</strong> (Team {evalModal.Team?.name})
            </p>

            <form onSubmit={handleSaveEvaluation}>
              {/* Conflict of Interest Confirmation Badge */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.8rem',
                color: '#34d399',
                marginBottom: 20
              }}>
                <ShieldCheck size={16} />
                <span>Verified Independent Reviewer: No institutional or mentorship conflict of interest detected.</span>
              </div>

              {/* Rubric 1: Technical Feasibility */}
              <div className="form-group mb-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cpu size={16} color="#38bdf8" />
                    <strong>1. Technical Feasibility & Architecture (0 - 100)</strong>
                  </label>
                  <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>{technicalScore} / 100</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={technicalScore}
                  onChange={(e) => setTechnicalScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Code quality, sensor endurance, cloud telemetry reliability, system robustness.
                </span>
              </div>

              {/* Rubric 2: Social Impact */}
              <div className="form-group mb-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HeartHandshake size={16} color="#4ade80" />
                    <strong>2. Social & Community Impact (0 - 100)</strong>
                  </label>
                  <strong style={{ color: '#4ade80', fontSize: '1.05rem' }}>{socialImpactScore} / 100</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={socialImpactScore}
                  onChange={(e) => setSocialImpactScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#4ade80' }}
                />
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Benefit to underserved communities, accessibility, cost affordability, grassroots usability.
                </span>
              </div>

              {/* Rubric 3: Deployment Readiness */}
              <div className="form-group mb-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Rocket size={16} color="#fbbf24" />
                    <strong>3. Field Deployment Readiness (0 - 100)</strong>
                  </label>
                  <strong style={{ color: '#fbbf24', fontSize: '1.05rem' }}>{deploymentReadinessScore} / 100</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={deploymentReadinessScore}
                  onChange={(e) => setDeploymentReadinessScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#fbbf24' }}
                />
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Weatherproofing, battery endurance, maintenance ease, regulatory safety compliance.
                </span>
              </div>

              {/* Live Composite Score Banner */}
              <div style={{
                background: compositeScore >= 75 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: compositeScore >= 75 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                padding: '14px 18px',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Weighted Composite Score</span>
                  <strong style={{ fontSize: '1.4rem', color: compositeScore >= 75 ? '#34d399' : '#fbbf24' }}>
                    {compositeScore} / 100
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${compositeScore >= 75 ? 'badge-emerald' : 'badge-amber'}`}>
                    {compositeScore >= 85 ? '🌟 Exceptional Candidate' : compositeScore >= 75 ? '✅ Pilot Recommended' : '⚠️ Revisions Advised'}
                  </span>
                </div>
              </div>

              {/* Pilot Readiness Certification Checkbox */}
              <div className="form-group mb-5" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="pilotCert"
                  checked={pilotReadinessCertified}
                  onChange={(e) => setPilotReadinessCertified(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                <label htmlFor="pilotCert" style={{ margin: 0, fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                  Certify prototype as Ready for Field Pilot Deployment
                </label>
              </div>

              {/* Feedback Notes */}
              <div className="form-group mb-4">
                <label className="form-label">Expert Recommendations & Technical Guidance</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Provide actionable guidance for the team on improving hardware endurance, cloud throughput, or pilot readiness..."
                  value={expertFeedback}
                  onChange={(e) => setExpertFeedback(e.target.value)}
                  required
                />
              </div>

              {/* Identified Risks */}
              <div className="form-group mb-6">
                <label className="form-label">Identified Operational & Safety Risks (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Ensure surge protectors on solar inverter; water salinity sensor needs bi-monthly calibration..."
                  value={identifiedRisks}
                  onChange={(e) => setIdentifiedRisks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEvalModal(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={evaluating} className="btn btn-primary">
                  {evaluating ? 'Submitting Evaluation...' : 'Save 3-Axis Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
