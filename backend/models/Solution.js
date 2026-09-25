const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Solution = sequelize.define('Solution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  approach: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  techStack: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  githubUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  demoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  // ─── Phase 6: Solution Proposal Structured Fields ───────────────────
  rootCauseAnalysis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  technicalArchitecture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  impactMetrics: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  budgetEstimate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timelineWeeks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  riskMitigation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // ─── Phase 6: 3-Tier Multi-Stakeholder Review Tracking ──────────────
  proposalStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'proposal_submitted' // 'proposal_submitted' | 'proposal_revision_required' | 'proposal_approved'
  },
  currentReviewTier: {
    type: DataTypes.INTEGER,
    defaultValue: 1 // 1: Faculty, 2: University Coordinator, 3: Govt Nodal Officer
  },
  // Tier 1: Faculty Mentor
  facultyApproval: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending' // 'pending' | 'approved' | 'revision_required' | 'rejected'
  },
  facultyFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facultyApprovedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Tier 2: University Coordinator
  universityApproval: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  universityFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  universityApprovedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Tier 3: Govt Nodal Officer
  govtApproval: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  govtFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  govtApprovedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'draft', 'submitted', 'under_review', 'approved', 'selected', 'rejected'
    ),
    defaultValue: 'submitted'
  },
  // Expert evaluation (Phase 8: Multi-Axis Independent Prototype Evaluation)
  feasibilityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 10 }
  },
  innovationScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 10 }
  },
  impactScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 10 }
  },
  technicalScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 100 }
  },
  socialImpactScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 100 }
  },
  deploymentReadinessScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 100 }
  },
  compositeScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  pilotReadinessCertified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  evaluatedById: {
    type: DataTypes.UUID,
    allowNull: true
  },
  evaluatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  conflictCheckConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  identifiedRisks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expertFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Community vote count (cached)
  voteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Implementation tracking (Phase 7)
  implementationStatus: {
    type: DataTypes.ENUM(
      'not_started', 'in_progress', 'piloting', 'implemented', 'impact_measured'
    ),
    defaultValue: 'not_started'
  },
  implementationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Phase 9: Field Pilot Deployment Tracking
  pilotRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pilotRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  pilotRequestDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pilotPermitGranted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pilotPermitNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pilotSiteLocation: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pilotPermitGrantedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  pilotPermitOfficerNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pilotStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'none' // 'none' | 'requested' | 'approved' | 'running' | 'completed'
  }
}, {
  timestamps: true
});

module.exports = Solution;
