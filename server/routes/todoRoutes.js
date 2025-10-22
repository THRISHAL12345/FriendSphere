const express = require("express");
const router = express.Router();
const { getRoomTodos } = require("../controllers/todoController");
const { protect } = require("../middleware/authMiddleware");

router.route("/room/:roomId").get(protect, getRoomTodos);

module.exports = router;
