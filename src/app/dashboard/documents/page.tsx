'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentList from '@/components/documents/DocumentList'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  url: string
}

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('utility')
  const [showUpload, setShowUpload] = useState(false)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])

  const handleUpload = (file: File) => {
    // In a real application, you would upload the file to your storage service here
    const newDoc: UploadedDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file), // This is temporary, in production use actual URLs
    }

    setDocuments(prev => [...prev, newDoc])
    setShowUpload(false)
  }

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const handleView = (doc: UploadedDocument) => {
    window.open(doc.url, '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
          >
            Upload Document
          </button>
        )}
      </div>

      {showUpload ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Upload Document</h2>
          <DocumentUpload
            onUpload={handleUpload}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      ) : (
        <Tabs defaultValue="utility" className="space-y-6">
          <TabsList>
            <TabsTrigger value="utility">Utility Bills</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="permits">Permits</TabsTrigger>
            <TabsTrigger value="other">Other Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="utility" className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Utility Bills</h2>
            <DocumentList
              documents={documents.filter(doc => doc.type.startsWith('utility'))}
              onDelete={handleDelete}
              onView={handleView}
            />
          </TabsContent>

          <TabsContent value="contracts" className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Contracts</h2>
            <DocumentList
              documents={documents.filter(doc => doc.type.startsWith('contract'))}
              onDelete={handleDelete}
              onView={handleView}
            />
          </TabsContent>

          <TabsContent value="permits" className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Permits</h2>
            <DocumentList
              documents={documents.filter(doc => doc.type.startsWith('permit'))}
              onDelete={handleDelete}
              onView={handleView}
            />
          </TabsContent>

          <TabsContent value="other" className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Other Documents</h2>
            <DocumentList
              documents={documents.filter(doc => 
                !doc.type.startsWith('utility') && 
                !doc.type.startsWith('contract') && 
                !doc.type.startsWith('permit')
              )}
              onDelete={handleDelete}
              onView={handleView}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 