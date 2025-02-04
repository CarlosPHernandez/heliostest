'use client'

import { FileText, Image as ImageIcon, Download, Trash2, Eye } from 'lucide-react'

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  url: string
}

interface DocumentListProps {
  documents: UploadedDocument[]
  onDelete: (id: string) => void
  onView: (document: UploadedDocument) => void
}

export default function DocumentList({ documents, onDelete, onView }: DocumentListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    }
    return <FileText className="h-6 w-6 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div key={doc.id} className="py-4 flex items-center gap-4">
              {getFileIcon(doc.type)}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.uploadedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(doc)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="View document"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <a
                  href={doc.url}
                  download
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 