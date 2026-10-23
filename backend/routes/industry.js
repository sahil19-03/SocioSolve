const express = require('express');
const router = express.Router();
const { IndustryPartnership, Challenge, Team, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');

// ─── GET /api/industry/partnerships — List partnerships ───────────
router.get('/partnerships', protect, async (req, res) => {
  try {
    const { status, challengeId, teamId } = req.query;
    const where = {};

    // Industry partners see only their own; admins see all
    if (req.user.role === 'industry_partner') where.industryPartnerId = req.user.id;
    if (status)      where.status      = status;
    if (challengeId) where.challengeId = challengeId;
    if (teamId)      where.teamId      = teamId;

    const partnerships = await IndustryPartnership.findAll({
      where,
      include: [
        { model: User,      as: 'industryPartner', attributes: ['id', 'name', 'organization', 'website'] },
        { model: Challenge, attributes: ['id', 'title', 'category', 'state'] },
        { model: Team,      attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: partnerships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/industry/partnerships — Propose a partnership ──────
router.post('/partnerships', protect, async (req, res) => {
  try {
    const { challengeId, teamId, type, proposal, fundingAmount, startDate, endDate } = req.body;

    if (!['industry_partner', 'expert', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only industry partners can propose partnerships' });
    }

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const partnership = await IndustryPartnership.create({
      industryPartnerId: req.user.id,
      challengeId,
      teamId: teamId || null,
      type,
      proposal,
      fundingAmount: fundingAmount || null,
      startDate: startDate || null,
      endDate: endDate || null
    });

    // Notify admin
    await createNotification({
      userId: null,        // null = notify all admins (handled in createNotification)
      type: 'partnership_proposed',
      title: 'New Partnership Proposed',
      message: `${req.user.name} proposed a ${type} partnership for "${challenge.title}"`,
      relatedId: partnership.id,
      relatedType: 'partnership',
      notifyAdmins: true
    });

    res.status(201).json({ success: true, data: partnership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/industry/partnerships/:id — Update status (admin) ───
router.put('/partnerships/:id', protect, async (req, res) => {
  try {
    const partnership = await IndustryPartnership.findByPk(req.params.id, {
      include: [
        { model: User, as: 'industryPartner', attributes: ['id', 'name'] },
        { model: Challenge, attributes: ['id', 'title'] }
      ]
    });
    if (!partnership) return res.status(404).json({ success: false, message: 'Partnership not found' });

    const isAdmin   = req.user.role === 'admin';
    const isOwner   = partnership.industryPartnerId === req.user.id;
    if (!isAdmin && !isOwner) return res.status(403).json({ success: false, message: 'Unauthorised' });

    const { status, notes, agreementUrl } = req.body;
    await partnership.update({ status, notes, agreementUrl });

    // Notify the industry partner when accepted or rejected
    if (status === 'accepted') {
      await createNotification({
        userId: partnership.industryPartnerId,
        type: 'partnership_accepted',
        title: 'Partnership Accepted',
        message: `Your ${partnership.type} partnership for "${partnership.Challenge.title}" has been accepted.`,
        relatedId: partnership.id,
        relatedType: 'partnership'
      });
    } else if (status === 'rejected') {
      await createNotification({
        userId: partnership.industryPartnerId,
        type: 'partnership_rejected',
        title: 'Partnership Proposal Update',
        message: `Your ${partnership.type} partnership proposal for "${partnership.Challenge.title}" was not approved.${notes ? ` Note: ${notes}` : ''}`,
        relatedId: partnership.id,
        relatedType: 'partnership'
      });
    }

    res.json({ success: true, data: partnership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/industry/challenges — Challenges open for industry ──
router.get('/challenges', protect, async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'category', 'description', 'state', 'district', 'impactScope', 'requiredSkills'],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ success: true, data: challenges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/industry/certified-prototypes — Certified prototypes ready for pilot/CSR ──
router.get('/certified-prototypes', protect, async (req, res) => {
  try {
    const { Solution, Challenge, Team, User } = require('../models');
    const { Op } = require('sequelize');
    const solutions = await Solution.findAll({
      where: {
        [Op.or]: [
          { pilotReadinessCertified: true },
          { compositeScore: { [Op.gte]: 70 } },
          { status: { [Op.in]: ['selected', 'approved'] } }
        ]
      },
      include: [
        { model: Challenge, attributes: ['id', 'title', 'category', 'state', 'district', 'urgency', 'status'] },
        { model: Team, attributes: ['id', 'name'] },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'university', 'email'] }
      ],
      order: [['compositeScore', 'DESC NULLS LAST'], ['createdAt', 'DESC']]
    });
    res.json({ success: true, count: solutions.length, data: solutions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
