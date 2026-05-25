const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// ✅ Helper — run ffmpeg and return output path
const runFfmpeg = (inputPath, outputPath, options = []) => {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath);
    options.forEach((opt) => cmd.outputOptions(opt));
    cmd
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
};

// ✅ 1. MP4 to MP3
exports.mp4ToMp3 = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-output.mp3`);
    await runFfmpeg(req.file.path, outputPath, ["-vn", "-ab", "192k"]);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 2. Compress Video
exports.compressVideo = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-compressed.mp4`);
    await runFfmpeg(req.file.path, outputPath, [
      "-vcodec libx264",
      "-crf 28",
      "-preset fast",
    ]);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 3. Trim Video
exports.trimVideo = async (req, res) => {
  try {
    const { start, duration } = req.body;
    const outputPath = path.join("outputs", `${Date.now()}-trimmed.mp4`);
    await runFfmpeg(req.file.path, outputPath, [
      `-ss ${start || 0}`,
      `-t ${duration || 30}`,
    ]);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 4. Convert to AVI
exports.toAvi = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-output.avi`);
    await runFfmpeg(req.file.path, outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 5. Convert to MKV
exports.toMkv = async (req, res) => {
  try {
    const outputPath = path.join("outputs", `${Date.now()}-output.mkv`);
    await runFfmpeg(req.file.path, outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ downloadUrl: `https://fileconverters-lf0e.onrender.com/${outputPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};