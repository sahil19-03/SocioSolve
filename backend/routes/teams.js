const express = require('express');
const { Op } = require('sequelize');
const { Team, TeamMember, User, Challenge } = require('../models');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');

const router = express.Router();

// ─── Phase 5: GET /api/teams/my ─── Current user's teams ─────────────
router.get('/my', protect, async (req, res) => {
  try {
    const memberships = await TeamMember.findAll({
      where: { UserId: req.user.id },
      attributes: ['TeamId']
    });
    const teamIds = memberships.map(m => m.TeamId);

    const teams = await Team.findAll({
      where: {
        [Op.or]: [
          { leaderId: req.user.id },
          { id: { [Op.in]: teamIds } }
        ]
      },
      include: [
        { model: User, as: 'leader', attributes: ['id', 'name', 'avatar', 'university'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'avatar', 'university', 'skills'], through: { attributes: ['role', 'joinedAt'] } },
        { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization', 'bio'] },
        { model: Challenge, attributes: ['id', 'title', 'category', 'status', 'submissionCode'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 5: GET /api/teams/university ─── University Coordinator: teams from this HEI ─
router.get('/university', protect, authorize('university_admin', 'admin'), async (req, res) => {
  try {
    // Find challenges assigned to this HEI or teams tagged with universityId
    const challenges = await Challenge.findAll({
      where: {
        [Op.or]: [
          { assignedUniversityId: req.user.id },
          { institutionInterestId: req.user.id }
        ]
      },
      attributes: ['id']
    });
    const challengeIds = challenges.map(c => c.id);

    const teams = await Team.findAll({
      where: {
        [Op.or]: [
          { universityId: req.user.id },
          { challengeId: { [Op.in]: challengeIds } }
        ]
      },
      include: [
        { model: User, as: 'leader', attributes: ['id', 'name', 'avatar', 'university', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'avatar', 'university', 'skills'], through: { attributes: ['role', 'joinedAt'] } },
        { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization', 'bio'] },
        { model: Challenge, attributes: ['id', 'title', 'category', 'status', 'submissionCode'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 5: GET /api/teams/faculty-candidates ─── Available faculty for pairing ─
router.get('/faculty-candidates', protect, async (req, res) => {
  try {
    const faculty = await User.findAll({
      where: { role: 'faculty' },
      attributes: ['id', 'name', 'organization', 'state', 'district', 'bio', 'skills']
    });
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/teams/challenge/:challengeId ─── Teams for a challenge ─
router.get('/challenge/:challengeId', async (req, res) => {
  try {
    const teams = await Team.findAll({
      where: { challengeId: req.params.challengeId },
      include: [
        { model: User, as: 'leader', attributes: ['id', 'name', 'avatar', 'university'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'avatar', 'university', 'skills'], through: { attributes: ['role', 'joinedAt'] } },
        { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization'] }
      ]
    });
    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── POST /api/teams ─── Phase 5: Create a student team ───────────
router.post('/', protect, authorize('student', 'admin'), async (req, res) => {
  try {
    const { name, description, challengeId, maxMembers } = req.body;

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    if (!['published', 'verified', 'assigned', 'converted_to_project'].includes(challenge.status)) {
      return res.status(400).json({ success: false, message: 'Challenge is not currently open for student team formation.' });
    }

    // Determine university affiliation: from assigned challenge or student's university
    const universityId = challenge.assignedUniversityId || challenge.institutionInterestId || null;

    const team = await Team.create({
      name,
      description,
      challengeId,
      universityId,
      maxMembers: maxMembers || 5,
      leaderId: req.user.id,
      status: 'forming',
      isApprovedByCoordinator: false
    });

    // Creator is automatically the team leader
    await TeamMember.create({ TeamId: team.id, UserId: req.user.id, role: 'leader' });

    // Update challenge team count
    await challenge.increment('teamCount');

    res.status(201).json({
      success: true,
      message: `Team "${team.name}" created! Next: recruit peers and link your faculty mentor.`,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/teams/:id ─── Get single team detail ───────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        { model: User, as: 'leader', attributes: ['id', 'name', 'avatar', 'university', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'avatar', 'university', 'skills'], through: { attributes: ['role', 'joinedAt'] } },
        { model: User, as: 'facultyMentor', attributes: ['id', 'name', 'organization', 'bio'] },
        { model: User, as: 'industryExpert', attributes: ['id', 'name', 'organization', 'bio'] },
        { model: User, as: 'university', attributes: ['id', 'name', 'organization', 'website'] },
        { model: Challenge, attributes: ['id', 'title', 'category', 'status', 'submissionCode', 'location'] }
      ]
    });

    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── GET /api/teams/available-students ─── Search students for squad invitation ─
router.get('/available-students', protect, async (req, res) => {
  try {
    const { q = '' } = req.query;
    const query = q.trim().toLowerCase();

    const where = {
      role: 'student',
      id: { [Op.ne]: req.user.id }
    };

    if (query) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { university: { [Op.iLike]: `%${query}%` } }
      ];
    }

    const students = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'avatar', 'university', 'skills', 'role'],
      limit: 20
    });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── POST /api/teams/:id/join ─── Student joins a team ───────────
router.post('/:id/join', protect, authorize('student'), async (req, res) => {
  try {
    const { role } = req.body; // e.g. "IoT Specialist", "Frontend Lead", "Data Analyst"
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: Challenge, attributes: ['id', 'title'] }]
    });
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!team.isOpen) return res.status(400).json({ success: false, message: 'Team is closed to new members.' });

    const memberCount = await TeamMember.count({ where: { TeamId: team.id } });
    if (memberCount >= team.maxMembers) {
      return res.status(400).json({ success: false, message: 'Team is full.' });
    }

    const existing = await TeamMember.findOne({ where: { TeamId: team.id, UserId: req.user.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already in this team.' });
    }

    await TeamMember.create({ TeamId: team.id, UserId: req.user.id, role: role || 'member' });

    // Notify team leader of new member
    if (team.leaderId && team.leaderId !== req.user.id) {
      await createNotification({
        userId: team.leaderId,
        type: 'team_joined',
        title: '🤝 New Squad Teammate',
        message: `${req.user.name} joined squad "${team.name}" as ${role || 'Member'}.`,
        relatedId: team.id,
        relatedType: 'team'
      });
    }

    res.json({ success: true, message: `Successfully joined ${team.name}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── POST /api/teams/:id/add-member ─── Squad leader adds student directly ─────
router.post('/:id/add-member', protect, async (req, res) => {
  try {
    const { studentId, email, role } = req.body;
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: Challenge, attributes: ['id', 'title'] }]
    });
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    // Only leader or admin can add
    if (team.leaderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team leader can add members directly.' });
    }

    const memberCount = await TeamMember.count({ where: { TeamId: team.id } });
    if (memberCount >= team.maxMembers) {
      return res.status(400).json({ success: false, message: `Team has reached maximum capacity (${team.maxMembers} members).` });
    }

    let targetStudent = null;
    if (studentId) {
      targetStudent = await User.findByPk(studentId);
    } else if (email) {
      targetStudent = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    }

    if (!targetStudent) {
      return res.status(404).json({ success: false, message: 'Student user not found with specified ID or email.' });
    }

    const existing = await TeamMember.findOne({ where: { TeamId: team.id, UserId: targetStudent.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: `${targetStudent.name} is already a member of this squad.` });
    }

    await TeamMember.create({
      TeamId: team.id,
      UserId: targetStudent.id,
      role: role || 'Engineering Specialist'
    });

    // Notify the added student immediately in database
    await createNotification({
      userId: targetStudent.id,
      type: 'team_joined',
      title: '🎉 Added to Innovation Squad!',
      message: `You were added to squad "${team.name}" by ${req.user.name} as ${role || 'Engineering Specialist'} for challenge: "${team.Challenge?.title || 'Open Challenge'}".`,
      relatedId: team.id,
      relatedType: 'team'
    });

    res.json({
      success: true,
      message: `${targetStudent.name} has been added to ${team.name}!`,
      data: {
        id: targetStudent.id,
        name: targetStudent.name,
        email: targetStudent.email,
        role: role || 'Engineering Specialist'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 5: PATCH /api/teams/:id/assign-faculty ─── Pair Faculty Mentor ──
router.patch('/:id/assign-faculty', protect, authorize('faculty', 'university_admin', 'admin'), async (req, res) => {
  try {
    const { facultyMentorId } = req.body;
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    // If caller is faculty, they can pair themselves
    const mentorId = req.user.role === 'faculty' ? req.user.id : facultyMentorId;

    if (!mentorId) {
      return res.status(400).json({ success: false, message: 'Faculty Mentor ID is required.' });
    }

    const faculty = await User.findByPk(mentorId);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(400).json({ success: false, message: 'Invalid faculty member.' });
    }

    await team.update({ facultyMentorId: mentorId });

    // Notify team leader
    if (team.leaderId) {
      await createNotification({
        userId: team.leaderId,
        type: 'mentor_assigned',
        title: '👨‍🏫 Faculty Mentor Assigned',
        message: `Faculty mentor ${faculty.name} is now attached to your squad "${team.name}".`,
        relatedId: team.id,
        relatedType: 'team'
      });
    }

    res.json({
      success: true,
      message: `Faculty mentor ${faculty.name} attached to Team "${team.name}".`,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── Phase 5: PATCH /api/teams/:id/approve ─── University Coordinator Approves Team Constitution ──
router.patch('/:id/approve', protect, authorize('university_admin', 'admin'), async (req, res) => {
  try {
    const { coordinatorNotes } = req.body;
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: Challenge }]
    });
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    await team.update({
      isApprovedByCoordinator: true,
      coordinatorApprovalAt: new Date(),
      coordinatorNotes: coordinatorNotes || 'Approved by University Coordinator.',
      status: 'active'
    });

    // Also verify challenge status
    if (team.Challenge && team.Challenge.status === 'published') {
      await team.Challenge.update({
        status: 'converted_to_project',
        assignedUniversityId: req.user.id
      });
    }

    // Notify all squad members in database
    const members = await TeamMember.findAll({ where: { TeamId: team.id } });
    for (const m of members) {
      await createNotification({
        userId: m.UserId,
        type: 'team_approved',
        title: '🏛️ Squad Constitution Approved!',
        message: `Your squad "${team.name}" has been officially approved by the University Coordinator. You can now build and submit solutions!`,
        relatedId: team.id,
        relatedType: 'team'
      });
    }

    res.json({
      success: true,
      message: `Team "${team.name}" constitution approved! Team is now official and ready for solution proposal development.`,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── PUT /api/teams/:id ─── Update team (leader only) ────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (team.leaderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team leader can update the team.' });
    }

    const { name, description, maxMembers, isOpen, githubUrl, projectUrl } = req.body;
    await team.update({ name, description, maxMembers, isOpen, githubUrl, projectUrl });

    res.json({ success: true, message: 'Team updated.', data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

module.exports = router;
