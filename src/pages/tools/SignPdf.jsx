import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const API = 'https://fileconverters-lf0e.onrender.com/api/pdf'

export default function SignPdf() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)

  const [pageNum] = useState(1)

  const [drawing, setDrawing] = useState(false)
  const [hasSig, setHasSig] = useState(false)
  const [sigImg, setSigImg] = useState(null)

  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState('')

  const [step, setStep] = useState(1)

  const [sigPos, setSigPos] = useState({ x: 100, y: 200 })
  const [sigSize] = useState({ w: 180, h: 70 })
  const [isDraggingSig, setIsDraggingSig] = useState(false)

  const dragOffset = useRef({ x: 0, y: 0 })
  const canvasRef = useRef()
  const inputRef = useRef()
  const pdfPageRef = useRef()

  // ---------------- CANVAS ----------------
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#1e3a8a'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  useEffect(() => {
    initCanvas()
  }, [])

  // ---------------- DRAW ----------------
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0]

    return {
      x: (touch?.clientX ?? e.clientX) - rect.left,
      y: (touch?.clientY ?? e.clientY) - rect.top,
    }
  }

  const startDraw = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)

    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)

    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)

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

  const confirmSig = () => {
    const canvas = canvasRef.current
    const img = canvas.toDataURL('image/png')
    setSigImg(img)
    setStep(3)
  }

  // ---------------- FILE ----------------
  const handleFile = (file) => {
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setPdfUrl(URL.createObjectURL(file))
      setDownloadUrl(null)
      setError('')
      setStep(2)
    } else {
      setError('Please upload a valid PDF file.')
    }
  }

  // ---------------- DRAG ----------------
  const onSigMouseDown = (e) => {
    e.preventDefault()

    dragOffset.current = {
      x: e.clientX - sigPos.x,
      y: e.clientY - sigPos.y,
    }

    setIsDraggingSig(true)
  }

  const onPageMouseMove = (e) => {
    if (!isDraggingSig) return

    setSigPos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    })
  }

  const onPageMouseUp = () => setIsDraggingSig(false)

  // ---------------- SIGN ----------------
  const handleSign = async () => {
    if (!pdfFile) return setError('Please upload a PDF file.')
    if (!sigImg) return setError('Please draw your signature first.')

    setLoading(true)
    setError('')

    try {
      const pageRect = pdfPageRef.current?.getBoundingClientRect()

      const relX = sigPos.x - (pageRect?.left ?? 0)
      const relY = sigPos.y - (pageRect?.top ?? 0)

      const fd = new FormData()
      fd.append('pdf', pdfFile)
      fd.append('signatureData', sigImg)
      fd.append('pageNum', pageNum - 1)
      fd.append('x', Math.max(0, relX))
      fd.append('y', Math.max(0, relY))
      fd.append('width', sigSize.w)
      fd.append('height', sigSize.h)

      const res = await fetch(`${API}/sign-pdf`, {
        method: 'POST',
        body: fd,
      })

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
      const res = await fetch(downloadUrl)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `signed-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download failed: ' + err.message)
    }
  }

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">

        <Link
          to="/pdf-tools"
          className="text-slate-500 text-sm mb-8 inline-block"
        >
          ← Back to PDF Tools
        </Link>

        <h1 className="text-4xl font-bold mb-6">Sign PDF</h1>

        {/* Upload */}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <button
          onClick={() => inputRef.current.click()}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl mb-6"
        >
          Upload PDF
        </button>

        {/* Canvas */}
        {step >= 2 && (
          <div className="mb-6">
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
              className="border w-full"
            />

            <button onClick={clearSig} className="text-red-500 mt-3">
              Clear
            </button>

            {hasSig && (
              <button
                onClick={confirmSig}
                className="block mt-3 bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm Signature
              </button>
            )}
          </div>
        )}

        {/* PDF */}
        {step >= 3 && sigImg && (
          <div
            ref={pdfPageRef}
            onMouseMove={onPageMouseMove}
            onMouseUp={onPageMouseUp}
            className="relative border"
          >
            <Document file={pdfUrl}>
              <Page pageNumber={pageNum} width={600} />
            </Document>

            <img
              src={sigImg}
              onMouseDown={onSigMouseDown}
              draggable={false}
              style={{
                position: 'absolute',
                left: sigPos.x,
                top: sigPos.y,
                width: sigSize.w,
                height: sigSize.h,
                cursor: 'grab',
              }}
            />
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {step === 3 && !downloadUrl && (
          <button
            onClick={handleSign}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl mt-4"
          >
            {loading ? 'Signing...' : 'Sign PDF'}
          </button>
        )}

        {downloadUrl && (
          <button
            onClick={handleDownload}
            className="w-full bg-green-600 text-white py-3 rounded-xl mt-4"
          >
            Download Signed PDF
          </button>
        )}

      </div>
    </div>
  )
}