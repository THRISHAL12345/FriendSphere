const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Room", // Link to the Room model
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
    },
    // The user who paid the money and is OWED
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // The user who OWES the money
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "settled"], // The status can only be one of these two
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
