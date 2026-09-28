import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChallengeCard from '../components/ChallengeCard';
import {
  Sparkles, Users, Lightbulb, Compass, Award,
  Settings, CheckCircle2, ArrowRight, Flag,
  Target, Zap, BarChart3, Clock, AlertTriangle
} from 'lucide-react';

const IMPL_STATUS_CFG = {
  not_started:     { label: 'Not Started',     color: '#64748b', step: 0 },
  in_progress:     { label: 'Development',     color: '#3b82f6', step: 1 },
  piloting:        { label: 'Pilot Testing',   color: '#f59e0b', step: 2 },
  implemented:     { label: 'Implemented',     color: '#8b5cf6', step: 3 },
  impact_measured: { label: 'Impact Measured', color: '#10b981', step: 4 },
};

const MS_STATUS_CFG = {
  pending:     { label: 'Pending',     color: '#64748b', icon: Clock },
  in_progress: { label: 'In Progress', color: '#f59e0b', icon: Clock },
  completed:   { label: 'Completed',   color: '#10b981', icon: CheckCircle2 },
  overdue:     { label: 'Overdue',     color: '#f43f5e', icon: AlertTriangle },
};

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [recommendations, setRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [userSkills, setUserSkills] = useState(user?.skills?.join(', ') || 'React, Node.js, Python, IoT');
  const [savingSkills, setSavingSkills] = useState(false);

  // Milestone + Solution data
  const [milestoneStats, setMilestoneStats] = useState({ total: 0, done: 0, completionPct: 0, overdue: 0 });
  const [recentMilestones, setRecentMilestones] = useState([]);
  const [solution, setSolution] = useState(null);
  const [teamName, setTeamName] = useState(null);
  const [pilotRequesting, setPilotRequesting] = useState(false);

  const handleRequestPilot = async () => {
    if (!solution) return;
    setPilotRequesting(true);
    try {
      const res = await api.post(`/solutions/${solution.id}/request-pilot`, {
        pilotSiteLocation: `${solution.Challenge?.title || 'Project'} Field Site`,
        pilotRequestDetails: 'Prototype testing with direct community beneficiaries and sensor telemetry logging.'
      });
      if (res.success) {
        toast.success(res.message || 'Pilot permit requested!');
        setSolution(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to request pilot');
    } finally {
      setPilotRequesting(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      // AI Recommendations
      try {
        const recRes = await api.get('/ai/recommendations');
        if (recRes.success && recRes.data) setRecommendations(recRes.data);
      } catch (err) {
        console.warn('AI recommendations load error:', err);
      } finally {
        setLoadingAI(false);
      }

      try {
        const chalRes = await api.get('/challenges?limit=4');
        if (chalRes.success && chalRes.data) {
          setRecommendations(prev => prev.length > 0 ? prev : chalRes.data);
        }
      } catch (e) { console.warn(e); }

      // Milestones
      try {
        const msRes = await api.get('/milestones/my-team');
        if (msRes.success) {
          const all = msRes.data || [];
          const done = all.filter(m => m.status === 'completed').length;
          const overdue = all.filter(m => m.status === 'overdue').length;
          setMilestoneStats({
            total: all.length, done, overdue,
            completionPct: all.length > 0 ? Math.round((done / all.length) * 100) : 0
          });
          // Show last 3 active milestones
          const active = all.filter(m => m.status !== 'completed').slice(0, 3);
          setRecentMilestones(active);
          setTeamName(msRes.teamName);
        }
      } catch (e) { console.warn(e); }

      // Solution / Implementation status
      try {
        const solRes = await api.get('/solutions/my-team-solution');
        if (solRes.success && solRes.data) setSolution(solRes.data);
      } catch (e) { console.warn(e); }
    };

    loadDashboardData();
  }, []);

  const handleUpdateSkills = async (e) => {
    e.preventDefault();
    setSavingSkills(true);
    try {
      const skillsArray = userSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.put('/auth/profile', { skills: skillsArray });
      if (res.success) {
        updateUser({ skills: skillsArray });
        toast.success('Skills updated! Refreshing AI recommendations...');
        const recRes = await api.get('/ai/recommendations');
        if (recRes.success && recRes.data) setRecommendations(recRes.data);
      }
    } catch (err) {
      toast.error(err.message || 'Could not update skills');
    } finally {
      setSavingSkills(false);
    }
  };

  const implStatus = solution?.implementationStatus || 'not_started';
  const implCfg = IMPL_STATUS_CFG[implStatus];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="card p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: 12 }}>Student Innovation Portal</span>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Welcome, {user?.name || 'Student Innovator'}!</h1>
            <p className="text-secondary" style={{ maxWidth: 640 }}>
              Explore AI-matched societal problem statements, build your interdisciplinary teams, and develop verified solutions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary btn-sm"><Compass size={15} /> Explore Challenges</Link>
            <Link to="/team-formation" className="btn btn-secondary btn-sm"><Users size={15} /> My Team</Link>
          </div>
        </div>
      </div>

      {/* Widgets Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        {/* Milestone Progress Widget */}
        <div className="card p-5" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.06))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flag size={16} color="#10b981" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Milestones</span>
            </div>
            <Link to="/milestones" style={{ fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 3 }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {teamName ? (
            <>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>{teamName}</div>
              {/* Progress bar */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 9999, height: 8, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${milestoneStats.completionPct}%`, background: milestoneStats.completionPct === 100 ? '#10b981' : 'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius: 9999, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{milestoneStats.done}/{milestoneStats.total} done</span>
                <span style={{ color: milestoneStats.completionPct === 100 ? '#10b981' : '#3b82f6', fontWeight: 700 }}>{milestoneStats.completionPct}%</span>
              </div>
              {milestoneStats.overdue > 0 && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, color: '#f43f5e', fontSize: '0.78rem', fontWeight: 600 }}>
                  <AlertTriangle size={12} /> {milestoneStats.overdue} overdue milestone{milestoneStats.overdue > 1 ? 's' : ''}
                </div>
              )}
              {/* Recent Active */}
              {recentMilestones.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {recentMilestones.map(m => {
                    const cfg = MS_STATUS_CFG[m.status] || MS_STATUS_CFG.pending;
                    const Icon = cfg.icon;
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon size={13} color={cfg.color} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.title}</span>
                        <span style={{ fontSize: '0.68rem', color: cfg.color, fontWeight: 600, flexShrink: 0 }}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>No team yet</p>
              <Link to="/team-formation" className="btn btn-secondary btn-sm"><Users size={13} /> Join a Team</Link>
            </div>
          )}
        </div>

        {/* Implementation Status Widget */}
        <div className="card p-5" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(139,92,246,0.06))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} color="#f59e0b" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Implementation</span>
            </div>
            <Link to="/milestones" style={{ fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 3 }}>
              Update <ArrowRight size={12} />
            </Link>
          </div>
          {solution ? (
            <>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `${implCfg.color}18`, color: implCfg.color,
                borderRadius: 9999, padding: '4px 12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: 10
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: implCfg.color }} />
                {implCfg.label}
              </div>
              {/* Mini stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
                {Object.entries(IMPL_STATUS_CFG).map(([key, cfg], i) => {
                  const active = i <= (implCfg.step ?? 0);
                  return (
                    <React.Fragment key={key}>
                      <div style={{ width: active ? 20 : 14, height: 6, borderRadius: 9999, background: active ? cfg.color : 'rgba(100,116,139,0.2)', transition: 'all 0.3s ease' }} />
                    </React.Fragment>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Step {(implCfg.step ?? 0) + 1} of 5 · {solution.Challenge?.title || 'Project'}
              </div>

              {/* Pilot Status & Request Action */}
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                {solution.pilotPermitGranted ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 6, padding: '8px 10px', fontSize: '0.78rem', color: '#34d399'
                  }}>
                    <strong>📜 Official Pilot Permit Active:</strong>
                    <div style={{ marginTop: 2, fontFamily: 'monospace' }}>{solution.pilotPermitNumber}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Site: {solution.pilotSiteLocation}</div>
                  </div>
                ) : solution.pilotRequested ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 6, padding: '8px 10px', fontSize: '0.78rem', color: '#fbbf24'
                  }}>
                    ⏳ <strong>Pilot Permit Under Review</strong> by Govt Nodal Officer
                  </div>
                ) : (
                  <button
                    onClick={handleRequestPilot}
                    disabled={pilotRequesting}
                    className="btn btn-secondary btn-sm w-full"
                    style={{ fontSize: '0.78rem', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Flag size={13} color="#f59e0b" />
                    {pilotRequesting ? 'Requesting...' : 'Request Field Pilot Permit'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>No solution submitted</p>
              <Link to="/submit-solution" className="btn btn-secondary btn-sm"><Lightbulb size={13} /> Submit Solution</Link>
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="card p-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <BarChart3 size={16} color="var(--color-primary-400)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Your Pipeline</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><Link to="/team-formation" className="btn btn-secondary w-full btn-sm" style={{ justifyContent: 'flex-start' }}><Users size={14} /> My Innovation Team</Link></li>
            <li><Link to="/milestones" className="btn btn-secondary w-full btn-sm" style={{ justifyContent: 'flex-start' }}><Flag size={14} /> Milestone Tracker</Link></li>
            <li><Link to="/submit-solution" className="btn btn-secondary w-full btn-sm" style={{ justifyContent: 'flex-start' }}><Lightbulb size={14} /> Submit Solution</Link></li>
            <li><Link to="/explore" className="btn btn-secondary w-full btn-sm" style={{ justifyContent: 'flex-start' }}><Compass size={14} /> Browse Challenges</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom: AI Recommendations + Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* AI Recommendations */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="#fbbf24" />
              <h3 style={{ fontSize: '1.3rem' }}>AI Recommended Challenges</h3>
            </div>
            <span className="badge badge-amber" style={{ fontSize: 11 }}>TF-IDF Skill Match</span>
          </div>

          {loadingAI ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[1, 2].map(n => (
                <div key={n} className="card p-6" style={{ height: 240 }}>
                  <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 24, width: '80%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 60, width: '100%' }} />
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {recommendations.map(c => <ChallengeCard key={c.id} challenge={c} showMatch={true} />)}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-muted">No challenge matches found. Try adding more skills below.</p>
            </div>
          )}
        </div>

        {/* Skills Editor */}
        <div className="card p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Settings size={18} color="var(--color-primary-400)" />
            <h4 style={{ fontSize: '1.05rem' }}>Your Skills for AI Matching</h4>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 16 }}>
            Update your engineering competencies so SocioSolve can match you with relevant challenges:
          </p>
          <form onSubmit={handleUpdateSkills}>
            <textarea
              className="form-textarea"
              rows={3}
              value={userSkills}
              onChange={e => setUserSkills(e.target.value)}
              placeholder="e.g. React, Python, IoT, GIS, Computer Vision, Docker"
              style={{ fontSize: '0.85rem', marginBottom: 12 }}
            />
            <button type="submit" disabled={savingSkills} className="btn btn-primary btn-sm w-full">
              {savingSkills ? 'Updating...' : 'Update Skills & Re-match'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
