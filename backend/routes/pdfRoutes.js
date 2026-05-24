const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const pdfController = require("../controllers/pdfController");

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ================= PDF ROUTES =================
router.post("/img-to-pdf", upload.array("images"), pdfController.imageToPdf);

router.post("/merge-pdf", upload.array("pdfs"), pdfController.mergePdf);

router.post("/split-pdf", upload.single("pdf"), pdfController.splitPdf);

router.post("/compress-pdf", upload.single("pdf"), pdfController.compressPdf);

router.post("/pdf-to-word", upload.single("pdf"), pdfController.pdfToWord);

router.post("/edit-pdf", upload.single("pdf"), pdfController.editPdf);

router.post("/pptx-to-pdf", upload.any(), pdfController.pptxToPdf);
router.post("/pdf-to-jpg", upload.single("pdf"), pdfController.pdfToJpg);
router.post("/sign-pdf",      upload.single("pdf"),  pdfController.signPdf)
router.post("/watermark-pdf", upload.single("pdf"),  pdfController.watermarkPdf)
router.post("/html-to-pdf", pdfController.htmlToPdf)
module.exports = router;