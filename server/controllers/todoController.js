const asyncHandler = require("express-async-handler");
const Todo = require("../models/Todo");

// @desc    Get all todos for a room
// @route   GET /api/todos/room/:roomId
// @access  Private
const getRoomTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({ room: req.params.roomId })
    .populate("createdBy", "name profilePictureUrl")
    .populate("completedBy", "name")
    .sort({ createdAt: "desc" }); // Show newest first

  res.status(200).json(todos);
});

module.exports = {
  getRoomTodos,
};
