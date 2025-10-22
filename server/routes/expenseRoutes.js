const express = require("express");
const router = express.Router();
const {
  createExpense,
  settleExpense,
  getRoomExpenses,
  getExpenseDashboard,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router
  .route("/room/:roomId")
  .post(protect, createExpense)
  .get(protect, getRoomExpenses);
router.route("/:expenseId/settle").put(protect, settleExpense);
router.route("/dashboard").get(protect, getExpenseDashboard);

module.exports = router;
