import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AiAssistant from './components/AiAssistant'

// Main Pages
import Home from './pages/Home'
import PdfTools from './pages/PdfTools'
import ImageTools from './pages/ImageTools'
import VideoTools from './pages/VideoTools'
import DocTools from './pages/DocTools'

// Tool Pages
import PdfEditor from './pages/tools/PdfEditor'
import PptxToPdf from './pages/tools/PptxToPdf'
import Mp4ToMp3 from './pages/tools/Mp4ToMp3'
import JpgToPng from './pages/tools/JpgToPng'
import PngToJpg from './pages/tools/PngToJpg'
import CompressImage from './pages/tools/CompressImage'
import JpgToWebp from './pages/tools/JpgToWebp'
import WebpToJpg from './pages/tools/WebpToJpg'
import HeicToJpg from './pages/tools/HeicToJpg'
import SvgToPng from './pages/tools/SvgToPng'
import ResizeImage from './pages/tools/ResizeImage'
import UpscaleImage from './pages/tools/UpscaleImage'
import VideoCompressor from './pages/tools/VideoCompressor'
import ToAvi from './pages/tools/ToAvi'
import ToMkv from './pages/tools/ToMkv'


// Auth Pages
import Login from './login/Login'
import Register from './login/Register'

// sign pdf watermark pdf
import SignPdf from './pages/tools/SignPdf'
import WatermarkPdf from './pages/tools/WatermarkPdf'

// crop image
import CropImage from './pages/tools/CropImage'

// rotate flip image
import RotateFlip from './pages/tools/RotateFlip'

//scroll to top on route change
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col mesh-bg">
        
         
        {/* NAVBAR */}
        <Navbar />

        {/* PAGES */}
        <main className="flex-grow pt-16">
          <Routes>

            {/* Auth Routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main Pages */}
            <Route path="/"            element={<Home />} />
            <Route path="/pdf-tools"   element={<PdfTools />} />
            <Route path="/image-tools" element={<ImageTools />} />
            <Route path="/video-tools" element={<VideoTools />} />
            <Route path="/doc-tools"   element={<DocTools />} />

            {/* Tool Pages */}
            <Route path="/tools/pptx-to-pdf" element={<PptxToPdf />} />
            <Route path="/pdf-editor"         element={<PdfEditor />} />
            <Route path="/tools/mp4-to-mp3" element={<Mp4ToMp3 />} />
            <Route path="/tools/jpg-to-png" element={<JpgToPng />} />
            <Route path="/tools/png-to-jpg" element={<PngToJpg />} />
            <Route path="/tools/compress-image" element={<CompressImage />} />
            <Route path="/tools/jpg-to-webp" element={<JpgToWebp />} />
            <Route path="/tools/webp-to-jpg" element={<WebpToJpg />} />
            <Route path="/tools/heic-to-jpg" element={<HeicToJpg />} />
            <Route path="/tools/svg-to-png" element={<SvgToPng />} />
            <Route path="/tools/resize-image" element={<ResizeImage />} />
            <Route path="/tools/upscale-image" element={<UpscaleImage />} />
            <Route path="/tools/video-compressor"element={<VideoCompressor />}/>
            <Route path="/tools/to-avi"element={<ToAvi />}/>
            <Route path="/tools/to-mkv"element={<ToMkv />}/>
            
            {/* Sign PDF watermark PDF */}
            <Route path="/tools/sign-pdf"      element={<SignPdf />} />
            <Route path="/tools/watermark-pdf" element={<WatermarkPdf />} />
          
          {/* Crop Image */}
          <Route
                path="/tools/crop-image"
                element={<CropImage />}
              />

          {/* Rotate Flip Image */}
          <Route path="/tools/rotate-flip" element={<RotateFlip />} /><Route path="/tools/rotate-flip"element={<RotateFlip />}
/>
          
          </Routes>
        </main>

        {/* FOOTER */}
        <Footer />

        {/* FLOATING AI CHAT */}
        <AiAssistant />

      </div>
    </Router>
  )
}

export default App