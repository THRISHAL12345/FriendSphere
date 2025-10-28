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

const deletePoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.pollId);

  if (!poll) {
    res.status(404);
    throw new Error("Poll not found");
  }

  // Security Check: Only creator or room owner can delete
  const room = await Room.findById(poll.room); // Need room to check owner
  if (!room) {
    res.status(404);
    throw new Error("Room not found for poll");
  }

  if (
    poll.createdBy.toString() !== req.user._id.toString() &&
    room.owner.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error("Not authorized to delete this poll");
  }

  await poll.deleteOne();
  res.status(200).json({ message: "Poll deleted" });
});

module.exports = {
  getRoomPolls,
  deletePoll,
};
