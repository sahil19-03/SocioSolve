import React, { useState, useEffect } from 'react';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, Clock, Building2,
  MapPin, Users, HelpCircle, Send, ArrowRight, Eye, RefreshCw,
  FileText, ExternalLink, X, AlertCircle, Sparkles, Filter, Check, ThumbsUp, ThumbsDown,
  GraduationCap, Lightbulb, Rocket, Award, HeartHandshake, Target, ChevronRight, Flag
} from 'lucide-react';

const COMMON_STATE_DEPTS = [
  'Drinking Water & Sanitation Department',
  'Department of Higher & Technical Education',
  'Department of Agriculture & Farmers Welfare',
  'Department of Rural Development & Panchayati Raj',
  'Department of Health & Family Welfare',
  'Urban Development & Municipal Administration',
  'Department of Energy & Renewable Resources',
  'Department of Environment, Forest & Climate Change',
  'Department of Information Technology & e-Governance',
  'Department of Social Welfare & Women Empowerment',
  'Public Works Department (PWD)',
  'Department of Science & Technology'
];

function getStateDepartments(stateName) {
  const state = (stateName || '').trim();
  if (state.toLowerCase() === 'jharkhand') {
    return [
      'Drinking Water & Sanitation Department',
      'Department of Higher & Technical Education',
      'Department of Agriculture & Animal Husbandry',
      'Department of Rural Development',
      'Department of Health, Medical Education & Family Welfare',
      'Urban Development & Housing Department',
      'Department of Energy & Renewable Energy',
      'Department of Forest, Environment & Climate Change',
      'Department of Information Technology & e-Governance',
      'Department of Women, Child Development & Social Security'
    ];
  }
  if (!state) return COMMON_STATE_DEPTS;
  return COMMON_STATE_DEPTS.map(d => `${d} (${state})`).concat(COMMON_STATE_DEPTS);
}

export default function NodalOfficerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const stateDepts = getStateDepartments(user?.state);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'verified', 'claims', 'proposals', 'pilots', 'impact', 'milestones', 'all'
  const [challenges, setChallenges] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [pendingProposals, setPendingProposals] = useState([]);
  const [stateMilestones, setStateMilestones] = useState([]);
  const [expandedMsTeam, setExpandedMsTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Review & Action Modal (Challenges)
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'verify', 'needs_info', 'reject', 'publish', 'confirm_claim', 'reject_claim'
  const [nodalNotes, setNodalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [responsibleDept, setResponsibleDept] = useState('');
  const [priorityScore, setPriorityScore] = useState(8);
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [domainExpertiseInput, setDomainExpertiseInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Proposal Review Modal (Tier 3)
  const [reviewProposal, setReviewProposal] = useState(null);
  const [proposalDecision, setProposalDecision] = useState('approved');
  const [proposalFeedback, setProposalFeedback] = useState('');
  const [proposalReviewing, setProposalReviewing] = useState(false);

  // Pilot Permits Modal
  const [pilotRequests, setPilotRequests] = useState([]);
  const [permitModal, setPermitModal] = useState(null);
  const [permitDecision, setPermitDecision] = useState('approved');
  const [permitSite, setPermitSite] = useState('');
  const [permitNotes, setPermitNotes] = useState('');
  const [permitSubmitting, setPermitSubmitting] = useState(false);

  // Handover & Impact Modal
  const [handoverModal, setHandoverModal] = useState(null);
  const [beneficiaryCount, setBeneficiaryCount] = useState(2400);
  const [baselineMetric, setBaselineMetric] = useState('Water availability: 2 hrs/day');
  const [targetMetric, setTargetMetric] = useState('Water availability: 8 hrs/day');
  const [actualMetric, setActualMetric] = useState('Water availability: 10 hrs/day');
  const [handoverStatus, setHandoverStatus] = useState('implemented');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverSubmitting, setHandoverSubmitting] = useState(false);

  const fetchAllData = async () => {
    try {
      const [queueRes, claimsRes, propRes, pilotRes, msRes] = await Promise.all([
        api.get('/challenges/verification-queue').catch(() => ({ success: true, data: [] })),
        api.get('/challenges/pending-assignments').catch(() => ({ success: true, data: [] })),
        api.get('/solutions/proposals-for-review').catch(() => ({ success: true, data: [] })),
        api.get('/solutions/pilot-requests').catch(() => ({ success: true, data: [] })),
        api.get('/milestones/university-teams').catch(() => ({ success: true, data: [] }))
      ]);

      if (queueRes.success && queueRes.data) setChallenges(queueRes.data);
      if (claimsRes.success && claimsRes.data) setPendingClaims(claimsRes.data);
      if (propRes.success && propRes.data) setPendingProposals(propRes.data);
      if (pilotRes.success && pilotRes.data) setPilotRequests(pilotRes.data);
      if (msRes.success && msRes.data) setStateMilestones(msRes.data);
    } catch (err) {
      console.error('Error fetching queues and proposals:', err);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGrantPilotPermit = async () => {
    if (!permitModal) return;
    setPermitSubmitting(true);
    try {
      const res = await api.patch(`/solutions/${permitModal.id}/grant-pilot-permit`, {
        decision: permitDecision,
        pilotSiteLocation: permitSite || permitModal.pilotSiteLocation,
        pilotPermitOfficerNotes: permitNotes
      });
      if (res.success) {
        toast.success(res.message || 'Pilot permit issued successfully!');
        setPermitModal(null);
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to issue permit');
    } finally {
      setPermitSubmitting(false);
    }
  };

  const handleMarkImplemented = async () => {
    if (!handoverModal) return;
    setHandoverSubmitting(true);
    try {
      const res = await api.patch(`/challenges/${handoverModal.id}/mark-implemented`, {
        beneficiaryCount: Number(beneficiaryCount),
        baselineMetric,
        targetMetric,
        actualMetric,
        handoverStatus,
        handoverNotes
      });
      if (res.success) {
        toast.success(res.message || 'Project marked as implemented!');
        setHandoverModal(null);
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete handover');
    } finally {
      setHandoverSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const openActionModal = (challenge, mode) => {
    setSelectedChallenge(challenge);
    setModalMode(mode);
    setNodalNotes('');
    setRejectionReason('');
    setResponsibleDept(challenge.responsibleDepartment || user?.organization || stateDepts[0]);
    setPriorityScore(challenge.priorityScore || 8);
    setReviewDeadline(challenge.reviewDeadline ? challenge.reviewDeadline.split('T')[0] : '');
    setDomainExpertiseInput(Array.isArray(challenge.domainExpertise) ? challenge.domainExpertise.join(', ') : '');
  };

  const closeModal = () => {
    setSelectedChallenge(null);
    setModalMode(null);
    setNodalNotes('');
    setRejectionReason('');
    setDomainExpertiseInput('');
  };

  const handleVerifyAction = async () => {
    if (!selectedChallenge) return;
    setActionLoading(true);

    try {
      if (modalMode === 'publish') {
        const domains = domainExpertiseInput
          ? domainExpertiseInput.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        const res = await api.patch(`/challenges/${selectedChallenge.id}/publish-with-ownership`, {
          responsibleDepartment: responsibleDept,
          priorityScore: Number(priorityScore),
          reviewDeadline: reviewDeadline || null,
          domainExpertise: domains,
          nodalNotes
        });
        if (res.success) {
          toast.success('Challenge prioritized and published for HEI innovation!');
          closeModal();
          fetchAllData();
        }
      } else if (modalMode === 'confirm_claim' || modalMode === 'reject_claim') {
        const action = modalMode === 'confirm_claim' ? 'confirm' : 'reject';
        const res = await api.patch(`/challenges/${selectedChallenge.id}/confirm-assignment`, {
          action,
          nodalNotes
        });
        if (res.success) {
          toast.success(action === 'confirm'
            ? 'University assignment confirmed! Challenge converted to active project.'
            : 'Claim rejected. Challenge re-opened for universities.');
          closeModal();
          fetchAllData();
        }
      } else {
        const res = await api.patch(`/challenges/${selectedChallenge.id}/verify`, {
          action: modalMode,
          nodalNotes,
          rejectionReason
        });
        if (res.success) {
          toast.success(`Challenge updated: ${modalMode.replace('_', ' ')}`);
          closeModal();
          fetchAllData();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProposalReviewSubmit = async () => {
    if (!reviewProposal) return;
    setProposalReviewing(true);
    try {
      const res = await api.patch(`/solutions/${reviewProposal.id}/proposal-review`, {
        decision: proposalDecision,
        feedback: proposalFeedback
      });
      toast.success(res.message || 'Tier 3 review recorded!');
      setReviewProposal(null);
      setProposalFeedback('');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setProposalReviewing(false);
    }
  };

  // Filter queues
  const pendingQueue = challenges.filter(c => ['submitted', 'pending', 'under_review'].includes(c.status));
  const needsInfoQueue = challenges.filter(c => c.status === 'needs_information');
  const verifiedQueue = challenges.filter(c => c.status === 'verified');
  const publishedQueue = challenges.filter(c => c.status === 'published');

  const displayedChallenges =
    activeTab === 'queue' ? [...pendingQueue, ...needsInfoQueue] :
    activeTab === 'verified' ? verifiedQueue :
    activeTab === 'claims' ? pendingClaims :
    challenges;

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>⚡ Critical Urgency</span>;
      case 'high':
        return <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.4)' }}>High Urgency</span>;
      case 'medium':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)' }}>Normal Urgency</span>;
      default:
        return <span className="badge badge-gray">{urgency || 'Standard'}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return <span className="badge badge-amber"><Clock size={12} style={{ marginRight: 4 }} /> Pending Vetting</span>;
      case 'needs_information':
        return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)' }}><HelpCircle size={12} style={{ marginRight: 4 }} /> Needs Clarification</span>;
      case 'verified':
        return <span className="badge badge-green"><CheckCircle2 size={12} style={{ marginRight: 4 }} /> Nodal Verified</span>;
      case 'published':
        return <span className="badge badge-cyan"><Sparkles size={12} style={{ marginRight: 4 }} /> Published for HEIs</span>;
      case 'assigned':
        return <span className="badge" style={{ background: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.4)' }}><Building2 size={12} style={{ marginRight: 4 }} /> HEI Claim Pending Approval</span>;
      case 'converted_to_project':
        return <span className="badge badge-purple"><Check size={12} style={{ marginRight: 4 }} /> Converted to Active Project</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1200 }}>

        {/* Nodal Officer Hero */}
        <div className="card p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
                  <ShieldCheck size={14} style={{ marginRight: 6 }} /> Government Nodal Governance
                </span>
                <span className="badge badge-cyan">
                  {user?.state || 'Jharkhand'} State Portal
                </span>
              </div>
              <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>
                Welcome, {user?.name || 'Government Nodal Officer'}
              </h1>
              <p className="text-secondary" style={{ maxWidth: 740, margin: 0 }}>
                {user?.organization || 'Department of Drinking Water & Sanitation, Govt. of Jharkhand'}.
                Verify community reports, set departmental priorities, approve university claims, and authorize field pilots.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {refreshing ? 'Updating...' : 'Sync Queues'}
            </button>
          </div>
        </div>

        {/* Real-time Metric Strips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>
          <div className="card p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Awaiting Verification</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
              {loading ? '—' : pendingQueue.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 4 }}>Screening Queue</div>
          </div>

          <div className="card p-6" style={{ borderLeft: '4px solid #10b981' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Verified by Dept</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
              {loading ? '—' : verifiedQueue.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 4 }}>Prioritize & Publish</div>
          </div>

          <div className="card p-6" style={{ borderLeft: '4px solid #818cf8' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>HEI Claims Pending</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8', marginTop: 4 }}>
              {loading ? '—' : pendingClaims.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 4 }}>University Matching</div>
          </div>

          <div className="card p-6" style={{ borderLeft: '4px solid #34d399' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pilot Sanctions</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
              {loading ? '—' : pendingProposals.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 4 }}>Ground Deployment</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', marginBottom: 24, paddingBottom: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('queue')}
            className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20 }}
          >
            Verification Queue ({pendingQueue.length + needsInfoQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`btn ${activeTab === 'verified' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20 }}
          >
            Prioritize & Publish ({verifiedQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`btn ${activeTab === 'claims' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20, borderColor: '#818cf8', color: activeTab === 'claims' ? '#fff' : '#818cf8' }}
          >
            University Claims ({pendingClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`btn ${activeTab === 'proposals' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20, borderColor: '#34d399', color: activeTab === 'proposals' ? '#fff' : '#34d399' }}
          >
            Proposal Sanctions ({pendingProposals.length})
          </button>
          <button
            onClick={() => setActiveTab('pilots')}
            className={`btn ${activeTab === 'pilots' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20, borderColor: '#f59e0b', color: activeTab === 'pilots' ? '#fff' : '#f59e0b' }}
          >
            Field Pilots ({pilotRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`btn ${activeTab === 'impact' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20, borderColor: '#10b981', color: activeTab === 'impact' ? '#fff' : '#10b981' }}
          >
            Handover & Impact
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20 }}
          >
            All Submissions ({challenges.length})
          </button>

        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p className="text-muted">Loading department vetting queue...</p>
          </div>
        ) : activeTab === 'proposals' ? (
          /* ─── PHASE 6 TIER 3 PILOT PROPOSALS VIEW ─── */
          pendingProposals.length === 0 ? (
            <div className="card p-12 text-center">
              <ShieldCheck size={48} style={{ color: '#34d399', margin: '0 auto 16px', opacity: 0.8 }} />
              <h3>No Proposals Awaiting Government Clearance</h3>
              <p className="text-secondary" style={{ maxWidth: 480, margin: '8px auto 0' }}>
                Proposals will appear here once they have successfully passed faculty review and university endorsement.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {pendingProposals.map((p) => (
                <div key={p.id} className="card p-6" style={{ borderLeft: '4px solid #34d399' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span className="badge badge-green">Government Review</span>
                        <span className="badge badge-purple">Prior Reviews Complete ✓</span>
                        <span className="badge badge-blue">Squad: {p.Team?.name}</span>
                      </div>
                      <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{p.title}</h3>
                      <p className="text-secondary" style={{ fontSize: '0.9rem', margin: '4px 0 0' }}>
                        Problem: <strong>{p.Challenge?.title}</strong> ({p.Challenge?.district}, {p.Challenge?.state})
                      </p>
                    </div>

                    <button
                      onClick={() => { setReviewProposal(p); setProposalDecision('approved'); setProposalFeedback(''); }}
                      className="btn btn-primary"
                      style={{ padding: '8px 20px', background: '#10b981', borderColor: '#10b981' }}
                    >
                      <ShieldCheck size={16} style={{ marginRight: 6 }} /> Grant Pilot Deployment Clearance
                    </button>
                  </div>

                  {/* Multi-stakeholder endorsements summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: '#818cf8' }}>Faculty Review:</strong>
                      <p style={{ margin: '4px 0 0' }}>{p.facultyFeedback || 'Academic & sensor design approved.'}</p>
                    </div>

                    <div>
                      <strong style={{ color: '#c084fc' }}>University Endorsement:</strong>
                      <p style={{ margin: '4px 0 0' }}>{p.universityFeedback || 'Lab resources & hardware safety confirmed.'}</p>
                    </div>

                    <div>
                      <strong style={{ color: '#34d399' }}>Pilot Deployment Scale:</strong>
                      <p style={{ margin: '4px 0 0' }}>Budget: <strong>{p.budgetEstimate}</strong> &bull; Timeline: <strong>{p.timelineWeeks} wks</strong></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'claims' ? (
          /* ─── PHASE 4 CLAIMS VIEW ─── */
          pendingClaims.length === 0 ? (
            <div className="card p-12 text-center">
              <Building2 size={48} style={{ color: '#818cf8', margin: '0 auto 16px', opacity: 0.8 }} />
              <h3>No University Claims Awaiting Approval</h3>
              <p className="text-secondary" style={{ maxWidth: 480, margin: '8px auto 0' }}>
                When universities and HEIs express interest in a published challenge, their claim dossiers appear here for government endorsement.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {pendingClaims.map((item) => {
                const institution = item.requestingInstitution || item.institutionInterest;
                return (
                  <div key={item.id} className="card p-6" style={{ borderLeft: '4px solid #818cf8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {item.submissionCode && (
                          <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {item.submissionCode}
                          </span>
                        )}
                        <span className="badge badge-purple">{item.category}</span>
                        {item.priorityScore && (
                          <span className="badge badge-amber">Priority P{11 - item.priorityScore} (Score {item.priorityScore}/10)</span>
                        )}
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Claimed {item.institutionInterestAt ? utils.timeAgo(item.institutionInterestAt) : 'Recently'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>{item.title}</h3>
                    <p className="text-secondary" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                      {item.description}
                    </p>

                    <div style={{
                      padding: 18,
                      borderRadius: 8,
                      background: 'rgba(129, 140, 248, 0.08)',
                      border: '1px solid rgba(129, 140, 248, 0.25)',
                      marginBottom: 16
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Building2 size={18} style={{ color: '#818cf8' }} />
                        <strong style={{ fontSize: '1.05rem', color: '#818cf8' }}>
                          Claimed by: {institution?.organization || institution?.name || 'Higher Education Institution'}
                        </strong>
                      </div>

                      {item.institutionInterestNote && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 6 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Institution Rationale / Lab Capabilities:</strong>
                          <p style={{ margin: '4px 0 0' }}>{item.institutionInterestNote}</p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                      <a
                        href={`/challenge/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                      >
                        <Eye size={14} style={{ marginRight: 6 }} /> Full Problem Dossier
                      </a>

                      <button
                        onClick={() => openActionModal(item, 'reject_claim')}
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.5)' }}
                      >
                        <ThumbsDown size={14} style={{ marginRight: 6 }} /> Reject / Reopen Challenge
                      </button>

                      <button
                        onClick={() => openActionModal(item, 'confirm_claim')}
                        className="btn btn-primary"
                        style={{ padding: '6px 18px', fontSize: '0.85rem', background: '#10b981', borderColor: '#10b981' }}
                      >
                        <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Confirm University Assignment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === 'pilots' ? (
          /* ─── PHASE 9: FIELD PILOT DEPLOYMENT CLEARANCES ─── */
          pilotRequests.length === 0 ? (
            <div className="card p-12 text-center">
              <Rocket size={48} style={{ color: '#f59e0b', margin: '0 auto 16px', opacity: 0.8 }} />
              <h3>No Pending Field Pilot Requests</h3>
              <p className="text-secondary" style={{ maxWidth: 480, margin: '8px auto 0' }}>
                Student teams will request official government field pilot permits once their prototypes have passed Expert Rubric Certification.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {pilotRequests.map((sol) => (
                <div key={sol.id} className="card p-6" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span className="badge badge-amber">Field Pilot Request</span>
                        <span className="badge badge-blue">Team: {sol.Team?.name}</span>
                        {sol.pilotPermitGranted ? (
                          <span className="badge badge-emerald">Permit Granted: {sol.pilotPermitNumber}</span>
                        ) : (
                          <span className="badge badge-rose">Permit Pending Sanction</span>
                        )}
                        {sol.pilotReadinessCertified && (
                          <span className="badge badge-cyan">Expert Certified ✓</span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{sol.title}</h3>
                      <p className="text-secondary" style={{ fontSize: '0.9rem', margin: '4px 0 0' }}>
                        Target Problem: <strong>{sol.Challenge?.title}</strong> ({sol.Challenge?.district}, {sol.Challenge?.state})
                      </p>
                    </div>

                    {!sol.pilotPermitGranted ? (
                      <button
                        onClick={() => {
                          setPermitModal(sol);
                          setPermitSite(sol.pilotSiteLocation || `${sol.Challenge?.district || 'District'} Block B Pilot Site`);
                          setPermitNotes('Official field pilot permission sanctioned under Department technical observation.');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '8px 20px', background: '#f59e0b', borderColor: '#f59e0b' }}
                      >
                        <FileText size={16} style={{ marginRight: 6 }} /> Issue Official Pilot Permit
                      </button>
                    ) : (
                      <span className="badge badge-emerald" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        ✓ Field Permit Active ({sol.pilotPermitNumber})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: '#fbbf24' }}>Designated Pilot Site:</strong>
                      <p style={{ margin: '4px 0 0' }}>📍 {sol.pilotSiteLocation || 'Local community field site'}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#38bdf8' }}>Deployment Scope:</strong>
                      <p style={{ margin: '4px 0 0' }}>{sol.pilotRequestDetails || 'Field sensor validation and beneficiary trial run.'}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#4ade80' }}>Rubric Score:</strong>
                      <p style={{ margin: '4px 0 0' }}>Composite: <strong>{sol.compositeScore || 85}/100</strong> (Readiness: {sol.deploymentReadinessScore || 80}/100)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'impact' ? (
          /* ─── PHASE 10: COMMUNITY IMPACT & IMPLEMENTATION HANDOVER ─── */
          challenges.filter(c => ['converted_to_project', 'in_development', 'archived', 'published'].includes(c.status)).length === 0 ? (
            <div className="card p-12 text-center">
              <Award size={48} style={{ color: '#10b981', margin: '0 auto 16px', opacity: 0.8 }} />
              <h3>No Active Projects Awaiting Final Handover</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {challenges
                .filter(c => ['converted_to_project', 'in_development', 'archived', 'published'].includes(c.status))
                .map((ch) => {
                  const isHandedOver = ch.handoverStatus === 'implemented' || ch.handoverStatus === 'extended';
                  return (
                    <div key={ch.id} className="card p-6" style={{ borderLeft: `4px solid ${isHandedOver ? '#10b981' : '#3b82f6'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span className="badge badge-purple">{ch.category}</span>
                            <span className="badge badge-blue">📍 {ch.district}, {ch.state}</span>
                            {isHandedOver ? (
                              <span className="badge badge-emerald">🎉 Implemented & Handed Over</span>
                            ) : (
                              <span className="badge badge-amber">Field Pilot Running</span>
                            )}
                            {ch.communityRating && (
                              <span className="badge badge-cyan">
                                ⭐ Community Rating: {ch.communityRating}/5 ({ch.communityRatingCount} reviews)
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{ch.title}</h3>
                          <p className="text-secondary" style={{ fontSize: '0.9rem', margin: '4px 0 0' }}>
                            Responsible Dept: <strong>{ch.responsibleDepartment || user?.organization || 'State Department'}</strong>
                          </p>
                        </div>

                        {!isHandedOver ? (
                          <button
                            onClick={() => {
                              setHandoverModal(ch);
                              setBeneficiaryCount(ch.beneficiaryCount || 2400);
                              setBaselineMetric(ch.baselineMetric || 'Water availability: 2 hrs/day');
                              setTargetMetric(ch.targetMetric || 'Water availability: 8 hrs/day');
                              setActualMetric(ch.actualMetric || 'Water availability: 10 hrs/day');
                              setHandoverStatus('implemented');
                              setHandoverNotes('Successful field pilot handover to Gram Panchayat and District DWSD.');
                            }}
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', background: '#10b981', borderColor: '#10b981' }}
                          >
                            <Award size={16} style={{ marginRight: 6 }} /> Certify & Mark Implemented
                          </button>
                        ) : (
                          <span className="badge badge-emerald" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            ✓ Handover Complete ({ch.beneficiaryCount?.toLocaleString() || 2400} Beneficiaries)
                          </span>
                        )}
                      </div>

                      {/* Beneficiary & Metrics summary */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.85rem' }}>
                        <div>
                          <strong style={{ color: '#10b981' }}>Verified Beneficiaries:</strong>
                          <p style={{ margin: '4px 0 0' }}>👥 {ch.beneficiaryCount ? `${ch.beneficiaryCount.toLocaleString()} citizens served` : '2,400 target citizens'}</p>
                        </div>
                        <div>
                          <strong style={{ color: '#38bdf8' }}>Baseline vs Actual Metric:</strong>
                          <p style={{ margin: '4px 0 0' }}>{ch.baselineMetric || '2 hrs/day'} ➔ <strong>{ch.actualMetric || '10 hrs/day'}</strong></p>
                        </div>
                        <div>
                          <strong style={{ color: '#c084fc' }}>Handover Status:</strong>
                          <p style={{ margin: '4px 0 0' }}>{ch.handoverNotes || 'Handover inspection confirmed by district executive engineer.'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        ) : displayedChallenges.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px', opacity: 0.8 }} />
            <h3>No submissions in this view</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {displayedChallenges.map((item) => (
              <div
                key={item.id}
                className="card p-6"
                style={{
                  transition: 'all 0.2s ease',
                  border: item.urgency === 'critical' ? '1px solid rgba(239, 68, 68, 0.4)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {item.submissionCode && (
                      <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {item.submissionCode}
                      </span>
                    )}
                    {getStatusBadge(item.status)}
                    {getUrgencyBadge(item.urgency)}
                    <span className="badge badge-purple">{item.category}</span>
                  </div>

                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    Submitted {utils.formatDate(item.createdAt)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>{item.title}</h3>
                <p className="text-secondary" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                  {item.description}
                </p>

                {/* Submitter & Ground Context Metadata */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  padding: 16,
                  background: 'var(--bg-secondary)',
                  borderRadius: 8,
                  marginBottom: 16
                }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Submitter / Organization</span>
                    <div style={{ fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} style={{ color: '#38bdf8' }} />
                      {item.submitter?.name || 'Citizen'} ({item.submitterOrg || item.submitter?.organization || 'Individual'})
                    </div>
                  </div>

                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Ground Location</span>
                    <div style={{ fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} style={{ color: '#10b981' }} />
                      {item.district || 'District'}, {item.state || 'State'}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Affected Population</span>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>
                      {item.affectedPopulation || item.impactArea || 'Community level'}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Responsible Department</span>
                    <div style={{ fontWeight: 600, marginTop: 2, fontSize: '0.85rem' }}>
                      {item.responsibleDepartment || 'Pending Assignment'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons based on status */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <a
                    href={`/challenge/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Eye size={14} /> Full Dossier
                  </a>

                  {['submitted', 'pending', 'under_review', 'needs_information'].includes(item.status) && (
                    <>
                      <button
                        onClick={() => openActionModal(item, 'needs_information')}
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.85rem', color: '#c084fc', borderColor: 'rgba(168,85,247,0.5)' }}
                      >
                        <HelpCircle size={14} style={{ marginRight: 4 }} /> Request Clarification
                      </button>

                      <button
                        onClick={() => openActionModal(item, 'reject')}
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.5)' }}
                      >
                        <AlertTriangle size={14} style={{ marginRight: 4 }} /> Reject / Duplicate
                      </button>

                      <button
                        onClick={() => openActionModal(item, 'verify')}
                        className="btn btn-primary"
                        style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#10b981', borderColor: '#10b981' }}
                      >
                        <CheckCircle2 size={14} style={{ marginRight: 4 }} /> Verify Genuine Problem
                      </button>
                    </>
                  )}

                  {item.status === 'verified' && (
                    <button
                      onClick={() => openActionModal(item, 'publish')}
                      className="btn btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#06b6d4', borderColor: '#06b6d4' }}
                    >
                      <Sparkles size={14} style={{ marginRight: 4 }} /> Assign Dept & Publish to HEIs
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Tier 3 Proposal Review */}
        {reviewProposal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div className="card p-8" style={{ maxWidth: 660, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
              <button
                onClick={() => setReviewProposal(null)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-green">Government Sanction</span>
                <span className="badge badge-cyan">Ground Pilot Clearance</span>
              </div>

              <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>{reviewProposal.title}</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
                Squad: <strong>{reviewProposal.Team?.name}</strong> for {reviewProposal.Challenge?.title}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)', fontSize: '0.88rem' }}>
                  <strong>Root Cause Analysis:</strong>
                  <p style={{ margin: '4px 0 0' }}>{reviewProposal.rootCauseAnalysis}</p>
                </div>

                <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)', fontSize: '0.88rem' }}>
                  <strong>Technical Architecture & Sensor Protocols:</strong>
                  <p style={{ margin: '4px 0 0' }}>{reviewProposal.technicalArchitecture}</p>
                </div>

                <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)', fontSize: '0.88rem' }}>
                  <strong>Target Beneficiary Metrics:</strong>
                  <p style={{ margin: '4px 0 0' }}>{reviewProposal.impactMetrics}</p>
                </div>

                <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)', fontSize: '0.88rem' }}>
                  <strong>Prior Endorsements:</strong>
                  <div style={{ marginTop: 4 }}>🎓 Faculty: {reviewProposal.facultyFeedback || 'Academic Feasibility Verified'}</div>
                  <div style={{ marginTop: 2 }}>🏛️ University: {reviewProposal.universityFeedback || 'Lab Facilities Allocated'}</div>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Government Decision</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="propDecision"
                      value="approved"
                      checked={proposalDecision === 'approved'}
                      onChange={() => setProposalDecision('approved')}
                    />
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Grant Field Pilot Prototyping Sanction</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="propDecision"
                      value="revision_required"
                      checked={proposalDecision === 'revision_required'}
                      onChange={() => setProposalDecision('revision_required')}
                    />
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Request Ground Adjustments</span>
                  </label>
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Official Departmental Directives</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="State district administrative directives, panchayat liaison contacts, or safety constraints..."
                  value={proposalFeedback}
                  onChange={(e) => setProposalFeedback(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setReviewProposal(null)} className="btn btn-outline" disabled={proposalReviewing}>
                  Cancel
                </button>
                <button
                  disabled={proposalReviewing}
                  onClick={handleProposalReviewSubmit}
                  className="btn btn-primary"
                  style={{
                    background: proposalDecision === 'approved' ? '#10b981' : '#f59e0b',
                    borderColor: proposalDecision === 'approved' ? '#10b981' : '#f59e0b'
                  }}
                >
                  {proposalReviewing ? 'Saving…' : 'Issue Government Sanction ✓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Challenge Verification Actions */}
        {selectedChallenge && modalMode && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div className="card p-8" style={{ maxWidth: 620, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
              <button
                onClick={closeModal}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.35rem', marginBottom: 12 }}>
                {modalMode === 'verify' && '✅ Verify Genuine Public Challenge'}
                {modalMode === 'needs_information' && '❓ Request Clarification from Submitter'}
                {modalMode === 'reject' && '❌ Reject or Mark Duplicate'}
                {modalMode === 'publish' && '🏛️ Assign Department & Publish to Universities'}
                {modalMode === 'confirm_claim' && '🎓 Confirm Institutional HEI Assignment'}
                {modalMode === 'reject_claim' && '❌ Reject University Claim & Reopen'}
              </h2>

              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
                Challenge: <strong>{selectedChallenge.title}</strong>
              </p>

              {modalMode === 'publish' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label">
                      Responsible Government Department {user?.state ? `(${user.state})` : ''}
                    </label>
                    <input
                      type="text"
                      list="deptList"
                      className="form-control"
                      value={responsibleDept}
                      onChange={(e) => setResponsibleDept(e.target.value)}
                      placeholder="Select from state departments or type..."
                      required
                    />
                    <datalist id="deptList">
                      {stateDepts.map((dept, i) => (
                        <option key={i} value={dept} />
                      ))}
                    </datalist>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="form-label">Priority Score (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-control"
                        value={priorityScore}
                        onChange={(e) => setPriorityScore(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="form-label">Solution Target Deadline</label>
                      <input
                        type="date"
                        className="form-control"
                        value={reviewDeadline}
                        onChange={(e) => setReviewDeadline(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Domain Expertise Keywords</label>
                    <input
                      type="text"
                      className="form-control"
                      value={domainExpertiseInput}
                      onChange={(e) => setDomainExpertiseInput(e.target.value)}
                      placeholder="e.g. Water Chemistry, IoT, Civil Engineering"
                    />
                  </div>

                  <div>
                    <label className="form-label">Official Directives</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={nodalNotes}
                      onChange={(e) => setNodalNotes(e.target.value)}
                      placeholder="State explicit field requirements..."
                    />
                  </div>
                </div>
              ) : modalMode === 'confirm_claim' || modalMode === 'reject_claim' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label">
                      {modalMode === 'confirm_claim' ? 'Official Government Assignment Directive' : 'Reason for Rejection / Reopen'}
                    </label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={nodalNotes}
                      onChange={(e) => setNodalNotes(e.target.value)}
                      placeholder="Directive remarks..."
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {modalMode === 'reject' && (
                    <div>
                      <label className="form-label">Rejection Reason</label>
                      <textarea
                        rows={2}
                        className="form-control"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="form-label">
                      {modalMode === 'needs_information' ? 'Clarification Questions for Citizen' : 'Nodal Officer Verification Remarks'}
                    </label>
                    <textarea
                      rows={4}
                      className="form-control"
                      value={nodalNotes}
                      onChange={(e) => setNodalNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button onClick={closeModal} className="btn btn-outline" disabled={actionLoading}>
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAction}
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Confirm Decision'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal - Issue Field Pilot Permit */}
        {permitModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div className="card p-8" style={{ maxWidth: 600, width: '100%', position: 'relative' }}>
              <button
                onClick={() => setPermitModal(null)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-amber">Government Pilot Clearance</span>
                <span className="badge badge-emerald">Field Permit Authorization</span>
              </div>

              <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Issue Official Pilot Deployment Permit</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
                Squad: <strong>{permitModal.Team?.name}</strong> &bull; Prototype: <strong>{permitModal.title}</strong>
              </p>

              <div className="form-group mb-4">
                <label className="form-label">Permit Decision</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="pilotDecision"
                      value="approved"
                      checked={permitDecision === 'approved'}
                      onChange={() => setPermitDecision('approved')}
                    />
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Grant Field Pilot Permit</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="pilotDecision"
                      value="rejected"
                      checked={permitDecision === 'rejected'}
                      onChange={() => setPermitDecision('rejected')}
                    />
                    <span style={{ color: '#f87171', fontWeight: 600 }}>Decline Permit</span>
                  </label>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Designated Deployment Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={permitSite}
                  onChange={(e) => setPermitSite(e.target.value)}
                  placeholder="e.g. Gumla Block B, Ward 4 Panchayat"
                  required
                />
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Department Safety & Compliance Directives</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={permitNotes}
                  onChange={(e) => setPermitNotes(e.target.value)}
                  placeholder="State safety constraints, local contact officer, or inspection timelines..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setPermitModal(null)} className="btn btn-outline" disabled={permitSubmitting}>
                  Cancel
                </button>
                <button
                  onClick={handleGrantPilotPermit}
                  disabled={permitSubmitting}
                  className="btn btn-primary"
                  style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                >
                  {permitSubmitting ? 'Issuing Permit...' : 'Confirm & Issue Field Permit 📜'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal - Officially Mark Implemented & Handover */}
        {handoverModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div className="card p-8" style={{ maxWidth: 620, width: '100%', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
              <button
                onClick={() => setHandoverModal(null)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-emerald">Impact Certification</span>
                <span className="badge badge-purple">Official Department Handover</span>
              </div>

              <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Final Handover & Impact Certification</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
                Certifying Project: <strong>{handoverModal.title}</strong> ({handoverModal.district}, {handoverModal.state})
              </p>

              <div className="form-group mb-4">
                <label className="form-label">Verified Number of Direct Beneficiaries</label>
                <input
                  type="number"
                  className="form-control"
                  value={beneficiaryCount}
                  onChange={(e) => setBeneficiaryCount(e.target.value)}
                  placeholder="e.g. 2400"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="mb-4">
                <div>
                  <label className="form-label">Baseline Metric (Before)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={baselineMetric}
                    onChange={(e) => setBaselineMetric(e.target.value)}
                    placeholder="e.g. Water: 2 hrs/day"
                  />
                </div>
                <div>
                  <label className="form-label">Actual Ground Result (Achieved)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={actualMetric}
                    onChange={(e) => setActualMetric(e.target.value)}
                    placeholder="e.g. Water: 10 hrs/day"
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Official Handover Status</label>
                <select
                  className="form-control"
                  value={handoverStatus}
                  onChange={(e) => setHandoverStatus(e.target.value)}
                >
                  <option value="implemented">Implemented (Successfully Handed Over to Dept / Panchayat)</option>
                  <option value="extended">Extended (Scaled up to adjacent blocks / districts)</option>
                  <option value="closed">Closed / Fully Completed</option>
                </select>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Executive Engineer / Nodal Handover Notes</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Official record of operational handover, maintenance agreement, and community sign-off..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setHandoverModal(null)} className="btn btn-outline" disabled={handoverSubmitting}>
                  Cancel
                </button>
                <button
                  onClick={handleMarkImplemented}
                  disabled={handoverSubmitting}
                  className="btn btn-primary"
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  {handoverSubmitting ? 'Certifying...' : 'Officially Stamp as Implemented 🎉'}
                </button>
              </div>
            </div>
          </div>
        )}



      </div>
    </div>
  );
}
