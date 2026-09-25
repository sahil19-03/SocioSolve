const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 100] }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(
      'citizen',           // Problem Submitter (individual / community org / govt body)
      'student',           // Student innovator
      'faculty',           // Faculty Mentor at an HEI
      'expert',            // Industry / domain expert evaluator
      'university_admin',  // Higher Education Institution coordinator
      'industry_partner',  // Company / startup / MSME / CSR partner
      'community',         // Community voter
      'admin',             // Platform Administrator
      'nodal_officer'      // Government Nodal Officer / Department Representative
    ),
    defaultValue: 'community'
  },

  // ─── Location & Contact ───────────────────────────────────────────
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ─── Organisation Info ─────────────────────────────────────────────
  organization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organizationType: {
    type: DataTypes.ENUM(
      'individual', 'government', 'ngo', 'institution', 'industry', 'community_org'
    ),
    defaultValue: 'individual'
  },
  institutionType: {
    type: DataTypes.ENUM(
      'hei', 'startup', 'msme', 'csr', 'research_lab', 'govt', 'other'
    ),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  registrationNo: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ─── Student / Faculty Fields ──────────────────────────────────────
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  university: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ─── Account Status ────────────────────────────────────────────────
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
