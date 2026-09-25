const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [10, 200] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'smart_city', 'environment', 'water', 'agriculture',
      'healthcare', 'education', 'accessibility', 'waste_management',
      'public_safety', 'energy', 'social_welfare', 'digital_services',
      'rural_livelihoods', 'urban_infrastructure', 'public_administration'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 'submitted', 'under_review', 'needs_information',
      'verified', 'published', 'assigned', 'converted_to_project',
      'rejected', 'duplicate', 'solved', 'archived'
    ),
    defaultValue: 'submitted'
  },
  submissionCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'intermediate'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  requiredSkills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  // ─── Location Fields ───────────────────────────────────────────────
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  gpsLat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  gpsLng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  impactScope: {
    type: DataTypes.ENUM('district', 'state', 'national'),
    defaultValue: 'district'
  },
  impactArea: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ─── Phase 1: Problem Submission Details ───────────────────────────
  affectedPopulation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  urgency: {
    type: DataTypes.STRING(30),
    defaultValue: 'medium'
  },
  expectedOutcome: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // ─── Media & Attachments ───────────────────────────────────────────
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  mediaUrls: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  // ─── University Routing & Phase 4 Institutional Expression of Interest ────────────
  assignedUniversityId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  institutionInterestId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  institutionInterestNote: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  institutionInterestAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  domainExpertise: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  // ─── AI Metadata ───────────────────────────────────────────────────
  priorityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 10 }
  },
  isDuplicate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  duplicateOfId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  similarityScore: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  aiCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ─── Submitter Info (denormalized) ─────────────────────────────────
  submitterOrg: {
    type: DataTypes.STRING,
    allowNull: true
  },
  submitterOrgType: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ─── Admin Fields ──────────────────────────────────────────────────
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // ─── Phase 2 & 3: Government Nodal Ownership ───────────────────────
  responsibleDepartment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nodalOfficerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  nodalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nodalDecision: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  reviewDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // ─── Stats (cached counters) ───────────────────────────────────────
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  teamCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  solutionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // ─── Phase 10: Community Feedback, Impact Validation & Implementation ──
  beneficiaryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  baselineMetric: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetMetric: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actualMetric: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  communityRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0
  },
  communityRatingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  handoverStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending' // 'pending' | 'handed_over' | 'extended' | 'closed'
  },
  handoverNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  handoverDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Challenge;
