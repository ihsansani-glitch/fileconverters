import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Draggable from "react-draggable"

import jpgToPngIcon from '../assets/jpg-to-png.png'
import pngToJpgIcon from '../assets/png-to-jpg.png'
import mainImgLogo from '../assets/img-tools-logo.png'

const API = 'https://fileconverters-lf0e.onrender.com/api/image'

function Modal({ tool, onClose }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [watermarkText, setWatermarkText] = useState('')
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [scale, setScale] = useState(2)
  const [progress, setProgress] = useState(0)

  const inputRef = useRef()

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

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleFiles = (selected) => {
    if (!selected || selected.length === 0) return

    const fileArray = Array.from(selected)

    setFiles(fileArray)
    setPreviewUrl(URL.createObjectURL(fileArray[0]))
    setResult(null)
    setError('')
  }

  const handleConvert = async () => {
    if (!files.length) {
      return setError('Please upload a file first.')
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
        if (!width || !height) {
          setError('Please enter width and height')
          setLoading(false)
          return
        }

        fd.append('width', width)
        fd.append('height', height)
      }

      if (tool.multiple) {
        files.forEach((f) => fd.append(tool.fieldName, f))
      } else {
        fd.append(tool.fieldName, files[0])
      }

      const res = await axios.post(
        `${API}/${tool.endpoint}`,
        fd,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )

            setProgress(percent)
          }
        }
      )

      setResult(res.data)
    } catch (err) {
      setError(
        err.response?.data?.error || 'Conversion failed'
      )
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#0f172a] rounded-3xl w-full max-w-lg p-8 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500 text-white text-xl"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={tool.icon}
            alt={tool.title}
            className="w-20 h-20"
          />

          <div>
            <h2 className="text-white text-xl font-bold">
              {tool.title}
            </h2>

            <p className="text-slate-400">
              {tool.description}
            </p>
          </div>
        </div>

        {/* WATERMARK */}
        {tool.id === 'watermark' && (
          <div className="mb-4">
            <input
              value={watermarkText}
              onChange={(e) =>
                setWatermarkText(e.target.value)
              }
              placeholder="Enter watermark text"
              className="w-full bg-slate-800 text-white p-3 rounded-xl mb-3"
            />

            {previewUrl && (
              <div className="relative h-[350px] bg-slate-900 rounded-xl overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />

                <Draggable
                  bounds="parent"
                  position={position}
                  onStop={(e, d) =>
                    setPosition({
                      x: d.x,
                      y: d.y,
                    })
                  }
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
              onChange={(e) =>
                setWidth(e.target.value)
              }
              className="w-full bg-slate-800 text-white p-3 rounded-xl"
            />

            <input
              type="number"
              placeholder="Height"
              value={height}
              onChange={(e) =>
                setHeight(e.target.value)
              }
              className="w-full bg-slate-800 text-white p-3 rounded-xl"
            />
          </div>
        )}

        {/* UPSCALE */}
        {tool.id === 'upscale' && (
          <div className="mb-4">
            <select
              value={scale}
              onChange={(e) =>
                setScale(Number(e.target.value))
              }
              className="w-full bg-slate-800 text-white p-3 rounded-xl"
            >
              <option value={2}>2x Upscale</option>
              <option value={4}>4x Upscale</option>
            </select>
          </div>
        )}

        {/* FILE INPUT */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) =>
            handleFiles(e.target.files)
          }
        />

        <button
          onClick={() => inputRef.current.click()}
          className="w-full border border-dashed border-slate-600 text-white py-8 rounded-xl"
        >
          Upload File
        </button>

        {/* PROGRESS */}
        {loading && (
          <div className="mt-4 text-white">
            Uploading... {progress}%
          </div>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-red-400 mt-3">
            {error}
          </p>
        )}

        {/* ACTION */}
        {!result ? (
          <button
            onClick={handleConvert}
            className={`w-full mt-5 bg-gradient-to-r ${tool.gradient} text-white py-3 rounded-xl font-bold`}
          >
            {loading
              ? 'Processing...'
              : tool.buttonLabel}
          </button>
        ) : (
          <button
            onClick={() =>
              download(result.downloadUrl)
            }
            className={`w-full mt-5 bg-gradient-to-r ${tool.gradient} text-white py-3 rounded-xl font-bold`}
          >
            Download File
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------- TOOLS ---------------- */

const tools = [
  {
    id: 'jpg-to-png',
    title: 'JPG to PNG',
    description: 'Convert JPG images to PNG',
    icon: jpgToPngIcon,
    gradient: 'from-blue-500 to-cyan-500',
    endpoint: 'jpg-to-png',
    fieldName: 'image',
    buttonLabel: 'Convert to PNG',
  },

  {
    id: 'png-to-jpg',
    title: 'PNG to JPG',
    description: 'Convert PNG images to JPG',
    icon: pngToJpgIcon,
    gradient: 'from-purple-500 to-pink-500',
    endpoint: 'png-to-jpg',
    fieldName: 'image',
    buttonLabel: 'Convert to JPG',
  },

  {
    id: 'resize',
    title: 'Resize Image',
    description: 'Resize image dimensions',
    icon: jpgToPngIcon,
    gradient: 'from-green-500 to-emerald-500',
    endpoint: 'resize',
    fieldName: 'image',
    buttonLabel: 'Resize Image',
  },

  {
    id: 'compress',
    title: 'Compress Image',
    description: 'Reduce image file size',
    icon: pngToJpgIcon,
    gradient: 'from-orange-500 to-red-500',
    endpoint: 'compress',
    fieldName: 'image',
    buttonLabel: 'Compress Image',
  },

  {
    id: 'crop',
    title: 'Crop Image',
    description: 'Crop unwanted areas',
    icon: jpgToPngIcon,
    gradient: 'from-pink-500 to-rose-500',
    endpoint: 'crop',
    fieldName: 'image',
    buttonLabel: 'Crop Image',
  },

  {
    id: 'rotate',
    title: 'Rotate Image',
    description: 'Rotate image angle',
    icon: pngToJpgIcon,
    gradient: 'from-indigo-500 to-blue-500',
    endpoint: 'rotate',
    fieldName: 'image',
    buttonLabel: 'Rotate Image',
  },

  {
    id: 'watermark',
    title: 'Add Watermark',
    description: 'Add text watermark',
    icon: jpgToPngIcon,
    gradient: 'from-cyan-500 to-sky-500',
    endpoint: 'watermark',
    fieldName: 'image',
    buttonLabel: 'Add Watermark',
  },

  {
    id: 'upscale',
    title: 'Upscale Image',
    description: 'Increase image quality',
    icon: pngToJpgIcon,
    gradient: 'from-violet-500 to-fuchsia-500',
    endpoint: 'upscale',
    fieldName: 'image',
    buttonLabel: 'Upscale Image',
  },

  {
    id: 'grayscale',
    title: 'Grayscale Image',
    description: 'Convert image to grayscale',
    icon: jpgToPngIcon,
    gradient: 'from-gray-500 to-slate-700',
    endpoint: 'grayscale',
    fieldName: 'image',
    buttonLabel: 'Convert to Grayscale',
  },

  {
    id: 'flip',
    title: 'Flip Image',
    description: 'Flip image horizontally',
    icon: pngToJpgIcon,
    gradient: 'from-teal-500 to-green-500',
    endpoint: 'flip',
    fieldName: 'image',
    buttonLabel: 'Flip Image',
  },

  {
    id: 'webp',
    title: 'Convert to WEBP',
    description: 'Convert image to WEBP',
    icon: jpgToPngIcon,
    gradient: 'from-yellow-500 to-orange-500',
    endpoint: 'webp',
    fieldName: 'image',
    buttonLabel: 'Convert to WEBP',
  },
]

export default function ImageTools() {
  const navigate = useNavigate()
  const [activeTool, setActiveTool] = useState(null)

  return (
    <div className="min-h-screen">

      <div className="h-20" />

      {/* HERO */}
      <div className="text-center py-20">
        <img
          src={mainImgLogo}
          alt="Image Tools"
          className="w-40 mx-auto mb-6"
        />

        <h1 className="text-5xl font-bold">
          Image Tools
        </h1>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6 px-10">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() =>
              tool.path
                ? navigate(tool.path)
                : setActiveTool(tool)
            }
            className="bg-white p-6 rounded-2xl shadow"
          >
            <img
              src={tool.icon}
              alt={tool.title}
              className="w-24 mx-auto"
            />

            <h3 className="mt-3 font-bold">
              {tool.title}
            </h3>
          </button>
        ))}
      </div>

      {activeTool && (
        <Modal
          tool={activeTool}
          onClose={() =>
            setActiveTool(null)
          }
        />
      )}
    </div>
  )
}