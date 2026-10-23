import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users, UserPlus, Shield, Sparkles, Check, ArrowRight,
  GraduationCap, Building2, CheckCircle2, Clock, Plus, Lightbulb,
  Copy, Key, Send, CheckCheck, XCircle, MessageSquare
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

  // Add Teammate Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [studentCandidates, setStudentCandidates] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [manualStudentEmail, setManualStudentEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState(SKILL_ROLES[0]);
  const [addingMember, setAddingMember] = useState(false);
  const [searchingStudents, setSearchingStudents] = useState(false);

  // ─── Option 1 (Hybrid): Join with Code & Join Requests State ───
  const [showCodeJoinModal, setShowCodeJoinModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [codeJoinRole, setCodeJoinRole] = useState(SKILL_ROLES[0]);
  const [joiningByCode, setJoiningByCode] = useState(false);

  const [showRequestJoinModal, setShowRequestJoinModal] = useState(false);
  const [targetRequestTeam, setTargetRequestTeam] = useState(null);
  const [requestRole, setRequestRole] = useState(SKILL_ROLES[0]);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestingJoin, setRequestingJoin] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      toast.error('Please enter a team invite code');
      return;
    }
    setJoiningByCode(true);
    try {
      const res = await api.post('/teams/join-code', {
        code: inputCode.trim(),
        role: codeJoinRole
      });
      toast.success(res.message || 'Successfully joined squad!');
      setShowCodeJoinModal(false);
      setInputCode('');
      if (res.data?.id) {
        navigate(`/team-formation?teamId=${res.data.id}`);
      }
      loadData();
    } catch (err) {
      toast.error(err.message || 'Could not join with code');
    } finally {
      setJoiningByCode(false);
    }
  };

  const handleRequestJoin = async (e) => {
    e.preventDefault();
    if (!targetRequestTeam) return;
    setRequestingJoin(true);
    try {
      const res = await api.post(`/teams/${targetRequestTeam.id}/request-join`, {
        role: requestRole,
        message: requestMessage
      });
      toast.success(res.message || 'Join request sent!');
      setShowRequestJoinModal(false);
      setRequestMessage('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Could not send join request');
    } finally {
      setRequestingJoin(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    if (!activeTeam) return;
    try {
      const res = await api.post(`/teams/${activeTeam.id}/requests/${userId}/accept`);
      toast.success(res.message || 'Student accepted into squad!');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (userId) => {
    if (!activeTeam) return;
    try {
      const res = await api.post(`/teams/${activeTeam.id}/requests/${userId}/reject`);
      toast.info(res.message || 'Request declined');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to decline request');
    }
  };

  const copyInviteCode = () => {
    if (!activeTeam?.joinCode) return;
    navigator.clipboard.writeText(activeTeam.joinCode);
    setCopiedCode(true);
    toast.success('Squad invite code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
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

  const openAddMemberModal = async () => {
    setShowAddMemberModal(true);
    setSearchingStudents(true);
    try {
      const res = await api.get('/teams/available-students');
      if (res.success && res.data) {
        setStudentCandidates(res.data);
      }
    } catch (_) {}
    finally {
      setSearchingStudents(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!activeTeam) return;
    if (!selectedStudentId && !manualStudentEmail.trim()) {
      toast.error('Please select a student from the list or enter an email address.');
      return;
    }

    setAddingMember(true);
    try {
      const payload = {
        role: newMemberRole,
        ...(selectedStudentId ? { studentId: selectedStudentId } : { email: manualStudentEmail.trim() })
      };
      const res = await api.post(`/teams/${activeTeam.id}/add-member`, payload);
      toast.success(res.message || 'Teammate successfully added to squad!');
      setShowAddMemberModal(false);
      setSelectedStudentId('');
      setManualStudentEmail('');
      loadData();
      // Notify other components locally
      window.dispatchEvent(new CustomEvent('notification-refresh'));
    } catch (err) {
      toast.error(err.message || 'Failed to add teammate to squad');
    } finally {
      setAddingMember(false);
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
              <span className="badge badge-purple">Team Formation</span>
              <span className="badge badge-cyan">NEP 2020 Multidisciplinary</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', marginBottom: 8 }}>Student Squads & Mentorship Pairing</h1>
            <p className="text-secondary" style={{ maxWidth: 640 }}>
              Form cross-functional student squads, recruit peers with designated technical skill sets, attach official academic faculty guides, and obtain HEI Coordinator approval.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowCodeJoinModal(true)}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Key size={16} /> Join with Code
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <UserPlus size={16} /> Launch New Squad
            </button>
          </div>
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

                {/* Direct CTA if student is leader/member */}
                {(isLeader || isMember) && (
                  <Link
                    to={`/submit-solution?teamId=${activeTeam.id}&challengeId=${activeTeam.Challenge?.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#06b6d4', borderColor: '#06b6d4' }}
                  >
                    <Lightbulb size={14} style={{ marginRight: 6 }} /> Submit Proposal
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

            {/* ── Option 1: Team Invite Code Bar (Leader-Only) ── */}
            {isLeader && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
                border: '1px dashed rgba(129,140,248,0.5)',
                borderRadius: 12,
                padding: '14px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Key size={13} /> Squad Invite Code (Leader Only)
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: 2, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: 2 }}>
                    {activeTeam.joinCode || 'Generating...'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Share this code privately with students you want to fast-track into the squad.
                  </div>
                </div>
                <button
                  onClick={copyInviteCode}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6, fontWeight: 600 }}
                >
                  {copiedCode ? <CheckCheck size={15} color="#10b981" /> : <Copy size={15} />}
                  {copiedCode ? 'Code Copied!' : 'Copy Invite Code'}
                </button>
              </div>
            )}

            {/* ── Option 1: Pending Join Requests Console (Leader Review) ── */}
            {isLeader && activeTeam.pendingRequests && activeTeam.pendingRequests.length > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 12,
                padding: '18px 20px',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                    <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#fbbf24' }}>
                      Pending Join Requests ({activeTeam.pendingRequests.length})
                    </h3>
                  </div>
                  <span className="badge badge-amber">Leader Approval Required</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeTeam.pendingRequests.map(reqUser => (
                    <div key={reqUser.id} className="card p-4" style={{ background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar" style={{ width: 40, height: 40 }}>
                          {utils.initials(reqUser.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{reqUser.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {reqUser.university || reqUser.email}
                          </div>
                          {reqUser.TeamMember?.skillRole && (
                            <span className="badge badge-purple" style={{ marginTop: 4, display: 'inline-block' }}>
                              Applying as: {reqUser.TeamMember.skillRole}
                            </span>
                          )}
                          {reqUser.TeamMember?.requestMessage && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0', fontStyle: 'italic' }}>
                              "{reqUser.TeamMember.requestMessage}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleAcceptRequest(reqUser.id)}
                          className="btn btn-primary btn-sm"
                          style={{ background: '#10b981', borderColor: '#10b981', gap: 4 }}
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(reqUser.id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: '#f43f5e', gap: 4 }}
                        >
                          <XCircle size={14} /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members List */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24, marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Team Constitution & Assigned Skills</h3>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {isLeader && (activeTeam.members?.length || 1) < activeTeam.maxMembers && (
                    <button
                      onClick={openAddMemberModal}
                      className="btn btn-primary btn-sm"
                    >
                      <UserPlus size={14} style={{ marginRight: 4 }} /> Add Teammate
                    </button>
                  )}
                  {!isMember && !isLeader && (activeTeam.members?.length || 1) < activeTeam.maxMembers && (
                    <button
                      onClick={() => { setTargetRequestTeam(activeTeam); setShowRequestJoinModal(true); }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Send size={14} /> Request to Join
                    </button>
                  )}
                </div>
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
                    No faculty mentor is assigned. A faculty guide is required to review milestone submissions.
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
                      onClick={() => { setTargetRequestTeam(t); setShowRequestJoinModal(true); }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <UserPlus size={14} /> Request to Join
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

        {/* Modal: Add Teammate to Squad (Notifies the student in database) */}
        {showAddMemberModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
          }}>
            <div className="card p-8" style={{ width: '100%', maxWidth: 520 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span className="badge badge-purple" style={{ marginBottom: 6 }}>Direct Squad Invitation</span>
                  <h3 style={{ margin: 0, fontSize: '1.35rem' }}>Add Teammate to Squad</h3>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                >
                  ✕
                </button>
              </div>

              <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.5 }}>
                Adding a student will link them to your squad constitution and dispatch an immediate <strong>in-app notification pop-up alert</strong> to their account.
              </p>

              <form onSubmit={handleAddMember}>
                {/* Option 1: Select from known students */}
                <div className="form-group mb-4">
                  <label className="form-label" style={{ fontSize: '0.88rem' }}>
                    Select Registered Student
                  </label>
                  <select
                    className="form-control"
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      if (e.target.value) setManualStudentEmail('');
                    }}
                    disabled={searchingStudents}
                  >
                    <option value="">-- Choose from available student innovators --</option>
                    {studentCandidates.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.university || s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  — OR ENTER STUDENT EMAIL DIRECTLY —
                </div>

                {/* Option 2: Enter Email */}
                <div className="form-group mb-5">
                  <label className="form-label" style={{ fontSize: '0.88rem' }}>
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="student@example.edu or student username"
                    value={manualStudentEmail}
                    onChange={(e) => {
                      setManualStudentEmail(e.target.value);
                      if (e.target.value) setSelectedStudentId('');
                    }}
                  />
                </div>

                {/* Designated Role */}
                <div className="form-group mb-6">
                  <label className="form-label" style={{ fontSize: '0.88rem' }}>
                    Designated Engineering Role
                  </label>
                  <select
                    className="form-control"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                  >
                    {SKILL_ROLES.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddMemberModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingMember || (!selectedStudentId && !manualStudentEmail.trim())}
                    className="btn btn-primary"
                  >
                    {addingMember ? 'Adding & Notifying...' : 'Add Teammate & Notify'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Join with Code */}
        {showCodeJoinModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
          }}>
            <div className="card p-8" style={{ width: '100%', maxWidth: 480 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Join Squad with Code</h3>
                  <p className="text-secondary" style={{ fontSize: '0.8rem', margin: 0 }}>Fast-track join using your leader's invite code</p>
                </div>
              </div>

              <form onSubmit={handleJoinByCode}>
                <div className="form-group mb-4">
                  <label className="form-label">Squad Invite Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. SQD-XXXX"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: 2, fontWeight: 700 }}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Ask your squad leader for their invite code (e.g. SQD-7K4M).
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="form-label">Your Designated Skill Role</label>
                  <select
                    className="form-control"
                    value={codeJoinRole}
                    onChange={(e) => setCodeJoinRole(e.target.value)}
                  >
                    {SKILL_ROLES.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowCodeJoinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={joiningByCode || !inputCode.trim()} className="btn btn-primary">
                    {joiningByCode ? 'Joining...' : 'Join Squad Instantly'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Request to Join Squad */}
        {showRequestJoinModal && targetRequestTeam && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20
          }}>
            <div className="card p-8" style={{ width: '100%', maxWidth: 520 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Request to Join Squad</h3>
                  <p className="text-secondary" style={{ fontSize: '0.8rem', margin: 0 }}>
                    Sending application to <strong>{targetRequestTeam.name}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleRequestJoin}>
                <div className="form-group mb-4">
                  <label className="form-label">Your Desired Engineering Role *</label>
                  <select
                    className="form-control"
                    value={requestRole}
                    onChange={(e) => setRequestRole(e.target.value)}
                  >
                    {SKILL_ROLES.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-6">
                  <label className="form-label">Note to Team Leader (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Briefly state your competencies, background, or why you'd like to work on this challenge..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowRequestJoinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={requestingJoin} className="btn btn-primary" style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}>
                    {requestingJoin ? 'Submitting...' : 'Send Join Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
