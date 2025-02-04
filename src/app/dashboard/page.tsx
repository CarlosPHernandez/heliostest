'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, FileText, AlertCircle, ClipboardList, Download, Upload, Gift, Share2 } from 'lucide-react'
import Link from 'next/link'

interface Milestone {
  id: number
  title: string
  status: 'completed' | 'in-progress' | 'pending' | 'ready'
  date?: string
  description: string
}

interface Document {
  id: number
  title: string
  status: 'pending' | 'completed' | 'action_required'
  dueDate?: string
  type: 'upload' | 'download' | 'form'
  description: string
}

const Dashboard = () => {
  const [milestones] = useState<Milestone[]>([
    {
      id: 1,
      title: 'Order Received',
      status: 'completed',
      date: '2024-02-04',
      description: 'Your solar order has been successfully received and is being processed.'
    },
    {
      id: 2,
      title: 'Solar Design',
      status: 'in-progress',
      description: 'Our engineers are creating a custom solar design for your home.'
    },
    {
      id: 3,
      title: 'Proposal Creation',
      status: 'pending',
      description: 'Your personalized proposal will be created based on the final design.'
    },
    {
      id: 4,
      title: 'Proposal Ready',
      status: 'pending',
      description: 'Your proposal will be available for review here.'
    }
  ])

  const [documents] = useState<Document[]>([
    {
      id: 1,
      title: 'Utility Bill',
      status: 'pending',
      dueDate: '2024-02-20',
      type: 'upload',
      description: 'Please upload your most recent utility bill'
    },
    {
      id: 2,
      title: 'Site Survey Form',
      status: 'action_required',
      dueDate: '2024-02-18',
      type: 'form',
      description: 'Complete the site survey form for your property'
    },
    {
      id: 3,
      title: 'Contract Documents',
      status: 'completed',
      type: 'download',
      description: 'Download and review your contract documents'
    }
  ])

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />
      case 'in-progress':
        return <Clock className="h-8 w-8 text-blue-500 animate-pulse" />
      case 'ready':
        return <FileText className="h-8 w-8 text-purple-500" />
      default:
        return <AlertCircle className="h-8 w-8 text-gray-300" />
    }
  }

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in-progress':
        return 'bg-blue-50 border-blue-200'
      case 'ready':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-5 w-5" />
      case 'download':
        return <Download className="h-5 w-5" />
      case 'form':
        return <ClipboardList className="h-5 w-5" />
    }
  }

  const getDocumentStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'action_required':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">Track your solar journey and complete required tasks below.</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress Timeline */}
          <div className="lg:col-span-2">
            {/* Milestones Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Installation Progress</h2>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`relative border rounded-xl p-5 ${getStatusColor(milestone.status)}`}
                  >
                    {index < milestones.length - 1 && (
                      <div className="absolute left-11 bottom-0 w-0.5 h-8 bg-gray-200 -mb-8 z-0" />
                    )}

                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 mt-1 cursor-pointer">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {milestone.title}
                          </h3>
                          {milestone.date && (
                            <span className="text-sm text-gray-500">
                              {new Date(milestone.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{milestone.description}</p>
                        
                        {milestone.status === 'ready' && (
                          <button 
                            className="mt-3 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            onClick={() => window.open('/proposal.pdf', '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Proposal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Section - Shows in mobile under progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 lg:hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Required Documents</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {documents.filter(d => d.status === 'completed').length} of {documents.length} completed
                  </p>
                </div>
                <Link 
                  href="/dashboard/documents"
                  className="text-sm font-medium text-black hover:text-gray-800"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`border rounded-lg p-4 ${getDocumentStatusColor(doc.status)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium truncate">
                            {doc.title}
                          </h3>
                          <div className="flex-shrink-0">
                            {doc.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : doc.status === 'action_required' ? (
                              <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        {doc.dueDate && (
                          <p className="text-xs mt-1">
                            Due: {new Date(doc.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm mt-2 mb-3">{doc.description}</p>
                        {doc.status !== 'completed' && (
                          <Link
                            href={doc.type === 'form' ? '/dashboard/site-survey' : '/dashboard/documents'}
                            className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-current rounded-lg hover:opacity-80 transition-opacity"
                          >
                            {doc.type === 'upload' && 'Upload Document'}
                            {doc.type === 'download' && 'Download Form'}
                            {doc.type === 'form' && 'Complete Form'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">System Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">System Size</p>
                  <p className="text-2xl font-semibold">8.4 kW</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Annual Production</p>
                  <p className="text-2xl font-semibold">12,000 kWh</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Estimated Savings</p>
                  <p className="text-2xl font-semibold text-green-600">$1,800/year</p>
                </div>
              </div>
            </div>

            {/* Referral Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Refer a Friend</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Know someone who would benefit from solar? Refer them and earn rewards!
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Gift className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-600 mb-1">Your Referrals</p>
                  <p className="text-2xl font-semibold text-purple-700">0</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Rewards Earned</p>
                  <p className="text-2xl font-semibold text-green-600">$0</p>
                </div>
              </div>

              <Link 
                href="/dashboard/referrals"
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Referral Link
              </Link>
            </div>
          </div>

          {/* Right Column - Documents & Support */}
          <div className="space-y-8 hidden lg:block">
            {/* Onboarding Documents Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Required Documents</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {documents.filter(d => d.status === 'completed').length} of {documents.length} completed
                  </p>
                </div>
                <Link 
                  href="/dashboard/documents"
                  className="text-sm font-medium text-black hover:text-gray-800"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`border rounded-lg p-4 ${getDocumentStatusColor(doc.status)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium truncate">
                            {doc.title}
                          </h3>
                          <div className="flex-shrink-0">
                            {doc.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : doc.status === 'action_required' ? (
                              <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        {doc.dueDate && (
                          <p className="text-xs mt-1">
                            Due: {new Date(doc.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm mt-2 mb-3">{doc.description}</p>
                        {doc.status !== 'completed' && (
                          <Link
                            href={doc.type === 'form' ? '/dashboard/site-survey' : '/dashboard/documents'}
                            className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-current rounded-lg hover:opacity-80 transition-opacity"
                          >
                            {doc.type === 'upload' && 'Upload Document'}
                            {doc.type === 'download' && 'Download Form'}
                            {doc.type === 'form' && 'Complete Form'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
              <p className="text-gray-600 text-sm mb-4">
                Our support team is here to help you with any questions about your solar installation.
              </p>
              <button className="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 