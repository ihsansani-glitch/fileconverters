const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const fs = require("fs")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Auto-create folders
const uploadsDir = path.join(__dirname, "uploads")
const outputsDir = path.join(__dirname, "outputs")

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir)

// Static folders
app.use("/uploads", express.static(uploadsDir))
app.use("/outputs", express.static(outputsDir))

// Routes
app.use("/api/pdf", require("./routes/pdfRoutes"))
app.use("/api/image", require("./routes/imageRoutes"))
app.use("/api/video", require("./routes/videoRoutes"))
app.use("/api/doc", require("./routes/docRoutes"))

// Health check
app.get("/", (req, res) => {
  res.send("✅ Tools Website Backend is Running!")
})

// Auto delete files and folders older than 5 minutes
const cleanFiles = () => {
  const folders = [uploadsDir, outputsDir]
  const fiveMin = 5 * 60 * 1000

  folders.forEach((dir) => {
    if (!fs.existsSync(dir)) return
    fs.readdirSync(dir).forEach((file) => {
      const fp = path.join(dir, file)
      try {
        const stats = fs.statSync(fp)
        if (Date.now() - stats.mtimeMs > fiveMin) {
          if (stats.isDirectory()) {
            fs.rmSync(fp, { recursive: true, force: true })
            console.log("🗑️ Deleted old folder:", file)
          } else {
            fs.unlinkSync(fp)
            console.log("🗑️ Deleted old file:", file)
          }
        }
      } catch (err) {
        console.error("Error deleting:", file, err.message)
      }
    })
  })
}
setInterval(cleanFiles, 5 * 60 * 1000)

// Start server (ONLY ONCE)
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})