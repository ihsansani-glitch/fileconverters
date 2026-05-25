const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const OUTPUT_DIR = path.join(__dirname, "../outputs");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
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
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

      fs.unlinkSync(file.path);
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `${Date.now()}-image.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(outputPath, pdfBytes);

    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}` });
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

    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// SPLIT PDF
// ==================================================
exports.splitPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

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

      downloadUrls.push(`https://fileconverters-lf0e.onrender.com/outputs/${fileName}`);
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
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const fileName = `${Date.now()}-compressed.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(
      outputPath,
      await pdfDoc.save({ useObjectStreams: true })
    );

    fs.unlinkSync(req.file.path);

    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// PDF → WORD
// ==================================================
exports.pdfToWord = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const inputPath = req.file.path;
    const fileName = `${Date.now()}.docx`;

    const cmd = `soffice --headless --convert-to docx --outdir "${OUTPUT_DIR}" "${inputPath}"`;

    exec(cmd, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Conversion failed (LibreOffice missing or not installed)" });
      }

      const generatedFile = inputPath.replace(".pdf", ".docx");
      const finalPath = path.join(OUTPUT_DIR, fileName);

      if (fs.existsSync(generatedFile)) {
        fs.renameSync(generatedFile, finalPath);
      } else {
        return res.status(500).json({ error: "Converted file not found" });
      }

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
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

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

    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${fileName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================================================
// PPTX → PDF (FIXED)
// ==================================================
exports.pptxToPdf = (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ error: "No PPTX uploaded" });

    const inputPath = file.path;
    const outputFileName = `${Date.now()}.pdf`;
    const finalPath = path.join(OUTPUT_DIR, outputFileName);

    // Get the base name multer gave the file (without extension)
    const uploadedBaseName = path.basename(inputPath, path.extname(inputPath));

    const cmd = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${inputPath}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("LibreOffice error:", stderr);
        return res.status(500).json({ error: "Conversion failed. Is LibreOffice installed?" });
      }

      // LibreOffice names output after the input file's base name
      const generatedPath = path.join(OUTPUT_DIR, `${uploadedBaseName}.pdf`);

      if (fs.existsSync(generatedPath)) {
        fs.renameSync(generatedPath, finalPath);
      } else {
        console.error("Expected file not found:", generatedPath);
        return res.status(500).json({ error: "Converted file not found" });
      }

      fs.unlinkSync(inputPath);

      res.json({
        downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${outputFileName}`,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//pdf to jpg

exports.pdfToJpg = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' })

    const archiver = require('archiver')
    const inputPath = path.resolve(req.file.path)
    const outputDir = path.resolve(path.join(__dirname, '../outputs'))
    const uploadedBaseName = path.basename(inputPath, path.extname(inputPath))

    // Create temp folder for jpg files
    const tempFolder = path.join(outputDir, uploadedBaseName)
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder)

    const outputPattern = path.join(tempFolder, 'page-%04d.jpg')

    // ImageMagick converts all pages at once
    const cmd = `magick -density 150 "${inputPath}" -quality 90 "${outputPattern}"`

    exec(cmd, (err, stdout, stderr) => {
      console.log('STDOUT:', stdout)
      console.log('STDERR:', stderr)
      console.log('ERROR:', err)

      const jpgFiles = fs.readdirSync(tempFolder).filter(f => f.endsWith('.jpg'))
      console.log('JPG files created:', jpgFiles)

      if (jpgFiles.length === 0) {
        return res.status(500).json({ error: 'Conversion failed — no JPG files created' })
      }

      // Zip all jpg files
      const zipFileName = `${Date.now()}-images.zip`
      const zipPath = path.join(outputDir, zipFileName)
      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => {
        // Cleanup temp folder
        jpgFiles.forEach(f => fs.unlinkSync(path.join(tempFolder, f)))
        fs.rmdirSync(tempFolder)
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)

        res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/outputs/${zipFileName}` })
      })

      archive.on('error', (err) => {
        res.status(500).json({ error: 'Zip failed: ' + err.message })
      })

      archive.pipe(output)

      jpgFiles.sort().forEach(f => {
        archive.file(path.join(tempFolder, f), { name: f })
      })

      archive.finalize()
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// pdf to jpg
exports.pdfToJpg = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' })

    const archiver = require('archiver')
    const inputPath = path.resolve(req.file.path)
    const outputDir = path.resolve(path.join(__dirname, '../outputs'))
    const uploadedBaseName = path.basename(inputPath, path.extname(inputPath))

    // Create temp folder for jpg files
    const tempFolder = path.join(outputDir, uploadedBaseName)
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder)

    const outputPattern = path.join(tempFolder, 'page-%04d.jpg')
    const magickPath = 'C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe'
    const cmd = '"' + magickPath + '" -density 150 "' + inputPath + '" -quality 90 "' + outputPattern + '"'

    exec(cmd, (err, stdout, stderr) => {
      console.log('STDOUT:', stdout)
      console.log('STDERR:', stderr)
      console.log('ERROR:', err)

      const jpgFiles = fs.readdirSync(tempFolder).filter(f => f.endsWith('.jpg'))
      console.log('JPG files created:', jpgFiles)

      if (jpgFiles.length === 0) {
        return res.status(500).json({ error: 'Conversion failed — no JPG files created' })
      }

      // Zip all jpg files
      const zipFileName = Date.now() + '-images.zip'
      const zipPath = path.join(outputDir, zipFileName)
      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => {
        jpgFiles.forEach(f => fs.unlinkSync(path.join(tempFolder, f)))
        fs.rmdirSync(tempFolder)
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        res.json({ downloadUrl: 'https://fileconverters-lf0e.onrender.com/outputs/' + zipFileName })
      })

      archive.on('error', (archiveErr) => {
        res.status(500).json({ error: 'Zip failed: ' + archiveErr.message })
      })

      archive.pipe(output)
      jpgFiles.sort().forEach(f => {
        archive.file(path.join(tempFolder, f), { name: f })
      })
      archive.finalize()
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ✅ Sign PDF
exports.signPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' })

    const { signatureData, pageNum, x, y, width, height } = req.body
    if (!signatureData) return res.status(400).json({ error: 'No signature data provided' })

    const { PDFDocument } = require('pdf-lib')

    const pdfBytes = fs.readFileSync(req.file.path)
    const pdfDoc   = await PDFDocument.load(pdfBytes)
    const pages    = pdfDoc.getPages()
    const page     = pages[parseInt(pageNum) || 0]

    // Convert base64 signature to image
    const base64Data = signatureData.replace(/^data:image\/png;base64,/, '')
    const sigBuffer  = Buffer.from(base64Data, 'base64')
    const sigImage   = await pdfDoc.embedPng(sigBuffer)

    const { width: pageW, height: pageH } = page.getSize()

    const sigW = parseFloat(width)  || 150
    const sigH = parseFloat(height) || 60
    const sigX = parseFloat(x)      || pageW / 2 - sigW / 2
    const sigY = pageH - (parseFloat(y) || 100) - sigH

    page.drawImage(sigImage, {
      x: sigX, y: sigY,
      width: sigW, height: sigH,
      opacity: 1,
    })

    const outputBytes = await pdfDoc.save()
    const outputPath  = path.join('outputs', `${Date.now()}-signed.pdf`)
    fs.writeFileSync(outputPath, outputBytes)
    fs.unlinkSync(req.file.path)

    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ✅ Watermark PDF
exports.watermarkPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' })

    const {
      text     = 'CONFIDENTIAL',
      fontSize = '48',
      opacity  = '0.15',
      color    = '808080',
      diagonal = 'true',
    } = req.body

    const { PDFDocument, rgb, degrees } = require('pdf-lib')

    // Parse hex color
    const hex = color.replace('#', '')
    const r   = parseInt(hex.substring(0, 2), 16) / 255
    const g   = parseInt(hex.substring(2, 4), 16) / 255
    const b   = parseInt(hex.substring(4, 6), 16) / 255

    const pdfBytes = fs.readFileSync(req.file.path)
    const pdfDoc   = await PDFDocument.load(pdfBytes)
    const pages    = pdfDoc.getPages()

    for (const page of pages) {
      const { width, height } = page.getSize()

      if (diagonal === 'true') {
        // Diagonal watermark grid
        const size        = parseInt(fontSize)
const textLen     = text.length * size * 0.6
const spacingX    = textLen + 80
const spacingY    = size + 80

for (let x = -spacingX; x < width + spacingX; x += spacingX) {
  for (let y = -spacingY; y < height + spacingY; y += spacingY) {
    page.drawText(text, {
      x: x,
      y: y,
      size: size,
      color: rgb(r, g, b),
      opacity: parseFloat(opacity),
      rotate: degrees(45),
    })
  }
}
        // Center watermark
        page.drawText(text, {
          x: width / 2 - (text.length * parseInt(fontSize) * 0.3),
          y: height / 2,
          size: parseInt(fontSize),
          color: rgb(r, g, b),
          opacity: parseFloat(opacity),
          rotate: degrees(0),
        })
      }
    }

    const outputBytes = await pdfDoc.save()
    const outputPath  = path.join('outputs', `${Date.now()}-watermarked.pdf`)
    fs.writeFileSync(outputPath, outputBytes)
    fs.unlinkSync(req.file.path)

    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
// ✅ HTML → PDF
const puppeteer = require('puppeteer')
exports.htmlToPdf = async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({
        error: "Please enter website URL"
      })
    }

    const browser = await puppeteer.launch({
      headless: true
    })

    const page = await browser.newPage()

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000
    })

    const outputPath = path.join(
      "outputs",
      `${Date.now()}-website.pdf`
    )

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true
    })

    await browser.close()

    res.json({
      downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}`
    })

  } catch (err) {
    res.status(500).json({
      error: "Website PDF conversion failed"
    })
  }
}