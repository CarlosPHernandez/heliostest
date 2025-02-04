'use client'

import { useState, use } from 'react'
import { ChevronLeft, CheckCircle2, Clock, AlertCircle, Calendar, MapPin, Zap, User, Phone, Mail, Building } from 'lucide-react'
import Link from 'next/link'
import StatusUpdateModal from '@/components/modals/StatusUpdateModal'
import DocumentUploadModal from '@/components/documents/DocumentUploadModal'
import ProjectNotes from '@/components/projects/ProjectNotes'

interface ProjectDetails {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  systemSize: string
  currentStage: string
  status: 'active' | 'completed' | 'on-hold'
  installationDate?: string
  progress: number
  documents: {
    id: number
    name: string
    status: 'pending' | 'completed'
    type: string
  }[]
  timeline: {
    id: number
    stage: string
    status: 'completed' | 'in-progress' | 'pending'
    date?: string
    notes?: string
  }[]
}

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [project, setProject] = useState<ProjectDetails>({
    id: resolvedParams.id,
    customerName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Solar Street, Sunnyville, CA 90210',
    systemSize: '8.4 kW',
    currentStage: 'Solar Design',
    status: 'active',
    installationDate: '2024-03-15',
    progress: 35,
    documents: [
      { id: 1, name: 'Utility Bill', status: 'completed', type: 'PDF' },
      { id: 2, name: 'Site Survey Form', status: 'pending', type: 'Form' },
      { id: 3, name: 'Contract', status: 'completed', type: 'PDF' }
    ],
    timeline: [
      {
        id: 1,
        stage: 'Order Received',
        status: 'completed',
        date: '2024-02-04',
        notes: 'Initial order processed and confirmed'
      },
      {
        id: 2,
        stage: 'Solar Design',
        status: 'in-progress',
        date: '2024-02-10',
        notes: 'Design team working on roof layout and system specifications'
      },
      {
        id: 3,
        stage: 'Permit Submission',
        status: 'pending'
      },
      {
        id: 4,
        stage: 'Installation',
        status: 'pending'
      }
    ]
  })
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)

  const getStatusIcon = (status: ProjectDetails['status'] | 'completed' | 'in-progress' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'active':
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: ProjectDetails['status'] | 'completed' | 'in-progress' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'active':
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const handleStatusUpdate = async (data: {
    stage: string
    status: string
    notes: string
    sendEmail: boolean
  }) => {
    // Update project status
    setProject(prev => ({
      ...prev,
      currentStage: data.stage,
      status: data.status as ProjectDetails['status'],
      timeline: [
        {
          id: Date.now(),
          stage: data.stage,
          status: 'completed',
          date: new Date().toISOString(),
          notes: data.notes
        },
        ...prev.timeline
      ]
    }))

    // Send email notification if enabled
    if (data.sendEmail) {
      // Implement email notification logic here
      console.log('Sending email notification to customer...')
    }
  }

  const handleDocumentUpload = async (file: File, category: string) => {
    // In a real app, you would upload the file to your storage service here
    const newDoc = {
      id: Date.now(),
      name: file.name,
      status: 'completed' as const,
      type: file.type.includes('pdf') ? 'PDF' : 'Image'
    }

    setProject(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-28">
        {/* Back button */}
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 lg:mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Project {project.id}</h1>
            <p className="mt-1 text-sm lg:text-base text-gray-600">Manage project details and track progress</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDocumentModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Upload Document
            </button>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Update Status
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Sidebar - Shown at top on mobile */}
          <div className="lg:order-2 space-y-4 lg:space-y-8">
            {/* Project Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Project Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600 text-sm lg:text-base">
                  <Calendar className="h-5 w-5 flex-shrink-0" />
                  <span className="break-words">Installation Date: {project.installationDate}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-600 text-sm lg:text-base">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{project.address}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm lg:text-base">
                  <Zap className="h-5 w-5 flex-shrink-0" />
                  <span className="break-words">System Size: {project.systemSize}</span>
                </div>
                <div className="h-px bg-gray-200 my-4" />
                <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 text-sm lg:text-base">
                    <User className="h-5 w-5 flex-shrink-0" />
                    <span className="break-words">{project.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm lg:text-base">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <span className="break-words">{project.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm lg:text-base">
                    <Mail className="h-5 w-5 flex-shrink-0" />
                    <span className="break-words">{project.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Project Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm lg:text-base">
                  <span className="text-gray-600">Current Stage</span>
                  <span className="font-medium text-gray-900">{project.currentStage}</span>
                </div>
                <div className="flex items-center justify-between text-sm lg:text-base">
                  <span className="text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm lg:text-base">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 lg:order-1 space-y-4 lg:space-y-8">
            {/* Project Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Installation Progress</h2>
              <div className="space-y-4">
                {project.timeline.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`relative border rounded-xl p-4 lg:p-5 ${getStatusColor(stage.status)}`}
                  >
                    {index < project.timeline.length - 1 && (
                      <div className="absolute left-8 lg:left-11 bottom-0 w-0.5 h-8 bg-gray-200 -mb-8 z-0" />
                    )}
                    <div className="flex items-start gap-4 lg:gap-6">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(stage.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                            {stage.stage}
                          </h3>
                          {stage.date && (
                            <span className="text-xs lg:text-sm text-gray-500">
                              {new Date(stage.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {stage.notes && (
                          <p className="text-sm text-gray-600 break-words">{stage.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Notes */}
            <ProjectNotes projectId={project.id} />

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Project Documents</h2>
              <div className="space-y-3 lg:space-y-4">
                {project.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 lg:p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                      <div className="flex-shrink-0">
                        {doc.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    <button className="ml-4 text-sm font-medium text-black hover:text-gray-700 whitespace-nowrap">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStage={project.currentStage}
        currentStatus={project.status}
        onUpdate={handleStatusUpdate}
      />

      <DocumentUploadModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onUpload={handleDocumentUpload}
      />
    </div>
  )
} 