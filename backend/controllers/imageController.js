const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const heicConvert = require('heic-convert')


// ✅ 1. JPG to PNG
exports.jpgToPng = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-output.png`);
    await sharp(req.file.path).png().toFile(outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 2. PNG to JPG
exports.pngToJpg = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-output.jpg`);
    await sharp(req.file.path).jpeg({ quality: 90 }).toFile(outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 3. Resize Image
exports.resizeImage = async (req, res) => {
  try {
    const { width, height } = req.body;
    const outputPath = path.join("outputs", `${Date.now()}-resized.png`);
    await sharp(req.file.path)
  .jpeg({ quality: 90 })
  .toFile(outputPath)

fs.unlink(req.file.path, (err) => {
  if (err) console.log('File cleanup failed')
})
    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 4. Compress Image
exports.compressImage = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-compressed.jpg`);
    await sharp(req.file.path)
      .jpeg({ quality: 50 })
      .toFile(outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 5. Convert to WebP
exports.toWebp = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-output.webp`);
    await sharp(req.file.path).webp({ quality: 80 }).toFile(outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 6. WebP to JPG
exports.webpToJpg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const outputPath = path.join(
      'outputs',
      `${Date.now()}-output.jpg`
    );

    await sharp(req.file.path)
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // Delete later to avoid Windows lock
    setTimeout(() => {
      fs.unlink(req.file.path, () => {});
    }, 2000);

    res.json({
      downloadUrl: `http://localhost:5000/${outputPath}`
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ✅ 6. Image to PDF
exports.imgToPdf = async (req, res) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const imgBytes = fs.readFileSync(req.file.path);
    let image;

    if (
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/jpg"
    ) {
      image = await pdfDoc.embedJpg(imgBytes);
    } else if (req.file.mimetype === "image/png") {
      image = await pdfDoc.embedPng(imgBytes);
    } else {
      return res.status(400).json({ error: "Only JPG and PNG supported" });
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join("outputs", `${Date.now()}-output.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    fs.unlinkSync(req.file.path);

    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ 7. HEIC to JPG
exports.heicToJpg = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        error: 'No image uploaded'
      })
    }

    const inputBuffer = fs.readFileSync(req.file.path)

    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9
    })

    const outputPath = path.join(
      'outputs',
      `${Date.now()}-output.jpg`
    )

    fs.writeFileSync(outputPath, outputBuffer)

    fs.unlinkSync(req.file.path)
      console.log('done')
    res.json({
      downloadUrl: `http://localhost:5000/${outputPath}`
    })

  } catch (err) {

    console.log(err)

    res.status(500).json({
      error: err.message
    })

  }
}
//✅ 8. SVG to PNG
exports.svgToPng = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        error: 'No image uploaded'
      })
    }

    const outputPath = path.join(
      'outputs',
      `${Date.now()}-output.png`
    )

    await sharp(req.file.path)
      .png()
      .toFile(outputPath)

    fs.unlinkSync(req.file.path)

    res.json({
      downloadUrl: `http://localhost:5000/${outputPath}`
    })

  } catch (err) {

    console.log(err)

    res.status(500).json({
      error: err.message
    })

  }
}
//✅ 9. Crop Image
exports.cropImage = async (req, res) => {
  try {

    const cropData = JSON.parse(req.body.cropData)

    const outputPath = path.join(
      'outputs',
      `${Date.now()}-cropped.png`
    )

    await sharp(req.file.path)
      .extract({
        left: Math.round(cropData.x),
        top: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height),
      })
      .png()
      .toFile(outputPath)

    fs.unlinkSync(req.file.path)

    res.json({
      downloadUrl: `http://localhost:5000/${outputPath}`
    })

  } catch (err) {

    console.log(err)

    res.status(500).json({
      error: err.message
    })

  }
}
//✅ 10. Resize Image (with dimensions)
exports.resizeImage = async (req, res) => {
  try {
    const { width, height } = req.body

    if (!width || !height) {
      return res.status(400).json({ error: 'Width and height required' })
    }

    const outputPath = path.join(
      'outputs',
      `${Date.now()}-resized.jpg`
    )

    await sharp(req.file.path)
      .resize(parseInt(width), parseInt(height))
      .toFile(outputPath)

    fs.unlinkSync(req.file.path)

    res.json({
      downloadUrl: `http://localhost:5000/${outputPath}`
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
//✅ 11. Upscale Image
exports.upscaleImage = async (req, res) => {
  try {

    const scale = parseInt(req.body.scale || 2)

    const metadata = await sharp(req.file.path).metadata()

    const newWidth = metadata.width * scale
    const newHeight = metadata.height * scale

    const outputPath = path.join(
      'outputs',
      `${Date.now()}-upscaled.jpg`
    )

    await sharp(req.file.path)
      .resize(newWidth, newHeight)
      .sharpen()
      .jpeg({ quality: 100 })
      .toFile(outputPath)

    fs.unlinkSync(req.file.path)

    res.json({
      downloadUrl: `http://localhost:5000/${outputPath}`
    })

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
}

//✅ 12. Rotate and Flip Image
//✅ 12. Rotate and Flip Image
exports.rotateFlipImage = async (req, res) => {

  try {

    const file = req.file

    const {
      rotation,
      flipH,
      flipV
    } = req.body

    if (!file) {
      return res.status(400).json({
        error: 'No image uploaded'
      })
    }

    const outputPath = path.join(
      'outputs',
      `${Date.now()}-rotated.png`
    )

    let image = sharp(file.path)

    // rotate
    image = image.rotate(Number(rotation || 0))

    // horizontal flip
    if (flipH === 'true') {
      image = image.flop()
    }

    // vertical flip
    if (flipV === 'true') {
      image = image.flip()
    }

    // save image
    await image.toFile(outputPath)

    // remove uploaded file
    fs.unlinkSync(file.path)

    return res.json({
      downloadUrl:
        `http://localhost:5000/${outputPath}`
    })

  } catch (err) {

    console.log(err)

    return res.status(500).json({
      error: 'Image processing failed'
    })
  }
}