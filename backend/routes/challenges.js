const express = require('express');
const { Op } = require('sequelize');
const { Challenge, User, Team, Solution } = require('../models');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer setup for challenge attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'backend/uploads/'),
  filename: (req, file, cb) => cb(null, `challenge_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── GET /api/challenges ─── Public: list published challenges ────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category, status = 'published', difficulty, search,
      page = 1, limit = 12, sortBy = 'createdAt', order = 'DESC'
    } = req.query;

    const where = {};
    // Admin and Nodal Officer can see all / filter; public only sees published
    if (!req.user || (!['admin', 'nodal_officer'].includes(req.user.role))) {
      where.status = 'published';
    } else if (status) {
      where.status = status;
    }

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Challenge.findAndCountAll({
      where,
      include: [{ model: User, as: 'submitter', attributes: ['id', 'name', 'organization', 'organizationType'] }],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/challenges/my ─── Submitter: get my submitted challenges ────
router.get('/my', protect, async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: { submitterId: req.user.id },
      include: [
        { model: User, as: 'assignedUniversity', attributes: ['id', 'name', 'organization'] },
        { model: User, as: 'nodalOfficer', attributes: ['id', 'name', 'organization'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/challenges/my-community-feedback ─── User's submitted community feedbacks ──
router.get('/my-community-feedback', protect, async (req, res) => {
  try {
    const { CommunityFeedback } = require('../models');
    const feedbacks = await CommunityFeedback.findAll({
      where: { citizenId: req.user.id },
      include: [
        {
          model: Challenge,
          attributes: ['id', 'title', 'category', 'status', 'district', 'state', 'submissionCode']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/challenges/verification-queue ─── Nodal Officer / Admin: screening queue ────
router.get('/verification-queue', protect, authorize('nodal_officer', 'admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.in]: ['submitted', 'pending', 'under_review', 'needs_information', 'verified'] };
    }

    const challenges = await Challenge.findAll({
      where,
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'organization', 'organizationType', 'district', 'state'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 4: GET /api/challenges/available-for-hei ─── Published challenges available for HEI to claim
router.get('/available-for-hei', protect, authorize('university_admin', 'admin'), async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {
      status: { [Op.in]: ['published', 'verified'] }
    };
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { district: { [Op.iLike]: `%${search}%` } },
        { state: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const challenges = await Challenge.findAll({
      where,
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'organization', 'district', 'state'] },
        { model: User, as: 'nodalOfficer', attributes: ['id', 'name', 'organization'] }
      ],
      order: [['priorityScore', 'DESC NULLS LAST'], ['createdAt', 'DESC']]
    });

    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 4: GET /api/challenges/claimed-by-hei ─── HEI's claimed/assigned challenges
router.get('/claimed-by-hei', protect, authorize('university_admin', 'admin'), async (req, res) => {
  try {
    const where = {
      [Op.or]: [
        { institutionInterestId: req.user.id },
        { assignedUniversityId: req.user.id }
      ]
    };

    const challenges = await Challenge.findAll({
      where,
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'organization'] },
        { model: User, as: 'nodalOfficer', attributes: ['id', 'name', 'organization'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 4: GET /api/challenges/pending-assignments ─── Govt: see pending institution interests
router.get('/pending-assignments', protect, authorize('nodal_officer', 'admin'), async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: {
        status: 'assigned',
        institutionInterestId: { [Op.ne]: null },
        assignedUniversityId: null  // not yet officially confirmed
      },
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'organization', 'district', 'state'] },
        { model: User, as: 'institutionInterest', attributes: ['id', 'name', 'organization', 'website', 'state', 'district', 'skills'] }
      ],
      order: [['institutionInterestAt', 'DESC']]
    });

    // Provide both institutionInterest and requestingInstitution for client backwards-compatibility
    const mapped = challenges.map(c => {
      const plain = c.toJSON();
      plain.requestingInstitution = plain.institutionInterest;
      return plain;
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/challenges/stats/overview ─── Admin stats ──────────
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await Challenge.count();
    const pending = await Challenge.count({ where: { status: 'pending' } });
    const published = await Challenge.count({ where: { status: 'published' } });
    const solved = await Challenge.count({ where: { status: 'solved' } });
    res.json({ success: true, data: { total, pending, published, solved } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── POST /api/challenges ─── Phase 1: Problem Submission ────────────────
router.post('/', protect, authorize('citizen', 'nodal_officer', 'admin'), upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      title, description, category, difficulty, tags,
      requiredSkills, location, impactArea, deadline,
      state, district, pincode, impactScope,
      affectedPopulation, urgency, expectedOutcome
    } = req.body;

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

    const attachments = req.files ? req.files.map(f => f.filename) : [];

    // Generate unique tracking submission code (e.g., JH-WAT-2026-8341)
    const statePrefix = (state ? state.substring(0, 2) : 'IN').toUpperCase();
    const catPrefix = (category ? category.substring(0, 3) : 'SOC').toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const submissionCode = `${statePrefix}-${catPrefix}-${new Date().getFullYear()}-${randNum}`;

    const challenge = await Challenge.create({
      title,
      description,
      category,
      difficulty: difficulty || 'intermediate',
      tags: parseArrayField(tags),
      requiredSkills: parseArrayField(requiredSkills),
      location,
      impactArea,
      deadline: deadline || null,
      attachments,
      submissionCode,
      // Phase 1 location & impact fields
      state: state || null,
      district: district || null,
      pincode: pincode || null,
      impactScope: impactScope || 'district',
      affectedPopulation: affectedPopulation || null,
      urgency: urgency || 'medium',
      expectedOutcome: expectedOutcome || null,
      // Submitter info
      submitterId: req.user.id,
      submitterOrg: req.user.organization,
      submitterOrgType: req.user.organizationType,
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      message: `Challenge submitted successfully! Tracking Code: ${submissionCode}`,
      data: challenge
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── PUT & PATCH /api/challenges/:id/verify ─── Phase 2: Nodal Officer Verification ──
const handleVerification = async (req, res) => {
  try {
    const { action, nodalNotes, rejectionReason } = req.body;
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    if (action === 'verify') {
      await challenge.update({
        status: 'verified',
        nodalOfficerId: req.user.id,
        nodalDecision: 'verified',
        nodalNotes: nodalNotes || 'Verified as a genuine public problem.'
      });
      return res.json({ success: true, message: 'Challenge successfully verified.', data: challenge });
    } else if (action === 'needs_information') {
      await challenge.update({
        status: 'needs_information',
        nodalOfficerId: req.user.id,
        nodalDecision: 'needs_information',
        nodalNotes: nodalNotes || 'Additional clarification required from submitter.'
      });
      return res.json({ success: true, message: 'Clarification requested from submitter.', data: challenge });
    } else if (action === 'reject') {
      await challenge.update({
        status: 'rejected',
        nodalOfficerId: req.user.id,
        nodalDecision: 'rejected',
        rejectionReason: rejectionReason || nodalNotes || 'Rejected by nodal authority.',
        nodalNotes
      });
      return res.json({ success: true, message: 'Challenge rejected.', data: challenge });
    } else if (action === 'duplicate') {
      await challenge.update({
        status: 'duplicate',
        nodalOfficerId: req.user.id,
        nodalDecision: 'duplicate',
        nodalNotes
      });
      return res.json({ success: true, message: 'Challenge marked as duplicate.', data: challenge });
    } else if (action === 'publish') {
      // Legacy fallback for platform admin
      await challenge.update({ status: 'published', adminNotes: nodalNotes, publishedAt: new Date() });
      return res.json({ success: true, message: 'Challenge published.', data: challenge });
    }

    res.status(400).json({ success: false, message: 'Invalid action. Choose verify, needs_information, reject, or duplicate.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
router.put('/:id/verify', protect, authorize('nodal_officer', 'admin'), handleVerification);
router.patch('/:id/verify', protect, authorize('nodal_officer', 'admin'), handleVerification);

// ─── PATCH /api/challenges/:id/publish-with-ownership ─── Phase 3: Prioritization & Publishing ──
router.patch('/:id/publish-with-ownership', protect, authorize('nodal_officer', 'admin'), async (req, res) => {
  try {
    const { responsibleDepartment, priorityScore, reviewDeadline, nodalNotes, domainExpertise } = req.body;
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    await challenge.update({
      status: 'published',
      responsibleDepartment: responsibleDepartment || challenge.responsibleDepartment,
      priorityScore: priorityScore !== undefined ? Number(priorityScore) : (challenge.priorityScore || 8),
      reviewDeadline: reviewDeadline || challenge.reviewDeadline,
      domainExpertise: domainExpertise || challenge.domainExpertise || [],
      nodalNotes: nodalNotes || challenge.nodalNotes,
      nodalOfficerId: req.user.id,
      publishedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Challenge prioritized and published for university collaboration!',
      data: challenge
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 4: POST /api/challenges/:id/express-interest ─── University expresses interest
router.post('/:id/express-interest', protect, authorize('university_admin', 'admin'), async (req, res) => {
  try {
    const { note } = req.body;
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    if (!['published', 'verified'].includes(challenge.status)) {
      return res.status(400).json({ success: false, message: 'Challenge is not available for institution claiming.' });
    }

    // Check if already claimed by another institution
    if (challenge.institutionInterestId && challenge.institutionInterestId !== req.user.id) {
      return res.status(409).json({ success: false, message: 'Another institution has already expressed interest. Awaiting government confirmation.' });
    }

    await challenge.update({
      institutionInterestId: req.user.id,
      institutionInterestNote: note || `${req.user.organization} has expressed institutional interest to work on this challenge.`,
      institutionInterestAt: new Date(),
      status: 'assigned'  // provisional — Govt will confirm
    });

    res.json({
      success: true,
      message: `${req.user.organization} has successfully claimed this challenge. Awaiting Government Nodal Officer confirmation.`,
      data: challenge
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 4: PATCH /api/challenges/:id/confirm-assignment ─── Govt confirms/rejects HEI assignment
router.patch('/:id/confirm-assignment', protect, authorize('nodal_officer', 'admin'), async (req, res) => {
  try {
    const { action, nodalNotes } = req.body; // action: 'confirm' | 'reject'
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    if (!challenge.institutionInterestId) {
      return res.status(400).json({ success: false, message: 'No institution has expressed interest in this challenge.' });
    }

    if (action === 'confirm') {
      await challenge.update({
        status: 'converted_to_project',
        assignedUniversityId: challenge.institutionInterestId,
        assignedAt: new Date(),
        nodalNotes: nodalNotes || `University assignment confirmed by nodal officer.`
      });
      return res.json({ success: true, message: 'University assignment confirmed. Challenge converted to active project!', data: challenge });
    } else if (action === 'reject') {
      // Reset interest, revert to published
      await challenge.update({
        status: 'published',
        institutionInterestId: null,
        institutionInterestNote: null,
        institutionInterestAt: null,
        nodalNotes: nodalNotes || 'Institution assignment rejected. Challenge re-opened for other institutions.'
      });
      return res.json({ success: true, message: 'Assignment rejected. Challenge re-published for other institutions.', data: challenge });
    }

    res.status(400).json({ success: false, message: 'Action must be confirm or reject.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/challenges/:id ─── Public: get single challenge ────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'organization', 'organizationType'] },
        { model: User, as: 'assignedUniversity', attributes: ['id', 'name', 'organization', 'website'] },
        { model: User, as: 'institutionInterest', attributes: ['id', 'name', 'organization', 'website'] },
        { model: User, as: 'nodalOfficer', attributes: ['id', 'name', 'organization'] },
        {
          model: Team,
          include: [
            { model: User, as: 'leader', attributes: ['id', 'name', 'avatar'] },
            { model: User, as: 'members', attributes: ['id', 'name', 'avatar'], through: { attributes: ['role'] } }
          ]
        },
        { model: Solution, where: { status: 'submitted' }, required: false }
      ]
    });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    if (challenge.status !== 'published' && (!req.user || !['admin', 'nodal_officer', 'university_admin'].includes(req.user.role))) {
      return res.status(403).json({ success: false, message: 'Challenge not available.' });
    }

    // Increment view count
    await challenge.increment('viewCount');

    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── PUT /api/challenges/:id ─── Update challenge (submitter/admin) ─
router.put('/:id', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    if (challenge.submitterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, category, difficulty, tags, requiredSkills, location, impactArea, deadline } = req.body;
    await challenge.update({ title, description, category, difficulty, tags, requiredSkills, location, impactArea, deadline });

    res.json({ success: true, message: 'Challenge updated.', data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/challenges/:id/teams ─── Teams on a challenge ───────
router.get('/:id/teams', optionalAuth, async (req, res) => {
  try {
    const { Team, User: UserModel } = require('../models');
    const teams = await Team.findAll({
      where: { challengeId: req.params.id },
      include: [
        { model: UserModel, as: 'leader', attributes: ['id', 'name', 'avatar', 'university'] },
        { model: UserModel, as: 'members', attributes: ['id', 'name', 'avatar', 'university'], through: { attributes: ['role'] } }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/challenges/:id/comments ─── List comments ──────────
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const { Comment, User: UserModel } = require('../models');
    const comments = await Comment.findAll({
      where: { challengeId: req.params.id },
      include: [{ model: UserModel, as: 'author', attributes: ['id', 'name', 'avatar', 'role', 'organization'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── POST /api/challenges/:id/comments ─── Post a comment ────────
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { Comment } = require('../models');
    const { content, type = 'general', parentId = null } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      type,
      parentId: parentId || null,
      authorId: req.user.id,
      challengeId: req.params.id
    });

    const { User: UserModel } = require('../models');
    const full = await Comment.findByPk(comment.id, {
      include: [{ model: UserModel, as: 'author', attributes: ['id', 'name', 'avatar', 'role', 'organization'] }]
    });

    res.status(201).json({ success: true, message: 'Comment posted.', data: full });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── DELETE /api/challenges/:id/comments/:commentId ──────────────
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const { Comment } = require('../models');
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    await comment.destroy();
    res.json({ success: true, message: 'Comment deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 10: POST /api/challenges/:id/community-feedback ─── Citizen Impact Rating & Feedback ──
router.post('/:id/community-feedback', protect, authorize('community', 'citizen', 'admin'), async (req, res) => {
  try {
    const { rating, feedback, verifiedImpact } = req.body;
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ success: false, message: 'Feedback text is required.' });
    }

    const { CommunityFeedback, User: UserModel } = require('../models');
    const record = await CommunityFeedback.create({
      challengeId: challenge.id,
      citizenId: req.user.id,
      rating: numRating,
      feedback: feedback.trim(),
      verifiedImpact: Boolean(verifiedImpact)
    });

    // Recompute average community rating
    const all = await CommunityFeedback.findAll({ where: { challengeId: challenge.id } });
    const count = all.length;
    const avg = count > 0 ? (all.reduce((acc, cur) => acc + cur.rating, 0) / count).toFixed(2) : numRating;

    await challenge.update({
      communityRating: parseFloat(avg),
      communityRatingCount: count
    });

    const full = await CommunityFeedback.findByPk(record.id, {
      include: [{ model: UserModel, as: 'citizen', attributes: ['id', 'name', 'avatar', 'district', 'state'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your community feedback and impact rating have been recorded.',
      data: full,
      ratingStats: { communityRating: parseFloat(avg), communityRatingCount: count }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 10: GET /api/challenges/:id/community-feedbacks (and singular alias) ─── List Feedbacks ──
const getCommunityFeedbacksHandler = async (req, res) => {
  try {
    const { CommunityFeedback, User: UserModel } = require('../models');
    const feedbacks = await CommunityFeedback.findAll({
      where: { challengeId: req.params.id },
      include: [{ model: UserModel, as: 'citizen', attributes: ['id', 'name', 'avatar', 'district', 'state'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
router.get('/:id/community-feedbacks', optionalAuth, getCommunityFeedbacksHandler);
router.get('/:id/community-feedback', optionalAuth, getCommunityFeedbacksHandler);

// ─── Phase 10: PATCH /api/challenges/:id/mark-implemented ─── Nodal Officer Official Sign-off ──
router.patch('/:id/mark-implemented', protect, authorize('nodal_officer', 'admin'), async (req, res) => {
  try {
    const { beneficiaryCount, baselineMetric, targetMetric, actualMetric, handoverNotes, handoverStatus } = req.body;
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    const statusChoice = handoverStatus || 'implemented'; // 'implemented' | 'extended' | 'closed'

    await challenge.update({
      beneficiaryCount: Number(beneficiaryCount) || challenge.beneficiaryCount || 0,
      baselineMetric: baselineMetric || challenge.baselineMetric,
      targetMetric: targetMetric || challenge.targetMetric,
      actualMetric: actualMetric || challenge.actualMetric,
      handoverStatus: statusChoice,
      handoverNotes: handoverNotes || 'Project successfully validated by community beneficiaries and handed over to department.',
      handoverDate: new Date()
    });

    // Update solutions for this challenge to 'implemented'
    const { Solution } = require('../models');
    await Solution.update(
      {
        implementationStatus: 'implemented',
        implementationNotes: `Officially certified as implemented by ${req.user.name}. Verified beneficiaries: ${challenge.beneficiaryCount}.`
      },
      { where: { challengeId: challenge.id } }
    );

    // Notify submitter
    const { createNotification } = require('../utils/notifications');
    if (challenge.submitterId) {
      await createNotification({
        userId: challenge.submitterId,
        type: 'challenge_implemented',
        title: '🎉 Solution Successfully Implemented!',
        message: `Your reported problem "${challenge.title}" has been successfully solved and deployed by student teams with department oversight.`,
        relatedId: challenge.id,
        relatedType: 'challenge'
      });
    }

    res.json({
      success: true,
      message: `🎉 Project successfully marked as "${statusChoice}" with official government handover!`,
      data: challenge
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

module.exports = router;
