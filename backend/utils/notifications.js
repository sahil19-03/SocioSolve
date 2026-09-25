/**
 * Notification utility — creates in-app notifications.
 * Import and call createNotification() from any route.
 */
const { Notification, User } = require('../models');

/**
 * @param {object} opts
 * @param {string|null} opts.userId   — target user ID (null if notifyAdmins)
 * @param {string}      opts.type     — notification type enum
 * @param {string}      opts.title
 * @param {string}      opts.message
 * @param {string}      [opts.relatedId]
 * @param {string}      [opts.relatedType]
 * @param {boolean}     [opts.notifyAdmins] — if true, send to all admins
 */
async function createNotification(opts) {
  try {
    const { userId, type, title, message, relatedId, relatedType, notifyAdmins } = opts;

    if (notifyAdmins) {
      // Send to all platform admins
      const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
      await Promise.all(
        admins.map(admin =>
          Notification.create({ userId: admin.id, type, title, message, relatedId, relatedType })
        )
      );
    } else if (userId) {
      await Notification.create({ userId, type, title, message, relatedId, relatedType });
    }
  } catch (err) {
    // Never crash the parent request over a notification failure
    console.warn('Notification creation failed:', err.message);
  }
}

module.exports = { createNotification };
