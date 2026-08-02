// controllers/notificationController.js
const Notification = require("../models/Notification");

// @desc    Get user notifications (unread first)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, read: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};