const mongoose = require("mongoose");
const { Schema } = mongoose;

// This is a sub-document schema for each option in a poll
const optionSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const pollSchema = new Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Room",
    },
    question: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    options: [optionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Poll", pollSchema);
