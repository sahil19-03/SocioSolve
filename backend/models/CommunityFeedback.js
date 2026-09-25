const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * CommunityFeedback — Phase 10: Feedback & satisfaction rating submitted
 * by local citizens / community beneficiaries after pilot or deployment.
 */
const CommunityFeedback = sequelize.define('CommunityFeedback', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  verifiedImpact: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
  // Foreign keys: challengeId, citizenId
}, {
  timestamps: true
});

module.exports = CommunityFeedback;
