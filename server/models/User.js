const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please add your date of birth"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please add a phone number"],
      unique: true,
    },
    upiId: {
      type: String,
      required: [true, "Please add your UPI ID"],
      unique: true,
    },
    profilePictureUrl: {
      type: String,
      default: "", // Or a URL to a default avatar
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- THIS IS THE CRUCIAL PART ---

// 1. This line compiles the schema into a usable model named "User".
const User = mongoose.model("User", userSchema);

// 2. This line EXPORTS the compiled model, not the schema.
module.exports = User;
