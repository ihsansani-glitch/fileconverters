const express = require("express");
const router = express.Router();
const docController = require("../controllers/docController");
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

// Document Routes
router.post("/xlsx-to-csv", upload.single("file"), docController.xlsxToCsv);
router.post("/csv-to-xlsx", upload.single("file"), docController.csvToXlsx);
router.post("/word-to-pdf", upload.single("file"), docController.wordToPdf);
router.post("/xlsx-to-pdf", upload.single("file"), docController.xlsxToPdf);
router.post("/pdf-to-word", upload.single("pdf"), docController.pdfToWord);
router.post("/xlsx-to-word", upload.single("file"), docController.xlsxToWord);
router.post("/pdf-to-pptx", upload.single("file"), docController.pdfToPptx);
module.exports = router;