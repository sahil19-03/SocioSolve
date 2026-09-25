const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

// ─── GET /api/notifications — Current user's notifications ────────
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (unreadOnly === 'true') where.isRead = false;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const unreadCount = await Notification.count({ where: { userId: req.user.id, isRead: false } });

    res.json({
      success: true,
      data: rows,
      unreadCount,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/notifications/unread-count ──────────────────────────
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.count({ where: { userId: req.user.id, isRead: false } });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/notifications/:id/read — Mark one as read ───────────
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    await notification.update({ isRead: true });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/notifications/read-all — Mark all as read ───────────
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/notifications/:id ────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
