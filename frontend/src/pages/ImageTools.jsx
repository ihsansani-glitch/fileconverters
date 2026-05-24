import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Draggable from 'react-draggable'
import jpgToPngIcon from '../assets/jpg-to-png.png'
import pngToJpgIcon from '../assets/png-to-jpg.png'
import mainImgLogo from '../assets/img-tools-logo.png'
import compressImageIcon from '../assets/compress-image.png'
import webpIcon from '../assets/webp.png'
import webpJpgIcon from '../assets/webp-to-jpg.png';
import heicIcon from '../assets/heic-to-jpg.png'
import svgPngIcon from '../assets/svg-to-png.png'
import cropIcon from '../assets/crop-image.png'
import resizeIcon from '../assets/resize.png'
import rotateIcon from '../assets/rotate.png'


const API = 'http://localhost:5000/api/image'

function Modal({ tool, onClose }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [watermarkText, setWatermarkText] = useState('')

const [position, setPosition] = useState({
  x: 100,
  y: 100,
})

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

  // preview
  setPreviewUrl(URL.createObjectURL(fileArray[0]))

  setResult(null)
  setError('')
}
  

  const handleConvert = async () => {
  if (!files.length) return setError('Please upload a file first.')

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
    // ✅ RESIZE VALIDATION + DATA
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
    console.log(res.data)

setResult(res.data)

   } catch (err) {

  console.log(err)

  if (err.response) {
    console.log(err.response.data)
  }

  setError(
    err.response?.data?.error || 'Conversion failed'
  )
}

  setLoading(false)
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#0f172a] rounded-3xl w-full max-w-lg p-8 relative">
        {tool.id === 'watermark' && (
  <div className="mb-4">

    {/* WATERMARK INPUT */}
    <input
      type="text"
      placeholder="Enter watermark text"
      value={watermarkText}
      onChange={(e) => setWatermarkText(e.target.value)}
      className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3 mb-4"
    />

    {/* PREVIEW */}
    {previewUrl ? (
      <div className="relative w-full h-[400px] bg-slate-900 rounded-2xl overflow-hidden">

        {/* IMAGE */}
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-contain"
        />

        {/* DRAGGABLE TEXT */}
        <Draggable
          bounds="parent"
          position={position}
          onStop={(e, data) => {
            setPosition({
              x: data.x,
              y: data.y,
            })
          }}
        >
          <div className="absolute cursor-move text-white text-3xl font-bold opacity-60 select-none">
            {watermarkText || 'Watermark'}
          </div>
        </Draggable>

      </div>
    ) : null}

  </div>
)}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500 transition-all duration-300 flex items-center justify-center text-white text-xl font-bold shadow-lg"
        >
          ✕
        </button>

        <div className="flex items-center gap-4 mb-6">
          <img
            src={tool.icon}
            alt={tool.title}
            className="w-20 h-20 object-contain"
          />
          <div>
            <h2 className="text-white text-xl font-bold">{tool.title}</h2>
            <p className="text-slate-400">{tool.description}</p>
          </div>
        </div>

        {!result ? (
          <>
          {tool.id === 'resize' && (
  <div className="flex gap-3 mb-4">
        {tool.id === 'upscale' && (
  <div className="mb-4">

    <label className="block text-white mb-2">
      Select Upscale Level
    </label>

    <select
      value={scale}
      onChange={(e) => setScale(e.target.value)}
      className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3"
    >
      <option value="2">2x Upscale</option>
      <option value="4">4x Upscale</option>
    </select>

  </div>
)}
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
            <input
              ref={inputRef}
              type="file"
              accept={tool.accept}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <button
              onClick={() => inputRef.current.click()}
              className="w-full border-2 border-dashed border-slate-600 rounded-2xl py-10 text-white"
            >
              Upload File
            </button>
              {loading && (
  <div className="w-full mt-4">
    <div className="flex justify-between text-sm text-white mb-2">
      <span>Uploading & Converting...</span>
      <span>{progress}%</span>
    </div>

    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${tool.gradient}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
)}
            {error && (
              <p className="text-red-400 mt-3">{error}</p>
            )}

            <button
              onClick={handleConvert}
              disabled={loading}
              className={`w-full mt-5 bg-gradient-to-r ${tool.gradient} text-white py-4 rounded-2xl font-bold`}
            >
              {loading ? 'Processing...' : tool.buttonLabel}
            </button>
          </>
        ) : (
          <div className="text-center">
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
          </div>
        )}
      </div>
    </div>
  )
}

const tools = [
  
  {
  id: 'jpg-to-png',
  title: 'JPG to PNG',
  description: 'Convert JPG images to PNG',
  icon: jpgToPngIcon,
  gradient: 'from-blue-500 to-cyan-500',
  path: '/tools/jpg-to-png',
},

  {
  id: 'png-to-jpg',
  title: 'PNG to JPG',
  description: 'Convert PNG images to JPG',
  icon: pngToJpgIcon,
  gradient: 'from-purple-500 to-pink-500',
  path: '/tools/png-to-jpg',
},
  {
  id: 'compress',
  title: 'Compress Image',
  description: 'Reduce image size',
  icon: compressImageIcon,
  gradient: 'from-red-500 to-orange-500',
  path: '/tools/compress-image',
},

{
  id: 'webp',
  title: 'JPG to WebP',
  description: 'Convert images to WebP',
  icon: webpIcon,
  gradient: 'from-green-500 to-emerald-500',
  path: '/tools/jpg-to-webp',
},
{
  id: 'webp-jpg',
  title: 'WebP to JPG',
  description: 'Convert WebP images to JPG',
  icon: webpJpgIcon,
  gradient: 'from-green-500 to-emerald-500',
  path: '/tools/webp-to-jpg',
},
{
  id: 'heic-jpg',
  title: 'HEIC to JPG',
  description: 'Convert HEIC images to JPG',
  icon: heicIcon,
  gradient: 'from-cyan-500 to-blue-500',
  path: '/tools/heic-to-jpg',
},
{
  id: 'svg-png',
  title: 'SVG to PNG',
  description: 'Convert SVG images to PNG',
  icon: svgPngIcon,
  gradient: 'from-violet-500 to-fuchsia-500',
  path: '/tools/svg-to-png',
},
{
  id: 'crop-image',
  title: 'Crop Image',
  description: 'Crop and resize images',
  icon: cropIcon,
  gradient: 'from-yellow-500 to-orange-500',
  path: '/tools/crop-image',
},
{
  id: 'resize',
  title: 'Resize Image',
  description: 'Change image dimensions',
  icon: compressImageIcon,
  gradient: 'from-indigo-500 to-blue-500',
  path: '/tools/resize-image',
},
{
  id: 'upscale',
  title: 'HD Upscaler',
  description: 'Increase image quality',
  icon: resizeIcon,
  gradient: 'from-violet-500 to-fuchsia-500',
  path: '/tools/upscale-image',
},
{
  id: 'rotate-flip',
  title: 'Rotate & Flip',
  description: 'Rotate and flip images easily',
  icon: rotateIcon,
  gradient: 'from-cyan-500 to-blue-500',
  path: '/tools/rotate-flip',
},




]

export default function ImageTools() {
  const navigate = useNavigate()
  const [activeTool, setActiveTool] = useState(null)

  return (
    <div className="min-h-screen">

      <div className="h-20" />

      {/* HERO */}
      <div className="min-h-[55vh] flex flex-col justify-center items-center text-center px-6">

        <div className="mb-6 hover:-translate-y-2 transition-all duration-500">
          <img
            src={mainImgLogo}
            alt="Image Tools"
            className="w-44 h-44 object-contain scale-110 drop-shadow-[0_20px_45px_rgba(59,130,246,0.35)] hover:scale-110 transition-all duration-700"
          />
        </div>

        <h1 className="text-5xl font-bold text-slate-900">
          Image Tools
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          Convert, compress and optimize your images instantly.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {tools.map((tool) => (
            <div key={tool.id} className="relative group">

              {/* GLOW */}
              <div
                className={`absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition bg-gradient-to-r ${tool.gradient}`}
              />

              {/* CARD */}
              <button
                onClick={() =>
                    tool.path
                      ? navigate(tool.path)
                      : setActiveTool(tool)
                  }
                className="relative w-full bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition text-center p-8"
              >

                {/* ICON (MATCH PDF STYLE) */}
                <div className="mb-4 flex justify-center items-center">
                  <div className="w-40 h-20 flex items-center justify-center">
                    <img
                      src={tool.icon}
                      alt={tool.title}
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 drop-shadow-lg"
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

      {activeTool && (
        <Modal
          tool={activeTool}
          onClose={() => setActiveTool(null)}
        />
      )}
    </div>
  )
}