'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Battery, 
  Sun, 
  DollarSign,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'

interface ProposalStatus {
  status: string
  label: string
  description: string
  icon: JSX.Element
  color: string
}

const statusConfig: Record<string, ProposalStatus> = {
  pending: {
    status: 'pending',
    label: 'Order Received',
    description: 'We have received your order and are reviewing the details.',
    icon: <Clock className="w-6 h-6" />,
    color: 'text-gray-500'
  },
  site_survey_scheduled: {
    status: 'site_survey_scheduled',
    label: 'Site Survey Scheduled',
    description: 'Our team will visit your property to assess installation requirements.',
    icon: <Calendar className="w-6 h-6" />,
    color: 'text-blue-500'
  },
  site_survey_completed: {
    status: 'site_survey_completed',
    label: 'Site Survey Completed',
    description: 'Property assessment completed. Proceeding with system design.',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-green-500'
  },
  design_in_progress: {
    status: 'design_in_progress',
    label: 'Design in Progress',
    description: 'Our engineers are designing your custom solar system.',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-yellow-500'
  },
  design_completed: {
    status: 'design_completed',
    label: 'Design Completed',
    description: 'Your solar system design has been finalized.',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-green-500'
  },
  permits_in_progress: {
    status: 'permits_in_progress',
    label: 'Permits in Progress',
    description: 'We are obtaining necessary permits from local authorities.',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-yellow-500'
  },
  permits_approved: {
    status: 'permits_approved',
    label: 'Permits Approved',
    description: 'All required permits have been approved.',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-green-500'
  },
  installation_scheduled: {
    status: 'installation_scheduled',
    label: 'Installation Scheduled',
    description: 'Your installation date has been set.',
    icon: <Calendar className="w-6 h-6" />,
    color: 'text-blue-500'
  },
  installation_in_progress: {
    status: 'installation_in_progress',
    label: 'Installation in Progress',
    description: 'Our team is installing your solar system.',
    icon: <Sun className="w-6 h-6" />,
    color: 'text-yellow-500'
  },
  installation_completed: {
    status: 'installation_completed',
    label: 'Installation Completed',
    description: 'Your solar system has been installed.',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-green-500'
  },
  inspection_scheduled: {
    status: 'inspection_scheduled',
    label: 'Inspection Scheduled',
    description: 'Final inspection has been scheduled.',
    icon: <Calendar className="w-6 h-6" />,
    color: 'text-blue-500'
  },
  inspection_passed: {
    status: 'inspection_passed',
    label: 'Inspection Passed',
    description: 'Your system has passed final inspection.',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-green-500'
  },
  system_activated: {
    status: 'system_activated',
    label: 'System Activated',
    description: 'Your solar system is now active and producing clean energy!',
    icon: <Sun className="w-6 h-6" />,
    color: 'text-green-500'
  }
}

export default function ProposalDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProposal()
  }, [])

  const loadProposal = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      if (!session) {
        console.log('No session found, redirecting to login...')
        router.push('/login?returnUrl=' + encodeURIComponent('/proposals/' + params.id))
        return
      }

      console.log('Fetching proposal:', params.id)
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', params.id)
        .single()

      if (proposalError) {
        console.error('Proposal error:', proposalError)
        throw proposalError
      }

      if (!proposal) {
        console.error('Proposal not found')
        throw new Error('Proposal not found')
      }

      console.log('Proposal loaded:', proposal)
      setProposal(proposal)
    } catch (error) {
      console.error('Error loading proposal:', error)
      setError(error instanceof Error ? error.message : 'Error loading proposal')
      toast.error('Error loading proposal details')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Proposal</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[proposal.status]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`${currentStatus.color}`}>
                  {currentStatus.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentStatus.label}</h2>
                  <p className="text-gray-600">{currentStatus.description}</p>
                </div>
              </div>
              
              {proposal.notes && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{proposal.notes}</p>
                </div>
              )}
            </div>

            {/* System Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">System Size</p>
                      <p className="font-medium">{proposal.system_size} kW</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Number of Panels</p>
                      <p className="font-medium">{proposal.number_of_panels} panels</p>
                    </div>
                  </div>
                  {proposal.include_battery && (
                    <div className="flex items-center gap-3">
                      <Battery className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Battery System</p>
                        <p className="font-medium">
                          {proposal.battery_count}x {proposal.battery_type}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Investment</p>
                      <p className="font-medium">{formatCurrency(proposal.total_price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">{proposal.payment_type}</p>
                    </div>
                  </div>
                  {proposal.payment_type === 'finance' && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Monthly Payment</p>
                        <p className="font-medium">{formatCurrency(proposal.monthly_payment)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Installation Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Installation Address</h2>
              <p className="text-gray-600">{proposal.address}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Timeline</h2>
            <div className="space-y-6">
              {Object.values(statusConfig).map((status, index) => {
                const isCompleted = Object.values(statusConfig).indexOf(currentStatus) >= index
                const isCurrent = currentStatus.status === status.status
                
                return (
                  <div
                    key={status.status}
                    className={`flex items-start gap-3 ${
                      index !== Object.values(statusConfig).length - 1
                        ? 'pb-6 border-l-2 border-gray-200 ml-[11px]'
                        : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        isCurrent ? 'text-blue-500' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {status.label}
                      </p>
                      <p className={`text-sm ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {status.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 