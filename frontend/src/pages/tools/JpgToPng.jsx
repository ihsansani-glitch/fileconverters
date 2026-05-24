import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import jpgToPngIcon from '../../assets/jpg-to-png.png'

const API = 'http://localhost:5000/api/image'

function JpgToPng() {

  const inputRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')

  const handleUpload = async (e) => {

    const file = e.target.files[0]

    if (!file) return

    setLoading(true)
    setError('')
    setDownloadUrl('')

    const fd = new FormData()

    fd.append('image', file)

    try {

      const res = await fetch(`${API}/jpg-to-png`, {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      setDownloadUrl(data.downloadUrl)

    } catch (err) {

      setError(err.message)

    }

    setLoading(false)
  }

  /* BROWSER DOWNLOAD */
  const handleDownload = async () => {

    try {

      const res = await fetch(downloadUrl)

      const blob = await res.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')

      a.href = blobUrl
      a.download = 'image.png'

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

        {/* UPLOAD SCREEN */}
        {!downloadUrl ? (

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
                src={jpgToPngIcon}
                alt="JPG to PNG"
                className="w-40 h-40 object-contain drop-shadow-xl"
              />

            </div>

            {/* TITLE */}
            <h1 className="text-5xl font-bold text-center">
              JPG to PNG
            </h1>

            <p className="text-slate-400 mt-4 text-center">
              Convert JPG images into high-quality PNG instantly
            </p>

            {/* HIDDEN INPUT */}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg"
              className="hidden"
              onChange={handleUpload}
            />

            {/* UPLOAD BOX */}
            <div
              onClick={() => inputRef.current.click()}
              className="
              mt-10
              w-full
              max-w-5xl
              bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10
              border-2 border-dashed border-cyan-400
              rounded-3xl
              p-14
              flex flex-col items-center justify-center
              cursor-pointer
              hover:border-cyan-300
              hover:bg-cyan-500/10
              transition-all duration-300"
            >

              {/* ICON */}
              <div
                className="
                w-24 h-24
                rounded-3xl
                bg-gradient-to-br from-cyan-500 to-blue-600
                shadow-lg shadow-cyan-500/20
                flex items-center justify-center
                mb-6"
              >

                <span className="text-white text-5xl leading-none">
                  ⬆
                </span>

              </div>

              <h2 className="text-2xl font-bold text-center">
                Upload JPG Image
              </h2>

              <p className="text-slate-400 mt-3 text-center">
                Drag & drop your image here or click to browse
              </p>

            </div>

            {/* LOADING */}
            {loading && (

              <p className="text-cyan-400 mt-6 text-lg font-medium">
                Converting Image...
              </p>

            )}

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

        ) : (

          /* DOWNLOAD SCREEN */
          <div className="max-w-6xl mx-auto w-full pb-24 px-4">

            {/* BACK */}
            <Link
              to="/image-tools"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors mb-8"
            >
              ← Back to Image Tools
            </Link>

            {/* HEADER */}
            <div className="flex flex-col items-center justify-center text-center mb-12">

              <img
                src={jpgToPngIcon}
                alt="JPG to PNG"
                className="w-32 h-32 object-contain drop-shadow-xl mb-5"
              />

              <h1 className="text-4xl md:text-5xl font-bold">
                JPG to PNG
              </h1>

              <p className="text-slate-400 mt-3 text-lg">
                Your image has been converted successfully
              </p>

            </div>

            {/* SUCCESS BOX */}
            <div
              className="
              w-full
              max-w-4xl
              mx-auto
              bg-slate-900
              border border-slate-800
              rounded-3xl
              p-16
              flex flex-col items-center justify-center"
            >

              <div
                className="
                w-24 h-24
                rounded-full
                bg-green-500/20
                flex items-center justify-center
                mb-6"
              >

                <span className="text-5xl">
                  ✅
                </span>

              </div>

              <h2 className="text-3xl font-bold text-center">
                PNG Ready
              </h2>

              <p className="text-slate-400 mt-4 text-center max-w-xl">
                Your JPG image was converted into PNG format successfully.
              </p>

              {/* BUTTONS */}
              <div className="flex flex-wrap justify-center gap-4 mt-10">

                {/* CHANGE IMAGE */}
                <button
                  onClick={() => {
                    setDownloadUrl('')
                    inputRef.current.click()
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
                <button
                  onClick={handleDownload}
                  className="
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  px-8 py-3.5
                  rounded-2xl
                  font-bold
                  hover:opacity-90
                  transition-all
                  shadow-lg shadow-cyan-500/25"
                >
                  ⬇️ Download PNG
                </button>

              </div>

            </div>

            {/* HIDDEN INPUT */}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg"
              className="hidden"
              onChange={handleUpload}
            />

          </div>

        )}

      </div>

    </div>
  )
}

export default JpgToPng