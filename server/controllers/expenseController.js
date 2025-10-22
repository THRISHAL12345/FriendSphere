const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const Room = require("../models/Room");

// @desc    Create a new expense
// @route   POST /api/expenses/room/:roomId
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
  const { description, amount, payeeId } = req.body;
  const roomId = req.params.roomId;
  const payerId = req.user._id;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  const isPayerMember = room.members.some(
    (memberId) => memberId.toString() === payerId.toString()
  );
  const isPayeeMember = room.members.some(
    (memberId) => memberId.toString() === payeeId
  );

  if (!isPayerMember || !isPayeeMember) {
    res.status(401);
    throw new Error("Payer or payee is not a member of this room");
  }

  const expense = await Expense.create({
    room: roomId,
    description,
    amount,
    payer: payerId,
    payee: payeeId,
    status: "pending",
  });
  res.status(201).json(expense);
});

// @desc    Settle an expense
// @route   PUT /api/expenses/:expenseId/settle
// @access  Private
const settleExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.expenseId);

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  if (expense.payer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to settle this expense");
  }
  expense.status = "settled";
  const updatedExpense = await expense.save();
  res.status(200).json(updatedExpense);
});

// @desc    Get all expenses for a room
// @route   GET /api/expenses/room/:roomId
// @access  Private
const getRoomExpenses = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.roomId);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  if (!room.members.includes(req.user._id)) {
    res.status(401);
    throw new Error("Not authorized to view these expenses");
  }
  const expenses = await Expense.find({ room: req.params.roomId })
    .populate("payer", "name")
    .populate("payee", "name");
  res.status(200).json(expenses);
});

// @desc    Get a user's personal expense dashboard
// @route   GET /api/expenses/dashboard
// @access  Private
const getExpenseDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // --- vvv THIS IS THE UPDATE vvv ---
  const moneyOwedToMe = await Expense.find({
    payer: userId,
    status: "pending",
  })
    .populate("payee", "name upiId profilePictureUrl")
    .populate("room", "name");

  const moneyIOwe = await Expense.find({
    payee: userId,
    status: "pending",
  })
    .populate("payer", "name upiId profilePictureUrl")
    .populate("room", "name");
  // --- ^^^ THIS IS THE UPDATE ^^^ ---

  res.status(200).json({ moneyOwedToMe, moneyIOwe });
});

module.exports = {
  createExpense,
  settleExpense,
  getRoomExpenses,
  getExpenseDashboard,
};
