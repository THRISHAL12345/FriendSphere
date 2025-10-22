const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");

// --- Helper function to format the user response ---
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePictureUrl: user.profilePictureUrl, // Include the profile pic URL
  token: generateToken(user._id),
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, dateOfBirth, phoneNumber, upiId } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    dateOfBirth,
    phoneNumber,
    upiId,
  });

  if (user) {
    res.status(201).json(formatUserResponse(user)); // Use helper
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json(formatUserResponse(user)); // Use helper
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Update user profile picture
// @route   PUT /api/users/profile/picture
// @access  Private
const updateUserProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image");
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: `friendsphere/profile_pictures`,
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "face", // Automatically center on the face
  });

  const user = await User.findById(req.user._id);

  if (user) {
    user.profilePictureUrl = result.secure_url;
    const updatedUser = await user.save();
    res.json(formatUserResponse(updatedUser)); // Send back updated user info
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  updateUserProfilePicture,
};
