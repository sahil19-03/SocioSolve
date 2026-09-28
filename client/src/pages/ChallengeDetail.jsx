import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, Lightbulb, MapPin, Calendar, Clock, Share2, 
  ExternalLink, ThumbsUp, MessageSquare, ShieldCheck, CheckCircle2, ArrowLeft
} from 'lucide-react';

const PROGRESS_LABELS = {
  pending: 'Awaiting review', submitted: 'Submitted for review',
  under_review: 'Under review', needs_information: 'More information requested',
  verified: 'Verified', published: 'Open for university teams',
  assigned: 'University team assigned', converted_to_project: 'In development',
  solved: 'Implemented', archived: 'Archived', rejected: 'Not approved', duplicate: 'Marked as duplicate',
};

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, getDashboardPath } = useAuth();
  const toast = useToast();
  const isStudent = user?.role === 'student';
  const canTakeAction = isStudent || ['faculty', 'expert'].includes(user?.role);
  const canViewTeamDossier = ['student', 'faculty', 'university_admin', 'admin'].includes(user?.role);

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Sub-data
  const [solutions, setSolutions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const res = await api.get(`/challenges/${id}`);
        if (res.success && res.data) {
          setChallenge(res.data);
        }
      } catch (err) {
        toast.error('Could not load challenge details: ' + err.message);
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [id]);

  // Lazy tab loader
  useEffect(() => {
    if (activeTab === 'solutions') loadSolutions();
    if (activeTab === 'teams') loadTeams();
    if (activeTab === 'comments') loadComments();
  }, [activeTab, id]);

  const loadSolutions = async () => {
    try {
      const res = await api.get(`/solutions/challenge/${id}`);
      if (res.success) setSolutions(res.data || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const loadTeams = async () => {
    try {
      const res = await api.get(`/challenges/${id}/teams`);
      if (res.success) setTeams(res.data || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const loadComments = async () => {
    try {
      const res = await api.get(`/challenges/${id}/comments`);
      if (res.success) setComments(res.data || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleVote = async (solutionId) => {
    if (!isLoggedIn) {
      toast.info('Please log in to vote on this solution');
      navigate(`/login?redirect=/challenge/${id}`);
      return;
    }

    try {
      const res = await api.post(`/solutions/${solutionId}/vote`);
      toast.success(res.message || 'Vote recorded!');
      loadSolutions();
    } catch (err) {
      toast.error(err.message || 'Could not register vote');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info('Please log in to post a comment');
      navigate(`/login?redirect=/challenge/${id}`);
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/challenges/${id}/comments`, { content: commentText.trim() });
      toast.success('Comment posted!');
      setCommentText('');
      loadComments();
    } catch (err) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleVolunteer = async (roleType) => {
    try {
      await api.post(`/challenges/${id}/volunteer`, { roleType });
      toast.success(`Thank you! You have volunteered as a ${roleType} mentor for this challenge.`);
    } catch (err) {
      toast.error(err.message || 'Failed to volunteer');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="skeleton" style={{ height: 32, width: '30%', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 48, width: '70%', marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200, width: '100%' }} />
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div>
      {/* ─── Header Hero ─── */}
      <section style={{ 
        padding: '50px 0 40px', 
        background: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 65%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <Link
            to={isLoggedIn ? getDashboardPath() : '/'}
            className="btn btn-ghost btn-sm challenge-detail-back"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>

          {/* Metadata badges strip */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="badge badge-blue">{utils.categoryLabel(challenge.category)}</span>
            <span className={`badge ${utils.difficultyBadge(challenge.difficulty)}`}>
              {challenge.difficulty.toUpperCase()}
            </span>
            <span className="badge badge-emerald">{PROGRESS_LABELS[challenge.status] || 'Progress updated'}</span>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> Posted {utils.timeAgo(challenge.createdAt)}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: 16, lineHeight: 1.25 }}>
            {challenge.title}
          </h1>

          <p className="text-secondary" style={{ fontSize: '1.05rem', maxWidth: 840, lineHeight: 1.6, marginBottom: 24 }}>
            {challenge.shortDescription || (challenge.description ? challenge.description.slice(0, 180) + '...' : '')}
          </p>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {challenge.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="var(--color-primary-400)" />
                {challenge.location}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} color="#67e8f9" />
              {challenge.teamCount || 0} Teams Working
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={16} color="#fbbf24" />
              {challenge.solutionCount || 0} Solutions Submitted
            </span>
            <button onClick={handleShare} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
              <Share2 size={15} /> Share Challenge
            </button>
          </div>
        </div>
      </section>

      {/* ─── Main Content Grid ─── */}
      <main className="container challenge-detail-container" style={{ padding: '40px 0 80px' }}>
        <div className="challenge-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 340px)', gap: 28, alignItems: 'start' }}>
          {/* Left Column: Tabs */}
          <div>
            {/* Tab Buttons */}
            <div className="challenge-detail-tabs" style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 28, overflowX: 'auto' }}>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`btn btn-ghost ${activeTab === 'overview' ? 'text-primary' : ''}`}
                style={{ 
                  borderRadius: 0, 
                  borderBottom: activeTab === 'overview' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                  padding: '12px 16px',
                  fontWeight: 600
                }}
              >
                📋 Overview & Scope
              </button>
              <button 
                onClick={() => setActiveTab('solutions')}
                className={`btn btn-ghost ${activeTab === 'solutions' ? 'text-primary' : ''}`}
                style={{ 
                  borderRadius: 0, 
                  borderBottom: activeTab === 'solutions' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                  padding: '12px 16px',
                  fontWeight: 600
                }}
              >
                💡 Solutions ({challenge.solutionCount || 0})
              </button>
              <button 
                onClick={() => setActiveTab('teams')}
                className={`btn btn-ghost ${activeTab === 'teams' ? 'text-primary' : ''}`}
                style={{ 
                  borderRadius: 0, 
                  borderBottom: activeTab === 'teams' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                  padding: '12px 16px',
                  fontWeight: 600
                }}
              >
                👥 Teams ({challenge.teamCount || 0})
              </button>
              <button 
                onClick={() => setActiveTab('comments')}
                className={`btn btn-ghost ${activeTab === 'comments' ? 'text-primary' : ''}`}
                style={{ 
                  borderRadius: 0, 
                  borderBottom: activeTab === 'comments' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                  padding: '12px 16px',
                  fontWeight: 600
                }}
              >
                💬 Discussion
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="card p-8">
                <h3 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Problem Statement</h3>
                <p className="text-secondary" style={{ lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: 32 }}>
                  {challenge.description}
                </p>

                <h4 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Expected Outcomes & Key Metrics</h4>
                <p className="text-secondary" style={{ lineHeight: 1.6, marginBottom: 32 }}>
                  {challenge.expectedOutcomes || 'Functional hardware/software prototype, verifiable performance metrics, open-source code repository, and field pilot demonstration.'}
                </p>

                <h4 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Target Beneficiaries & Impact Area</h4>
                <p className="text-secondary" style={{ lineHeight: 1.6, marginBottom: 32 }}>
                  {challenge.impactArea || 'Communities, municipal systems, and local domain stakeholders.'}
                </p>

                <h4 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Recommended Technical Domains & Skills</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {challenge.requiredSkills && challenge.requiredSkills.length > 0 ? (
                    challenge.requiredSkills.map((s, i) => (
                      <span key={i} className="skill-chip" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
                        ⚡ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">Interdisciplinary engineering and computer science</span>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SOLUTIONS */}
            {activeTab === 'solutions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.3rem' }}>Proposed Solutions</h3>
                  {isStudent && (
                    <Link to={`/submit-solution?challengeId=${challenge.id}`} className="btn btn-primary btn-sm">
                      🚀 Submit Solution
                    </Link>
                  )}
                </div>

                {solutions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {solutions.map((sol) => (
                      <div key={sol.id} className="card p-6">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                          <div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                              <span className="badge badge-purple">
                                Team: {sol.Team?.name || 'Independent Team'}
                              </span>
                              <span className={`badge ${sol.status === 'selected' ? 'badge-emerald' : 'badge-blue'}`}>
                                {sol.status.toUpperCase()}
                              </span>
                              {sol.feasibilityScore && (
                                <span className="badge badge-amber">
                                  ⭐ Feasibility: {sol.feasibilityScore}/10
                                </span>
                              )}
                            </div>

                            <h4 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                              {sol.title}
                            </h4>

                            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
                              {sol.description}
                            </p>

                            {/* Tech stack chips */}
                            {sol.techStack && sol.techStack.length > 0 && (
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                                {sol.techStack.map((tech, i) => (
                                  <span key={i} className="skill-chip" style={{ fontSize: 11 }}>
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Links */}
                            <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                              {sol.githubUrl && (
                                <a href={sol.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  📦 GitHub Repository <ExternalLink size={13} />
                                </a>
                              )}
                              {sol.demoUrl && (
                                <a href={sol.demoUrl} target="_blank" rel="noreferrer" className="text-cyan hover:underline" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  🌐 Live Demo <ExternalLink size={13} />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Upvote Button */}
                          <button
                            onClick={() => handleVote(sol.id)}
                            className="card p-4 text-center"
                            style={{ 
                              cursor: 'pointer', 
                              minWidth: 80, 
                              background: 'rgba(255,255,255,0.03)',
                              borderColor: 'var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <ThumbsUp size={20} color="var(--color-primary-400)" />
                            <strong style={{ fontSize: '1.1rem' }}>{sol.voteCount || 0}</strong>
                            <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Votes</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center">
                    <Lightbulb size={40} color="#60a5fa" style={{ margin: '0 auto 12px' }} />
                    <h4>No Solutions Yet</h4>
                    <p className="text-secondary" style={{ marginBottom: isStudent ? 20 : 0 }}>
                      {isStudent ? 'Be the first student team to build and submit a prototype for this challenge.' : 'Student teams have not submitted a solution yet.'}
                    </p>
                    {isStudent && (
                      <Link to={`/submit-solution?challengeId=${challenge.id}`} className="btn btn-primary btn-sm">
                        Submit Your Solution
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TEAMS */}
            {activeTab === 'teams' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.3rem' }}>Active Teams</h3>
                  {isStudent && (
                    <Link to={`/team-formation?challengeId=${challenge.id}`} className="btn btn-secondary btn-sm">
                      👥 Form / Join Team
                    </Link>
                  )}
                </div>

                {teams.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {teams.map((t) => (
                      <div key={t.id} className="card p-5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{t.name}</h4>
                          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                            {t.description || 'Student innovation team working on this challenge.'}
                          </p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span className="badge badge-blue">Members: {t.memberCount || 1}</span>
                            {t.hasMentor ? (
                              <span className="badge badge-emerald">Mentor Assigned</span>
                            ) : (
                              <span className="badge badge-amber">Seeking Mentor</span>
                            )}
                          </div>
                        </div>
                        {canViewTeamDossier && (
                          <Link to={`/team-formation?teamId=${t.id}`} className="btn btn-outline btn-sm">
                            View Team
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center">
                    <Users size={40} color="#60a5fa" style={{ margin: '0 auto 12px' }} />
                    <h4>No Teams Formed Yet</h4>
                    <p className="text-secondary" style={{ marginBottom: isStudent ? 20 : 0 }}>
                      {isStudent ? 'Start a team and recruit teammates with the required skillsets.' : 'Students have not formed a team for this challenge yet.'}
                    </p>
                    {isStudent && (
                      <Link to={`/team-formation?challengeId=${challenge.id}`} className="btn btn-secondary btn-sm">
                        Form a Team
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMMENTS / DISCUSSION */}
            {activeTab === 'comments' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Community Discussion</h3>

                {/* Comment Input */}
                <form onSubmit={handlePostComment} className="card p-5" style={{ marginBottom: 24 }}>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    placeholder="Ask questions about scope, share field data, or offer insights..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={submittingComment} className="btn btn-primary btn-sm">
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>

                {/* Comment List */}
                {comments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {comments.map((c) => (
                      <div key={c.id} className="card p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {utils.initials(c.User?.name)}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{c.User?.name || 'Community Member'}</strong>
                            <span className="badge badge-blue" style={{ fontSize: 9, marginLeft: 6 }}>
                              {c.User?.role}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: 8 }}>
                              {utils.timeAgo(c.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
                          {c.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center" style={{ padding: '24px 0' }}>
                    No comments yet. Start the conversation!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Actions Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Primary Action Card */}
            {canTakeAction && <div className="card p-6">
              <h4 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Take Action</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {isStudent && <>
                  <Link to={`/team-formation?challengeId=${challenge.id}`} className="btn btn-primary w-full">
                    <Users size={16} /> Form / Join Team
                  </Link>

                  <Link to={`/submit-solution?challengeId=${challenge.id}`} className="btn btn-secondary w-full">
                    <Lightbulb size={16} /> Submit Solution
                  </Link>
                </>}

                {user?.role === 'faculty' && (
                  <button onClick={() => handleVolunteer('faculty')} className="btn btn-outline w-full">
                    🎓 Offer Faculty Mentorship
                  </button>
                )}

                {user?.role === 'expert' && (
                  <button onClick={() => handleVolunteer('expert')} className="btn btn-outline w-full">
                    ⭐ Offer Expert Review
                  </button>
                )}
              </div>
            </div>}

            {/* Submitter Profile Card */}
            <div className="card p-6">
              <h4 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--text-muted)' }}>Problem Submitter</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 42, height: 42 }}>
                  {utils.initials(challenge.submitter?.name || challenge.submitterOrg || 'Gov')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {challenge.submitter?.name || challenge.submitterOrg || 'Verified Stakeholder'}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {challenge.submitterOrgType || challenge.submitter?.organization || 'Civic Organization'}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Summary Card */}
            <div className="card p-6">
              <h4 style={{ fontSize: '1rem', marginBottom: 16 }}>Challenge Details</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Category:</span>
                  <strong>{utils.categoryLabel(challenge.category)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Complexity:</span>
                  <span className="text-capitalize">{challenge.difficulty}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Submission Deadline:</span>
                  <span>{challenge.deadline ? utils.formatDate(challenge.deadline) : 'Rolling Submissions'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Total Views:</span>
                  <span>{challenge.viewCount || 0}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
