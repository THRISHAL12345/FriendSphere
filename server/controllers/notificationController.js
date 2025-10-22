const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// @desc    Get my unread notifications
// @route   GET /api/notifications/my
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
  }).sort({ createdAt: -1 }); // Show newest first
  res.status(200).json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // Security check: Make sure user can only mark their own notifications as read
  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  notification.isRead = true;
  await notification.save();
  res.status(200).json({ message: "Notification marked as read" });
});

module.exports = {
  getMyNotifications,
  markAsRead,
};
