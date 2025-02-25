'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, File, Trash2, Loader2, Image as ImageIcon, FileText, X, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useDropzone } from 'react-dropzone'

// Document types and their configurations
const DOCUMENT_TYPES = {
  CONTRACT: 'contract',
  PERMIT: 'permit',
  DESIGN: 'design',
  SURVEY: 'survey',
  OTHER: 'other'
} as const

type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES]

const ACCEPTED_FILE_TYPES = {
  'image/*': ['.jpeg', '.jpg', '.png'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface ProjectDocument {
  id: string
  proposal_id: string
  name: string
  file_url: string
  document_type: string
  requires_input: boolean
  customer_data?: any
  status: string
  created_at: string
  updated_at: string
  size?: number
  content_type?: string
}

interface ProjectDocumentsProps {
  proposalId: string
  isAdmin?: boolean
}

interface UploadProgressEvent {
  loaded: number
  total: number
}

export default function ProjectDocuments({ proposalId, isAdmin = false }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [selectedType, setSelectedType] = useState<DocumentType>(DOCUMENT_TYPES.OTHER)
  const [previewFile, setPreviewFile] = useState<{ url: string, type: string, name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [proposalId])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('proposal_id', proposalId as any)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data as unknown as ProjectDocument[] || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type === 'application/pdf') return 'pdf'
    if (file.type.includes('word')) return 'word'
    return 'other'
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    try {
      setUploading(true)
      
      // Process each file
      for (const file of acceptedFiles) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB`)
          continue
        }

        // Create a unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `project-documents/${proposalId}/${fileName}`

        // Show upload progress toast
        const toastId = toast.loading(`Uploading ${file.name}...`)

        // Upload file to Supabase Storage
        const uploadTask = supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          })

        // Track upload progress
        const handleProgress = (event: UploadProgressEvent) => {
          const percent = (event.loaded / event.total) * 100
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: percent
          }))
          
          // Update toast with progress
          toast.loading(`Uploading ${file.name}... ${Math.round(percent)}%`, { id: toastId })
        }

        // Attach progress handler
        if (uploadTask.hasOwnProperty('onUploadProgress')) {
          (uploadTask as any).onUploadProgress = handleProgress
        }

        const { error: uploadError, data: uploadData } = await uploadTask

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`, { id: toastId })
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        // Create document record
        const { error: dbError } = await supabase
          .from('project_documents')
          .insert({
            proposal_id: proposalId,
            name: file.name,
            file_url: publicUrl,
            document_type: selectedType,
            requires_input: false,
            status: 'pending'
          } as any)

        if (dbError) {
          toast.error(`Failed to save ${file.name} to database`, { id: toastId })
          throw dbError
        }

        // Clear progress for this file
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })

        toast.success(`${file.name} uploaded successfully`, { id: toastId })
      }

      loadDocuments()
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast.error('Failed to upload one or more documents')
    } finally {
      setUploading(false)
    }
  }, [proposalId, selectedType])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    disabled: uploading,
    maxSize: MAX_FILE_SIZE,
    noClick: true,
    noKeyboard: true
  })

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Show confirmation dialog
      if (!confirm('Are you sure you want to delete this document?')) {
        return
      }
      
      setLoading(true)

      // Extract the file path from the URL
      const filePathFromUrl = filePath.split('/').slice(-3).join('/')

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePathFromUrl])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId as any)

      if (dbError) throw dbError

      toast.success('Document deleted successfully')
      loadDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (contentType: string | undefined, name: string) => {
    if (!contentType) {
      // Try to determine from file extension
      const ext = name.split('.').pop()?.toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
        return <ImageIcon className="h-5 w-5 text-green-500" />
      }
      if (ext === 'pdf') {
        return <FileText className="h-5 w-5 text-red-500" />
      }
      return <File className="h-5 w-5 text-blue-500" />
    }
    
    if (contentType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-green-500" />
    if (contentType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />
    if (contentType.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const handlePreview = (url: string, type: string, name: string) => {
    setPreviewFile({ url, type, name })
  }

  const closePreview = () => {
    setPreviewFile(null)
  }

  const isImage = (url: string): boolean => {
    const ext = url.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Documents</h2>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DocumentType)}
          className="select select-bordered"
        >
          {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
            <option key={value} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-500 font-medium">Drop the files here</p>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">Drag and drop files here</p>
            <button
              type="button"
              onClick={open}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={uploading}
            >
              Select Files
            </button>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {Object.entries(uploadProgress).length > 0 && (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700">Uploading Files</h3>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate max-w-[80%]">{fileName}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No documents available</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload documents to share with your project team
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(doc.content_type, doc.name)}
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    {doc.size && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="capitalize">{doc.document_type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isImage(doc.file_url) && (
                  <button
                    onClick={() => handlePreview(doc.file_url, 'image', doc.name)}
                    className="btn btn-ghost btn-sm"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  View
                </a>
                {(isAdmin || doc.status === 'pending') && (
                  <button
                    onClick={() => deleteDocument(doc.id, doc.file_url)}
                    className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && previewFile.type === 'image' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium truncate">{previewFile.name}</h3>
              <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <img 
                src={previewFile.url} 
                alt={previewFile.name} 
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <a
                href={previewFile.url}
                download
                className="btn btn-primary btn-sm"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 