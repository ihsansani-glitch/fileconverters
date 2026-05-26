const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib");
const puppeteer = require("puppeteer");
const archiver = require("archiver");

const OUTPUT_DIR = path.join(__dirname, "../outputs");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ==================================================
// IMAGE → PDF
// ==================================================
exports.imageToPdf = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ error: "No images uploaded" });

    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      const imgBytes = fs.readFileSync(file.path);
      let image;

      if (file.mimetype.includes("jpeg") || file.mimetype.includes("jpg")) {
        image = await pdfDoc.embedJpg(imgBytes);
      } else {
        image = await pdfDoc.embedPng(imgBytes);
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      fs.unlinkSync(file.path);
    }

    const fileName = `${Date.now()}-image.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// MERGE PDF
// ==================================================
exports.mergePdf = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ error: "No PDFs uploaded" });

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));

      fs.unlinkSync(file.path);
    }

    const fileName = `${Date.now()}-merged.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(outputPath, await mergedPdf.save());

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// SPLIT PDF
// ==================================================
exports.splitPdf = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const totalPages = pdfDoc.getPageCount();
    const downloadUrls = [];

    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(page);

      const fileName = `${Date.now()}-page-${i}.pdf`;
      const outputPath = path.join(OUTPUT_DIR, fileName);

      fs.writeFileSync(outputPath, await newPdf.save());

      downloadUrls.push(
        `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`
      );
    }

    fs.unlinkSync(req.file.path);

    res.json({ downloadUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// COMPRESS PDF
// ==================================================
exports.compressPdf = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const fileName = `${Date.now()}-compressed.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(
      outputPath,
      await pdfDoc.save({ useObjectStreams: true })
    );

    fs.unlinkSync(req.file.path);

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// PDF → WORD
// ==================================================
exports.pdfToWord = (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

    const inputPath = req.file.path;
    const fileName = `${Date.now()}.docx`;

    const cmd = `soffice --headless --convert-to docx --outdir "${OUTPUT_DIR}" "${inputPath}"`;

    exec(cmd, (err) => {
      if (err) {
        return res.status(500).json({
          error: "LibreOffice not installed or conversion failed",
        });
      }

      const generatedFile = inputPath.replace(".pdf", ".docx");
      const finalPath = path.join(OUTPUT_DIR, fileName);

      if (!fs.existsSync(generatedFile)) {
        return res.status(500).json({ error: "Converted file not found" });
      }

      fs.renameSync(generatedFile, finalPath);
      fs.unlinkSync(inputPath);

      res.json({
        downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// EDIT PDF
// ==================================================
exports.editPdf = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.getPages()[0];

    const { text, x, y } = req.body;

    page.drawText(text || "Edited", {
      x: Number(x) || 50,
      y: Number(y) || 50,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    const fileName = `${Date.now()}-edited.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(outputPath, await pdfDoc.save());
    fs.unlinkSync(req.file.path);

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// PPTX → PDF
// ==================================================
exports.pptxToPdf = (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file)
      return res.status(400).json({ error: "No PPTX uploaded" });

    const inputPath = file.path;
    const outputFileName = `${Date.now()}.pdf`;
    const finalPath = path.join(OUTPUT_DIR, outputFileName);

    const uploadedBaseName = path.basename(
      inputPath,
      path.extname(inputPath)
    );

    const cmd = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${inputPath}"`;

    exec(cmd, (err) => {
      if (err) {
        return res.status(500).json({
          error: "LibreOffice conversion failed",
        });
      }

      const generatedPath = path.join(
        OUTPUT_DIR,
        `${uploadedBaseName}.pdf`
      );

      if (!fs.existsSync(generatedPath)) {
        return res.status(500).json({
          error: "Converted file not found",
        });
      }

      fs.renameSync(generatedPath, finalPath);
      fs.unlinkSync(inputPath);

      res.json({
        downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${outputFileName}`,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// PDF → JPG (FIXED - SINGLE VERSION)
// ==================================================
exports.pdfToJpg = (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

    const inputPath = path.resolve(req.file.path);
    const uploadedBaseName = path.basename(
      inputPath,
      path.extname(inputPath)
    );

    const tempFolder = path.join(OUTPUT_DIR, uploadedBaseName);
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);

    const outputPattern = path.join(tempFolder, "page-%04d.jpg");

    const magickPath =
      "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

    const cmd = `"${magickPath}" -density 150 "${inputPath}" -quality 90 "${outputPattern}"`;

    exec(cmd, (err) => {
      if (err) {
        return res.status(500).json({
          error: "ImageMagick conversion failed",
        });
      }

      const jpgFiles = fs
        .readdirSync(tempFolder)
        .filter((f) => f.endsWith(".jpg"));

      if (!jpgFiles.length) {
        return res.status(500).json({
          error: "No JPG files created",
        });
      }

      const zipFileName = `${Date.now()}-images.zip`;
      const zipPath = path.join(OUTPUT_DIR, zipFileName);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        jpgFiles.forEach((f) =>
          fs.unlinkSync(path.join(tempFolder, f))
        );
        fs.rmdirSync(tempFolder);
        fs.unlinkSync(inputPath);

        res.json({
          downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${zipFileName}`,
        });
      });

      archive.on("error", (err) => {
        res.status(500).json({ error: err.message });
      });

      archive.pipe(output);

      jpgFiles.sort().forEach((f) => {
        archive.file(path.join(tempFolder, f), { name: f });
      });

      archive.finalize();
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// SIGN PDF
// ==================================================
exports.signPdf = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

    const { signatureData, pageNum, x, y, width, height } = req.body;

    if (!signatureData)
      return res.status(400).json({ error: "No signature data" });

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    const page = pages[parseInt(pageNum) || 0];

    const base64Data = signatureData.replace(
      /^data:image\/png;base64,/,
      ""
    );

    const sigBuffer = Buffer.from(base64Data, "base64");
    const sigImage = await pdfDoc.embedPng(sigBuffer);

    const { width: pageW, height: pageH } = page.getSize();

    const sigW = parseFloat(width) || 150;
    const sigH = parseFloat(height) || 60;
    const sigX = parseFloat(x) || pageW / 2;
    const sigY = pageH - (parseFloat(y) || 100);

    page.drawImage(sigImage, {
      x: sigX,
      y: sigY,
      width: sigW,
      height: sigH,
    });

    const fileName = `${Date.now()}-signed.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(outputPath, await pdfDoc.save());
    fs.unlinkSync(req.file.path);

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// WATERMARK PDF
// ==================================================
exports.watermarkPdf = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

    const {
      text = "CONFIDENTIAL",
      fontSize = "48",
      opacity = "0.15",
      color = "808080",
      diagonal = "true",
    } = req.body;

    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      if (diagonal === "true") {
        const size = parseInt(fontSize);

        const textLen = text.length * size * 0.6;
        const spacingX = textLen + 80;
        const spacingY = size + 80;

        for (let x = -spacingX; x < width + spacingX; x += spacingX) {
          for (let y = -spacingY; y < height + spacingY; y += spacingY) {
            page.drawText(text, {
              x,
              y,
              size,
              color: rgb(r, g, b),
              opacity: parseFloat(opacity),
              rotate: degrees(45),
            });
          }
        }
      }
    }

    const fileName = `${Date.now()}-watermarked.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(outputPath, await pdfDoc.save());
    fs.unlinkSync(req.file.path);

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// HTML → PDF (FIXED FOR RENDER)
// ==================================================
exports.htmlToPdf = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url)
      return res.status(400).json({ error: "URL required" });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    const fileName = `${Date.now()}-website.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}`,
    });
  } catch (err) {
    res.status(500).json({
      error: "HTML to PDF conversion failed",
    });
  }
};