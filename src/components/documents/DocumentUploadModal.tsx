'use client'

import { useState, useCallback } from 'react'
import { X, Upload, File, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, category: string) => void
}

const documentCategories = [
  'Utility Bill',
  'Site Survey',
  'Contract',
  'Permit Documents',
  'Design Documents',
  'Other'
]

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onUpload
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState(documentCategories[0])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) {
      onUpload(selectedFile, category)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-lg w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-6">Upload Document</h2>

          <div className="space-y-6">
            {/* Document Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {documentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input {...getInputProps()} />
                {selectedFile ? (
                  <div className="space-y-2">
                    <File className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                    </p>
                    <p className="text-xs text-gray-500">
                      or click to select a file
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, or JPG (max 10MB)
                    </p>
                  </div>
                )}
              </div>
              {error && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 