const asyncHandler = require("express-async-handler");
const Poll = require("../models/Poll");

// @desc    Get all polls for a room
// @route   GET /api/polls/room/:roomId
// @access  Private
const getRoomPolls = asyncHandler(async (req, res) => {
  const polls = await Poll.find({ room: req.params.roomId })
    .populate("createdBy", "name profilePictureUrl")
    .populate("options.votes", "name profilePictureUrl") // Get info on who voted
    .sort({ createdAt: "desc" }); // Show newest first

  res.status(200).json(polls);
});

module.exports = {
  getRoomPolls,
};
