const express = require('express');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const { Solution, Team, Challenge, User, Vote } = require('../models');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'backend/uploads/'),
  filename: (req, file, cb) => cb(null, `solution_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper to parse arrays
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return field.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// ─── Phase 6: GET /api/solutions/proposals-for-review ─── Queue by Role (Tier 1/2/3) ──
router.get('/proposals-for-review', protect, authorize('faculty', 'university_admin', 'nodal_officer', 'admin'), async (req, res) => {
  try {
    const where = {};

    // ── Team association include (default: no filter on team) ──
    let teamInclude = {
      model: Team,
      required: false,
      include: [
        { model: User, as: 'leader',       attributes: ['id', 'name', 'avatar', 'university', 'email'] },
        { model: User, as: 'members',      attributes: ['id', 'name', 'avatar', 'university', 'skills'], through: { attributes: ['role'] } },
        { model: User, as: 'facultyMentor',attributes: ['id', 'name', 'organization'] }
      ]
    };

    if (req.user.role === 'faculty') {
      // Tier 1: Faculty only sees proposals from teams they personally mentor
      where.currentReviewTier = 1;
      where.facultyApproval   = 'pending';
      teamInclude = {
        ...teamInclude,
        required: true,   // INNER JOIN — exclude solutions with no matching team
        where: { facultyMentorId: req.user.id }
      };
    } else if (req.user.role === 'university_admin') {
      // Tier 2: University Coordinator sees proposals from their institution
      where.currentReviewTier  = 2;
      where.universityApproval = 'pending';
    } else if (req.user.role === 'nodal_officer') {
      // Tier 3: Govt Nodal Officer sees all Tier 3 pending proposals
      where.currentReviewTier = 3;
      where.govtApproval      = 'pending';
    }
    // Admin sees all proposals in any review state (no extra filter)

    const proposals = await Solution.findAll({
      where,
      include: [
        teamInclude,
        {
          model: Challenge,
          attributes: ['id', 'title', 'category', 'status', 'submissionCode', 'district', 'state', 'responsibleDepartment', 'priorityScore']
        },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'avatar', 'organization'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, count: proposals.length, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 6: GET /api/solutions/my-proposals ─── Student/Team Leader Proposals ──
router.get('/my-proposals', protect, async (req, res) => {
  try {
    const proposals = await Solution.findAll({
      where: { submittedById: req.user.id },
      include: [
        {
          model: Team,
          include: [
            { model: User, as: 'leader', attributes: ['id', 'name'] },
            { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization'] }
          ]
        },
        {
          model: Challenge,
          attributes: ['id', 'title', 'category', 'submissionCode', 'responsibleDepartment']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 6: POST /api/solutions/proposal ─── Student submits formal 5-part proposal ──
router.post('/proposal', protect, authorize('student', 'admin'), upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      title, description, challengeId, teamId,
      rootCauseAnalysis, technicalArchitecture, impactMetrics,
      budgetEstimate, timelineWeeks, riskMitigation,
      techStack, githubUrl, demoUrl, videoUrl
    } = req.body;

    if (!challengeId) {
      return res.status(400).json({ success: false, message: 'Challenge ID is required.' });
    }

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Target challenge not found.' });
    }

    // Resolve or verify team
    let resolvedTeamId = teamId;
    if (!resolvedTeamId) {
      let team = await Team.findOne({ where: { challengeId, leaderId: req.user.id } });
      if (!team) {
        team = await Team.create({
          name: `Team ${req.user.name}`,
          description: `Formed for ${challenge.title}`,
          challengeId,
          leaderId: req.user.id,
          universityId: challenge.assignedUniversityId || null,
          status: 'team_formed',
          isApprovedByCoordinator: true
        });
      }
      resolvedTeamId = team.id;
    }

    const attachments = req.files ? req.files.map(f => f.filename) : [];

    const solution = await Solution.create({
      title: title || `Engineering Solution: ${challenge.title}`,
      description: description || technicalArchitecture || 'Proposed engineering and community solution.',
      rootCauseAnalysis,
      technicalArchitecture,
      impactMetrics,
      budgetEstimate: budgetEstimate || '₹50,000 - ₹1,50,000',
      timelineWeeks: timelineWeeks ? parseInt(timelineWeeks) : 8,
      riskMitigation,
      techStack: parseArrayField(techStack),
      githubUrl,
      demoUrl,
      videoUrl,
      attachments,
      teamId: resolvedTeamId,
      challengeId,
      submittedById: req.user.id,
      // Phase 6 Sequential Review Defaults: Starts at Tier 1 (Faculty)
      status: 'under_review',
      proposalStatus: 'proposal_submitted',
      currentReviewTier: 1,
      facultyApproval: 'pending',
      universityApproval: 'pending',
      govtApproval: 'pending'
    });

    // Update challenge solution counter & team status
    await challenge.increment('solutionCount');
    await Team.update({ status: 'submitted' }, { where: { id: resolvedTeamId } });

    res.status(201).json({
      success: true,
      message: 'Solution Proposal submitted successfully! Enrouted to Tier 1: Faculty Academic Mentor Review.',
      data: solution
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/solutions/challenge/:challengeId ─── Solutions for a challenge ─
router.get('/challenge/:challengeId', optionalAuth, async (req, res) => {
  try {
    const solutions = await Solution.findAll({
      where: {
        challengeId: req.params.challengeId,
        status: { [Op.in]: ['submitted', 'under_review', 'approved', 'selected'] }
      },
      include: [
        { model: Team, include: [{ model: User, as: 'leader', attributes: ['id', 'name', 'avatar'] }] },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'avatar'] }
      ],
      order: [['voteCount', 'DESC']]
    });
    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 6: PATCH /api/solutions/:id/proposal-review ─── Multi-Stakeholder 3-Tier Review ──
router.patch('/:id/proposal-review', protect, authorize('faculty', 'university_admin', 'nodal_officer', 'admin'), async (req, res) => {
  try {
    const { decision, feedback } = req.body; // decision: 'approved' | 'revision_required' | 'rejected'
    const solution = await Solution.findByPk(req.params.id, {
      include: [
        { model: Challenge },
        { model: Team }
      ]
    });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution proposal not found.' });

    const role = req.user.role;
    let newTier = solution.currentReviewTier;
    let newProposalStatus = solution.proposalStatus;

    if (role === 'faculty') {
      // ─── Tier 1: Faculty Mentor Review ─────────────────────────────
      if (solution.currentReviewTier !== 1 && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'Proposal is not currently awaiting Tier 1 Faculty Review.' });
      }

      if (decision === 'approved') {
        await solution.update({
          facultyApproval: 'approved',
          facultyFeedback: feedback || 'Faculty approved: Technical architecture and feasibility verified.',
          facultyApprovedAt: new Date(),
          currentReviewTier: 2, // Advance to Tier 2: University Coordinator
          proposalStatus: 'under_review'
        });
        return res.json({
          success: true,
          message: 'Tier 1 (Faculty) approval granted! Proposal advanced to Tier 2: University Coordinator Review.',
          data: solution
        });
      } else {
        await solution.update({
          facultyApproval: decision === 'rejected' ? 'rejected' : 'revision_required',
          facultyFeedback: feedback || 'Revisions requested by faculty mentor.',
          proposalStatus: decision === 'rejected' ? 'rejected' : 'proposal_revision_required'
        });
        return res.json({ success: true, message: `Tier 1 review recorded: ${decision}`, data: solution });
      }

    } else if (role === 'university_admin') {
      // ─── Tier 2: University Coordinator Review ─────────────────────
      if (solution.currentReviewTier !== 2 && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'Proposal must pass Tier 1 Faculty Approval before University Coordinator Review.' });
      }

      if (decision === 'approved') {
        await solution.update({
          universityApproval: 'approved',
          universityFeedback: feedback || 'University Coordinator approved: Institutional labs and resources verified.',
          universityApprovedAt: new Date(),
          currentReviewTier: 3, // Advance to Tier 3: Government Nodal Officer
          proposalStatus: 'under_review'
        });
        return res.json({
          success: true,
          message: 'Tier 2 (University Coordinator) approval granted! Proposal forwarded to Tier 3: Government Nodal Officer for state deployment clearance.',
          data: solution
        });
      } else {
        await solution.update({
          universityApproval: decision === 'rejected' ? 'rejected' : 'revision_required',
          universityFeedback: feedback || 'Institutional adjustments required.',
          proposalStatus: decision === 'rejected' ? 'rejected' : 'proposal_revision_required'
        });
        return res.json({ success: true, message: `Tier 2 review recorded: ${decision}`, data: solution });
      }

    } else if (role === 'nodal_officer' || role === 'admin') {
      // ─── Tier 3: Government Nodal Officer Review ───────────────────
      if (solution.currentReviewTier !== 3 && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'Proposal must pass Tier 1 and Tier 2 before Government Nodal clearance.' });
      }

      if (decision === 'approved') {
        await solution.update({
          govtApproval: 'approved',
          govtFeedback: feedback || 'Government clearance granted: Solution aligns with district priorities and panchayat ground realities.',
          govtApprovedAt: new Date(),
          proposalStatus: 'proposal_approved',
          status: 'approved'
        });

        // Upgrade target challenge status to 'in_development'
        if (solution.Challenge) {
          await solution.Challenge.update({ status: 'converted_to_project' });
        }
        if (solution.Team) {
          await solution.Team.update({ status: 'active' });
        }

        return res.json({
          success: true,
          message: '🎉 Tier 3 (Government Nodal) clearance granted! Proposal is officially approved for field development & prototyping.',
          data: solution
        });
      } else {
        await solution.update({
          govtApproval: decision === 'rejected' ? 'rejected' : 'revision_required',
          govtFeedback: feedback || 'Government requested adjustments.',
          proposalStatus: decision === 'rejected' ? 'rejected' : 'proposal_revision_required'
        });
        return res.json({ success: true, message: `Tier 3 review recorded: ${decision}`, data: solution });
      }
    }

    res.status(400).json({ success: false, message: 'Unauthorized reviewer role.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 7: GET /api/solutions/my-team-solution ─── Student's team solution status ──
router.get('/my-team-solution', protect, async (req, res) => {
  try {
    const { TeamMember } = require('../models');
    const membership = await TeamMember.findOne({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    const ledTeam = await Team.findOne({
      where: { leaderId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    const teamId = membership?.TeamId || ledTeam?.id;
    if (!teamId) return res.json({ success: true, data: null });

    const solution = await Solution.findOne({
      where: { teamId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Challenge, attributes: ['id', 'title', 'category'] }]
    });

    res.json({ success: true, data: solution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Phase 8: GET /api/solutions/evaluation-queue ─── Expert Prototype Evaluation Queue ──
router.get('/evaluation-queue', protect, authorize('expert', 'admin'), async (req, res) => {
  try {
    const solutions = await Solution.findAll({
      where: {
        [Op.or]: [
          { currentReviewTier: 3, govtApproval: 'approved' },
          { proposalStatus: 'proposal_approved' },
          { status: { [Op.in]: ['under_review', 'approved'] } }
        ]
      },
      include: [
        {
          model: Team,
          include: [
            { model: User, as: 'leader', attributes: ['id', 'name', 'avatar', 'university', 'email'] },
            { model: User, as: 'members', attributes: ['id', 'name', 'avatar', 'university', 'skills'], through: { attributes: ['role'] } },
            { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization'] },
            { model: User, as: 'university', attributes: ['id', 'name', 'organization'] }
          ]
        },
        {
          model: Challenge,
          attributes: ['id', 'title', 'category', 'status', 'submissionCode', 'district', 'state', 'responsibleDepartment', 'priorityScore']
        },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'organization', 'university'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const evaluatorOrg = (req.user.organization || req.user.university || '').trim().toLowerCase();
    const evaluatorId = req.user.id;

    const data = solutions.map(s => {
      const plain = s.toJSON();
      const teamOrg = (plain.Team?.university?.organization || plain.Team?.university?.name || plain.Team?.leader?.university || '').trim().toLowerCase();
      const isMentor = plain.Team?.facultyMentorId === evaluatorId;
      const isLeader = plain.Team?.leaderId === evaluatorId;
      const isMember = plain.Team?.members?.some(m => m.id === evaluatorId);
      const sameOrg = Boolean(evaluatorOrg && teamOrg && (evaluatorOrg.includes(teamOrg) || teamOrg.includes(evaluatorOrg)));

      plain.hasConflictOfInterest = (isMentor || isLeader || isMember || sameOrg) && req.user.role !== 'admin';
      plain.conflictReason = isMentor ? 'You are the faculty mentor for this team.'
        : (isLeader || isMember) ? 'You are a member or leader of this team.'
        : sameOrg ? `Affiliated with the same institution (${teamOrg || 'HEI'}). Independent evaluation required.`
        : null;
      return plain;
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 9: GET /api/solutions/pilot-requests ─── Nodal Officer Pilot Approvals Queue ──
router.get('/pilot-requests', protect, authorize('nodal_officer', 'admin'), async (req, res) => {
  try {
    const solutions = await Solution.findAll({
      where: {
        [Op.or]: [
          { pilotRequested: true },
          { pilotStatus: { [Op.in]: ['requested', 'approved', 'running'] } }
        ]
      },
      include: [
        {
          model: Team,
          include: [
            { model: User, as: 'leader', attributes: ['id', 'name', 'university', 'email'] },
            { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization'] }
          ]
        },
        {
          model: Challenge,
          attributes: ['id', 'title', 'category', 'status', 'submissionCode', 'district', 'state', 'responsibleDepartment']
        }
      ],
      order: [['pilotRequestedAt', 'DESC']]
    });

    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/solutions/:id ─── Get single solution dossier ───────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const solution = await Solution.findByPk(req.params.id, {
      include: [
        {
          model: Team,
          include: [
            { model: User, as: 'leader', attributes: ['id', 'name', 'avatar', 'university'] },
            { model: User, as: 'members', attributes: ['id', 'name', 'avatar', 'university', 'skills'], through: { attributes: ['role'] } },
            { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization', 'bio'] },
            { model: User, as: 'industryExpert', attributes: ['id', 'name', 'organization', 'bio'] }
          ]
        },
        { model: Challenge },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'avatar', 'organization'] }
      ]
    });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });
    res.json({ success: true, data: solution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── POST /api/solutions/:id/vote ─── Upvote a solution ───────────
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const solution = await Solution.findByPk(req.params.id);
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    const existingVote = await Vote.findOne({ where: { UserId: req.user.id, SolutionId: solution.id } });
    if (existingVote) {
      await existingVote.destroy();
      await solution.decrement('voteCount');
      return res.json({ success: true, message: 'Vote removed.', voted: false, voteCount: solution.voteCount - 1 });
    }

    await Vote.create({ UserId: req.user.id, SolutionId: solution.id, type: 'upvote' });
    await solution.increment('voteCount');

    res.json({ success: true, message: 'Vote added.', voted: true, voteCount: solution.voteCount + 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 8: PUT /api/solutions/:id/evaluate ─── Multi-Axis Expert Evaluation (3 Rubrics) ───
router.put('/:id/evaluate', protect, authorize('expert', 'admin'), async (req, res) => {
  try {
    const {
      technicalScore,
      socialImpactScore,
      deploymentReadinessScore,
      expertFeedback,
      identifiedRisks,
      pilotReadinessCertified,
      // Legacy compatibility
      feasibilityScore,
      innovationScore,
      impactScore,
      status
    } = req.body;

    const solution = await Solution.findByPk(req.params.id, {
      include: [
        {
          model: Team,
          include: [
            { model: User, as: 'university' },
            { model: User, as: 'leader' },
            { model: User, as: 'members', attributes: ['id'] }
          ]
        },
        { model: Challenge }
      ]
    });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    // Conflict of interest check (Strict check: Evaluator cannot evaluate if from same university or is mentor)
    if (req.user.role === 'expert') {
      const evaluatorOrg = (req.user.organization || req.user.university || '').trim().toLowerCase();
      const teamOrg = (solution.Team?.university?.organization || solution.Team?.university?.name || solution.Team?.leader?.university || '').trim().toLowerCase();
      const isMentor = solution.Team?.facultyMentorId === req.user.id;
      const isLeader = solution.Team?.leaderId === req.user.id;
      const isMember = solution.Team?.members?.some(m => m.id === req.user.id);
      const sameOrg = Boolean(evaluatorOrg && teamOrg && (evaluatorOrg.includes(teamOrg) || teamOrg.includes(evaluatorOrg)));

      if (isMentor || isLeader || isMember || sameOrg) {
        return res.status(403).json({
          success: false,
          message: 'Conflict of interest detected: Experts cannot evaluate prototypes from their own institution or mentored teams.'
        });
      }
    }

    // Determine normalized 0-100 scores
    const tScore = technicalScore !== undefined ? Number(technicalScore) : (feasibilityScore ? Number(feasibilityScore) * 10 : 80);
    const sScore = socialImpactScore !== undefined ? Number(socialImpactScore) : (impactScore ? Number(impactScore) * 10 : 80);
    const dScore = deploymentReadinessScore !== undefined ? Number(deploymentReadinessScore) : (innovationScore ? Number(innovationScore) * 10 : 80);
    const composite = parseFloat(((tScore + sScore + dScore) / 3).toFixed(1));
    const certified = pilotReadinessCertified !== undefined ? Boolean(pilotReadinessCertified) : (composite >= 75);

    await solution.update({
      technicalScore: tScore,
      socialImpactScore: sScore,
      deploymentReadinessScore: dScore,
      compositeScore: composite,
      pilotReadinessCertified: certified,
      evaluatedById: req.user.id,
      evaluatedAt: new Date(),
      conflictCheckConfirmed: true,
      identifiedRisks: identifiedRisks || null,
      expertFeedback: expertFeedback || 'Prototype verified against engineering & field deployment criteria.',
      feasibilityScore: Math.round(tScore / 10),
      impactScore: Math.round(sScore / 10),
      innovationScore: Math.round(dScore / 10),
      status: status || 'approved'
    });

    // Notify team leader of completed evaluation
    const { createNotification } = require('../utils/notifications');
    if (solution.Team?.leaderId) {
      await createNotification({
        userId: solution.Team.leaderId,
        type: 'evaluation_completed',
        title: '⭐ Prototype Evaluated by Domain Expert',
        message: `Your prototype received a composite score of ${composite}/100 from ${req.user.name}. Pilot readiness: ${certified ? 'Certified' : 'Pending'}.`,
        relatedId: solution.id,
        relatedType: 'solution'
      });
    }

    res.json({
      success: true,
      message: `Evaluation submitted successfully! Composite score: ${composite}/100. ${certified ? 'Certified for Field Pilot!' : ''}`,
      data: solution
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 9: POST /api/solutions/:id/request-pilot ─── Team Requests Field Pilot ───
router.post('/:id/request-pilot', protect, async (req, res) => {
  try {
    const { pilotSiteLocation, pilotRequestDetails, targetHouseholds, durationWeeks } = req.body;
    const solution = await Solution.findByPk(req.params.id, {
      include: [
        { model: Team },
        { model: Challenge }
      ]
    });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    const team = solution.Team;
    const isLeadOrMember = team?.leaderId === req.user.id;
    const isMentor = team?.facultyMentorId === req.user.id;
    if (!isLeadOrMember && !isMentor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team members or mentors can request pilot deployment.' });
    }

    const details = pilotRequestDetails || `Proposed pilot deployment at ${pilotSiteLocation || 'designated district site'} for ${durationWeeks || 4} weeks targeting ${targetHouseholds || 250} beneficiaries.`;

    await solution.update({
      pilotRequested: true,
      pilotRequestedAt: new Date(),
      pilotSiteLocation: pilotSiteLocation || (solution.Challenge?.district ? `${solution.Challenge.district} Pilot Site` : 'Field Site'),
      pilotRequestDetails: details,
      pilotStatus: 'requested'
    });

    const { createNotification } = require('../utils/notifications');
    if (solution.Challenge?.nodalOfficerId) {
      await createNotification({
        userId: solution.Challenge.nodalOfficerId,
        type: 'pilot_requested',
        title: '🚀 Field Pilot Deployment Permit Requested',
        message: `Team "${team.name}" requested field pilot deployment for challenge "${solution.Challenge.title}".`,
        relatedId: solution.id,
        relatedType: 'solution'
      });
    }

    res.json({
      success: true,
      message: 'Field Pilot deployment request submitted to Government Nodal Officer for official permit issuance!',
      data: solution
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 9: PATCH /api/solutions/:id/grant-pilot-permit ─── Nodal Officer Issues Permit ───
router.patch('/:id/grant-pilot-permit', protect, authorize('nodal_officer', 'admin'), async (req, res) => {
  try {
    const { decision, pilotPermitOfficerNotes, pilotSiteLocation } = req.body; // 'approved' | 'rejected'
    const solution = await Solution.findByPk(req.params.id, {
      include: [
        { model: Team },
        { model: Challenge }
      ]
    });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    if (decision === 'approved') {
      const year = new Date().getFullYear();
      const code = solution.Challenge?.district ? solution.Challenge.district.substring(0, 3).toUpperCase() : 'JH';
      const permitNo = `PILOT-${code}-${year}-${Date.now().toString().slice(-4)}`;

      await solution.update({
        pilotPermitGranted: true,
        pilotPermitNumber: permitNo,
        pilotSiteLocation: pilotSiteLocation || solution.pilotSiteLocation || 'District Field Site',
        pilotPermitGrantedAt: new Date(),
        pilotPermitOfficerNotes: pilotPermitOfficerNotes || 'Official pilot deployment permit granted under district oversight.',
        pilotStatus: 'approved',
        implementationStatus: 'piloting'
      });

      if (solution.Challenge) {
        await solution.Challenge.update({ status: 'converted_to_project' });
      }

      const { createNotification } = require('../utils/notifications');
      if (solution.Team?.leaderId) {
        await createNotification({
          userId: solution.Team.leaderId,
          type: 'pilot_permit_granted',
          title: `🏛️ Government Pilot Permit Issued: ${permitNo}`,
          message: `Government Nodal Officer approved your field pilot at ${solution.pilotSiteLocation}! Permit No: ${permitNo}`,
          relatedId: solution.id,
          relatedType: 'solution'
        });
      }

      res.json({
        success: true,
        message: `Official Pilot Permit ${permitNo} issued successfully! Project status advanced to Field Piloting.`,
        data: solution
      });
    } else {
      await solution.update({
        pilotPermitGranted: false,
        pilotPermitOfficerNotes: pilotPermitOfficerNotes || 'Pilot permit declined.',
        pilotStatus: 'none'
      });

      res.json({ success: true, message: 'Pilot request declined.', data: solution });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 7: PUT /api/solutions/:id/implementation-status ─── Track dev progress ──
router.put('/:id/implementation-status', protect, async (req, res) => {
  try {
    const solution = await Solution.findByPk(req.params.id, {
      include: [{ model: Team, attributes: ['id', 'leaderId', 'facultyMentorId'] }]
    });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    const team = solution.Team;
    const isLeader = team?.leaderId === req.user.id;
    const isMentor = team?.facultyMentorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isLeader && !isMentor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorised' });
    }

    const { implementationStatus, implementationNotes } = req.body;
    const validStatuses = ['not_started', 'in_progress', 'piloting', 'implemented', 'impact_measured'];
    if (!validStatuses.includes(implementationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid implementation status.' });
    }

    await solution.update({ implementationStatus, implementationNotes });
    res.json({ success: true, data: solution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

