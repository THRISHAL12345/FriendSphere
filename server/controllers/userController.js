const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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

// --- ADD THIS FUNCTION ---
// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  // 1. Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal if user exists or not for security
    res.status(404); // Or maybe 200 OK to prevent email enumeration
    throw new Error(
      "If an account with that email exists, a reset link has been sent."
    );
  }

  // 2. Generate the random reset token (plain text version)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 3. Hash the token and set it in the user document
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 4. Set token expiry (e.g., 10 minutes from now)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes in ms

  await user.save({ validateBeforeSave: false }); // Save, skipping validations if needed

  // 5. Create the reset URL (frontend URL + plain token)
  //    Make sure FRONTEND_URL is set in your .env or replace directly
  const resetURL = `${
    process.env.FRONTEND_URL || "https://friendhub.netlify.app"
  }/reset-password/${resetToken}`;

  const message = `Forgot your password? Click the link below to reset it. This link is valid for 10 minutes.`;
  const html = `
    <p>${message}</p>
    <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your FriendSphere Password Reset Link (valid for 10 min)",
      message, // Fallback for non-HTML clients
      html, // HTML version of the email
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    // If email fails, clear the token from the DB to allow retry
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error("EMAIL ERROR:", err);
    res.status(500);
    throw new Error("There was an error sending the email. Try again later.");
  }
});

// --- ADD THIS FUNCTION ---
// @desc    Reset password using token
// @route   PATCH /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // 1. Get user based on the hashed token and ensure it hasn't expired
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token) // Hash the token from the URL
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Check if expiry is in the future
  });

  // 2. If token is invalid or expired
  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or has expired");
  }

  // 3. If token is valid, set the new password
  if (!req.body.password || req.body.password !== req.body.confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match or are missing");
  }
  user.password = req.body.password; // Mongoose 'pre-save' hook will hash it
  user.passwordResetToken = undefined; // Invalidate the token
  user.passwordResetExpires = undefined;
  await user.save();

  // 4. Log the user in (optional, or just send success)
  // You could generate a new JWT here and send it back
  res.status(200).json({
    status: "success",
    message: "Password reset successful. Please log in.",
    // token: generateToken(user._id), // Optionally log them in directly
  });
});

// --- Make sure to export the new functions ---
module.exports = {
  registerUser,
  loginUser,
  updateUserProfilePicture,
  forgotPassword, // <-- Add this
  resetPassword, // <-- Add this
};
