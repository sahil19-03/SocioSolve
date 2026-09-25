const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Milestone — Project lifecycle tracking for a Team.
 * Each team can have multiple milestones that define deliverables
 * and progress towards solving an assigned Challenge.
 */
const Milestone = sequelize.define('Milestone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [3, 200] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
    defaultValue: 'pending'
  },
  // Ordered position within the team's milestone list
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Expected deliverables (e.g. ["Working prototype", "Test report"])
  deliverables: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  // Uploaded evidence files
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  // Notes from mentor on completion
  mentorFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Foreign keys set via associations in index.js
  // teamId, approvedById
}, {
  timestamps: true
});

module.exports = Milestone;
