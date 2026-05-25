import { useState, useRef } from 'react'

function UploadBox({ onUpload, accept, multiple, label }) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  const handleFile = (files) => {
    if (!files.length) return
    setFileName(multiple
      ? `${files.length} file(s) selected`
      : files[0].name
    )
    onUpload(multiple ? files : files[0])
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files) }}
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer
        ${dragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800'
        }`}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
      <div className="text-4xl mb-4">📁</div>
      <p className="text-white font-medium text-lg mb-2">
        {fileName || label || 'Click or drag file here'}
      </p>
      <p className="text-slate-400 text-sm">
        {fileName ? '✅ File ready to convert' : 'Supports drag and drop'}
      </p>
    </div>
  )
}

export default UploadBox
