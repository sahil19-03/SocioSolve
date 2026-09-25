import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users, UserPlus, Shield, Sparkles, Check, ArrowRight,
  GraduationCap, Building2, CheckCircle2, Clock, Plus, Lightbulb
} from 'lucide-react';

const SKILL_ROLES = [
  'IoT & Embedded Systems Engineer',
  'AI / ML & Computer Vision Specialist',
  'Full-Stack & Cloud Developer',
  'Civil / Environmental Engineering Lead',
  'Hardware Prototyping & CAD Designer',
  'Community Field Survey & Data Analyst'
];

export default function TeamFormation() {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challengeId') || '';
  const teamId = searchParams.get('teamId') || '';
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();

  const [activeTeam, setActiveTeam] = useState(null);
  const [openTeams, setOpenTeams] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(challengeId);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [creating, setCreating] = useState(false);

  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [pairingMentor, setPairingMentor] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [targetJoinTeamId, setTargetJoinTeamId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(SKILL_ROLES[0]);
  const [joining, setJoining] = useState(false);

  const loadData = async () => {
    try {
      const [chalRes, facRes] = await Promise.all([
        api.get('/challenges?limit=50'),
        api.get('/teams/faculty-candidates').catch(() => ({ success: true, data: [] }))
      ]);

      if (chalRes.success) setChallenges(chalRes.data || []);
      if (facRes.success) setFacultyList(facRes.data || []);

      if (teamId) {
        const teamRes = await api.get(`/teams/${teamId}`);
        if (teamRes.success) setActiveTeam(teamRes.data);
      } else if (challengeId) {
        const teamsRes = await api.get(`/teams/challenge/${challengeId}`);
        if (teamsRes.success) setOpenTeams(teamsRes.data || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [challengeId, teamId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info('Please log in to create a team');
      navigate('/login');
      return;
    }

    if (!selectedChallengeId) {
      toast.error('Please select the challenge your team will address');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/teams', {
        name: newTeamName,
        description: newTeamDesc,
        challengeId: selectedChallengeId,
        maxMembers
      });
      toast.success(res.message || 'Team created successfully!');
      setShowCreateModal(false);
      if (res.data?.id) {
        navigate(`/team-formation?teamId=${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!targetJoinTeamId) return;
    setJoining(true);
    try {
      const res = await api.post(`/teams/${targetJoinTeamId}/join`, { role: selectedRole });
      toast.success(res.message || 'Joined team!');
      setShowJoinModal(false);
      navigate(`/team-formation?teamId=${targetJoinTeamId}`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Could not join team');
    } finally {
      setJoining(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!activeTeam || !selectedFacultyId) return;
    setPairingMentor(true);
    try {
      const res = await api.patch(`/teams/${activeTeam.id}/assign-faculty`, {
        facultyMentorId: selectedFacultyId
      });
      toast.success(res.message);
      setShowMentorModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to assign mentor');
    } finally {
      setPairingMentor(false);
    }
  };

  const handleCoordinatorApprove = async () => {
    if (!activeTeam) return;
    try {
      const res = await api.patch(`/teams/${activeTeam.id}/approve`, {
        coordinatorNotes: `Approved by ${user?.organization || 'University Coordinator'}`
      });
      toast.success(res.message);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve team constitution');
    }
  };

  const isLeader = activeTeam && user && activeTeam.leaderId === user.id;
  const isMember = activeTeam && user && (activeTeam.members || []).some(m => m.id === user.id);
  const isCoordinator = user && (user.role === 'university_admin' || user.role === 'admin');

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-purple">Phase 5: Team Formation</span>
              <span className="badge badge-cyan">NEP 2020 Multidisciplinary</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', marginBottom: 8 }}>Student Squads & Mentorship Pairing</h1>
            <p className="text-secondary" style={{ maxWidth: 640 }}>
              Form cross-functional student squads, recruit peers with designated technical skill sets, attach official academic faculty guides, and obtain HEI Coordinator approval.
            </p>
          </div>

          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <UserPlus size={16} /> Launch New Squad
          </button>
        </div>

        {/* If viewing a single team */}
        {activeTeam ? (
          <div className="card p-8 mb-8" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="badge badge-blue">Team Dossier</span>
                  {activeTeam.isApprovedByCoordinator ? (
                    <span className="badge badge-green"><CheckCircle2 size={12} style={{ marginRight: 4 }} /> Coordinator Approved</span>
                  ) : (
                    <span className="badge badge-amber"><Clock size={12} style={{ marginRight: 4 }} /> Pending Coordinator Approval</span>
                  )}
                  <span className="badge badge-purple">Members: {(activeTeam.members?.length || 1)} / {activeTeam.maxMembers}</span>
                </div>

                <h2 style={{ fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                  {activeTeam.name}
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.95rem', maxWidth: 640 }}>
                  {activeTeam.description || 'Dedicated student innovation squad formulating an engineering solution.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {activeTeam.Challenge && (
                  <Link to={`/challenge/${activeTeam.Challenge.id}`} className="btn btn-outline btn-sm">
                    Target Problem &rarr;
                  </Link>
                )}

                {/* Direct Phase 6 CTA if student is leader/member */}
                {(isLeader || isMember) && (
                  <Link
                    to={`/submit-solution?teamId=${activeTeam.id}&challengeId=${activeTeam.Challenge?.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#06b6d4', borderColor: '#06b6d4' }}
                  >
                    <Lightbulb size={14} style={{ marginRight: 6 }} /> Submit Proposal (Phase 6)
                  </Link>
                )}

                {/* Coordinator Approval Button */}
                {isCoordinator && !activeTeam.isApprovedByCoordinator && (
                  <button onClick={handleCoordinatorApprove} className="btn btn-primary btn-sm" style={{ background: '#10b981', borderColor: '#10b981' }}>
                    <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Approve Constitution
                  </button>
                )}
              </div>
            </div>

            {/* Coordinator Notes if present */}
            {activeTeam.coordinatorNotes && (
              <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981', marginBottom: 20, fontSize: '0.85rem' }}>
                <strong>Institutional Note:</strong> {activeTeam.coordinatorNotes}
              </div>
            )}

            {/* Team Members List */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24, marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Team Constitution & Assigned Skills</h3>
                {!isMember && (activeTeam.members?.length || 1) < activeTeam.maxMembers && (
                  <button
                    onClick={() => { setTargetJoinTeamId(activeTeam.id); setShowJoinModal(true); }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} style={{ marginRight: 4 }} /> Join Squad
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {activeTeam.members && activeTeam.members.length > 0 ? (
                  activeTeam.members.map((m) => (
                    <div key={m.id} className="card p-4" style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ width: 42, height: 42 }}>
                        {utils.initials(m.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>
                          {m.TeamMember?.role || 'Squad Member'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {m.university || 'Engineering Student'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar">{utils.initials(activeTeam.leader?.name)}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{activeTeam.leader?.name || 'Leader'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>Squad Leader</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{activeTeam.leader?.university || 'Student Leader'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mentors Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24, marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-primary-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <GraduationCap size={16} /> Faculty Academic Mentor
                  </h4>
                  {!activeTeam.facultyMentor && (isLeader || isCoordinator) && (
                    <button onClick={() => setShowMentorModal(true)} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                      Pair Guide
                    </button>
                  )}
                </div>

                {activeTeam.facultyMentor ? (
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>{activeTeam.facultyMentor.name}</strong>
                    <p className="text-secondary" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                      {activeTeam.facultyMentor.organization || 'University Department'}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    No faculty mentor assigned. Guide is required to approve milestone submissions in Phase 6 & 7.
                  </p>
                )}
              </div>

              <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: 12, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={16} /> Sponsoring HEI Institution
                </h4>
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>
                    {activeTeam.university?.organization || activeTeam.university?.name || activeTeam.leader?.university || 'Host Institution'}
                  </strong>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                    Provides prototyping labs, clean room access, and test benches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Open Teams Browser */}
        <div className="card p-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 4 }}>Open Squads Seeking Peers</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>
                Join an existing squad or partner with peer students across departments.
              </p>
            </div>
            {challengeId && (
              <span className="badge badge-cyan">Filtered by Selected Challenge</span>
            )}
          </div>

          {openTeams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {openTeams.map((t) => (
                <div key={t.id} className="card p-5" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <h4 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)' }}>{t.name}</h4>
                      {t.isApprovedByCoordinator && (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>HEI Approved</span>
                      )}
                    </div>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 10 }}>
                      {t.description || 'Committed squad formulating an engineering proposal.'}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-purple">Members: {t.members?.length || 1} / {t.maxMembers || 5}</span>
                      {t.facultyMentor ? (
                        <span className="badge badge-emerald">Faculty Guide: {t.facultyMentor.name}</span>
                      ) : (
                        <span className="badge badge-amber">Open for Faculty Mentor</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link to={`/team-formation?teamId=${t.id}`} className="btn btn-outline btn-sm">
                      Dossier
                    </Link>
                    <button
                      onClick={() => { setTargetJoinTeamId(t.id); setShowJoinModal(true); }}
                      className="btn btn-secondary btn-sm"
                    >
                      Join Squad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <h4>No Squads Formed Yet for this Challenge</h4>
              <p className="text-secondary" style={{ marginBottom: 20 }}>
                Step forward, form the first squad, and recruit fellow students with complementary skills!
              </p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
                Create Squad
              </button>
            </div>
          )}
        </div>

        {/* Modal: Create Team */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
          }}>
            <div className="card p-8" style={{ width: '100%', maxWidth: 560 }}>
              <h3 style={{ marginBottom: 16 }}>Form a New Multidisciplinary Squad</h3>

              <form onSubmit={handleCreateTeam}>
                <div className="form-group mb-4">
                  <label className="form-label">Target Societal Challenge *</label>
                  <select
                    className="form-control"
                    value={selectedChallengeId}
                    onChange={(e) => setSelectedChallengeId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Challenge --</option>
                    {challenges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.submissionCode ? `[${c.submissionCode}] ` : ''}{c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Squad Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Team JalRakshak"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Mission Statement & Desired Roles</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Formulating solar-assisted LoRaWAN borehole telemetry kiosk. Seeking embedded C programmer and CAD hardware designer."
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                  />
                </div>

                <div className="form-group mb-6">
                  <label className="form-label">Maximum Squad Size (2–8 students)</label>
                  <input
                    type="number"
                    className="form-control"
                    min={2}
                    max={8}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="btn btn-primary">
                    {creating ? 'Creating...' : 'Launch Squad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Join Team with Skill Selection */}
        {showJoinModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
          }}>
            <div className="card p-8" style={{ width: '100%', maxWidth: 480 }}>
              <h3 style={{ marginBottom: 16 }}>Join Student Squad</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
                Select your designated technical role within the squad to fulfill multidisciplinary NEP 2020 criteria.
              </p>

              <form onSubmit={handleJoinTeam}>
                <div className="form-group mb-6">
                  <label className="form-label">Designated Technical Role</label>
                  <select
                    className="form-control"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {SKILL_ROLES.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={joining} className="btn btn-primary">
                    {joining ? 'Joining...' : 'Confirm Squad Membership'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Assign Faculty Mentor */}
        {showMentorModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
          }}>
            <div className="card p-8" style={{ width: '100%', maxWidth: 500 }}>
              <h3 style={{ marginBottom: 16 }}>Pair Faculty Academic Mentor</h3>

              <div className="form-group mb-6">
                <label className="form-label">Select Faculty Member</label>
                <select
                  className="form-control"
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                >
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.organization || 'Faculty Guide'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowMentorModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={pairingMentor || !selectedFacultyId}
                  onClick={handleAssignMentor}
                  className="btn btn-primary"
                >
                  {pairingMentor ? 'Pairing...' : 'Confirm Faculty Mentor'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
