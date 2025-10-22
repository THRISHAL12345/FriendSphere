const express = require("express");
const router = express.Router();
const {
  createRoom,
  joinRoom,
  manageJoinRequest,
  getRoomDetails,
  getMyRooms,
  updateRoom,
  removeMember,
  deleteRoom,
} = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

// Get all my rooms or create a new one
router.route("/").post(protect, createRoom);
router.route("/myrooms").get(protect, getMyRooms);

// Routes for a specific room ID
router
  .route("/:id")
  .get(protect, getRoomDetails) // Get room details
  .put(protect, updateRoom) // Update room name
  .delete(protect, deleteRoom); // Delete the room

// Routes for managing members
router.route("/:id/join").post(protect, joinRoom);
router.route("/:id/manage").put(protect, manageJoinRequest);
router.route("/:id/remove").put(protect, removeMember);

module.exports = router;
