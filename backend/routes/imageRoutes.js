const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
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

// Image Routes
router.post("/jpg-to-png",    upload.single("image"), imageController.jpgToPng);
router.post("/png-to-jpg",    upload.single("image"), imageController.pngToJpg);
router.post("/compress",      upload.single("image"), imageController.compressImage);
router.post("/webp", upload.single("image"), imageController.toWebp);
router.post("/img-to-pdf",    upload.single("image"), imageController.imgToPdf);
router.post('/webp-to-jpg', upload.single('image'), imageController.webpToJpg);
router.post('/heic-to-jpg',upload.single('image'),imageController.heicToJpg);
router.post('/svg-to-png',upload.single('image'),imageController.svgToPng);
router.post('/crop-image',upload.single('image'),imageController.cropImage);
router.post('/resize', upload.single('image'), imageController.resizeImage);
router.post('/upscale-image',upload.single('image'),imageController.upscaleImage);
router.post('/rotate-flip',upload.single('image'),imageController.rotateFlipImage);

module.exports = router;