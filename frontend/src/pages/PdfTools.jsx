import { useState } from 'react'
import axios from 'axios'
import UploadBox from '../components/UploadBox'
import pptxIcon from '../assets/pptx-to-pdf.png';
import imgIcon from '../assets/img-to-pdf.png';
import mergeIcon from '../assets/merge-pdf.png';
import splitIcon from '../assets/split-pdf.png';
import compressIcon from '../assets/compress-pdf.png';
import pdfJpgIcon from '../assets/pdf-to-jpg.png';
import signPdfIcon from '../assets/sign-pdf.png';
import watermarkPdfIcon from '../assets/watermark-pdf.png';
import htmlPdfIcon from '../assets/html-to-pdf.png';
import mainPdfLogo from '../assets/pdf-tools-logo.png';
const API = 'http://localhost:5000/api/pdf'

/* =========================
   MODAL
========================= */
function Modal({ tool, onClose }) {
  const [file, setFile] = useState(null)
  const [files, setFiles] = useState([])
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const handleUpload = (f) => {
    setFile(tool.multiple ? null : f)
    setFiles(tool.multiple ? Array.from(f) : [])
    setResult(null)
    setError('')
  }

  const convert = async () => {
  setLoading(true)
  setError('')
  setProgress(0)

  try {
    let res

    if (tool.isUrlTool) {

      res = await axios.post(
        `${API}/${tool.endpoint}`,
        { url: websiteUrl },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            )

            setProgress(percent)
          },
        }
      )

    } else {

      const fd = new FormData()

      if (tool.multiple) {
        files.forEach((f) => fd.append(tool.fieldName, f))
      } else {
        fd.append(tool.fieldName, file)
      }

      res = await axios.post(
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
    }

    if (res.data.error) {
      setError(res.data.error)
    } else {
      setResult(res.data)
      setProgress(100)
    }

  } catch {
    setError('Server error')
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-[#0f172a] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden">

        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="mb-6 flex justify-center items-center">
  <img
    src={tool.icon}
    alt={tool.title}
    className="w-20 h-20 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-lg"
  />
</div>
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
              {tool.isUrlTool ? (
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3"
                />
              ) : (
                <UploadBox
                  accept={tool.accept}
                  multiple={tool.multiple}
                  label="Upload File"
                  onUpload={handleUpload}
                />
              )}

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
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setFiles([])
                  setWebsiteUrl('')
                }}
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
  id: 'pptx',
  title: 'PPTX to PDF',
  description: 'Convert PowerPoint to PDF',
  icon: pptxIcon,
  gradient: 'from-red-500 to-orange-500',
  accept: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  multiple: false,
  fieldName: 'file',
  endpoint: 'pptx-to-pdf',
  buttonLabel: 'Convert',
},
  {
  id: 'img',
  title: 'Image to PDF',
  description: 'Convert images into PDF',
  icon: imgIcon,
  gradient: 'from-red-500 to-orange-500',
  accept: 'image/*',
  multiple: true,
  fieldName: 'images',
  endpoint: 'img-to-pdf',
  buttonLabel: 'Convert',
},
  {
  id: 'merge',
  title: 'Merge PDF',
  description: 'Combine PDF files',
  icon: mergeIcon,
  gradient: 'from-orange-500 to-yellow-500',
  accept: 'application/pdf',
  multiple: true,
  fieldName: 'pdfs',
  endpoint: 'merge-pdf',
  buttonLabel: 'Merge',
},
  {
  id: 'split',
  title: 'Split PDF',
  description: 'Split PDF pages',
  icon: splitIcon,
  gradient: 'from-pink-500 to-red-500',
  accept: 'application/pdf',
  multiple: false,
  fieldName: 'pdf',
  endpoint: 'split-pdf',
  buttonLabel: 'Split',
},
  {
  id: 'compress',
  title: 'Compress PDF',
  description: 'Reduce file size',
  icon: compressIcon,
  gradient: 'from-red-600 to-rose-500',
  accept: 'application/pdf',
  multiple: false,
  fieldName: 'pdf',
  endpoint: 'compress-pdf',
  buttonLabel: 'Compress',
},
 
  {
  id: 'pdf-jpg',
  title: 'PDF to JPG',
  description: 'Convert PDF pages to JPG images',
  icon: pdfJpgIcon,
  gradient: 'from-red-500 to-orange-500',
  accept: 'application/pdf,.pdf',
  multiple: false,
  fieldName: 'pdf',
  endpoint: 'pdf-to-jpg',
  buttonLabel: 'Convert',
},

{
  id: 'sign-pdf',
  title: 'Sign PDF',
  description: 'Draw and place your signature on PDF',
  icon: signPdfIcon,
  gradient: 'from-indigo-500 to-purple-500',
  isLink: true,
  link: '/tools/sign-pdf',
},

{
  id: 'watermark-pdf',
  title: 'Watermark PDF',
  description: 'Add text watermark to all PDF pages',
  icon: watermarkPdfIcon,
  gradient: 'from-blue-500 to-indigo-500',
  isLink: true,
  link: '/tools/watermark-pdf',
},

{
  id: 'html-to-pdf',
  title: 'Html to PDF',
  description: 'Convert any website into PDF using URL',
  icon: htmlPdfIcon,
  gradient: 'from-emerald-500 to-teal-500',
  isUrlTool: true,
  endpoint: 'html-to-pdf',
  buttonLabel: 'Convert Website →',
  outputFileName: 'website.pdf',
  outputLabel: 'PDF',
  badge: 'Live',
},
]

/* =========================
   MAIN PAGE
========================= */
export default function PdfTools() {
  const [active, setActive] = useState(null)

  return (
    <div className="min-h-screen">

      <div className="h-20" />

      {/* HERO */}
      <div className="min-h-[55vh] flex flex-col justify-center items-center text-center px-6">
        <div className="mb-6 hover:-translate-y-2 transition-all duration-500">
  <img
    src={mainPdfLogo}
    alt="PDF Tools"
    className="w-50 h-50 object-contain scale-125 drop-shadow-[0_20px_45px_rgba(239,68,68,0.35)] hover:scale-110 hover:rotate-y-180 transition-all duration-700"
    style={{ transformStyle: 'preserve-3d' }}
  />
</div>
        <h1 className="text-5xl font-bold text-slate-900">
          PDF Tools
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          Convert, merge and compress PDF files instantly.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {tools.map((tool) => (
  <div key={tool.id} className="relative group">

    {/* Glow background (SAFE VERSION) */}
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




