const express = require("express");
const router = express.Router();
const {
  uploadPhoto,
  getRoomPhotos,
  deletePhoto, // <-- 1. Import the delete function
} = require("../controllers/photoController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// --- Route for uploading photos to a specific room ---
// Requires authentication (protect) and handles single file upload named 'image' (upload.single)
router
  .route("/room/:roomId/upload")
  .post(protect, upload.single("image"), uploadPhoto);

// --- Route for getting all photos for a specific room ---
router.route("/room/:roomId").get(protect, getRoomPhotos);

// --- 2. ADD THIS: Route for deleting a specific photo by its ID ---
router.route("/:photoId").delete(protect, deletePhoto);

module.exports = router;
