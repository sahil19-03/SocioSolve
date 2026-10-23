const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Junction table: Users <-> Teams (many-to-many)
const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('leader', 'member'),
    defaultValue: 'member'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'removed'),
    defaultValue: 'active'
  },
  skillRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  requestMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = TeamMember;
