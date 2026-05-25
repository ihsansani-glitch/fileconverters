import { useState } from 'react'
import { Link } from 'react-router-dom'

// ICONS
import videoMainIcon from '../assets/video-tools-logo.png'
import mp3Icon from '../assets/mp4-to-mp3.png'
import compressIcon from '../assets/compress-video.png'
import aviIcon from '../assets/video-avi.png'
import mkvIcon from '../assets/video-mkv.png'

// ---------------- TOOL CARD ----------------
function ToolCard({ title, description, icon, children, gradient }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative group">

      {/* Glow */}
      <div
        className={`absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition bg-gradient-to-r ${gradient}`}
      />

      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl transition overflow-hidden">

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">

              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white transition"
              >
                ×
              </button>

              <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <img src={icon} alt={title} className="w-full h-full object-contain" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-white/80 mt-1">{description}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 text-center">
                {children}
              </div>

            </div>
          </div>
        )}

        {/* Card */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex flex-col items-center text-center p-8 hover:bg-slate-50 transition"
        >
          <div className="w-28 h-20 flex items-center justify-center mb-5">
            <img src={icon} alt={title} className="w-full h-full object-contain" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900">
            {title}
          </h3>

          <p className="text-slate-500 text-sm mt-3 max-w-[260px] leading-relaxed">
            {description}
          </p>

          <div className="mt-5 text-slate-400 text-2xl font-light">
            {open ? '−' : '+'}
          </div>
        </button>

      </div>
    </div>
  )
}

// ---------------- MAIN PAGE ----------------
export default function VideoTools() {
  return (
    <div className="min-h-screen bg-white">

      <div className="h-24" />

      {/* HERO */}
      <div className="min-h-[55vh] flex flex-col justify-center items-center text-center px-6 pb-10">

        <img
          src={videoMainIcon}
          alt="Video Tools"
          className="w-44 h-44 object-contain mb-8"
        />

        <h1 className="text-5xl font-bold text-slate-900">
          Video Tools
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          Convert, compress and edit videos instantly.
        </p>

      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <Link to="/tools/mp4-to-mp3">
            <ToolCard
              title="MP4 to MP3"
              description="Extract audio from MP4 videos instantly"
              icon={mp3Icon}
              gradient="from-purple-500 to-pink-500"
            >
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-bold">
                Open Tool
              </button>
            </ToolCard>
          </Link>

          <Link to="/tools/video-compressor">
            <ToolCard
              title="Compress Video"
              description="Reduce video size while keeping quality"
              icon={compressIcon}
              gradient="from-red-500 to-orange-500"
            >
              <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold">
                Open Tool
              </button>
            </ToolCard>
          </Link>

          <Link to="/tools/to-avi">
            <ToolCard
              title="Convert to AVI"
              description="Convert videos into AVI format"
              icon={aviIcon}
              gradient="from-green-500 to-emerald-500"
            >
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl font-bold">
                Open Tool
              </button>
            </ToolCard>
          </Link>

          <Link to="/tools/to-mkv">
            <ToolCard
              title="Convert to MKV"
              description="Convert videos into MKV format"
              icon={mkvIcon}
              gradient="from-violet-500 to-fuchsia-500"
            >
              <button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-6 py-3 rounded-2xl font-bold">
                Open Tool
              </button>
            </ToolCard>
          </Link>

        </div>
      </div>

    </div>
  )
}