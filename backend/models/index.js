const User              = require('./User');
const Challenge         = require('./Challenge');
const Team              = require('./Team');
const TeamMember        = require('./TeamMember');
const Solution          = require('./Solution');
const Vote              = require('./Vote');
const Comment           = require('./Comment');
const Milestone         = require('./Milestone');
const Notification      = require('./Notification');
const IndustryPartnership = require('./IndustryPartnership');

// ─── Challenge Associations ───────────────────────────────────────
Challenge.belongsTo(User, { as: 'submitter', foreignKey: 'submitterId' });
User.hasMany(Challenge, { as: 'submittedChallenges', foreignKey: 'submitterId' });

// University assigned to a challenge
Challenge.belongsTo(User, { as: 'assignedUniversity', foreignKey: 'assignedUniversityId' });
User.hasMany(Challenge, { as: 'assignedChallenges', foreignKey: 'assignedUniversityId' });

// Phase 4: University expressing interest
Challenge.belongsTo(User, { as: 'institutionInterest', foreignKey: 'institutionInterestId' });
User.hasMany(Challenge, { as: 'expressedInterestChallenges', foreignKey: 'institutionInterestId' });

// Government Nodal Officer assigned to a challenge
Challenge.belongsTo(User, { as: 'nodalOfficer', foreignKey: 'nodalOfficerId' });
User.hasMany(Challenge, { as: 'nodalChallenges', foreignKey: 'nodalOfficerId' });

// ─── Team Associations ────────────────────────────────────────────
Team.belongsTo(Challenge, { foreignKey: 'challengeId' });
Challenge.hasMany(Team, { foreignKey: 'challengeId' });

Team.belongsTo(User, { as: 'leader', foreignKey: 'leaderId' });
User.hasMany(Team, { as: 'ledTeams', foreignKey: 'leaderId' });

Team.belongsTo(User, { as: 'facultyMentor', foreignKey: 'facultyMentorId' });
User.hasMany(Team, { as: 'mentoredTeams', foreignKey: 'facultyMentorId' });

Team.belongsTo(User, { as: 'industryExpert', foreignKey: 'industryExpertId' });
User.hasMany(Team, { as: 'expertTeams', foreignKey: 'industryExpertId' });

// Phase 5: Team affiliated university coordinator
Team.belongsTo(User, { as: 'university', foreignKey: 'universityId' });
User.hasMany(Team, { as: 'campusTeams', foreignKey: 'universityId' });

// Team <-> User many-to-many through TeamMember
Team.belongsToMany(User, { through: TeamMember, as: 'members' });
User.belongsToMany(Team, { through: TeamMember, as: 'teams' });

// ─── Solution Associations ────────────────────────────────────────
Solution.belongsTo(Team, { foreignKey: 'teamId' });
Team.hasMany(Solution, { foreignKey: 'teamId' });

Solution.belongsTo(Challenge, { foreignKey: 'challengeId' });
Challenge.hasMany(Solution, { foreignKey: 'challengeId' });

Solution.belongsTo(User, { as: 'submittedBy', foreignKey: 'submittedById' });

// ─── Vote Associations ────────────────────────────────────────────
Vote.belongsTo(User, { foreignKey: 'UserId' });
Vote.belongsTo(Solution, { foreignKey: 'SolutionId' });
User.hasMany(Vote, { foreignKey: 'UserId' });
Solution.hasMany(Vote, { foreignKey: 'SolutionId' });

// ─── Comment Associations ─────────────────────────────────────────
Comment.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Comment.belongsTo(Challenge, { foreignKey: 'challengeId' });
Comment.belongsTo(Solution, { foreignKey: 'solutionId' });
User.hasMany(Comment, { foreignKey: 'authorId' });

// ─── Milestone Associations ───────────────────────────────────────
Milestone.belongsTo(Team, { foreignKey: 'teamId' });
Team.hasMany(Milestone, { foreignKey: 'teamId', as: 'milestones' });

Milestone.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });

const CommunityFeedback  = require('./CommunityFeedback');

// ─── Notification Associations ────────────────────────────────────
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// ─── IndustryPartnership Associations ─────────────────────────────
IndustryPartnership.belongsTo(User, { as: 'industryPartner', foreignKey: 'industryPartnerId' });
User.hasMany(IndustryPartnership, { as: 'partnerships', foreignKey: 'industryPartnerId' });

IndustryPartnership.belongsTo(Challenge, { foreignKey: 'challengeId' });
Challenge.hasMany(IndustryPartnership, { as: 'partnerships', foreignKey: 'challengeId' });

IndustryPartnership.belongsTo(Team, { foreignKey: 'teamId' });
Team.hasMany(IndustryPartnership, { as: 'partnerships', foreignKey: 'teamId' });

// ─── CommunityFeedback Associations (Phase 10) ────────────────────
CommunityFeedback.belongsTo(Challenge, { foreignKey: 'challengeId' });
Challenge.hasMany(CommunityFeedback, { as: 'communityFeedbacks', foreignKey: 'challengeId' });

CommunityFeedback.belongsTo(User, { as: 'citizen', foreignKey: 'citizenId' });
User.hasMany(CommunityFeedback, { foreignKey: 'citizenId' });

module.exports = {
  User, Challenge, Team, TeamMember, Solution,
  Vote, Comment, Milestone, Notification, IndustryPartnership, CommunityFeedback
};
