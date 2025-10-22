const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.route("/my").get(protect, getMyNotifications);
router.route("/:id/read").put(protect, markAsRead);

module.exports = router;
