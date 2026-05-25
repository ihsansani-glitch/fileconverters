import { useState } from 'react'
import UploadBox from '../components/UploadBox'

/* =========================
   ICONS
========================= */

import docMainLogo from '../assets/doc-tools-logo.png'

import xlsxCsvIcon from '../assets/xlsx-csv.png'
import csvXlsxIcon from '../assets/csv-xlsx.png'
import wordPdfIcon from '../assets/word-pdf.png'
import xlsxPdfIcon from '../assets/xlsx-pdf.png'
import pdfWordIcon from '../assets/pdf-word.png'
import xlsxWordIcon from '../assets/xlsx-word.png'
import pdfPptxIcon from '../assets/pdf-pptx.png'

const API = 'https://fileconverters-lf0e.onrender.com/api/doc'

/* =========================
   MODAL
========================= */

function Modal({ tool, onClose }) {

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState('')

  const handleConvert = async () => {

    if (!file) return

    setLoading(true)
    setError('')
    setDownloadUrl(null)

    try {

      const fd = new FormData()

      fd.append(tool.fieldName, file)

      const res = await fetch(
        `${API}/${tool.endpoint}`,
        {
          method: 'POST',
          body: fd,
        }
      )

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setDownloadUrl(data.downloadUrl)
      }

    } catch (err) {

      setError('Server error: ' + err.message)

    }

    setLoading(false)
  }

  const handleDownload = async () => {

    try {

      const res = await fetch(downloadUrl)

      const blob = await res.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')

      a.href = blobUrl
      a.download = downloadUrl.split('/').pop() || 'file'

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

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-[#0f172a] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">

          <div className="flex items-center gap-4">

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center`}>

              <img
                src={tool.icon}
                alt={tool.title}
                className="w-8 h-8 object-contain"
              />

            </div>

            <div>

              <h2 className="text-white font-bold text-lg">
                {tool.title}
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                {tool.description}
              </p>

            </div>

          </div>

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500 transition flex items-center justify-center text-white text-xl"
          >
            ×
          </button>

        </div>

        {/* BODY */}
        <div className="p-6 text-center">

          {!downloadUrl ? (

            <>
              <UploadBox
                accept={tool.accept}
                multiple={false}
                label="Upload File"
                onUpload={(f) => {
                  setFile(f)
                  setDownloadUrl(null)
                  setError('')
                }}
              />

              {error && (
                <p className="text-red-400 text-sm mt-4">
                  {error}
                </p>
              )}

              {file && (

                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className={`w-full mt-5 bg-gradient-to-r ${tool.gradient} text-white font-bold py-4 rounded-2xl hover:scale-105 transition`}
                >
                  {loading
                    ? 'Processing...'
                    : tool.buttonLabel || 'Convert'}
                </button>

              )}
            </>

          ) : (

            <div>

              <h3 className="text-white text-2xl font-bold mb-5">
                Done 🎉
              </h3>

              <button
                onClick={handleDownload}
                className={`bg-gradient-to-r ${tool.gradient} text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition`}
              >
                Download File
              </button>

              <button
                onClick={() => {
                  setDownloadUrl(null)
                  setFile(null)
                }}
                className="block mx-auto mt-5 text-slate-400 text-sm hover:text-white transition"
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
    id: 'xlsx-csv',
    title: 'XLSX to CSV',
    description: 'Convert Excel spreadsheets into CSV format',
    icon: xlsxCsvIcon,
    accept: '.xlsx,.xls',
    fieldName: 'file',
    endpoint: 'xlsx-to-csv',
    buttonLabel: 'Convert',
    gradient: 'from-green-500 to-emerald-500'
  },

  {
    id: 'csv-xlsx',
    title: 'CSV to XLSX',
    description: 'Convert CSV files into Excel spreadsheets in one click',
    icon: csvXlsxIcon,
    accept: '.csv',
    fieldName: 'file',
    endpoint: 'csv-to-xlsx',
    buttonLabel: 'Convert',
    gradient: 'from-blue-500 to-cyan-500'
  },

  {
    id: 'word-pdf',
    title: 'Word to PDF',
    description: 'Convert Word documents into PDF format',
    icon: wordPdfIcon,
    accept: '.doc,.docx',
    fieldName: 'file',
    endpoint: 'word-to-pdf',
    buttonLabel: 'Convert',
    gradient: 'from-red-500 to-orange-500'
  },

  {
    id: 'xlsx-pdf',
    title: 'XLSX to PDF',
    description: 'Convert Excel files into PDF documents in one Click',
    icon: xlsxPdfIcon,
    accept: '.xlsx,.xls',
    fieldName: 'file',
    endpoint: 'xlsx-to-pdf',
    buttonLabel: 'Convert',
    gradient: 'from-yellow-500 to-orange-500'
  },

  {
    id: 'pdf-word',
    title: 'PDF to Word',
    description: 'Convert PDF files into editable Word documents',
    icon: pdfWordIcon,
    accept: 'application/pdf,.pdf',
    fieldName: 'pdf',
    endpoint: 'pdf-to-word',
    buttonLabel: 'Convert',
    gradient: 'from-purple-500 to-pink-500'
  },

  {
    id: 'xlsx-word',
    title: 'XLSX to Word',
    description: 'Convert Excel spreadsheets into Word documents',
    icon: xlsxWordIcon,
    accept: '.xlsx,.xls',
    fieldName: 'file',
    endpoint: 'xlsx-to-word',
    buttonLabel: 'Convert',
    gradient: 'from-cyan-500 to-blue-500'
  },

  {
    id: 'pdf-pptx',
    title: 'PDF to PPTX',
    description: 'Convert PDF into PowerPoint presentations',
    icon: pdfPptxIcon,
    accept: 'application/pdf,.pdf',
    fieldName: 'file',
    endpoint: 'pdf-to-pptx',
    buttonLabel: 'Convert',
    gradient: 'from-violet-500 to-fuchsia-500'
  },

]

/* =========================
   MAIN PAGE
========================= */

function DocTools() {

  const [active, setActive] = useState(null)

  return (

    <div className="min-h-screen bg-white">

      {/* NAVBAR SPACE */}
      <div className="h-24" />

      {/* HERO */}
      <div className="min-h-[55vh] flex flex-col justify-center items-center text-center px-6 pb-10">

        {/* MAIN LOGO */}
        <div className="mb-8">

          <img
            src={docMainLogo}
            alt="Document Tools"
            className="w-44 h-44 object-contain drop-shadow-[0_20px_45px_rgba(34,197,94,0.35)]"
          />

        </div>

        {/* TITLE */}
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
          Document Tools
        </h1>

        {/* SUBTITLE */}
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Convert Word, Excel and CSV files instantly with secure and professional-grade processing.
        </p>

      </div>

      {/* TOOL GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {tools.map((tool) => (

            <div
              key={tool.id}
              className="relative group"
            >

              {/* GLOW */}
              <div
                className={`absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition bg-gradient-to-r ${tool.gradient}`}
              />

              {/* CARD */}
              <button
                onClick={() => setActive(tool)}
                className="relative bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl transition-all text-center p-8 flex flex-col items-center justify-center w-full overflow-hidden"
              >

                {/* ICON */}
                <div className="w-28 h-20 flex items-center justify-center mb-5">

                  <img
                    src={tool.icon}
                    alt={tool.title}
                    className="w-full h-full object-contain hover:scale-110 transition duration-300"
                  />

                </div>

                {/* TITLE */}
                <h3 className="text-2xl font-bold text-slate-900">
                  {tool.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-slate-500 text-sm mt-3 max-w-[260px] leading-relaxed">
                  {tool.description}
                </p>

                {/* PLUS */}
                <div className="mt-5 text-slate-400 text-2xl font-light">
                  +
                </div>

              </button>

            </div>

          ))}

        </div>

      </div>

      {/* SEO SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">

        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
          Free Online Document Tools
        </h2>

        <p className="text-slate-600 leading-relaxed">
          Convert, edit and manage Word, Excel, CSV and PDF files directly in your browser with secure high-speed processing.
        </p>

      </section>

      {/* MODAL */}
      {active && (
        <Modal
          tool={active}
          onClose={() => setActive(null)}
        />
      )}

    </div>
  )
}

export default DocTools