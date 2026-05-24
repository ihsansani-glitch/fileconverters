import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import upscaleIcon from '../../assets/resize.png'

const API = 'http://localhost:5000/api/image'

function UpscaleImage() {

  const inputRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const [scale, setScale] = useState(2)

  const handleUpload = async (file) => {

    if (!file) return

    setLoading(true)
    setError('')
    setDownloadUrl('')
    setUploaded(true)

    const fd = new FormData()

    fd.append('image', file)
    fd.append('scale', scale)

    try {

      const res = await fetch(`${API}/upscale-image`, {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      if (data?.downloadUrl) {

        setDownloadUrl(data.downloadUrl)

      } else {

        setError(data?.error || 'Upscale failed')
      }

    } catch (err) {

      setError(err.message)

    }

    setLoading(false)
  }

  /* FILE INPUT */
  const handleFile = (e) => {

    const file = e.target.files[0]

    handleUpload(file)
  }

  /* DRAG DROP */
  const handleDrop = (e) => {

    e.preventDefault()

    setDragActive(false)

    const file = e.dataTransfer.files[0]

    handleUpload(file)
  }

  /* DOWNLOAD */
  const handleDownload = async () => {

    try {

      const res = await fetch(downloadUrl)

      const blob = await res.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')

      a.href = blobUrl
      a.download = 'upscaled-image.png'

      document.body.appendChild(a)

      a.click()

      a.remove()

      window.URL.revokeObjectURL(blobUrl)

    } catch (err) {

      alert('Download failed: ' + err.message)

    }
  }

  return (

    <div className="min-h-screen bg-[#020617] text-white overflow-y-auto">

      <div
        className="px-6 pb-20"
        style={{ paddingTop: '90px' }}
      >

        {!uploaded ? (

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
                src={upscaleIcon}
                alt="HD Upscaler"
                className="w-40 h-40 object-contain drop-shadow-xl"
              />

            </div>

            {/* TITLE */}
            <h1 className="text-5xl font-bold text-center">
              HD Upscaler
            </h1>

            <p className="text-slate-400 mt-4 text-center">
              Increase image resolution and quality instantly
            </p>

            {/* UPSCALE SELECT */}
            <div className="w-full max-w-3xl mt-10">

              <label className="block text-slate-300 font-medium mb-3 text-lg">
                Select Upscale Level
              </label>

              <select
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                className="
                w-full
                bg-slate-900
                border border-slate-700
                rounded-2xl
                px-6 py-4
                text-white
                text-lg
                outline-none
                focus:border-violet-500
                transition-all"
              >

                <option value="2">2x Upscale</option>
                <option value="4">4x Upscale</option>

              </select>

            </div>

            {/* INPUT */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />

            {/* COOL UPLOAD BOX */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
              className={`
                mt-10
                w-full
                max-w-5xl
                rounded-[32px]
                border-2
                border-dashed
                transition-all
                duration-300
                cursor-pointer
                overflow-hidden
                ${
                  dragActive
                    ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
                    : 'border-slate-700 bg-slate-900 hover:border-violet-400 hover:bg-slate-800'
                }
              `}
            >

              <div className="p-14 flex flex-col items-center justify-center">

                {/* ICON */}
                <div
                  className="
                  w-28 h-28
                  rounded-[30px]
                  bg-gradient-to-br from-violet-500 to-fuchsia-500
                  flex items-center justify-center
                  shadow-2xl shadow-violet-500/30
                  mb-8"
                >

                  <span className="text-white text-6xl">
                    ⬆
                  </span>

                </div>

                {/* TEXT */}
                <h2 className="text-3xl font-bold text-white text-center">
                  Drop your image here
                </h2>

                <p className="text-slate-400 text-lg mt-4 text-center">
                  Drag & drop image here or click to browse
                </p>

                <p className="text-slate-500 text-sm mt-3 text-center">
                  AI-powered HD image enhancement
                </p>

                {/* BUTTON */}
                <button
                  className="
                  mt-10
                  bg-gradient-to-r from-violet-500 to-fuchsia-500
                  px-10 py-4
                  rounded-2xl
                  font-bold
                  text-white
                  hover:scale-105
                  transition-all
                  shadow-xl shadow-violet-500/30"
                >
                  Upload Image
                </button>

              </div>

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
                text-center
                max-w-2xl w-full"
              >
                ⚠️ {error}
              </div>

            )}

          </div>

        ) : (

          /* RESULT SCREEN */
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
                src={upscaleIcon}
                alt="HD Upscaler"
                className="w-32 h-32 object-contain drop-shadow-xl mb-5"
              />

              <h1 className="text-4xl md:text-5xl font-bold">
                HD Upscaler
              </h1>

              <p className="text-slate-400 mt-3 text-lg">
                Your image has been enhanced successfully
              </p>

            </div>

            {/* RESULT BOX */}
            <div className="flex justify-center">

              <div
                className="
                bg-slate-900
                rounded-3xl
                w-full
                max-w-5xl
                h-[350px]
                flex items-center justify-center
                overflow-hidden
                border border-slate-800"
              >

                {loading ? (

                  <div className="text-center">

                    <div
                      className="
                      w-16 h-16
                      border-4
                      border-violet-500
                      border-t-transparent
                      rounded-full
                      animate-spin
                      mx-auto mb-5"
                    />

                    <p className="text-violet-400 text-xl font-semibold">
                      Enhancing Image Quality...
                    </p>

                  </div>

                ) : (

                  <div className="text-center">

                    <div className="text-7xl mb-5">
                      ✨
                    </div>

                    <p className="text-slate-300 text-xl font-semibold">
                      Upscale Complete
                    </p>

                    <p className="text-slate-500 mt-3">
                      {scale}x AI Enhancement Applied
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">

              {/* CHANGE IMAGE */}
              <button
                onClick={() => {
                  setUploaded(false)
                  setDownloadUrl('')
                }}
                className="
                bg-slate-700 hover:bg-slate-600
                px-6 py-3.5
                rounded-2xl
                font-semibold
                transition-all"
              >
                📁 Change Image
              </button>

              {/* DOWNLOAD */}
              {downloadUrl && (

                <button
                  onClick={handleDownload}
                  className="
                  bg-gradient-to-r from-violet-500 to-fuchsia-500
                  px-12 py-4
                  rounded-2xl
                  font-bold
                  text-lg
                  hover:opacity-90
                  transition-all
                  shadow-lg shadow-violet-500/25"
                >
                  ⬇️ Download Upscaled Image
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

export default UpscaleImage