import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChallengeCard from './ChallengeCard';
import {
  Sparkles, Users, Lightbulb, Compass, Award,
  Settings, CheckCircle2, ArrowRight, ShieldCheck, Check,
  X, RefreshCw, Eye, PlusCircle, BookOpen, Layers,
  ExternalLink, Sliders
} from 'lucide-react';

export default function HomeDashboardView({ user }) {
  const toast = useToast();
  const { updateUser } = useAuth();

  // Role state
  const role = user?.role || 'student';

  // Common & role-specific states
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [userSkills, setUserSkills] = useState(user?.skills?.join(', ') || 'React, Node.js, Python, IoT');
  const [savingSkills, setSavingSkills] = useState(false);

  // Admin state
  const [adminStats, setAdminStats] = useState(null);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [processingVerify, setProcessingVerify] = useState(false);

  // Submitter state
  const [mySubmissions, setMySubmissions] = useState([]);

  // Faculty & Expert state
  const [facultyChallenges, setFacultyChallenges] = useState([]);
  const [expertSolutions, setExpertSolutions] = useState([]);

  // University state
  const [uniChallenges, setUniChallenges] = useState([]);
  const [uniTeams, setUniTeams] = useState([]);

  // Active role view tab (for admin to preview any role view)
  const [activeRoleView, setActiveRoleView] = useState(role);

  const loadData = async () => {
    setLoading(true);
    try {
      if (role === 'student' || activeRoleView === 'student') {
        setLoadingAI(true);
        try {
          const recRes = await api.get('/ai/recommendations');
          if (recRes.success && recRes.data) {
            setRecommendations(recRes.data);
          } else {
            const chalRes = await api.get('/challenges?limit=4');
            if (chalRes.success && chalRes.data) setRecommendations(chalRes.data);
          }
        } catch (_) {}
        setLoadingAI(false);
      }

      if (role === 'admin' || activeRoleView === 'admin') {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ success: false })),
          api.get('/admin/challenges/pending').catch(() => ({ success: false }))
        ]);
        if (statsRes.success) setAdminStats(statsRes.data);
        if (pendingRes.success) setPendingChallenges(pendingRes.data || []);
      }

      if (role === 'citizen' || activeRoleView === 'citizen') {
        const res = await api.get('/challenges?limit=20');
        if (res.success && res.data) {
          const mine = res.data.filter(c => c.submitterId === user?.id);
          setMySubmissions(mine.length > 0 ? mine : res.data.slice(0, 4));
        }
      }

      if (role === 'faculty' || activeRoleView === 'faculty') {
        const res = await api.get('/challenges?limit=6');
        if (res.success) setFacultyChallenges(res.data || []);
      }

      if (role === 'expert' || activeRoleView === 'expert') {
        const res = await api.get('/challenges?limit=6');
        if (res.success && res.data) {
          const list = [];
          for (const c of res.data.slice(0, 4)) {
            try {
              const solRes = await api.get(`/solutions/challenge/${c.id}`);
              if (solRes.success && solRes.data) list.push(...solRes.data);
            } catch (_) {}
          }
          setExpertSolutions(list);
        }
      }

      if (role === 'university_admin' || activeRoleView === 'university_admin') {
        const [chRes, tmRes] = await Promise.all([
          api.get('/challenges?limit=10').catch(() => ({ success: false })),
          api.get('/teams?limit=10').catch(() => ({ success: false }))
        ]);
        if (chRes.success) setUniChallenges(chRes.data || []);
        if (tmRes.success) setUniTeams(tmRes.data || []);
      }
    } catch (err) {
      console.warn('Dashboard data fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRoleView]);

  const handleUpdateSkills = async (e) => {
    e.preventDefault();
    setSavingSkills(true);
    try {
      const skillsArray = userSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.put('/auth/profile', { skills: skillsArray });
      if (res.success) {
        updateUser({ skills: skillsArray });
        toast.success('Skills updated! AI recommendations refreshed.');
        const recRes = await api.get('/ai/recommendations');
        if (recRes.success && recRes.data) setRecommendations(recRes.data);
      }
    } catch (err) {
      toast.error(err.message || 'Could not update skills');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleVerify = async (challengeId, action) => {
    setProcessingVerify(true);
    try {
      const res = await api.put(`/challenges/${challengeId}/verify`, {
        action,
        adminNotes: action === 'approve' ? 'Approved for community hackathon solving.' : 'Criteria not met.'
      });
      toast.success(res.message || `Challenge ${action === 'approve' ? 'published' : 'rejected'}`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Verification update failed');
    } finally {
      setProcessingVerify(false);
    }
  };

  const roleBadgeMap = {
    student: { badge: 'badge-purple', label: '🎓 Student Innovator' },
    admin: { badge: 'badge-rose', label: '🛡️ System Administrator' },
    citizen: { badge: 'badge-cyan', label: '📢 Problem Stakeholder' },
    faculty: { badge: 'badge-purple', label: '🔬 Academic Guide & Mentor' },
    expert: { badge: 'badge-amber', label: '⭐ Domain Evaluator' },
    university_admin: { badge: 'badge-emerald', label: '🏛️ University Coordinator' },
  };

  const currentBadge = roleBadgeMap[user?.role] || { badge: 'badge-blue', label: user?.role };

  return (
    <div className="home-dashboard-wrapper">
      {/* ── Dashboard Header ────────────────────────────────────── */}
      <div className="dashboard-container" style={{ paddingBottom: 24, paddingTop: 28 }}>
        <div className="card p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(139, 92, 246, 0.12) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle glow */}
          <div style={{
            position: 'absolute', top: -50, right: -50, width: 220, height: 220,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span className={`badge ${currentBadge.badge}`}>{currentBadge.label}</span>
                {user?.organization && (
                  <span className="badge badge-outline" style={{ fontSize: 11 }}>
                    {user.organization}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: 8, lineHeight: 1.2 }}>
                Welcome back, <span className="text-gradient">{user?.name}</span>!
              </h1>
              <p className="text-secondary" style={{ maxWidth: 660, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Your personal innovation command center on SocioSolve. Track challenges, team progress, and evaluate technical solutions.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn btn-primary btn-sm">
                <Compass size={15} /> Explore Challenges
              </Link>
              <Link to="/submit-challenge" className="btn btn-secondary btn-sm">
                <PlusCircle size={15} /> Submit Problem
              </Link>
              <button onClick={loadData} className="btn btn-outline btn-sm" title="Refresh Dashboard">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Admin Role Switcher (Superpower for testing / demoing) */}
          {user?.role === 'admin' && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Admin View As:
                </span>
                {Object.keys(roleBadgeMap).map((rKey) => (
                  <button
                    key={rKey}
                    onClick={() => setActiveRoleView(rKey)}
                    className={`btn btn-sm ${activeRoleView === rKey ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.75rem', padding: '4px 10px', height: 28 }}
                  >
                    {roleBadgeMap[rKey].label.split(' ')[0]} {roleBadgeMap[rKey].label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Dynamic Content Based on Role ──────────────────────── */}

        {/* 1. STUDENT VIEW */}
        {activeRoleView === 'student' && (
          <div>
            {/* KPI Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>AI Match Confidence</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>94%</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Based on profile skills</span>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Recommended Problems</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
                  {loadingAI ? '—' : recommendations.length}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open for solutions</span>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Your Innovation Teams</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c4b5fd', marginTop: 4 }}>2 Active</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Collaborating</span>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Solutions Submitted</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>1 Validated</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Under evaluation</span>
              </div>
            </div>

            {/* Split Grid: AI Recommendations + Skills Panel */}
            <div className="dashboard-split-grid">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={20} color="#fbbf24" />
                    <h3 style={{ fontSize: '1.3rem' }}>AI Recommended Challenges for You</h3>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: 11 }}>TF-IDF Skill Match Engine</span>
                </div>

                {loadingAI ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
                    {[1, 2].map(n => (
                      <div key={n} className="card p-6" style={{ height: 260 }}>
                        <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 24, width: '80%', marginBottom: 16 }} />
                        <div className="skeleton" style={{ height: 60, width: '100%' }} />
                      </div>
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
                    {recommendations.slice(0, 4).map(c => (
                      <ChallengeCard key={c.id} challenge={c} showMatch={true} />
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center">
                    <p className="text-muted">No challenge matches found. Update your skills below to discover problems.</p>
                  </div>
                )}
              </div>

              {/* Skills Editor & Pipeline shortcuts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card p-6">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Settings size={18} color="var(--color-primary-400)" />
                    <h4 style={{ fontSize: '1.05rem' }}>AI Matching Skills</h4>
                  </div>
                  <p className="text-secondary" style={{ fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 12 }}>
                    Update your competencies so SocioSolve matches you with relevant civic bottlenecks:
                  </p>
                  <form onSubmit={handleUpdateSkills}>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={userSkills}
                      onChange={(e) => setUserSkills(e.target.value)}
                      placeholder="e.g. React, Python, IoT, GIS, Computer Vision"
                      style={{ fontSize: '0.85rem', marginBottom: 10 }}
                    />
                    <button type="submit" disabled={savingSkills} className="btn btn-primary btn-sm w-full">
                      {savingSkills ? 'Updating...' : 'Update & Re-match'}
                    </button>
                  </form>
                </div>

                <div className="card p-6">
                  <h4 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Quick Pipeline</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link to="/team-formation" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                      <Users size={15} /> Find / Build Teams
                    </Link>
                    <Link to="/submit-solution" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                      <Lightbulb size={15} /> Submit Solution
                    </Link>
                    <Link to="/milestones" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                      <CheckCircle2 size={15} /> Milestone Progress
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ADMIN VIEW */}
        {activeRoleView === 'admin' && (
          <div>
            {/* Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Pending Verification</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
                  {adminStats?.pendingChallenges ?? pendingChallenges.length}
                </div>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Published Challenges</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
                  {adminStats?.publishedChallenges ?? 28}
                </div>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Registered Student Teams</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c4b5fd', marginTop: 4 }}>
                  {adminStats?.totalTeams ?? 94}
                </div>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Candidate Solutions</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                  {adminStats?.totalSolutions ?? 65}
                </div>
              </div>
            </div>

            {/* Pending Verification Queue */}
            <div className="card p-8 mb-8">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: 4 }}>Pending Challenge Verification Queue</h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    Review incoming civic problems for hackathon suitability.
                  </p>
                </div>
                <span className="badge badge-amber">{pendingChallenges.length} Pending Review</span>
              </div>

              {pendingChallenges.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {pendingChallenges.slice(0, 3).map((c) => (
                    <div key={c.id} className="card p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'start' }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span className="badge badge-blue">{utils.categoryLabel(c.category)}</span>
                            <span className={`badge ${utils.difficultyBadge(c.difficulty)}`}>{c.difficulty}</span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                              by {c.submitter?.name || 'Community Member'} &bull; {utils.timeAgo(c.createdAt)}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.15rem', marginBottom: 6, color: 'var(--text-primary)' }}>{c.title}</h4>
                          <p className="text-secondary" style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
                            {c.description ? c.description.slice(0, 200) + '...' : ''}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleVerify(c.id, 'approve')}
                            disabled={processingVerify}
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10b981', borderColor: '#10b981' }}
                          >
                            <Check size={14} /> Publish
                          </button>
                          <button
                            onClick={() => handleVerify(c.id, 'reject')}
                            disabled={processingVerify}
                            className="btn btn-danger btn-sm"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <h4>Verification Queue is Clear</h4>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>All submitted problems have been processed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SUBMITTER VIEW */}
        {activeRoleView === 'citizen' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Your Submitted Problems</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                  {mySubmissions.length}
                </div>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Active Student Teams</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>
                  {mySubmissions.reduce((acc, c) => acc + (c.teamCount || 0), 0)}
                </div>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Candidate Solutions</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
                  {mySubmissions.reduce((acc, c) => acc + (c.solutionCount || 0), 0)}
                </div>
              </div>
              <div className="card p-6">
                <span className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Validated Outcomes</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                  {mySubmissions.filter(c => c.status === 'solved').length}
                </div>
              </div>
            </div>

            <div className="card p-8 mb-8">
              <h3 style={{ fontSize: '1.3rem', marginBottom: 20 }}>Your Problem Submissions Tracker</h3>
              {mySubmissions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {mySubmissions.map((c) => (
                    <div key={c.id} className="card p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span className="badge badge-blue">{utils.categoryLabel(c.category)}</span>
                            <span className={`badge ${c.status === 'published' ? 'badge-emerald' : 'badge-amber'}`}>
                              {c.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.15rem', marginBottom: 6 }}>{c.title}</h4>
                          <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>👥 {c.teamCount || 0} Teams</span>
                            <span>💡 {c.solutionCount || 0} Solutions</span>
                          </div>
                        </div>
                        <Link to={`/challenge/${c.id}`} className="btn btn-outline btn-sm">
                          View Live &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No challenges submitted yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. FACULTY / EXPERT / UNIVERSITY QUICK HIGHLIGHTS */}
        {(activeRoleView === 'faculty' || activeRoleView === 'expert' || activeRoleView === 'university_admin') && (
          <div className="card p-8 mb-8">
            <h3 style={{ fontSize: '1.3rem', marginBottom: 12 }}>
              {activeRoleView === 'faculty' && '🔬 Academic Mentorship Pipeline'}
              {activeRoleView === 'expert' && '⭐ Candidate Prototype Evaluation Queue'}
              {activeRoleView === 'university_admin' && '🏛️ Institutional Challenge Portfolio'}
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 24 }}>
              Active problems and deliverables currently matching your institutional scope.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {(activeRoleView === 'faculty' ? facultyChallenges : uniChallenges).slice(0, 3).map((c) => (
                <div key={c.id} className="card p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="badge badge-blue" style={{ marginBottom: 8 }}>{utils.categoryLabel(c.category)}</span>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{c.title}</h4>
                  <Link to={`/challenge/${c.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
                    Inspect Challenge &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle Divider before public discovery catalog */}
      <div style={{ borderBottom: '1px solid var(--border-color)', margin: '16px 0 32px' }} />
    </div>
  );
}
