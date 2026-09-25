const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [3, 100] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 1, max: 10 }
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true  // open for new members to join
  },
  status: {
    type: DataTypes.ENUM('forming', 'team_formed', 'active', 'submitted', 'completed'),
    defaultValue: 'forming'
  },
  // University Affiliation & Coordinator Approval (Phase 5)
  universityId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isApprovedByCoordinator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  coordinatorApprovalAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  coordinatorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Mentor IDs stored for quick lookup
  facultyMentorId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  industryExpertId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // GitHub / project links
  githubUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Team;
