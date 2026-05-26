import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

function ToolPage({
  title,
  description,
  icon,
  gradient,
  accept,
  multiple,
  apiUrl,
  fieldName,
  extraFields,
  backLink,
  backLabel,
}) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFiles = (selected) => {
    setFiles(Array.from(selected))
    setResult(null)
    setError('')
  }

  const handleConvert = async () => {
    if (!files.length) return setError('Please upload a file first.')
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      if (multiple) {
        files.forEach((f) => fd.append(fieldName, f))
      } else {
        fd.append(fieldName, files[0])
      }
      if (extraFields) {
        Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v))
      }
      const res = await fetch(apiUrl, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const resetAll = () => {
    setFiles([])
    setResult(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">

      {/* Top Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br ${gradient} opacity-10 blur-3xl pointer-events-none`} />

      <div className="relative max-w-3xl mx-auto px-4 py-16">

        {/* Back Button */}
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          {backLabel}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl`}>
            {icon}
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">{title}</h1>
          <p className="text-slate-400 text-lg">{description}</p>
        </div>

        {/* Upload Area */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => inputRef.current.click()}
            className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300
              ${dragging
                ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                : files.length
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/3'
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {files.length ? (
              <>
                <div className="text-5xl mb-4">✅</div>
                <p className="text-white font-bold text-xl mb-2">
                  {multiple ? `${files.length} file(s) selected` : files[0].name}
                </p>
                <p className="text-slate-400 text-sm">Click to change file</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">☁️</div>
                <p className="text-white font-bold text-xl mb-2">
                  Drop your file here
                </p>
                <p className="text-slate-400 text-sm mb-6">or click to browse</p>
                <div className={`inline-block bg-gradient-to-r ${gradient} text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg`}>
                  Choose File
                </div>
              </>
            )}
          </div>
        )}

        {/* Extra Fields Slot */}
        {extraFields && !result && (
          <div className="mt-4">{extraFields.renderInputs?.()}</div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Convert Button */}
        {files.length > 0 && !result && (
          <button
            onClick={handleConvert}
            disabled={loading}
            className={`w-full mt-6 bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-extrabold py-4 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Converting...
              </span>
            ) : `Convert Now →`}
          </button>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 bg-white/3 border border-white/10 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-white font-extrabold text-2xl mb-2">Done!</h3>
            <p className="text-slate-400 mb-8">Your file is ready to download</p>

            {/* Single Download */}
            {result.downloadUrl && (
              <a
                href={result.downloadUrl}
                download
                className={`inline-block bg-gradient-to-r ${gradient} text-white font-extrabold px-10 py-4 rounded-2xl text-lg shadow-xl hover:opacity-90 hover:scale-105 transition-all duration-300`}
              >
                ⬇️ Download File
              </a>
            )}

            {/* Multiple Downloads (Split PDF) */}
            {result.downloadUrls && (
              <div className="space-y-3">
                {result.downloadUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    download
                    className={`block bg-gradient-to-r ${gradient} text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:opacity-90 transition-all`}
                  >
                    ⬇️ Download Page {i + 1}
                  </a>
                ))}
              </div>
            )}

            {/* Convert Another */}
            <button
              onClick={resetAll}
              className="mt-6 block w-full text-slate-400 hover:text-white text-sm transition-colors"
            >
              ↩ Convert another file
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ToolPage