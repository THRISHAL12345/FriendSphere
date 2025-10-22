const asyncHandler = require("express-async-handler");
const Photo = require("../models/Photo");
const Room = require("../models/Room");
const cloudinary = require("../config/cloudinary");

// @desc    Upload a photo to a room's gallery
// @route   POST /api/photos/room/:roomId/upload
// @access  Private
const uploadPhoto = asyncHandler(async (req, res) => {
  const { section, description } = req.body;
  const roomId = req.params.roomId;
  const uploaderId = req.user._id;

  // Check if a file was actually uploaded
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a file");
  }

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  // Security Check: Ensure the uploader is a member of the room
  if (!room.members.includes(uploaderId)) {
    res.status(401);
    throw new Error("You are not a member of this room");
  }

  // Validation: Ensure the section is either 'group' or a valid member ID
  if (
    section !== "group" &&
    !room.members.some((m) => m.toString() === section)
  ) {
    res.status(400);
    throw new Error("Invalid section provided.");
  }

  // Upload image to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: `friendsphere/${roomId}`, // Organize uploads in folders
    resource_type: "image",
  });

  // Create a new photo document in our database
  const photo = await Photo.create({
    room: roomId,
    imageUrl: result.secure_url,
    uploader: uploaderId,
    section,
    description,
  });

  res.status(201).json(photo);
});

// @desc    Get all photos for a room
// @route   GET /api/photos/room/:roomId
// @access  Private
const getRoomPhotos = asyncHandler(async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.user._id;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  // Security Check: Only room members can view photos
  if (!room.members.includes(userId)) {
    res.status(401);
    throw new Error("Not authorized to view this gallery");
  }

  const photos = await Photo.find({ room: roomId }).populate(
    "uploader",
    "name"
  );
  res.status(200).json(photos);
});

module.exports = {
  uploadPhoto,
  getRoomPhotos,
};
