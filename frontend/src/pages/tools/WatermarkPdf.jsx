import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const API = 'https://fileconverters-lf0e.onrender.com/api/pdf'

export default function WatermarkPdf() {
  const [pdfFile,     setPdfFile]     = useState(null)
  const [dragging,    setDragging]    = useState(false)
  const [text,        setText]        = useState('CONFIDENTIAL')
  const [fontSize,    setFontSize]    = useState(48)
  const [opacity,     setOpacity]     = useState(0.15)
  const [color,       setColor]       = useState('#808080')
  const [diagonal,    setDiagonal]    = useState(true)
  const [loading,     setLoading]     = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error,       setError]       = useState('')
  const inputRef = useRef()

  const handleFile = (file) => {
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setDownloadUrl(null)
      setError('')
    } else {
      alert('Please upload a valid PDF file.')
    }
  }

  const handleWatermark = async () => {
    if (!pdfFile) return setError('Please upload a PDF file.')
    if (!text.trim()) return setError('Please enter watermark text.')
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('pdf',      pdfFile)
      fd.append('text',     text)
      fd.append('fontSize', fontSize)
      fd.append('opacity',  opacity)
      fd.append('color',    color.replace('#', ''))
      fd.append('diagonal', diagonal)

      const res  = await fetch(`${API}/watermark-pdf`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setDownloadUrl(data.downloadUrl)
    } catch (err) {
      setError('Something went wrong. Is backend running?')
    }
    setLoading(false)
  }

  const handleDownload = async () => {
    try {
      const res  = await fetch(downloadUrl)
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `watermarked-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download failed: ' + err.message)
    }
  }

  const PRESETS = [
    { label: 'CONFIDENTIAL', color: '#dc2626' },
    { label: 'DRAFT',        color: '#d97706' },
    { label: 'APPROVED',     color: '#16a34a' },
    { label: 'TOP SECRET',   color: '#7c3aed' },
    { label: 'SAMPLE',       color: '#0369a1' },
    { label: 'DO NOT COPY',  color: '#475569' },
  ]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/pdf-tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-8 transition-colors">
          ← Back to PDF Tools
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/25">
            💧
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Watermark PDF</h1>
          <p className="text-slate-500">Add a professional watermark to all pages of your PDF</p>
        </div>

        <div className="space-y-6">

          {/* Step 1 — Upload */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">1</span>
              Upload PDF
            </h2>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => inputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                ${dragging ? 'border-blue-500 bg-blue-50' : pdfFile ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'}`}
            >
              <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              {pdfFile ? (
                <>
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-bold text-green-700">{pdfFile.name}</p>
                  <p className="text-sm text-slate-500 mt-1">Click to change file</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">📄</div>
                  <p className="font-bold text-slate-700 mb-1">Drop your PDF here</p>
                  <p className="text-sm text-slate-500 mb-4">or click to browse</p>
                  <div className="inline-block bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md">
                    Choose PDF File
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Step 2 — Watermark Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">2</span>
              Watermark Settings
            </h2>

            {/* Presets */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button key={p.label}
                    onClick={() => { setText(p.label); setColor(p.color) }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all
                      ${text === p.label ? 'scale-105 shadow-md' : 'hover:scale-105'}`}
                    style={{
                      borderColor: p.color,
                      color: text === p.label ? '#fff' : p.color,
                      background: text === p.label ? p.color : 'transparent'
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Watermark Text</label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter watermark text..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Font Size */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Font Size: {fontSize}px</label>
                <input type="range" min="12" max="100" value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>

              {/* Opacity */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Opacity: {Math.round(opacity * 100)}%</label>
                <input type="range" min="0.05" max="0.8" step="0.05" value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5" />
                <span className="text-sm font-mono text-slate-600">{color}</span>
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Watermark Style</label>
              <div className="flex gap-3">
                <button onClick={() => setDiagonal(true)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all
                    ${diagonal ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  ↗ Diagonal Grid
                </button>
                <button onClick={() => setDiagonal(false)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all
                    ${!diagonal ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  ⊙ Center Only
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">3</span>
              Preview
            </h2>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 aspect-[0.707] max-w-xs mx-auto flex items-center justify-center overflow-hidden relative">
              {/* Fake page lines */}
              <div className="absolute inset-4 flex flex-col gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-2 bg-slate-200 rounded" style={{ width: `${70 + Math.random() * 25}%` }} />
                ))}
              </div>
              {/* Watermark preview */}
              {diagonal ? (
                <>
                  {[[-20,30],[80,120],[170,60],[20,160]].map(([x, y], i) => (
                    <span key={i} className="absolute font-bold select-none pointer-events-none"
                      style={{
                        left: `${x}px`, top: `${y}px`,
                        fontSize: `${Math.max(12, fontSize * 0.3)}px`,
                        color, opacity, transform: 'rotate(45deg)',
                        whiteSpace: 'nowrap'
                      }}>
                      {text}
                    </span>
                  ))}
                </>
              ) : (
                <span className="absolute font-bold select-none pointer-events-none text-center"
                  style={{
                    fontSize: `${Math.max(12, fontSize * 0.3)}px`,
                    color, opacity, whiteSpace: 'nowrap'
                  }}>
                  {text}
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Apply Button */}
          {!downloadUrl ? (
            <button onClick={handleWatermark} disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-500/25 hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Adding Watermark...
                </span>
              ) : '💧 Apply Watermark'}
            </button>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Watermark Added!</h3>
              <p className="text-slate-500 text-sm mb-6">Your watermark has been applied to all pages</p>
              <button onClick={handleDownload}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-green-500/25 hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                ⬇️ Download Watermarked PDF
              </button>
              <button onClick={() => { setDownloadUrl(null); setPdfFile(null) }}
                className="mt-3 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                ↩ Watermark another PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}