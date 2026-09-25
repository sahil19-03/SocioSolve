const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('discussion', 'mentor_feedback', 'expert_feedback', 'general'),
    defaultValue: 'general'
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true   // for threaded replies
  }
}, {
  timestamps: true
});

module.exports = Comment;
