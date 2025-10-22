const express = require("express");
const router = express.Router();
const {
  uploadPhoto,
  getRoomPhotos,
} = require("../controllers/photoController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Note the order: protect -> upload.single('image') -> controller
router
  .route("/room/:roomId/upload")
  .post(protect, upload.single("image"), uploadPhoto);

router.route("/room/:roomId").get(protect, getRoomPhotos);

module.exports = router;
