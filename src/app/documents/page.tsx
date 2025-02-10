'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  url: string
  created_at: string
}

const requiredDocuments = [
  {
    type: 'utility_bill',
    name: 'Utility Bill',
    description: 'Recent electricity bill (last 3 months)',
    format: 'PDF or image'
  },
  {
    type: 'property_survey',
    name: 'Property Survey',
    description: 'Recent property survey document',
    format: 'PDF'
  },
  {
    type: 'roof_photos',
    name: 'Roof Photos',
    description: 'Clear photos of your roof from all angles',
    format: 'JPG or PNG'
  },
  {
    type: 'electrical_panel',
    name: 'Electrical Panel',
    description: 'Photos of your electrical panel',
    format: 'JPG or PNG'
  }
]

export default function DocumentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadDocuments()
  }, [user, router])

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
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

  const handleFileUpload = async (file: File, type: string) => {
    if (!user) return

    setUploading(true)
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Save document reference in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          type,
          status: 'pending',
          url: publicUrl
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

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.type === type)
    return doc?.status || 'not_uploaded'
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/account"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Account
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Required Documents</h1>
          <p className="mt-2 text-gray-600">
            Upload the following documents to proceed with your solar installation
          </p>
        </div>

        <div className="space-y-6">
          {requiredDocuments.map((doc) => {
            const status = getDocumentStatus(doc.type)
            return (
              <div
                key={doc.type}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {doc.name}
                    </h3>
                    <p className="mt-1 text-gray-600">{doc.description}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Accepted format: {doc.format}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {status !== 'not_uploaded' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    )}
                    <label
                      htmlFor={`file-${doc.type}`}
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {status === 'not_uploaded' ? 'Upload' : 'Replace'}
                      <input
                        type="file"
                        id={`file-${doc.type}`}
                        className="hidden"
                        accept={doc.format.toLowerCase().split(' or ').join(',')}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, doc.type)
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 