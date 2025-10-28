const express = require("express");
const router = express.Router();
// Import both getRoomPolls and deletePoll functions
const { getRoomPolls, deletePoll } = require("../controllers/pollController");
const { protect } = require("../middleware/authMiddleware");

// Route to get all polls for a specific room
router.route("/room/:roomId").get(protect, getRoomPolls);

// Route to delete a specific poll by its ID
router.route("/:pollId").delete(protect, deletePoll);

module.exports = router;
