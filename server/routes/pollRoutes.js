const express = require("express");
const router = express.Router();
const { getRoomPolls } = require("../controllers/pollController");
const { protect } = require("../middleware/authMiddleware");

router.route("/room/:roomId").get(protect, getRoomPolls);

module.exports = router;
