import { useState, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

export default function ToolModal({ tool, onClose }) {

  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    setFile(selected)
    setResult(null)
    setError('')
  }

  const handleConvert = async () => {
    if (!file) return setError('Please upload a file')

    setLoading(true)
    setError('')

    try {
      const fd = new FormData()

      fd.append(tool.fieldName, file)

      const res = await axios.post(
        `${API}/${tool.endpoint}`,
        fd
      )

      setResult(res.data)

    } catch (err) {
      setError(err.response?.data?.error || 'Conversion failed')
    }

    setLoading(false)
  }

  const download = async (url) => {
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
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">

      <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-slate-600 hover:text-red-500"
        >
          ×
        </button>

        {/* TITLE */}
        <div className="text-center mb-6">
          <img src={tool.icon} className="w-20 mx-auto mb-3" />
          <h2 className="text-xl font-bold">{tool.title}</h2>
          <p className="text-slate-500 text-sm">{tool.description}</p>
        </div>

        {/* UPLOAD */}
        <input
          ref={inputRef}
          type="file"
          accept={tool.accept}
          onChange={handleFile}
          className="hidden"
        />

        <button
          onClick={() => inputRef.current.click()}
          className="w-full border-2 border-dashed rounded-2xl py-8 mb-4"
        >
          Upload File
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* CONVERT */}
        <button
          onClick={handleConvert}
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-white font-bold bg-gradient-to-r ${tool.gradient}`}
        >
          {loading ? 'Processing...' : 'Convert'}
        </button>

        {/* RESULT */}
        {result?.downloadUrl && (
          <button
            onClick={() => download(result.downloadUrl)}
            className="w-full mt-4 py-4 rounded-2xl bg-green-500 text-white font-bold"
          >
            Download File
          </button>
        )}

      </div>
    </div>
  )
}