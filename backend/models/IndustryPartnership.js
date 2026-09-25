const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * IndustryPartnership — Records industry/startup engagement with challenges or teams.
 * Covers mentoring, funding, prototyping, CSR, and technology transfer arrangements.
 */
const IndustryPartnership = sequelize.define('IndustryPartnership', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM(
      'mentoring',
      'funding',
      'prototyping',
      'csr',
      'technology_transfer',
      'co_development',
      'pilot_implementation'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('proposed', 'under_review', 'accepted', 'active', 'completed', 'rejected'),
    defaultValue: 'proposed'
  },
  // Proposal description from the industry partner
  proposal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Optional funding amount (in INR)
  fundingAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  // Link to signed MoU / agreement document
  agreementUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Admin / team notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Foreign keys: industryPartnerId, challengeId, teamId — set via associations in index.js
}, {
  timestamps: true
});

module.exports = IndustryPartnership;
