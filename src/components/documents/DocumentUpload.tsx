'use client'

import { useState } from 'react'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'

interface DocumentUploadProps {
  onUpload: (file: File) => void
  onCancel: () => void
  acceptedTypes?: string
  maxSize?: number // in MB
}

export default function DocumentUpload({ 
  onUpload, 
  onCancel, 
  acceptedTypes = "image/*,application/pdf", 
  maxSize = 10 
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Check file type
    const fileType = file.type
    const validTypes = acceptedTypes.split(',')
    if (!validTypes.some(type => {
      const [category, extension] = type.split('/')
      return extension === '*' ? fileType.startsWith(category) : fileType === type
    })) {
      setError('Invalid file type')
      return false
    }

    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError(null)

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500 bg-red-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleChange}
          id="file-upload"
        />

        {!selectedFile ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-600 text-center mb-2">
              Drag and drop your file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: Images and PDF • Max size: {maxSize}MB
            </p>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreview(null)
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="absolute -bottom-6 left-0 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {selectedFile && (
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
          >
            Upload File
          </button>
        </div>
      )}
    </div>
  )
} 