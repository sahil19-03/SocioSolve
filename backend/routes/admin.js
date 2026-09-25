const express = require('express');
const { User, Challenge, Team, Solution, IndustryPartnership } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op, fn, col, literal } = require('sequelize');
const { createNotification } = require('../utils/notifications');

const router = express.Router();

// ─── GET /api/admin/stats ─────────────────────────────────────────
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers, totalChallenges, pendingChallenges,
      publishedChallenges, totalTeams, totalSolutions
    ] = await Promise.all([
      User.count(),
      Challenge.count(),
      Challenge.count({ where: { status: 'pending' } }),
      Challenge.count({ where: { status: 'published' } }),
      Team.count(),
      Solution.count()
    ]);

    const roleBreakdown = await User.findAll({
      attributes: ['role', [fn('COUNT', col('id')), 'count']],
      group: ['role'],
      raw: true
    });

    res.json({
      success: true,
      data: { totalUsers, totalChallenges, pendingChallenges, publishedChallenges, totalTeams, totalSolutions, roleBreakdown }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/admin/analytics/overview ───────────────────────────
router.get('/analytics/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalChallenges, pendingChallenges, publishedChallenges,
      assignedChallenges, solvedChallenges,
      totalTeams, activeTeams,
      totalSolutions, approvedSolutions,
      totalUsers, totalPartnerships
    ] = await Promise.all([
      Challenge.count(),
      Challenge.count({ where: { status: 'pending' } }),
      Challenge.count({ where: { status: 'published' } }),
      Challenge.count({ where: { status: 'assigned' } }),
      Challenge.count({ where: { status: 'solved' } }),
      Team.count(),
      Team.count({ where: { status: 'active' } }),
      Solution.count(),
      Solution.count({ where: { status: { [Op.in]: ['approved', 'selected'] } } }),
      User.count({ where: { isActive: true } }),
      IndustryPartnership.count({ where: { status: 'active' } })
    ]);

    res.json({
      success: true,
      data: {
        challenges: { total: totalChallenges, pending: pendingChallenges, published: publishedChallenges, assigned: assignedChallenges, solved: solvedChallenges },
        teams: { total: totalTeams, active: activeTeams },
        solutions: { total: totalSolutions, approved: approvedSolutions },
        users: { total: totalUsers },
        partnerships: { active: totalPartnerships }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/analytics/by-state ───────────────────────────
router.get('/analytics/by-state', protect, authorize('admin'), async (req, res) => {
  try {
    const stateData = await Challenge.findAll({
      attributes: ['state', [fn('COUNT', col('id')), 'count']],
      where: { state: { [Op.ne]: null } },
      group: ['state'],
      order: [[literal('count'), 'DESC']],
      raw: true
    });
    res.json({ success: true, data: stateData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/analytics/by-domain ──────────────────────────
router.get('/analytics/by-domain', protect, authorize('admin'), async (req, res) => {
  try {
    const domainData = await Challenge.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      order: [[literal('count'), 'DESC']],
      raw: true
    });
    res.json({ success: true, data: domainData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/analytics/by-scope ───────────────────────────
router.get('/analytics/by-scope', protect, authorize('admin'), async (req, res) => {
  try {
    const scopeData = await Challenge.findAll({
      attributes: ['impactScope', [fn('COUNT', col('id')), 'count']],
      group: ['impactScope'],
      raw: true
    });
    res.json({ success: true, data: scopeData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name:  { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/admin/users/:id/toggle ─────────────────────────────
router.put('/users/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await user.update({ isActive: !user.isActive });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/challenges/pending ───────────────────────────
router.get('/challenges/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'organization'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/admin/challenges/:id/verify ────────────────────────
router.put('/challenges/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, reason, adminNotes } = req.body; // action: 'approve' | 'reject'
    const challenge = await Challenge.findByPk(req.params.id, {
      include: [{ model: User, as: 'submitter', attributes: ['id'] }]
    });
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    if (action === 'approve') {
      await challenge.update({ status: 'published', adminNotes, publishedAt: new Date() });
      await createNotification({
        userId: challenge.submitter.id,
        type: 'challenge_verified',
        title: 'Challenge Approved!',
        message: `Your challenge "${challenge.title}" has been verified and published.`,
        relatedId: challenge.id,
        relatedType: 'challenge'
      });
    } else if (action === 'reject') {
      await challenge.update({ status: 'rejected', rejectionReason: reason, adminNotes });
      await createNotification({
        userId: challenge.submitter.id,
        type: 'challenge_rejected',
        title: 'Challenge Not Approved',
        message: `Your challenge "${challenge.title}" was not approved. Reason: ${reason}`,
        relatedId: challenge.id,
        relatedType: 'challenge'
      });
    }

    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/admin/challenges/:id/assign ────────────────────────
router.put('/challenges/:id/assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { universityUserId } = req.body;
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const university = await User.findOne({ where: { id: universityUserId, role: 'university_admin' } });
    if (!university) return res.status(404).json({ success: false, message: 'University user not found' });

    await challenge.update({ assignedUniversityId: universityUserId, status: 'assigned', assignedAt: new Date() });

    await createNotification({
      userId: universityUserId,
      type: 'challenge_assigned',
      title: 'New Challenge Assigned',
      message: `A new challenge "${challenge.title}" has been assigned to your institution.`,
      relatedId: challenge.id,
      relatedType: 'challenge'
    });

    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
