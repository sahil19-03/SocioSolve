const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Milestone, Team, TeamMember, User, Solution, Challenge } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');

// ─── Helpers ───────────────────────────────────────────────────────────────
const isMemberOrLead = async (teamId, userId) => {
  const team = await Team.findByPk(teamId, { attributes: ['leaderId', 'facultyMentorId', 'industryExpertId'] });
  if (!team) return { allowed: false, team: null };
  const isLeader = team.leaderId === userId;
  const isMentor = team.facultyMentorId === userId;
  const isExpert = team.industryExpertId === userId;
  const membership = await TeamMember.findOne({ where: { TeamId: teamId, UserId: userId } });
  return { allowed: isLeader || isMentor || isExpert || !!membership, team, isLeader, isMentor };
};

// ─── GET /api/milestones/my-team ─── Auto-load milestones for logged-in student ──
router.get('/my-team', protect, async (req, res) => {
  try {
    // Find the user's primary team (as leader or member)
    const membership = await TeamMember.findOne({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    const ledTeam = await Team.findOne({
      where: { leaderId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    const mentorTeam = await Team.findOne({
      where: { facultyMentorId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    const teamId = membership?.TeamId || ledTeam?.id || mentorTeam?.id;
    if (!teamId) return res.json({ success: true, data: [], teamId: null, teamName: null });

    const team = await Team.findByPk(teamId, {
      include: [
        { model: Challenge, attributes: ['id', 'title', 'category'] },
        { model: User, as: 'leader', attributes: ['id', 'name'] },
        { model: User, as: 'facultyMentor', attributes: ['id', 'name'] }
      ]
    });

    // Auto-mark overdue milestones
    const now = new Date();
    await Milestone.update(
      { status: 'overdue' },
      { where: { teamId, status: { [Op.in]: ['pending', 'in_progress'] }, dueDate: { [Op.lt]: now } } }
    );

    const milestones = await Milestone.findAll({
      where: { teamId },
      include: [{ model: User, as: 'approvedBy', attributes: ['id', 'name', 'role'] }],
      order: [['orderIndex', 'ASC'], ['createdAt', 'ASC']]
    });

    // Compute completion percentage
    const total = milestones.length;
    const done = milestones.filter(m => m.status === 'completed').length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

    res.json({
      success: true,
      data: milestones,
      teamId,
      teamName: team?.name || 'My Team',
      challenge: team?.Challenge || null,
      facultyMentor: team?.facultyMentor || null,
      stats: { total, done, completionPct }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/milestones/team/:teamId ─── All milestones for a specific team ──
router.get('/team/:teamId', protect, async (req, res) => {
  try {
    const { allowed } = await isMemberOrLead(req.params.teamId, req.user.id);
    if (!allowed && req.user.role !== 'admin' && req.user.role !== 'nodal_officer') {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    // Auto-mark overdue
    const now = new Date();
    await Milestone.update(
      { status: 'overdue' },
      { where: { teamId: req.params.teamId, status: { [Op.in]: ['pending', 'in_progress'] }, dueDate: { [Op.lt]: now } } }
    );

    const milestones = await Milestone.findAll({
      where: { teamId: req.params.teamId },
      include: [{ model: User, as: 'approvedBy', attributes: ['id', 'name', 'role'] }],
      order: [['orderIndex', 'ASC'], ['createdAt', 'ASC']]
    });

    const total = milestones.length;
    const done = milestones.filter(m => m.status === 'completed').length;
    res.json({ success: true, data: milestones, stats: { total, done, completionPct: total > 0 ? Math.round((done / total) * 100) : 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/milestones/faculty-teams ─── Faculty sees all their teams' milestones ──
router.get('/faculty-teams', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const teams = await Team.findAll({
      where: { facultyMentorId: req.user.id },
      include: [
        { model: User, as: 'leader', attributes: ['id', 'name', 'university'] },
        { model: Challenge, attributes: ['id', 'title', 'category'] },
        {
          model: Milestone,
          as: 'milestones',
          include: [{ model: User, as: 'approvedBy', attributes: ['id', 'name'] }]
        }
      ]
    });

    // Flatten with team metadata for faculty view
    const result = teams.map(t => ({
      teamId: t.id,
      teamName: t.name,
      leader: t.leader,
      challenge: t.Challenge,
      milestones: t.milestones || [],
      stats: {
        total: t.milestones?.length || 0,
        done: t.milestones?.filter(m => m.status === 'completed').length || 0,
        overdue: t.milestones?.filter(m => m.status === 'overdue').length || 0,
        pending: t.milestones?.filter(m => m.status === 'pending' || m.status === 'in_progress').length || 0
      }
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/milestones/pending-review ─── Faculty/Admin milestone review queue ──
router.get('/pending-review', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const whereTeam = req.user.role === 'admin' ? {} : { facultyMentorId: req.user.id };
    const milestones = await Milestone.findAll({
      where: {
        status: { [Op.in]: ['in_progress', 'pending'] }
      },
      include: [
        {
          model: Team,
          where: whereTeam,
          include: [
            { model: User, as: 'leader', attributes: ['id', 'name', 'university'] },
            { model: Challenge, attributes: ['id', 'title', 'category'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: milestones.length, data: milestones });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/milestones ─── Create a milestone ──────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { teamId, title, description, dueDate, deliverables, orderIndex } = req.body;

    const { allowed, isMentor, isLeader } = await isMemberOrLead(teamId, req.user.id);
    if (!allowed && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team members can add milestones' });
    }

    const milestone = await Milestone.create({
      teamId, title, description,
      dueDate: dueDate || null,
      deliverables: Array.isArray(deliverables) ? deliverables : (deliverables ? deliverables.split('\n').filter(Boolean) : []),
      orderIndex: orderIndex || 0
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/milestones/:id/progress ─── Student reports progress ──────
router.put('/:id/progress', protect, async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [{ model: Team, attributes: ['id', 'leaderId', 'facultyMentorId', 'name'] }]
    });
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const team = milestone.Team;
    const membership = await TeamMember.findOne({ where: { TeamId: team.id, UserId: req.user.id } });
    const isLeader = team.leaderId === req.user.id;
    if (!isLeader && !membership && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team members can report progress' });
    }

    const { status, progressNote, attachments } = req.body;
    const allowedStatusChanges = ['in_progress'];
    if (!allowedStatusChanges.includes(status)) {
      return res.status(400).json({ success: false, message: 'Students can only set status to in_progress. Faculty must approve completion.' });
    }

    const updates = { status };
    if (progressNote) updates.description = (milestone.description || '') + `\n\n📝 Progress Update [${new Date().toLocaleDateString()}]: ${progressNote}`;
    if (attachments) updates.attachments = attachments;

    await milestone.update(updates);

    // Notify faculty mentor
    if (team.facultyMentorId) {
      await createNotification({
        userId: team.facultyMentorId,
        type: 'milestone_progress',
        title: `Progress Update: ${milestone.title}`,
        message: `Team "${team.name}" marked milestone "${milestone.title}" as in progress.`,
        relatedId: milestone.id,
        relatedType: 'milestone'
      });
    }

    res.json({ success: true, data: milestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/milestones/:id/validate ─── Faculty validates / completes milestone ──
router.put('/:id/validate', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [{ model: Team, attributes: ['id', 'leaderId', 'facultyMentorId', 'name'] }]
    });
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const team = milestone.Team;
    if (req.user.role === 'faculty' && team.facultyMentorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not the faculty mentor for this team' });
    }

    const { action, mentorFeedback } = req.body; // action: 'approve' | 'reject' | 'request_revision'

    const updates = { mentorFeedback };
    if (action === 'approve') {
      updates.status = 'completed';
      updates.completedAt = new Date();
      updates.approvedById = req.user.id;

      // Notify team leader
      await createNotification({
        userId: team.leaderId,
        type: 'milestone_approved',
        title: '✅ Milestone Approved!',
        message: `Your faculty mentor approved milestone "${milestone.title}" for team "${team.name}".`,
        relatedId: milestone.id,
        relatedType: 'milestone'
      });

      // Check if all milestones done — notify university admin
      const allMilestones = await Milestone.findAll({ where: { teamId: team.id } });
      const allDone = allMilestones.every(m => m.id === milestone.id ? true : m.status === 'completed');
      if (allDone && allMilestones.length > 0) {
        await createNotification({
          userId: team.leaderId,
          type: 'project_complete',
          title: '🎉 All Milestones Complete!',
          message: `Your team "${team.name}" has completed all milestones. Congratulations!`,
          relatedId: team.id,
          relatedType: 'team'
        });
      }
    } else if (action === 'request_revision') {
      updates.status = 'in_progress';
      await createNotification({
        userId: team.leaderId,
        type: 'milestone_revision',
        title: '🔄 Milestone Revision Requested',
        message: `Faculty mentor requested revision on "${milestone.title}". Feedback: ${mentorFeedback || 'See milestone details.'}`,
        relatedId: milestone.id,
        relatedType: 'milestone'
      });
    }

    await milestone.update(updates);
    res.json({ success: true, data: milestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/milestones/:id ─── General update (admin/leader/mentor) ────
router.put('/:id', protect, async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [{ model: Team, attributes: ['id', 'leaderId', 'facultyMentorId'] }]
    });
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const team = milestone.Team;
    const isLeader = team.leaderId === req.user.id;
    const isMentor = team.facultyMentorId === req.user.id;
    const isAdmin  = req.user.role === 'admin';
    if (!isLeader && !isMentor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorised' });
    }

    const { title, description, dueDate, status, deliverables, mentorFeedback, attachments, orderIndex } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (status !== undefined) updates.status = status;
    if (deliverables !== undefined) updates.deliverables = deliverables;
    if (mentorFeedback !== undefined) updates.mentorFeedback = mentorFeedback;
    if (attachments !== undefined) updates.attachments = attachments;
    if (orderIndex !== undefined) updates.orderIndex = orderIndex;

    // Auto-set completedAt
    if (status === 'completed' && !milestone.completedAt) {
      updates.completedAt = new Date();
      updates.approvedById = req.user.id;

      await createNotification({
        userId: team.leaderId,
        type: 'milestone_approved',
        title: 'Milestone Completed',
        message: `"${milestone.title}" has been marked as completed.`,
        relatedId: milestone.id,
        relatedType: 'milestone'
      });
    }

    await milestone.update(updates);
    res.json({ success: true, data: milestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/milestones/:id ─────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [{ model: Team, attributes: ['leaderId'] }]
    });
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const isLeader = milestone.Team.leaderId === req.user.id;
    const isAdmin  = req.user.role === 'admin';
    if (!isLeader && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorised' });
    }

    await milestone.destroy();
    res.json({ success: true, message: 'Milestone deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
