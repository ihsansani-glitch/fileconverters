const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const xlsx = require("xlsx");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");


// ✅ 1. XLSX to CSV
exports.xlsxToCsv = async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csv = xlsx.utils.sheet_to_csv(worksheet);

    const outputPath = path.join("outputs", `${Date.now()}-output.csv`);
    fs.writeFileSync(outputPath, csv);
    fs.unlinkSync(req.file.path);

    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 2. CSV to XLSX
exports.csvToXlsx = async (req, res) => {
  try {
    const csvData = fs.readFileSync(req.file.path, "utf8");
    const workbook = xlsx.read(csvData, { type: "string" });
    const outputPath = path.join("outputs", `${Date.now()}-output.xlsx`);
    xlsx.writeFile(workbook, outputPath);
    fs.unlinkSync(req.file.path);

    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 3. Word to PDF
exports.wordToPdf = async (req, res) => {
  try {
    const mammoth = require("mammoth");
    const { value: text } = await mammoth.extractRawText({
      path: req.file.path,
    });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([600, 800]);
    const lines = text.split("\n");
    let y = 750;

    for (const line of lines) {
      if (y < 50) {
        const newPage = pdfDoc.addPage([600, 800]);
        y = 750;
      }
      page.drawText(line.substring(0, 80), {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join("outputs", `${Date.now()}-output.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    fs.unlinkSync(req.file.path);

    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 4. XLSX to PDF
exports.xlsxToPdf = async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([800, 600]);
    let y = 550;

    for (const row of data) {
      const rowText = row.join("   |   ");
      page.drawText(rowText.substring(0, 100), {
        x: 30,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
      if (y < 30) break;
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join("outputs", `${Date.now()}-output.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    fs.unlinkSync(req.file.path);

    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ XLSX to Word
exports.xlsxToWord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = require('docx')
    const xlsx = require('xlsx')

    const workbook = xlsx.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 })

    const tableRows = data.map(row =>
      new TableRow({
        children: row.map(cell =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: String(cell ?? ''), size: 20 })]
            })],
            width: { size: Math.floor(9000 / Math.max(row.length, 1)), type: WidthType.DXA }
          })
        )
      })
    )

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: `Sheet: ${sheetName}`, bold: true, size: 28 })]
          }),
          new Paragraph({ children: [] }),
          new Table({ rows: tableRows }),
        ]
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    const outputPath = path.join('outputs', `${Date.now()}-output.docx`)
    fs.writeFileSync(outputPath, buffer)
    fs.unlinkSync(req.file.path)

    res.json({ downloadUrl: `http://localhost:5000/${outputPath}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.pdfToPptx = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const inputPath = path.resolve(req.file.path)
    const outputDir = path.resolve(path.join(__dirname, '../outputs'))
    const outputFileName = `${Date.now()}.pptx`
    const finalPath = path.join(outputDir, outputFileName)
    const uploadedBaseName = path.basename(inputPath, path.extname(inputPath))

    const soffice = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`

    // Step 1 — PDF to ODP
    const cmd1 = `${soffice} --headless --infilter="impress_pdf_import" --convert-to odp --outdir "${outputDir}" "${inputPath}"`

    console.log('Step 1:', cmd1)

    exec(cmd1, (err1, stdout1, stderr1) => {
      console.log('Step 1 STDOUT:', stdout1)
      console.log('Step 1 STDERR:', stderr1)

      const odpPath = path.join(outputDir, `${uploadedBaseName}.odp`)

      if (!fs.existsSync(odpPath)) {
        const files = fs.readdirSync(outputDir)
        console.log('Files in output dir:', files)
        return res.status(500).json({ error: 'Step 1 failed — ODP not created. Files: ' + files.join(', ') })
      }

      // Step 2 — ODP to PPTX
      const cmd2 = `${soffice} --headless --convert-to pptx --outdir "${outputDir}" "${odpPath}"`

      console.log('Step 2:', cmd2)

      exec(cmd2, (err2, stdout2, stderr2) => {
        console.log('Step 2 STDOUT:', stdout2)
        console.log('Step 2 STDERR:', stderr2)

        const pptxBaseName = path.basename(odpPath, '.odp')
        const generatedPptx = path.join(outputDir, `${pptxBaseName}.pptx`)

        // Clean up ODP
        if (fs.existsSync(odpPath)) fs.unlinkSync(odpPath)

        if (fs.existsSync(generatedPptx)) {
          fs.renameSync(generatedPptx, finalPath)
        } else {
          const files = fs.readdirSync(outputDir)
          console.log('Files in output dir after step 2:', files)
          return res.status(500).json({ error: 'Step 2 failed — PPTX not created. Files: ' + files.join(', ') })
        }

        // Clean up input
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)

        res.json({
          downloadUrl: `http://localhost:5000/outputs/${outputFileName}`,
        })
      })
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
exports.pdfToPptx = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const inputPath = path.resolve(req.file.path)
    const outputDir = path.resolve(path.join(__dirname, '../outputs'))
    const outputFileName = `${Date.now()}.pptx`
    const finalPath = path.join(outputDir, outputFileName)
    const uploadedBaseName = path.basename(inputPath, path.extname(inputPath))
    const soffice = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`

    // Kill any existing LibreOffice instance first
    exec('taskkill /F /IM soffice.exe /T', () => {

      // Wait 2 seconds then run Step 1
      setTimeout(() => {
        const cmd1 = `${soffice} --headless --infilter="impress_pdf_import" --convert-to odp --outdir "${outputDir}" "${inputPath}"`

        exec(cmd1, (err1, stdout1, stderr1) => {
          console.log('Step 1 STDOUT:', stdout1)
          console.log('Step 1 STDERR:', stderr1)

          const odpPath = path.join(outputDir, `${uploadedBaseName}.odp`)

          if (!fs.existsSync(odpPath)) {
            const files = fs.readdirSync(outputDir)
            return res.status(500).json({ error: 'Step 1 failed — ODP not created. Files: ' + files.join(', ') })
          }

          // Wait 2 seconds then run Step 2
          setTimeout(() => {
            const cmd2 = `${soffice} --headless --convert-to pptx --outdir "${outputDir}" "${odpPath}"`

            exec(cmd2, (err2, stdout2, stderr2) => {
              console.log('Step 2 STDOUT:', stdout2)
              console.log('Step 2 STDERR:', stderr2)

              const generatedPptx = path.join(outputDir, `${uploadedBaseName}.pptx`)

              if (fs.existsSync(odpPath)) fs.unlinkSync(odpPath)

              if (fs.existsSync(generatedPptx)) {
                fs.renameSync(generatedPptx, finalPath)
              } else {
                const files = fs.readdirSync(outputDir)
                return res.status(500).json({ error: 'Step 2 failed — PPTX not created. Files: ' + files.join(', ') })
              }

              if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)

              res.json({
                downloadUrl: `http://localhost:5000/outputs/${outputFileName}`,
              })
            })
          }, 2000)
        })
      }, 2000)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
// ✅ 6. PDF to Word
exports.pdfToWord = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve(path.join(__dirname, "../outputs"));
    const outputFileName = `${Date.now()}.docx`;
    const finalPath = path.join(outputDir, outputFileName);
    const uploadedBaseName = path.basename(inputPath, path.extname(inputPath));

    const cmd = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --infilter="writer_pdf_import" --convert-to docx --outdir "${outputDir}" "${inputPath}"`;

    console.log("Running command:", cmd);

    exec(cmd, (err, stdout, stderr) => {
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);
      console.log("ERROR:", err);

      if (err) {
        return res.status(500).json({ error: "Conversion failed: " + stderr });
      }

      const generatedPath = path.join(outputDir, `${uploadedBaseName}.docx`);
      console.log("Looking for file at:", generatedPath);

      // List output dir to debug
      const files = fs.readdirSync(outputDir);
      console.log("Files in output dir:", files);

      if (fs.existsSync(generatedPath)) {
        fs.renameSync(generatedPath, finalPath);
      } else {
        return res.status(500).json({ error: "Converted file not found. Files in output: " + files.join(", ") });
      }

      fs.unlinkSync(inputPath);

      res.json({
        downloadUrl: `http://localhost:5000/outputs/${outputFileName}`,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
