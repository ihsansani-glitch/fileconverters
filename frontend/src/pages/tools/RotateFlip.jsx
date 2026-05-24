import { useRef, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import rotateIcon from '../../assets/rotate.png'

const API = 'http://localhost:5000/api/image'

export default function RotateFlip() {

  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (e) => {

    const selected = e.target.files[0]

    if (!selected) return

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setResult(null)
  }

  const handleApply = async () => {

    if (!file) return setError('Please upload image')

    setLoading(true)
    setError('')

    try {

      const fd = new FormData()

      fd.append('image', file)
      fd.append('rotation', rotation)
      fd.append('flipH', flipH)
      fd.append('flipV', flipV)

      const res = await axios.post(
        `${API}/rotate-flip`,
        fd
      )

      setResult(res.data)

    } catch (err) {

      setError(
        err.response?.data?.error || 'Failed'
      )
    }

    setLoading(false)
  }

  const download = async (url) => {

    const res = await fetch(url)

    const blob = await res.blob()

    const blobUrl = window.URL.createObjectURL(blob)

    const a = document.createElement('a')

    a.href = blobUrl
    a.download = 'edited-image.png'

    a.click()

    window.URL.revokeObjectURL(blobUrl)
  }

  return (

    <div className="min-h-screen bg-[#020617] text-white overflow-y-auto">

      <div
        className="px-6 pb-20"
        style={{ paddingTop: '90px' }}
      >

        {!previewUrl ? (

          /* UPLOAD SCREEN */
          <div className="flex flex-col items-center justify-start pt-6">

            {/* BACK */}
            <Link
              to="/image-tools"
              className="self-start mb-6 text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1"
            >
              ← Back to Image Tools
            </Link>

            {/* LOGO */}
            <div className="flex justify-center mb-6">

              <img
                src={rotateIcon}
                alt="Rotate & Flip"
                className="w-40 h-40 object-contain drop-shadow-xl"
              />

            </div>

            {/* TITLE */}
            <h1 className="text-5xl font-bold text-center">
              Rotate & Flip Image
            </h1>

            <p className="text-slate-400 mt-4 text-center">
              Rotate or flip your image easily
            </p>

            {/* INPUT */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />

            {/* UPLOAD BUTTON */}
            <button
              onClick={() => inputRef.current.click()}
              className="
              mt-10
              bg-gradient-to-r from-cyan-500 to-blue-500
              px-10 py-4
              rounded-2xl
              font-bold
              hover:opacity-90
              transition-all
              shadow-lg shadow-cyan-500/25"
            >
              Upload Image
            </button>

          </div>

        ) : (

          /* EDITOR */
          <div className="max-w-6xl mx-auto w-full pb-24 px-4">

            {/* BACK */}
            <Link
              to="/image-tools"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors mb-8"
            >
              ← Back to Image Tools
            </Link>

            {/* HEADER */}
            <div className="flex flex-col items-center justify-center text-center mb-10">

              <img
                src={rotateIcon}
                alt="Rotate & Flip"
                className="w-32 h-32 object-contain drop-shadow-xl mb-5"
              />

              <h1 className="text-4xl md:text-5xl font-bold">
                Rotate & Flip Image
              </h1>

              <p className="text-slate-400 mt-3 text-lg">
                Edit image orientation
              </p>

            </div>

            {/* CONTROLS */}
            <div className="w-full flex items-center justify-center mb-10">

              <div className="flex flex-wrap justify-center gap-3 max-w-4xl">

                <button
                  onClick={() => setRotation(rotation - 90)}
                  className="
                  bg-slate-800 hover:bg-slate-700
                  transition
                  px-6 py-3
                  rounded-2xl
                  font-semibold"
                >
                  ↺ Rotate Left
                </button>

                <button
                  onClick={() => setRotation(rotation + 90)}
                  className="
                  bg-slate-800 hover:bg-slate-700
                  transition
                  px-6 py-3
                  rounded-2xl
                  font-semibold"
                >
                  ↻ Rotate Right
                </button>

                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`
                  px-6 py-3
                  rounded-2xl
                  font-semibold
                  transition
                  ${
                    flipH
                      ? 'bg-cyan-500 shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  ↔ Flip Horizontal
                </button>

                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`
                  px-6 py-3
                  rounded-2xl
                  font-semibold
                  transition
                  ${
                    flipV
                      ? 'bg-cyan-500 shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  ↕ Flip Vertical
                </button>

                <button
                  onClick={() => {
                    setRotation(0)
                    setFlipH(false)
                    setFlipV(false)
                  }}
                  className="
                  bg-slate-700 hover:bg-slate-600
                  transition
                  px-6 py-3
                  rounded-2xl
                  font-semibold
                  text-slate-300"
                >
                  ⟳ Reset
                </button>

              </div>

            </div>

            {/* ROTATION INFO */}
            <p className="text-center text-slate-500 text-sm mb-6">

              Rotation:
              {' '}
              {((rotation % 360) + 360) % 360}°

              {flipH && ' · Flipped Horizontal'}
              {flipV && ' · Flipped Vertical'}

            </p>

            {/* PREVIEW */}
            <div
             className="flex justify-center">

              <div
                className="
                bg-slate-900
                rounded-3xl
                w-full
                max-w-5xl
                h-[600px]
                flex items-center justify-center
                overflow-hidden
                border border-slate-800"
              >

                <img
                  src={previewUrl}
                  alt="preview"
                  style={{
                    transform:
                      `rotate(${rotation}deg)
                      scaleX(${flipH ? -1 : 1})
                      scaleY(${flipV ? -1 : 1})`
                  }}
                  className="
                  max-w-full
                  max-h-full
                  object-contain
                  transition-all duration-300"
                />

              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">

              {/* CHANGE IMAGE */}
              <button
                onClick={() => inputRef.current.click()}
                className="
                bg-slate-700 hover:bg-slate-600
                px-6 py-3.5
                rounded-2xl
                font-semibold
                transition-all"
              >
                📁 Change Image
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />

              {/* APPLY */}
              <button
                onClick={handleApply}
                disabled={loading}
                className="
                bg-gradient-to-r from-cyan-500 to-blue-500
                px-8 py-3.5
                rounded-2xl
                font-bold
                hover:opacity-90
                transition-all
                shadow-lg shadow-cyan-500/25
                disabled:opacity-50"
              >

                {loading ? (

                  <span className="flex items-center gap-2">

                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >

                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />

                    </svg>

                    Applying...

                  </span>

                ) : '✅ Apply Changes'}

              </button>

              {/* DOWNLOAD */}
              {result && (

                <button
                  onClick={() => download(result.downloadUrl)}
                  className="
                  bg-green-500 hover:bg-green-600
                  px-8 py-3.5
                  rounded-2xl
                  font-bold
                  transition-all
                  shadow-lg shadow-green-500/25"
                >
                  ⬇️ Download
                </button>

              )}

            </div>

            {/* ERROR */}
            {error && (

              <div
                className="
                mt-6
                bg-red-500/10
                border border-red-500/20
                rounded-2xl
                px-5 py-4
                text-red-400
                text-sm
                text-center"
              >
                ⚠️ {error}
              </div>

            )}

          </div>
        )}

      </div>

    </div>
  )
}