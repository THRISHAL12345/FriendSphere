const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUserProfilePicture,
  forgotPassword, // <-- Import
  resetPassword, // Import
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword); // <-- Add route
router.route("/reset-password/:token").patch(resetPassword);

// Protected route for profile picture update
router
  .route("/profile/picture")
  .put(protect, upload.single("image"), updateUserProfilePicture);

module.exports = router;
