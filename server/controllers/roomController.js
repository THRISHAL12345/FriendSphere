const asyncHandler = require("express-async-handler");
const Room = require("../models/Room");
const User = require("../models/User"); // We need User for one of the functions

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Please provide a room name");
  }
  const room = await Room.create({
    name,
    owner: req.user._id,
    members: [req.user._id],
  });
  res.status(201).json(room);
});

// @desc    Send a request to join a room
// @route   POST /api/rooms/:id/join
// @access  Private
const joinRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  const userId = req.user._id;

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  if (room.members.includes(userId)) {
    res.status(400);
    throw new Error("You are already a member of this room");
  }
  if (room.pendingRequests.includes(userId)) {
    res.status(400);
    throw new Error("Join request already sent");
  }
  room.pendingRequests.push(userId);
  await room.save();
  res.status(200).json({ message: "Join request sent successfully" });
});

// @desc    Accept or reject a join request (Owner only)
// @route   PUT /api/rooms/:id/manage
// @access  Private (Owner)
const manageJoinRequest = asyncHandler(async (req, res) => {
  const { requestingUserId, action } = req.body;
  const roomId = req.params.id;
  const ownerId = req.user._id;

  const room = await Room.findById(roomId);

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  if (room.owner.toString() !== ownerId.toString()) {
    res.status(401);
    throw new Error("Not authorized to perform this action");
  }
  if (!room.pendingRequests.includes(requestingUserId)) {
    res.status(400);
    throw new Error("No pending request found for this user");
  }

  if (action === "accept") {
    room.members.push(requestingUserId);
    room.pendingRequests = room.pendingRequests.filter(
      (id) => id.toString() !== requestingUserId
    );
  } else if (action === "reject") {
    room.pendingRequests = room.pendingRequests.filter(
      (id) => id.toString() !== requestingUserId
    );
  } else {
    res.status(400);
    throw new Error('Invalid action. Must be "accept" or "reject".');
  }
  const updatedRoom = await room.save();
  res.status(200).json(updatedRoom);
});

// @desc    Get details for a single room (Members only)
// @route   GET /api/rooms/:id
// @access  Private (Members)
const getRoomDetails = asyncHandler(async (req, res) => {
  const roomId = req.params.id;
  const userId = req.user._id;

  const room = await Room.findById(roomId)
    .populate("owner", "name email upiId")
    // --- vvv THIS IS THE UPDATE vvv ---
    .populate("members", "name email upiId profilePictureUrl")
    .populate("pendingRequests", "name email profilePictureUrl");
  // --- ^^^ THIS IS THE UPDATE ^^^ ---

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  if (
    !room.members.some((member) => member._id.toString() === userId.toString())
  ) {
    res.status(401);
    throw new Error("Not authorized to view this room");
  }
  res.status(200).json(room);
});

// @desc    Get all rooms a user is part of
// @route   GET /api/rooms/myrooms
// @access  Private
const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ members: req.user._id });
  res.status(200).json(rooms);
});

// @desc    Update a room's name
// @route   PUT /api/rooms/:id
// @access  Private (Owner)
const updateRoom = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  if (room.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }
  room.name = name || room.name;
  const updatedRoom = await room.save();
  res.status(200).json(updatedRoom);
});

// @desc    Remove a member from a room
// @route   PUT /api/rooms/:id/remove
// @access  Private (Owner)
const removeMember = asyncHandler(async (req, res) => {
  const { memberId } = req.body;
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  if (room.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }
  if (memberId === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot remove yourself as owner");
  }
  room.members = room.members.filter((id) => id.toString() !== memberId);
  await room.save();
  res.status(200).json({ message: "Member removed" });
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private (Owner)
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  if (room.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }
  await room.deleteOne();
  res.status(200).json({ message: "Room deleted" });
});

module.exports = {
  createRoom,
  joinRoom,
  manageJoinRequest,
  getRoomDetails,
  getMyRooms,
  updateRoom,
  removeMember,
  deleteRoom,
};
