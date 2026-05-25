import { useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'

const API = 'https://fileconverters-lf0e.onrender.com/api/pdf'

export default function WatermarkPdf() {
  const [pdfFile, setPdfFile] = useState(null)
  const [text] = useState('CONFIDENTIAL')
  const [fontSize] = useState(48)
  const [opacity] = useState(0.15)
  const [color] = useState('#808080')
  const [diagonal] = useState(true)

  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState('')

  const inputRef = useRef()

  const fakeLines = useMemo(() => {
    return [82, 91, 76, 88, 73, 95, 84, 79]
  }, [])

  const handleFile = (file) => {
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setDownloadUrl(null)
      setError('')
    } else {
      setError('Please upload a valid PDF file.')
    }
  }

  const handleWatermark = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file.')
      return
    }

    if (!text.trim()) {
      setError('Please enter watermark text.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const fd = new FormData()

      fd.append('pdf', pdfFile)
      fd.append('text', text)
      fd.append('fontSize', fontSize)
      fd.append('opacity', opacity)
      fd.append('color', color.replace('#', ''))
      fd.append('diagonal', diagonal)

      const res = await fetch(`${API}/watermark-pdf`, {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setDownloadUrl(data.downloadUrl)
      }
    } catch {
      setError('Something went wrong. Is backend running?')
    }

    setLoading(false)
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(downloadUrl)
      const blob = await res.blob()

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')

      a.href = url
      a.download = `watermarked-${Date.now()}.pdf`

      document.body.appendChild(a)

      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download failed: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* BACK */}
        <Link
          to="/pdf-tools"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-8"
        >
          ← Back to PDF Tools
        </Link>

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Watermark PDF
          </h1>

          <p className="text-slate-500">
            Add watermark to PDF
          </p>
        </div>

        {/* UPLOAD */}
        <div className="bg-white p-6 rounded-2xl border mb-6">

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <button
            onClick={() => inputRef.current.click()}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl"
          >
            Choose PDF
          </button>

          {pdfFile && (
            <p className="mt-3 text-sm text-slate-600">
              {pdfFile.name}
            </p>
          )}
        </div>

        {/* PREVIEW */}
        <div className="bg-white rounded-2xl p-6 mb-6 border relative overflow-hidden min-h-[300px]">

          <div className="absolute inset-4 flex flex-col gap-2">
            {fakeLines.map((w, i) => (
              <div
                key={i}
                className="h-2 bg-slate-200 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
              diagonal ? 'rotate-[-30deg]' : ''
            }`}
          >
            <span
              style={{
                fontSize: `${fontSize}px`,
                opacity,
                color,
              }}
              className="font-bold tracking-widest select-none"
            >
              {text}
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-500 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ACTION */}
        {!downloadUrl ? (
          <button
            onClick={handleWatermark}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Apply Watermark'}
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className="w-full bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded-xl font-semibold"
          >
            Download PDF
          </button>
        )}

      </div>
    </div>
  )
}