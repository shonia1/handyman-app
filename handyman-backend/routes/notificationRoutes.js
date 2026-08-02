// routes/notificationRoutes.js
const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require("../controllers/notificationController");

const router = express.Router();

router.route("/").get(protect, getNotifications);
router.route("/unread-count").get(protect, getUnreadCount);
router.route("/read-all").patch(protect, markAllAsRead);
router.route("/:id/read").patch(protect, markAsRead);

module.exports = router;