import { useState } from 'react'

export default function useFileUpload() {
  const [file, setFile] = useState(null)
  const [files, setFiles] = useState([])
  const [preview, setPreview] = useState([])
  const [progress, setProgress] = useState(0)

  const handleSelect = (selected, multiple = false) => {
    setProgress(0)

    if (multiple) {
      const arr = Array.from(selected)
      setFiles(arr)
      setPreview(arr.map(f => URL.createObjectURL(f)))
      setFile(null)
    } else {
      const f = selected
      setFile(f)
      setFiles([])
      setPreview(f ? [URL.createObjectURL(f)] : [])
    }
  }

  const reset = () => {
    setFile(null)
    setFiles([])
    setPreview([])
    setProgress(0)
  }

  return {
    file,
    files,
    preview,
    progress,
    setProgress,
    handleSelect,
    reset
  }
}