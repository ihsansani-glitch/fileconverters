import { useState, useEffect } from 'react'
import axios from 'axios'
import Draggable from "react-draggable"
import UploadBox from '../components/UploadBox'
import jpgToPngIcon from '../assets/jpg-to-png.png'
import pngToJpgIcon from '../assets/png-to-jpg.png'
import mainImgLogo from '../assets/img-tools-logo.png'

const API = 'https://fileconverters-lf0e.onrender.com/api/image'

/* =========================
   MODAL
========================= */
function Modal({ tool, onClose }) {
  const [file, setFile] = useState(null)
  const [files, setFiles] = useState([])
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  // Tool-specific parameters
  const [watermarkText, setWatermarkText] = useState('')
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [scale, setScale] = useState(2)

  const handleUpload = (f) => {
    setFile(tool.multiple ? null : f)
    setFiles(tool.multiple ? Array.from(f) : [])
    setResult(null)
    setError('')
  }

  // Build/release a preview URL for the currently selected image
  useEffect(() => {
    const selected = tool.multiple ? files[0] : file

    if (!selected) {
      setPreviewUrl('')
      return
    }

    const url = URL.createObjectURL(selected)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file, files, tool.multiple])

  const convert = async () => {
    const hasFile = tool.multiple ? files.length : file

    if (!hasFile) {
      return setError('Please upload a file first.')
    }

    if (tool.id === 'resize' && (!width || !height)) {
      return setError('Please enter width and height')
    }

    setLoading(true)
    setError('')
    setProgress(0)

    try {
      const fd = new FormData()

      if (tool.id === 'watermark') {
        fd.append('text', watermarkText)
        fd.append('x', position.x)
        fd.append('y', position.y)
      }

      if (tool.id === 'upscale') {
        fd.append('scale', scale)
      }

      if (tool.id === 'resize') {
        fd.append('width', width)
        fd.append('height', height)
      }

      if (tool.multiple) {
        files.forEach((f) => fd.append(tool.fieldName, f))
      } else {
        fd.append(tool.fieldName, file)
      }

      const res = await axios.post(
        `${API}/${tool.endpoint}`,
        fd,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            )

            setProgress(percent)
          },
        }
      )

      if (res.data.error) {
        setError(res.data.error)
      } else {
        setResult(res.data)
        setProgress(100)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Conversion failed')
    }

    setLoading(false)
  }

  const download = async (url) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = url.split('/').pop()

      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      alert('Download failed: ' + err.message)
    }
  }

  const reset = () => {
    setResult(null)
    setFile(null)
    setFiles([])
    setWatermarkText('')
    setPosition({ x: 100, y: 100 })
    setWidth('')
    setHeight('')
    setScale(2)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-[#0f172a] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden">

        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={tool.icon}
              alt={tool.title}
              className="w-16 h-16 object-contain"
            />
            <div>
              <h2 className="text-white font-bold">{tool.title}</h2>
              <p className="text-slate-400 text-xs">{tool.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white">✕</button>
        </div>

        <div className="p-6 text-center">
          {!result ? (
            <>
              {/* WATERMARK */}
              {tool.id === 'watermark' && (
                <div className="mb-4 text-left">
                  <input
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3 mb-3"
                  />

                  {previewUrl && (
                    <div className="relative h-[300px] bg-slate-900 rounded-xl overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />

                      <Draggable
                        bounds="parent"
                        position={position}
                        onStop={(e, d) => setPosition({ x: d.x, y: d.y })}
                      >
                        <div className="absolute text-white text-3xl font-bold opacity-60 cursor-move">
                          {watermarkText || 'Watermark'}
                        </div>
                      </Draggable>
                    </div>
                  )}
                </div>
              )}

              {/* RESIZE */}
              {tool.id === 'resize' && (
                <div className="flex gap-3 mb-4">
                  <input
                    type="number"
                    placeholder="Width"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3"
                  />

                  <input
                    type="number"
                    placeholder="Height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3"
                  />
                </div>
              )}

              {/* UPSCALE */}
              {tool.id === 'upscale' && (
                <div className="mb-4">
                  <select
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3"
                  >
                    <option value={2}>2x Upscale</option>
                    <option value={4}>4x Upscale</option>
                  </select>
                </div>
              )}

              <UploadBox
                accept={tool.accept}
                multiple={tool.multiple}
                label="Upload Image"
                onUpload={handleUpload}
              />

              {error && (
                <p className="text-red-400 text-sm mt-3">{error}</p>
              )}

              {loading && (
                <div className="w-full mt-4">
                  <div className="flex justify-between text-sm text-white mb-2">
                    <span>Uploading & Converting...</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${tool.gradient} transition-all duration-300`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={convert}
                disabled={loading}
                className={`w-full mt-5 bg-gradient-to-r ${tool.gradient} text-white font-bold py-3 rounded-xl`}
              >
                {loading ? 'Processing...' : tool.buttonLabel}
              </button>
            </>
          ) : (
            <div>
              <h3 className="text-white text-xl mb-4">Done 🎉</h3>

              <button
                onClick={async () => {
                  await download(result.downloadUrl)
                  onClose()
                }}
                className={`bg-gradient-to-r ${tool.gradient} text-white px-6 py-3 rounded-xl`}
              >
                Download File
              </button>

              <button
                onClick={reset}
                className="block mx-auto mt-3 text-slate-400 text-sm underline"
              >
                Convert another file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================
   TOOLS
========================= */
const tools = [
  {
    id: 'jpg-to-png',
    title: 'JPG to PNG',
    description: 'Convert JPG images to PNG',
    icon: jpgToPngIcon,
    gradient: 'from-blue-500 to-cyan-500',
    accept: 'image/jpeg',
    multiple: false,
    fieldName: 'image',
    endpoint: 'jpg-to-png',
    buttonLabel: 'Convert to PNG',
  },

  {
    id: 'png-to-jpg',
    title: 'PNG to JPG',
    description: 'Convert PNG images to JPG',
    icon: pngToJpgIcon,
    gradient: 'from-purple-500 to-pink-500',
    accept: 'image/png',
    multiple: false,
    fieldName: 'image',
    endpoint: 'png-to-jpg',
    buttonLabel: 'Convert to JPG',
  },

  {
    id: 'resize',
    title: 'Resize Image',
    description: 'Resize image dimensions',
    icon: jpgToPngIcon,
    gradient: 'from-green-500 to-emerald-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'resize',
    buttonLabel: 'Resize Image',
  },

  {
    id: 'compress',
    title: 'Compress Image',
    description: 'Reduce image file size',
    icon: pngToJpgIcon,
    gradient: 'from-orange-500 to-red-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'compress',
    buttonLabel: 'Compress Image',
  },

  {
    id: 'crop',
    title: 'Crop Image',
    description: 'Crop unwanted areas',
    icon: jpgToPngIcon,
    gradient: 'from-pink-500 to-rose-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'crop-image',
    buttonLabel: 'Crop Image',
  },

  {
    id: 'rotate',
    title: 'Rotate Image',
    description: 'Rotate image angle',
    icon: pngToJpgIcon,
    gradient: 'from-indigo-500 to-blue-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'rotate',
    buttonLabel: 'Rotate Image',
  },

  {
    id: 'watermark',
    title: 'Add Watermark',
    description: 'Add text watermark',
    icon: jpgToPngIcon,
    gradient: 'from-cyan-500 to-sky-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'watermark',
    buttonLabel: 'Add Watermark',
  },

  {
    id: 'upscale',
    title: 'Upscale Image',
    description: 'Increase image quality',
    icon: pngToJpgIcon,
    gradient: 'from-violet-500 to-fuchsia-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'upscale-image',
    buttonLabel: 'Upscale Image',
  },

  {
    id: 'grayscale',
    title: 'Grayscale Image',
    description: 'Convert image to grayscale',
    icon: jpgToPngIcon,
    gradient: 'from-gray-500 to-slate-700',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'grayscale',
    buttonLabel: 'Convert to Grayscale',
  },

  {
    id: 'flip',
    title: 'Flip Image',
    description: 'Flip image horizontally',
    icon: pngToJpgIcon,
    gradient: 'from-teal-500 to-green-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'flip',
    buttonLabel: 'Flip Image',
  },

  {
    id: 'webp',
    title: 'Convert to WEBP',
    description: 'Convert image to WEBP',
    icon: jpgToPngIcon,
    gradient: 'from-yellow-500 to-orange-500',
    accept: 'image/*',
    multiple: false,
    fieldName: 'image',
    endpoint: 'webp',
    buttonLabel: 'Convert to WEBP',
  },
]

/* =========================
   MAIN PAGE
========================= */
export default function ImageTools() {
  const [active, setActive] = useState(null)

  return (
    <div className="min-h-screen">

      <div className="h-20" />

      {/* HERO */}
      <div className="min-h-[55vh] flex flex-col justify-center items-center text-center px-6">
        <div className="mb-6 hover:-translate-y-2 transition-all duration-500">
          <img
            src={mainImgLogo}
            alt="Image Tools"
            className="w-50 h-50 object-contain scale-125 drop-shadow-[0_20px_45px_rgba(59,130,246,0.35)] hover:scale-110 hover:rotate-y-180 transition-all duration-700"
            style={{ transformStyle: 'preserve-3d' }}
          />
        </div>
        <h1 className="text-5xl font-bold text-slate-900">
          Image Tools
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          Convert, resize, crop, compress, watermark and enhance images instantly.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {tools.map((tool) => (
            <div key={tool.id} className="relative group">

              {/* Glow background */}
              <div
                className={`absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition bg-gradient-to-r ${tool.gradient}`}
              ></div>

              {/* Card */}
              <button
                onClick={() =>
                  tool.isLink
                    ? (window.location.href = tool.link)
                    : setActive(tool)
                }
                className="relative w-full bg-white border border-slate-200 rounded-3xl shadow-sm p-8 text-center hover:shadow-lg transition"
              >

                {/* ICON */}
                <div className="mb-4 flex justify-center items-center">
                  <div className="w-40 h-20 flex items-center justify-center">
                    <img
                      src={tool.icon}
                      alt={tool.title}
                      className="w-full h-full object-contain scale-110"
                    />
                  </div>
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-semibold text-slate-900">
                  {tool.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-slate-600 text-sm mt-2">
                  {tool.description}
                </p>

                <div className="mt-4 text-slate-900 text-xl">+</div>

              </button>
            </div>
          ))}

        </div>
      </div>

      {/* MODAL */}
      {active && (
        <Modal tool={active} onClose={() => setActive(null)} />
      )}

    </div>
  )
}
