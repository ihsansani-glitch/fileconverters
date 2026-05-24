import { useState, useRef } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import cropIcon from '../../assets/crop-image.png'

function CropImage() {

  const [image, setImage] = useState(null)

  const [crop, setCrop] = useState({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80
  })

  const [completedCrop, setCompletedCrop] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(false)

  const imgRef = useRef(null)
  const inputRef = useRef()

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = (e) => {

    const file = e.target.files[0]
    if (!file) return

    setImage(URL.createObjectURL(file))
    setZoom(100)
    setCompletedCrop(null)

    setCrop({
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80
    })
  }

  /* ---------------- DOWNLOAD ---------------- */
  const downloadBlob = (blob, name = 'cropped-image.jpg') => {

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = name

    document.body.appendChild(a)
    a.click()
    a.remove()

    window.URL.revokeObjectURL(url)
  }

  /* ---------------- CROPPING ---------------- */
  const getCroppedImg = () => {

    if (!completedCrop || !imgRef.current) return

    setLoading(true)

    const img = imgRef.current

    const canvas = document.createElement('canvas')

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    )

    canvas.toBlob((blob) => {

      if (blob) downloadBlob(blob)

      setLoading(false)

    }, 'image/jpeg')
  }

  return (

    <div className="min-h-screen bg-white px-6">

      <div className="h-28" />

      <div className="max-w-6xl mx-auto">

        {/* TOP LOGO */}
        <div className="flex justify-center mb-6">

          <img
            src={cropIcon}
            alt="Crop Image"
            className="w-44 h-44 object-contain drop-shadow-xl"
          />

        </div>

        {/* HEADER */}
        <div className="text-center mb-10">

          <h1 className="text-5xl font-bold text-slate-900">
            Crop Image
          </h1>

          <p className="mt-5 text-slate-600 text-lg max-w-2xl mx-auto">
            Crop your image easily with zoom control
          </p>

        </div>

        {/* UPLOAD BOX */}
        {!image ? (

          <div className="
            w-full
            bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50
            border-2 border-dashed border-orange-300
            rounded-3xl
            p-10
            shadow-lg
            text-center
          ">

            {/* ICON */}
            <div className="flex justify-center mb-6">

              <div className="
                w-24 h-24
                rounded-3xl
                bg-gradient-to-br from-yellow-500 to-orange-500
                flex items-center justify-center
                shadow-lg shadow-orange-200
              ">
                <span className="text-white text-5xl">✂️</span>
              </div>

            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />

            <button
              onClick={() => inputRef.current.click()}
              className="
                bg-gradient-to-r from-yellow-500 to-orange-500
                text-white font-bold
                px-10 py-4
                rounded-2xl
                hover:scale-105 transition
                shadow-lg shadow-orange-200
              "
            >
              Upload Image
            </button>

          </div>

        ) : (

          /* EDITOR */
          <div className="w-full">

            {/* ZOOM */}
            <div className="flex justify-center items-center gap-4 mb-6">

              <button
                onClick={() => setZoom(z => Math.max(30, z - 10))}
                className="px-3 py-2 bg-slate-800 text-white rounded-lg"
              >
                −
              </button>

              <input
                type="range"
                min="30"
                max="200"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-60"
              />

              <button
                onClick={() => setZoom(z => Math.min(200, z + 10))}
                className="px-3 py-2 bg-slate-800 text-white rounded-lg"
              >
                +
              </button>

              <span className="text-slate-600">{zoom}%</span>

            </div>

            {/* CROPPER BOX (SMALL FIXED - NO PAGE SCROLL) */}
            <div className="
              bg-slate-900
              border border-slate-700
              rounded-3xl
              p-4
              flex justify-center items-center
              overflow-hidden
              w-full
              max-w-3xl
              mx-auto
              h-[420px]
            ">

              <div
                className="flex justify-center items-center w-full h-full"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center'
                }}
              >

                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                >

                  <img
                    ref={imgRef}
                    src={image}
                    alt="crop"
                    draggable={false}
                    className="
                      max-h-[380px]
                      max-w-full
                      object-contain
                      mx-auto
                    "
                  />

                </ReactCrop>

              </div>

            </div>

            {/* LOADING */}
            {loading && (
              <p className="text-center text-orange-600 mt-4">
                Processing Crop...
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex justify-center gap-4 mt-6">

              <button
                onClick={getCroppedImg}
                disabled={!completedCrop}
                className="
                  bg-gradient-to-r from-yellow-500 to-orange-500
                  text-white font-bold
                  px-8 py-4
                  rounded-2xl
                  hover:scale-105 transition
                  disabled:opacity-40
                "
              >
                ✂️ Crop & Download
              </button>

              <button
                onClick={() => {
                  setImage(null)
                  setCompletedCrop(null)
                }}
                className="bg-slate-800 text-white px-6 py-4 rounded-2xl"
              >
                Clear
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  )
}

export default CropImage