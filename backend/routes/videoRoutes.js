const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const multer = require("multer");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Video Routes
router.post("/mp4-to-mp3",   upload.single("video"), videoController.mp4ToMp3);
router.post("/compress",     upload.single("video"), videoController.compressVideo);
router.post("/trim",         upload.single("video"), videoController.trimVideo);
router.post("/to-avi",       upload.single("video"), videoController.toAvi);
router.post("/to-mkv",       upload.single("video"), videoController.toMkv);

module.exports = router;