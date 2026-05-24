import { useState } from 'react'
import UploadBox from '../components/UploadBox'
import { Link } from 'react-router-dom'

// ICONS
import videoMainIcon from '../assets/video-tools-logo.png'
import mp3Icon from '../assets/mp4-to-mp3.png'
import compressIcon from '../assets/compress-video.png'
import aviIcon from '../assets/video-avi.png'
import mkvIcon from '../assets/video-mkv.png'


const API = 'http://localhost:5000/api/video'

function ToolCard({
  title,
  description,
  icon,
  children,
  gradient
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative group">

      {/* GLOW */}
      <div
        className={`absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition bg-gradient-to-r ${gradient}`}
      />

      {/* CARD */}
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl transition overflow-hidden">

        {/* CLOSE ICON */}
        {open && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

    {/* POPUP BOX */}
    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_.25s_ease]">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white transition flex items-center justify-center text-xl font-bold"
      >
        ×
      </button>

      {/* HEADER */}
      <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
            <img
              src={icon}
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>

          <div>

            <h2 className="text-2xl font-bold">
              {title}
            </h2>

            <p className="text-white/80 mt-1">
              {description}
            </p>

          </div>

        </div>

      </div>

      {/* CONTENT */}
      <div className="p-8 bg-slate-50 text-center">
        {children}
      </div>

    </div>

  </div>

)}
        

        {/* TOP */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex flex-col items-center text-center p-8 hover:bg-slate-50 transition"
        >

          {/* ICON */}
          <div className="w-28 h-20 flex items-center justify-center mb-5">
            <img
              src={icon}
              alt={title}
              className="w-full h-full object-contain hover:scale-110 transition duration-300"
            />
          </div>

          {/* TITLE */}
          <h3 className="text-2xl font-bold text-slate-900">
            {title}
          </h3>

          {/* DESC */}
          <p className="text-slate-500 text-sm mt-3 max-w-[260px] leading-relaxed">
            {description}
          </p>

          {/* PLUS */}
          <div className="mt-5 text-slate-400 text-2xl font-light">
            {open ? '−' : '+'}
          </div>

        </button>

        {/* CONTENT */}
        {open && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 text-center">
            {children}
          </div>
        )}

      </div>
    </div>
  )
}

function DownloadButton({
  url,
  gradient,
  filename
}) {

  if (!url) return null

  const handleDownload = async () => {

    try {

      const response = await fetch(url)

      const blob = await response.blob()

      const blobUrl =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = blobUrl

      link.download =
        filename || 'download-file'

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      window.URL.revokeObjectURL(blobUrl)

    } catch (error) {

      console.log(error)

      alert('Download failed')
    }
  }

  return (

    <button
      onClick={handleDownload}
      className={`mt-5 inline-flex items-center justify-center bg-gradient-to-r ${gradient} text-white font-bold px-8 py-4 rounded-2xl hover:scale-105 transition`}
    >
      Download File
    </button>

  )
}
function VideoTools() {

  const [loading, setLoading] = useState('')
  const [results, setResults] = useState({})

  const [start, setStart] = useState('0')
  const [duration, setDuration] = useState('30')

  const handleConvert = async (
    toolName,
    formData
  ) => {

    setLoading(toolName)

    try {

      const res = await fetch(
        `${API}/${toolName}`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await res.json()

      setResults((prev) => ({
        ...prev,
        [toolName]: data
      }))

    } catch (err) {

      alert('Error: ' + err.message)

    }

    setLoading('')
  }

  return (

    <div className="min-h-screen bg-white">

      {/* NAVBAR SPACE */}
      <div className="h-24" />

      {/* HERO */}
      <div className="min-h-[55vh] flex flex-col justify-center items-center text-center px-6 pb-10">

        {/* MAIN ICON */}
        <div className="mb-8">
          <img
            src={videoMainIcon}
            alt="Video Tools"
            className="w-44 h-44 object-contain drop-shadow-[0_20px_45px_rgba(168,85,247,0.35)]"
          />
        </div>

        {/* TITLE */}
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
          Video Tools
        </h1>

        {/* SUBTITLE */}
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Convert, compress and edit videos instantly with secure high-speed processing.
        </p>

      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* MP4 TO MP3 */}
          <Link to="/tools/mp4-to-mp3">

  <ToolCard
    title="MP4 to MP3"
    description="Extract audio from MP4 videos instantly"
    icon={mp3Icon}
    gradient="from-purple-500 to-pink-500"
  >

    <div className="text-center py-6">

      <button
        className="bg-gradient-to-r from-purple-500 to-pink-500
        text-white px-6 py-3 rounded-2xl font-bold"
      >
        Open Tool
      </button>

    </div>

  </ToolCard>

</Link>

         {/* COMPRESS */}
<Link to="/tools/video-compressor">

  <ToolCard
    title="Compress Video"
    description="Reduce video size while keeping quality"
    icon={compressIcon}
    gradient="from-red-500 to-orange-500"
  >

    <div className="text-center py-6">

      <button
        className="bg-gradient-to-r from-red-500 to-orange-500
        text-white px-6 py-3 rounded-2xl font-bold"
      >
        Open Tool
      </button>

    </div>

  </ToolCard>

</Link>

{/* AVI */}
<Link to="/tools/to-avi">

  <ToolCard
    title="Convert to AVI"
    description="Convert videos into AVI format"
    icon={aviIcon}
    gradient="from-green-500 to-emerald-500"
  >

    <div className="text-center py-6">

      <button
        className="bg-gradient-to-r from-green-500 to-emerald-500
        text-white px-6 py-3 rounded-2xl font-bold"
      >
        Open Tool
      </button>

    </div>

  </ToolCard>

</Link>

{/* MKV */}
<Link to="/tools/to-mkv">

  <ToolCard
    title="Convert to MKV"
    description="Convert videos into MKV format"
    icon={mkvIcon}
    gradient="from-violet-500 to-fuchsia-500"
  >

    <div className="text-center py-6">

      <button
        className="bg-gradient-to-r from-violet-500 to-fuchsia-500
        text-white px-6 py-3 rounded-2xl font-bold"
      >
        Open Tool
      </button>

    </div>

  </ToolCard>

</Link>

        </div>
      </div>

      {/* SEO SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">

        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
          Free Online Video Tools
        </h2>

        <p className="text-slate-600 leading-relaxed">
          Convert, compress, trim and optimize videos directly in your browser with fast secure processing.
        </p>

      </section>

    </div>
  )
}

export default VideoTools