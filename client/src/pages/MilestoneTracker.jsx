import React, { useState, useEffect, useCallback } from 'react';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp,
  Trash2, Target, Users, BookOpen, BarChart3, ArrowRight,
  Flag, Edit3, MessageSquare, RefreshCw, Zap, Award
} from 'lucide-react';

// ─── Status Config ─────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:     { label: 'Pending',     color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: Clock },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: RefreshCw },
  completed:   { label: 'Completed',   color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle2 },
  overdue:     { label: 'Overdue',     color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   icon: AlertTriangle },
};

const IMPL_STATUS = {
  not_started:     { label: 'Not Started',      color: '#64748b', step: 0 },
  in_progress:     { label: 'Development',      color: '#3b82f6', step: 1 },
  piloting:        { label: 'Pilot Testing',    color: '#f59e0b', step: 2 },
  implemented:     { label: 'Implemented',      color: '#8b5cf6', step: 3 },
  impact_measured: { label: 'Impact Measured',  color: '#10b981', step: 4 },
};

// ─── Progress Bar ──────────────────────────────────────────────────────────
function ProgressRing({ pct }) {
  const r = 36, cx = 44, cy = 44, stroke = 7;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
      <circle cx={cx} cy={cy} r={r} stroke={pct === 100 ? '#10b981' : '#3b82f6'} strokeWidth={stroke}
        fill="none" strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.8s ease', strokeLinecap: 'round' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700}
        fill={pct === 100 ? '#10b981' : '#e2e8f0'} style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── Implementation Pipeline ───────────────────────────────────────────────
function ImplPipeline({ current }) {
  const stages = Object.entries(IMPL_STATUS);
  const currentStep = IMPL_STATUS[current]?.step ?? 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', padding: '4px 0' }}>
      {stages.map(([key, cfg], i) => {
        const active = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <React.Fragment key={key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 72, flex: '0 0 auto' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: active ? cfg.color : 'rgba(100,116,139,0.15)',
                border: isCurrent ? `2px solid ${cfg.color}` : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isCurrent ? `0 0 10px ${cfg.color}60` : 'none',
                transition: 'all 0.3s ease'
              }}>
                {active ? <CheckCircle2 size={16} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(100,116,139,0.4)' }} />}
              </div>
              <span style={{ fontSize: '0.65rem', color: active ? cfg.color : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                {cfg.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentStep ? '#3b82f6' : 'rgba(100,116,139,0.15)', minWidth: 16, marginBottom: 20, transition: 'background 0.3s ease' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Milestone Card ────────────────────────────────────────────────────────
function MilestoneCard({ milestone, canFacultyValidate, onProgressUpdate, onValidate, onDelete, isFaculty }) {
  const [expanded, setExpanded] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  const [feedback, setFeedback] = useState(milestone.mentorFeedback || '');
  const [saving, setSaving] = useState(false);
  const cfg = STATUS_CFG[milestone.status] || STATUS_CFG.pending;
  const Icon = cfg.icon;

  const handleProgress = async () => {
    setSaving(true);
    await onProgressUpdate(milestone.id, { status: 'in_progress', progressNote });
    setProgressNote('');
    setSaving(false);
  };

  const handleValidate = async (action) => {
    setSaving(true);
    await onValidate(milestone.id, { action, mentorFeedback: feedback });
    setSaving(false);
  };

  return (
    <div className="card" style={{ marginBottom: 10, borderLeft: `3px solid ${cfg.color}`, overflow: 'visible', transition: 'all 0.2s ease' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={cfg.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {milestone.orderIndex > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 6 }}>#{milestone.orderIndex}</span>}
            {milestone.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {milestone.dueDate ? `Due: ${utils.formatDate(milestone.dueDate)}` : 'No due date'}
            {milestone.completedAt && <span style={{ color: '#10b981', marginLeft: 8 }}>✓ Completed {utils.formatDate(milestone.completedAt)}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '2px 8px', borderRadius: 9999, background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {cfg.label}
          </span>
          {expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border-color)' }}>
          {/* Description */}
          {milestone.description && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {milestone.description}
            </p>
          )}

          {/* Deliverables */}
          {milestone.deliverables?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deliverables</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {milestone.deliverables.map((d, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={13} color={milestone.status === 'completed' ? '#10b981' : '#64748b'} style={{ marginTop: 2, flexShrink: 0 }} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mentor Feedback */}
          {milestone.mentorFeedback && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', marginBottom: 4, textTransform: 'uppercase' }}>Faculty Feedback</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{milestone.mentorFeedback}</p>
              {milestone.approvedBy && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>— {milestone.approvedBy.name}</div>
              )}
            </div>
          )}

          {/* Student: Report Progress */}
          {!isFaculty && milestone.status !== 'completed' && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>📊 Report Progress</div>
              <textarea className="form-textarea" rows={2} placeholder="Describe what you've done so far..." value={progressNote}
                onChange={e => setProgressNote(e.target.value)} style={{ fontSize: '0.85rem', marginBottom: 8 }} />
              <button className="btn btn-primary btn-sm" onClick={handleProgress} disabled={saving || milestone.status === 'in_progress' && !progressNote}>
                <RefreshCw size={13} /> {saving ? 'Saving...' : 'Mark as In Progress'}
              </button>
            </div>
          )}

          {/* Faculty: Validate */}
          {isFaculty && canFacultyValidate && milestone.status !== 'completed' && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>🏫 Faculty Validation</div>
              <textarea className="form-textarea" rows={2} placeholder="Add feedback or notes for this milestone..." value={feedback}
                onChange={e => setFeedback(e.target.value)} style={{ fontSize: '0.85rem', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => handleValidate('approve')} disabled={saving}>
                  <CheckCircle2 size={13} /> {saving ? '...' : 'Approve'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleValidate('request_revision')} disabled={saving}>
                  <RefreshCw size={13} /> Request Revision
                </button>
              </div>
            </div>
          )}

          {/* Delete */}
          {onDelete && (
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" style={{ color: '#f43f5e', fontSize: '0.75rem' }} onClick={() => onDelete(milestone.id)}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function MilestoneTracker({ teamId: propTeamId }) {
  const { user } = useAuth();
  const toast = useToast();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const [milestones, setMilestones] = useState([]);
  const [teamId, setTeamId] = useState(propTeamId || null);
  const [teamName, setTeamName] = useState('My Team');
  const [challenge, setChallenge] = useState(null);
  const [facultyMentor, setFacultyMentor] = useState(null);
  const [solution, setSolution] = useState(null);
  const [stats, setStats] = useState({ total: 0, done: 0, completionPct: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [updatingImpl, setUpdatingImpl] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', deliverables: '', orderIndex: '' });

  // ─── Faculty: multi-team view ────────────────────────────────────────
  const [facultyTeams, setFacultyTeams] = useState([]);
  const [selectedFacultyTeam, setSelectedFacultyTeam] = useState(null);

  const loadMyTeam = useCallback(async () => {
    setLoading(true);
    try {
      if (isFaculty && !propTeamId) {
        const res = await api.get('/milestones/faculty-teams');
        if (res.success) {
          setFacultyTeams(res.data);
          if (res.data.length > 0 && !selectedFacultyTeam) {
            const first = res.data[0];
            setSelectedFacultyTeam(first.teamId);
            setMilestones(first.milestones || []);
            setTeamName(first.teamName);
            setChallenge(first.challenge);
            setStats(first.stats);
          }
        }
      } else {
        const res = await api.get('/milestones/my-team');
        if (res.success) {
          setMilestones(res.data || []);
          setTeamId(res.teamId);
          setTeamName(res.teamName || 'My Team');
          setChallenge(res.challenge);
          setFacultyMentor(res.facultyMentor);
          setStats(res.stats || { total: 0, done: 0, completionPct: 0 });
        }
      }
    } catch (err) {
      toast.error('Could not load milestones');
    } finally {
      setLoading(false);
    }
  }, [isFaculty, propTeamId, selectedFacultyTeam]);

  useEffect(() => { loadMyTeam(); }, []);

  // When faculty selects a team tab
  const handleFacultyTeamSelect = (teamData) => {
    setSelectedFacultyTeam(teamData.teamId);
    setTeamId(teamData.teamId);
    setMilestones(teamData.milestones || []);
    setTeamName(teamData.teamName);
    setChallenge(teamData.challenge);
    setStats(teamData.stats);
  };

  // Load solution for implementation status (students)
  useEffect(() => {
    if (!isFaculty) {
      api.get('/solutions/my-team-solution').then(res => {
        if (res.success) setSolution(res.data);
      }).catch(() => {});
    }
  }, [isFaculty]);

  const handleAdd = async () => {
    if (!form.title) return toast.error('Title is required');
    const tid = teamId || selectedFacultyTeam;
    if (!tid) return toast.error('No team found');
    try {
      const res = await api.post('/milestones', {
        teamId: tid,
        title: form.title,
        description: form.description,
        dueDate: form.dueDate || null,
        deliverables: form.deliverables,
        orderIndex: parseInt(form.orderIndex) || milestones.length + 1
      });
      if (res.success) {
        setMilestones(prev => [...prev, res.data]);
        setStats(s => ({ ...s, total: s.total + 1 }));
        setForm({ title: '', description: '', dueDate: '', deliverables: '', orderIndex: '' });
        setShowAdd(false);
        toast.success('Milestone added!');
      }
    } catch (err) { toast.error(err.message || 'Failed to add milestone'); }
  };

  const handleProgressUpdate = async (id, updates) => {
    try {
      const res = await api.put(`/milestones/${id}/progress`, updates);
      if (res.success) {
        setMilestones(prev => prev.map(m => m.id === id ? res.data : m));
        toast.success('Progress reported!');
      }
    } catch (err) { toast.error(err.message || 'Failed to update'); }
  };

  const handleValidate = async (id, updates) => {
    try {
      const res = await api.put(`/milestones/${id}/validate`, updates);
      if (res.success) {
        setMilestones(prev => prev.map(m => m.id === id ? res.data : m));
        const newDone = milestones.filter(m => m.id === id ? res.data.status === 'completed' : m.status === 'completed').length;
        setStats(s => ({ ...s, done: newDone, completionPct: Math.round((newDone / s.total) * 100) }));
        toast.success(updates.action === 'approve' ? '✅ Milestone approved!' : '🔄 Revision requested');
      }
    } catch (err) { toast.error(err.message || 'Failed to validate'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/milestones/${id}`);
      setMilestones(prev => prev.filter(m => m.id !== id));
      setStats(s => ({ ...s, total: s.total - 1 }));
      toast.success('Milestone removed');
    } catch (err) { toast.error(err.message); }
  };

  const handleImplStatus = async (status) => {
    if (!solution) return toast.error('No solution found for your team');
    setUpdatingImpl(true);
    try {
      const res = await api.put(`/solutions/${solution.id}/implementation-status`, { implementationStatus: status });
      if (res.success) {
        setSolution(res.data);
        toast.success('Implementation status updated!');
      }
    } catch (err) { toast.error(err.message); }
    setUpdatingImpl(false);
  };

  // Group by status
  const grouped = { pending: [], in_progress: [], overdue: [], completed: [] };
  milestones.forEach(m => { (grouped[m.status] || grouped.pending).push(m); });

  if (loading) {
    return (
      <div style={{ padding: '50px 0 100px' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[1,2,3].map(n => <div key={n} className="card p-6"><div className="skeleton" style={{ height: 80 }} /></div>)}
          </div>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px 0 100px' }}>
      <div className="container" style={{ maxWidth: 960 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 36 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 10 }}>Phase 7 · Development & Execution</span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 6 }}>Milestone Tracker</h1>
          <p className="text-secondary">
            {isFaculty ? 'Supervise team progress, validate milestones and provide feedback.' : 'Track deliverables, report progress, and stay on top of your project lifecycle.'}
          </p>
        </div>

        {/* Faculty: Team Tabs */}
        {isFaculty && facultyTeams.length > 1 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {facultyTeams.map(t => (
              <button key={t.teamId}
                className={`btn btn-sm ${selectedFacultyTeam === t.teamId ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleFacultyTeamSelect(t)}>
                <Users size={13} /> {t.teamName}
                {t.stats.overdue > 0 && <span style={{ background: '#f43f5e', color: '#fff', borderRadius: 9999, padding: '0 5px', fontSize: 10, marginLeft: 4 }}>{t.stats.overdue}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Stats Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {/* Progress Ring */}
          <div className="card p-5" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))' }}>
            <ProgressRing pct={stats.completionPct} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Overall Progress</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.done}/{stats.total}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>milestones done</div>
            </div>
          </div>

          {/* Status Counters */}
          {Object.entries(STATUS_CFG).map(([st, cfg]) => {
            const count = grouped[st]?.length || 0;
            const Icon = cfg.icon;
            return (
              <div key={st} className="card p-5" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cfg.color }}>{count}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{cfg.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Challenge & Team Info Banner */}
        {(challenge || teamName !== 'My Team') && (
          <div className="card p-4" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Team</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{teamName}</div>
              </div>
            </div>
            {challenge && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={16} color="#8b5cf6" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Challenge</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{challenge.title}</div>
                </div>
              </div>
            )}
            {facultyMentor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Faculty Mentor</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{facultyMentor.name}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Implementation Status Pipeline (students only) */}
        {!isFaculty && solution && (
          <div className="card p-5" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="#f59e0b" />
                <h4 style={{ fontSize: '1rem' }}>Project Implementation Pipeline</h4>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(IMPL_STATUS).map(([key, cfg]) => (
                  <button key={key}
                    className="btn btn-sm"
                    style={{
                      background: solution.implementationStatus === key ? cfg.color : 'transparent',
                      color: solution.implementationStatus === key ? '#fff' : cfg.color,
                      border: `1px solid ${cfg.color}40`,
                      fontSize: '0.72rem'
                    }}
                    disabled={updatingImpl}
                    onClick={() => handleImplStatus(key)}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <ImplPipeline current={solution.implementationStatus || 'not_started'} />
          </div>
        )}

        {/* Main Content: Add + Milestone List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flag size={18} color="var(--color-primary-400)" /> Milestones
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} /> Add Milestone
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="card p-6" style={{ marginBottom: 20, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.04)' }}>
            <h4 style={{ marginBottom: 16, fontSize: '1rem' }}>New Milestone</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="e.g. Working Prototype Demo" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Order / Phase #</label>
                <input type="number" className="form-input" placeholder="e.g. 1" min={1} value={form.orderIndex} onChange={e => setForm({ ...form, orderIndex: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Deliverables (one per line)</label>
                <textarea className="form-textarea" rows={3} placeholder={"Working prototype\nTest report\nVideo demo"} value={form.deliverables} onChange={e => setForm({ ...form, deliverables: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add Milestone</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {milestones.length === 0 ? (
          <div className="card p-8" style={{ textAlign: 'center' }}>
            <Flag size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8 }}>No milestones yet</h3>
            <p className="text-muted">Add your first milestone to start tracking team progress.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20, alignItems: 'start' }}>
            {/* Overdue first, then in_progress, pending, completed */}
            {(['overdue', 'in_progress', 'pending', 'completed']).map(st => {
              const items = grouped[st] || [];
              if (items.length === 0) return null;
              const cfg = STATUS_CFG[st];
              const Icon = cfg.icon;
              return (
                <div key={st}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cfg.label}</span>
                    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 9999, padding: '0 6px', fontSize: '0.72rem', fontWeight: 700 }}>{items.length}</span>
                  </div>
                  {items.map(m => (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      isFaculty={isFaculty}
                      canFacultyValidate={isFaculty}
                      onProgressUpdate={handleProgressUpdate}
                      onValidate={handleValidate}
                      onDelete={(user?.role === 'admin' || (isFaculty && m.status !== 'completed')) ? handleDelete : null}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* No Team Found */}
        {!teamId && !isFaculty && !loading && (
          <div className="card p-8" style={{ textAlign: 'center', marginTop: 20 }}>
            <Users size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8 }}>No team found</h3>
            <p className="text-muted" style={{ marginBottom: 20 }}>You need to join or create a team to track milestones.</p>
            <a href="/team-formation" className="btn btn-primary">
              <Users size={16} /> Go to Team Formation
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
