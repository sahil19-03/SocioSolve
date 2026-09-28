const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Notification — In-app notification for any user.
 * Created by the backend whenever a significant event occurs
 * (challenge assigned, milestone approved, solution reviewed, etc.)
 */
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Optional link back to the related entity
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  relatedType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Foreign key: userId set via associations in index.js
}, {
  timestamps: true,
  updatedAt: false   // Notifications are immutable once created
});

module.exports = Notification;
