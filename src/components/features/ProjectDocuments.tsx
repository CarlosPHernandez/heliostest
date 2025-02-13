'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Upload, File, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProjectDocument {
  id: string
  name: string
  file_url: string
  document_type: string
  requires_input: boolean
  status: string
  created_at: string
}

interface ProjectDocumentsProps {
  proposalId: string
  isAdmin?: boolean
}

export default function ProjectDocuments({ proposalId, isAdmin = false }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setUploading(true)
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `project-documents/${proposalId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

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
          document_type: 'onboarding',
          requires_input: false
        })

      if (dbError) throw dbError

      toast.success('Document uploaded successfully')
      loadDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      setLoading(true)

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId)

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Documents</h2>
        {isAdmin && (
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <button
              className="btn btn-primary flex items-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Document
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No documents available
        </p>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    Added {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  View
                </a>
                {isAdmin && (
                  <button
                    onClick={() => deleteDocument(doc.id, doc.file_url)}
                    className="btn btn-ghost btn-sm text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 