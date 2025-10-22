const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");

// @desc    Get all messages for a room
// @route   GET /api/messages/room/:roomId
// @access  Private
const getRoomMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ room: req.params.roomId })
    // --- vvv THIS IS THE UPDATE vvv ---
    .populate("sender", "name profilePictureUrl")
    // --- ^^^ THIS IS THE UPDATE ^^^ ---
    .sort({ createdAt: "asc" });

  res.status(200).json(messages);
});

module.exports = {
  getRoomMessages,
};
