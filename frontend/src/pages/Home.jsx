import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// PDF ICONS
import pptxIcon from '../assets/pptx-to-pdf.png'
import imgToPdfIcon from '../assets/img-to-pdf.png'
import mergePdfIcon from '../assets/merge-pdf.png'
import splitPdfIcon from '../assets/split-pdf.png'
import compressPdfIcon from '../assets/compress-pdf.png'
import pdfJpgIcon from '../assets/pdf-to-jpg.png'
import signPdfIcon from '../assets/sign-pdf.png'
import watermarkPdfIcon from '../assets/watermark-pdf.png'
import htmlPdfIcon from '../assets/html-to-pdf.png'

// IMAGE ICONS
import jpgToPngIcon from '../assets/jpg-to-png.png'
import pngToJpgIcon from '../assets/png-to-jpg.png'
import compressImageIcon from '../assets/compress-image.png'
import webpIcon from '../assets/webp.png'
import heicIcon from '../assets/heic-to-jpg.png'
import svgIcon from '../assets/svg-to-png.png'
import cropIcon from '../assets/crop-image.png'
import resizeIcon from '../assets/resize.png'
import rotateIcon from '../assets/rotate.png'

// VIDEO ICONS
import mp3Icon from '../assets/mp4-to-mp3.png'
import compressVideoIcon from '../assets/compress-video.png'
import aviIcon from '../assets/video-avi.png'
import mkvIcon from '../assets/video-mkv.png'

function Home() {

  const [query, setQuery] = useState('')

  const fullText = "Professional Tools Hub"
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < fullText.length) {
        setText(fullText.slice(0, index + 1))
        setIndex(index + 1)
      }
    }, 80)

    return () => clearTimeout(timer)
  }, [index])

  // ✅ UPDATED TOOL LIST WITH DESCRIPTION
  const tools = [
    // PDF
    { name: 'PDF Compressor', desc: 'Reduce PDF size With HD quality', icon: compressPdfIcon, link: '/pdf-tools' },
    { name: 'PDF Merger', desc: 'Combine multiple PDFs into one', icon: mergePdfIcon, link: '/pdf-tools' },
    { name: 'PDF Splitter', desc: 'Split PDF into separate pages', icon: splitPdfIcon, link: '/pdf-tools' },
    { name: 'Image to PDF', desc: 'Convert images into PDF file', icon: imgToPdfIcon, link: '/pdf-tools' },
    { name: 'PDF to JPG', desc: 'Extract images from PDF', icon: pdfJpgIcon, link: '/pdf-tools' },
    { name: 'Sign PDF', desc: 'Add digital signature to PDF', icon: signPdfIcon, link: '/pdf-tools' },
    { name: 'Watermark PDF', desc: 'Add watermark to protect PDF', icon: watermarkPdfIcon, link: '/pdf-tools' },
    { name: 'HTML to PDF', desc: 'Convert web pages to PDF', icon: htmlPdfIcon, link: '/pdf-tools' },
    { name: 'PPT to PDF', desc: 'Convert PowerPoint to PDF', icon: pptxIcon, link: '/pdf-tools' },

    // IMAGE
    { name: 'JPG to PNG', desc: 'Convert JPG images to PNG format', icon: jpgToPngIcon, link: '/image-tools' },
    { name: 'PNG to JPG', desc: 'Convert PNG images to JPG format', icon: pngToJpgIcon, link: '/image-tools' },
    { name: 'Image Compressor', desc: 'Compress image size easily', icon: compressImageIcon, link: '/image-tools' },
    { name: 'WEBP Converter', desc: 'Convert WEBP images to JPG', icon: webpIcon, link: '/image-tools' },
    { name: 'HEIC to JPG', desc: 'Convert iPhone HEIC images', icon: heicIcon, link: '/image-tools' },
    { name: 'SVG to PNG', desc: 'Convert vector SVG to PNG', icon: svgIcon, link: '/image-tools' },
    { name: 'Crop Image', desc: 'Crop images easily', icon: cropIcon, link: '/image-tools' },
    { name: 'Resize Image', desc: 'Resize images to any dimension', icon: resizeIcon, link: '/image-tools' },
    { name: 'Rotate Image', desc: 'Rotate images in any direction', icon: rotateIcon, link: '/image-tools' },

    // VIDEO
    { name: 'MP4 to MP3', desc: 'Extract audio from video', icon: mp3Icon, link: '/video-tools' },
    { name: 'Compress Video', desc: 'Reduce video file size', icon: compressVideoIcon, link: '/video-tools' },
    { name: 'Convert to AVI', desc: 'Convert video to AVI format', icon: aviIcon, link: '/video-tools' },
    { name: 'Convert to MKV', desc: 'Convert video to MKV format', icon: mkvIcon, link: '/video-tools' },
  ]

  // ✅ SEARCH WORKS FOR NAME + DESCRIPTION
  const filteredTools = tools.filter(tool =>
    (tool.name + tool.desc).toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen">

      <div className="h-28" />

      {/* SEARCH (UNCHANGED DESIGN) */}
      <div className="flex justify-end px-8 relative">

        <div className="search-bar">

          <input
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button>
            <label>Search</label>
            <div className="search-icon"></div>
          </button>

          {query && (
            <div className="search-dropdown">

              {filteredTools.length > 0 ? (
                filteredTools.map((tool, i) => (
                  <Link
                    key={i}
                    to={tool.link}
                    onClick={() => setQuery('')}
                    className="dropdown-item"
                  >
                    <img src={tool.icon} className="w-5 h-5 inline mr-2" />
                    {tool.name}
                  </Link>
                ))
              ) : (
                <div className="dropdown-item">No matching tools</div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6 mt-16">

        <div className="h-[80px] flex items-center justify-center">
          <h1 className="text-5xl font-bold text-slate-900">
            {text}
          </h1>
        </div>

        <span className="block text-blue-600 mt-3 text-xl font-semibold">
          All In One Place
        </span>

        <p className="mt-8 text-lg text-slate-600 max-w-3xl">
          Convert, compress, edit and optimize your files instantly.
        </p>

      </section>

      <div className="h-20" />

      {/* TOOL GRID (ONLY DESCRIPTION ADDED) */}
      <section className="max-w-6xl mx-auto px-6 pb-20">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {tools.map((tool, i) => (
            <Link
              key={i}
              to={tool.link}
              className="group border border-slate-200 rounded-3xl p-10
                         flex flex-col items-center justify-center
                         transition-all duration-300
                         hover:shadow-xl hover:-translate-y-2 bg-white text-center"
            >

              <div className="flex items-center justify-center w-28 h-28">
  <img src={tool.icon} className="w-24 h-24 object-contain" />
</div>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">
                {tool.name}
              </h3>

              {/* ✅ NEW DESCRIPTION */}
              <p className="text-sm text-slate-500 mt-2 max-w-[220px]">
                {tool.desc}
              </p>

            </Link>
          ))}

        </div>

      </section>

      {/* STYLES (UNCHANGED) */}
      <style>{`
        .search-bar {
          position: relative;
          width: 40ch;
          height: 3rem;
          padding-left: 1.5rem;
          border-radius: 1.5rem;
          background: white;
          border: 2px solid #dbe3f0;
        }

        .search-bar input {
          all: unset;
          height: 100%;
          width: calc(100% - 7rem);
          color: black;
        }

        .search-bar button {
          all: unset;
          position: absolute;
          right: 0;
          height: 3rem;
          padding-left: 3rem;
          border-radius: 1.5rem;
          background: #296ec7;
          cursor: pointer;
        }

        .search-bar button label {
          color: white;
          padding-right: 1rem;
        }

        .search-icon {
          position: absolute;
          height: 0.875rem;
          width: 0.875rem;
          top: 1rem;
          left: 0.875rem;
          border: 0.125rem solid white;
          border-radius: 50%;
          transform: rotate(-45deg);
        }

        .search-icon::after {
          content: "";
          position: absolute;
          height: 0.5rem;
          width: 0.125rem;
          background: white;
          left: 50%;
          bottom: -0.55rem;
          transform: translateX(-50%);
        }

        .search-dropdown {
          position: absolute;
          top: 3.8rem;
          right: 0;
          width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          z-index: 50;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .dropdown-item {
          display: block;
          padding: 0.9rem 1rem;
          color: black;
        }

        .dropdown-item:hover {
          background: #eff6ff;
        }
      `}</style>

    </div>
  )
}

export default Home