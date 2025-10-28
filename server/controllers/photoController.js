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
  // Use .some() and toString() for correct comparison
  if (
    !room.members.some(
      (memberId) => memberId.toString() === uploaderId.toString()
    )
  ) {
    res.status(401);
    throw new Error("You are not a member of this room");
  }

  // Validation: Ensure the section is either 'group' or a valid member ID string
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

  // Populate uploader info before sending response
  const populatedPhoto = await photo.populate(
    "uploader",
    "name profilePictureUrl"
  );

  res.status(201).json(populatedPhoto);
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
  // Use .some() and toString() for correct comparison
  if (
    !room.members.some((memberId) => memberId.toString() === userId.toString())
  ) {
    res.status(401);
    throw new Error("Not authorized to view this gallery");
  }

  // Populate uploader name and profile picture
  const photos = await Photo.find({ room: roomId })
    .populate("uploader", "name profilePictureUrl")
    .sort({ createdAt: "desc" }); // Show newest first

  res.status(200).json(photos);
});

// @desc    Delete a photo
// @route   DELETE /api/photos/:photoId
// @access  Private (Uploader or Room Owner)
const deletePhoto = asyncHandler(async (req, res) => {
  const photo = await Photo.findById(req.params.photoId);

  if (!photo) {
    res.status(404);
    throw new Error("Photo not found");
  }

  const room = await Room.findById(photo.room);
  if (!room) {
    res.status(404); // Should not happen often
    throw new Error("Room associated with the photo not found");
  }

  // Security Check: Allow deletion only by the uploader or the room owner
  const isUploader = photo.uploader.toString() === req.user._id.toString();
  const isRoomOwner = room.owner.toString() === req.user._id.toString();

  if (!isUploader && !isRoomOwner) {
    res.status(401);
    throw new Error("Not authorized to delete this photo");
  }

  // Optional: Delete from Cloudinary as well
  // Extract public_id from imageUrl (more robust extraction might be needed depending on URL structure)
  try {
    // Example: "https://res.cloudinary.com/demo/image/upload/v1573668049/friendsphere/roomId/filename.jpg"
    // Needs "friendsphere/roomId/filename"
    const urlParts = photo.imageUrl.split("/");
    const versionIndex = urlParts.findIndex(
      (part) => part.startsWith("v") && !isNaN(parseInt(part.substring(1)))
    );
    if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
      const publicIdWithExtension = urlParts.slice(versionIndex + 1).join("/");
      const publicId = publicIdWithExtension.substring(
        0,
        publicIdWithExtension.lastIndexOf(".")
      ); // Remove extension
      if (publicId) {
        console.log(`Attempting to delete Cloudinary image: ${publicId}`);
        await cloudinary.uploader.destroy(publicId);
      }
    }
  } catch (cloudinaryError) {
    // Log the error but don't stop the database deletion
    console.error("Cloudinary delete error (non-critical):", cloudinaryError);
  }

  // Delete from MongoDB
  await photo.deleteOne(); // Use deleteOne() on the document instance

  res.status(200).json({ message: "Photo deleted successfully" });
});

module.exports = {
  uploadPhoto,
  getRoomPhotos,
  deletePhoto, // Export the new delete function
};
