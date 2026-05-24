import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const API = 'http://localhost:5000/api/pdf'

export default function SignPdf() {
  const [pdfFile,     setPdfFile]     = useState(null)
  const [pdfUrl,      setPdfUrl]      = useState(null)
  const [numPages,    setNumPages]    = useState(0)
  const [pageNum,     setPageNum]     = useState(1)
  const [dragging,    setDragging]    = useState(false)
  const [drawing,     setDrawing]     = useState(false)
  const [hasSig,      setHasSig]      = useState(false)
  const [sigImg,      setSigImg]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error,       setError]       = useState('')
  const [penColor,    setPenColor]    = useState('#1e3a8a')
  const [penSize,     setPenSize]     = useState(3)
  const [step,        setStep]        = useState(1) // 1=upload, 2=draw, 3=place

  // Signature position on PDF preview
  const [sigPos,  setSigPos]  = useState({ x: 100, y: 200 })
  const [sigSize, setSigSize] = useState({ w: 180, h: 70 })
  const [isDraggingSig, setIsDraggingSig] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const canvasRef  = useRef()
  const inputRef   = useRef()
  const pdfPageRef = useRef()

  // Setup canvas with transparent background
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = penColor
    ctx.lineWidth   = penSize
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
  }

  useEffect(() => { initCanvas() }, [penColor, penSize])

  const getPos = (e, canvas) => {
    const rect  = canvas.getBoundingClientRect()
    const touch = e.touches?.[0]
    return {
      x: (touch?.clientX ?? e.clientX) - rect.left,
      y: (touch?.clientY ?? e.clientY) - rect.top,
    }
  }

  const startDraw = (e) => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e, canvas)
    ctx.strokeStyle = penColor
    ctx.lineWidth   = penSize
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasSig(true)
  }

  const stopDraw = () => setDrawing(false)

  const clearSig = () => {
    initCanvas()
    setHasSig(false)
    setSigImg(null)
  }

  // Convert canvas to transparent PNG
  const confirmSig = () => {
    const canvas = canvasRef.current
    const img    = canvas.toDataURL('image/png')
    setSigImg(img)
    setStep(3)
  }

  const handleFile = (file) => {
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setPdfUrl(URL.createObjectURL(file))
      setDownloadUrl(null)
      setError('')
      setStep(2)
    } else {
      alert('Please upload a valid PDF file.')
    }
  }

  // Drag signature on PDF preview
  const onSigMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - sigPos.x,
      y: e.clientY - sigPos.y,
    }
    setIsDraggingSig(true)
  }

  const onPageMouseMove = (e) => {
    if (!isDraggingSig) return
    const pageRect = pdfPageRef.current?.getBoundingClientRect()
    if (!pageRect) return
    const newX = e.clientX - dragOffset.current.x
    const newY = e.clientY - dragOffset.current.y
    setSigPos({ x: newX, y: newY })
  }

  const onPageMouseUp = () => setIsDraggingSig(false)

  const handleSign = async () => {
    if (!pdfFile) return setError('Please upload a PDF file.')
    if (!sigImg)  return setError('Please draw your signature first.')
    setLoading(true)
    setError('')
    try {
      // Calculate position relative to PDF page
      const pageRect = pdfPageRef.current?.getBoundingClientRect()
      const relX = sigPos.x - (pageRect?.left ?? 0)
      const relY = sigPos.y - (pageRect?.top  ?? 0)

      const fd = new FormData()
      fd.append('pdf',           pdfFile)
      fd.append('signatureData', sigImg)
      fd.append('pageNum',       pageNum - 1)
      fd.append('x',             Math.max(0, relX))
      fd.append('y',             Math.max(0, relY))
      fd.append('width',         sigSize.w)
      fd.append('height',        sigSize.h)

      const res  = await fetch(`${API}/sign-pdf`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setDownloadUrl(data.downloadUrl)
    } catch {
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
      a.download = `signed-${Date.now()}.pdf`
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
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link to="/pdf-tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-8 transition-colors">
          ← Back to PDF Tools
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            ✍️
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sign PDF</h1>
          <p className="text-slate-500">Draw your signature and drag it anywhere on your PDF</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Upload PDF', 'Draw Signature', 'Place & Sign'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
                ${step === i+1 ? 'bg-indigo-600 text-white shadow-md' : step > i+1 ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <span>{step > i+1 ? '✓' : i+1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${step > i+1 ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="space-y-6">

          {/* STEP 1 — Upload PDF */}
          {step >= 1 && (
            <div className={`bg-white rounded-3xl border shadow-sm p-6 transition-all ${step===1?'border-indigo-300':'border-slate-200'}`}>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${step>1?'bg-green-500 text-white':'bg-indigo-100 text-indigo-600'}`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                Upload PDF
              </h2>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                onClick={() => inputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                  ${dragging ? 'border-indigo-500 bg-indigo-50' : pdfFile ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
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
                    <div className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md">
                      Choose PDF File
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Draw Signature */}
          {step >= 2 && (
            <div className={`bg-white rounded-3xl border shadow-sm p-6 transition-all ${step===2?'border-indigo-300':'border-slate-200'}`}>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${step>2?'bg-green-500 text-white':'bg-indigo-100 text-indigo-600'}`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                Draw Your Signature
              </h2>

              {/* Pen Controls */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600 font-medium">Color:</label>
                  <input type="color" value={penColor} onChange={e => setPenColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600 font-medium">Thickness:</label>
                  <input type="range" min="1" max="8" value={penSize} onChange={e => setPenSize(Number(e.target.value))}
                    className="w-24 accent-indigo-600" />
                  <span className="text-sm text-slate-500">{penSize}px</span>
                </div>
                <button onClick={clearSig}
                  className="ml-auto px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all">
                  🗑 Clear
                </button>
              </div>

              {/* Signature Canvas — transparent background */}
              <div className="rounded-2xl overflow-hidden border-2 border-slate-200 cursor-crosshair shadow-inner relative"
                style={{ background: 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 0 0 / 20px 20px' }}>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  className="w-full"
                  style={{ background: 'transparent' }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                ✏️ Draw your signature — the background will be transparent (checkered = transparent)
              </p>

              {/* Signature Size */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Signature Width</label>
                  <input type="number" value={sigSize.w} min={50} max={400}
                    onChange={e => setSigSize(s => ({ ...s, w: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Signature Height</label>
                  <input type="number" value={sigSize.h} min={20} max={200}
                    onChange={e => setSigSize(s => ({ ...s, h: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>

              {hasSig && (
                <button onClick={confirmSig}
                  className="w-full mt-4 py-3 rounded-2xl text-white font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  ✅ Confirm Signature — Place on PDF →
                </button>
              )}
            </div>
          )}

          {/* STEP 3 — Place Signature */}
          {step >= 3 && sigImg && (
            <div className={`bg-white rounded-3xl border shadow-sm p-6 ${step===3?'border-indigo-300':'border-slate-200'}`}>
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-black">3</span>
                Drag Signature to Position
              </h2>
              <p className="text-sm text-slate-500 mb-4">🖱 Drag your signature anywhere on the PDF page below</p>

              {/* Page selector */}
              {numPages > 1 && (
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm font-medium text-slate-600">Page:</label>
                  <div className="flex gap-1">
                    {[...Array(numPages)].map((_, i) => (
                      <button key={i} onClick={() => setPageNum(i+1)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all
                          ${pageNum===i+1?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                        {i+1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Preview with draggable signature */}
              <div
                ref={pdfPageRef}
                className="relative border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg select-none"
                style={{ display: 'inline-block', cursor: isDraggingSig ? 'grabbing' : 'default' }}
                onMouseMove={onPageMouseMove}
                onMouseUp={onPageMouseUp}
                onMouseLeave={onPageMouseUp}
              >
                <Document file={pdfUrl} onLoadSuccess={({ numPages: n }) => setNumPages(n)} loading="">
                  <Page pageNumber={pageNum} width={560} renderAnnotationLayer={false} renderTextLayer={false} />
                </Document>

                {/* Draggable Signature */}
                <img
                  src={sigImg}
                  alt="signature"
                  onMouseDown={onSigMouseDown}
                  style={{
                    position:  'absolute',
                    left:      sigPos.x,
                    top:       sigPos.y,
                    width:     sigSize.w,
                    height:    sigSize.h,
                    cursor:    isDraggingSig ? 'grabbing' : 'grab',
                    userSelect:'none',
                    filter:    'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                    border:    '2px dashed #6366f1',
                    borderRadius: 4,
                  }}
                  draggable={false}
                />
              </div>

              <p className="text-xs text-slate-400 mt-2">
                💡 Drag the signature to position it exactly where you want
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Sign Button */}
          {step === 3 && !downloadUrl && (
            <button onClick={handleSign} disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing PDF...
                </span>
              ) : '✍️ Apply Signature to PDF'}
            </button>
          )}

          {/* Download */}
          {downloadUrl && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">PDF Signed!</h3>
              <p className="text-slate-500 text-sm mb-6">Your signature has been placed on the PDF</p>
              <button onClick={handleDownload}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-green-500/25 hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                ⬇️ Download Signed PDF
              </button>
              <button onClick={() => { setDownloadUrl(null); setPdfFile(null); clearSig(); setStep(1); setSigImg(null) }}
                className="mt-3 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                ↩ Sign another PDF
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}