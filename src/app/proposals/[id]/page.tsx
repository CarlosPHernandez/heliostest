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
  ChevronRight,
  AlertCircle,
  ArrowRight,
  MapPin,
  PencilRuler,
  ClipboardCheck,
  Wrench,
  Camera
} from 'lucide-react'
import ProjectDocuments from '@/components/features/ProjectDocuments'
import ProjectNotes from '@/components/features/ProjectNotes'
import ProjectMessages from '@/components/features/ProjectMessages'
import { Database } from '@/types/database.types'

interface ProposalStatus {
  status: string
  label: string
  description: string
  icon: JSX.Element
  color: string
}

type Profile = Database['public']['Tables']['profiles']['Row']
type Proposal = Database['public']['Tables']['proposals']['Row']

const projectStages = [
  {
    stage: 'proposal',
    label: 'Proposal',
    description: 'Initial proposal and customer agreement',
    icon: <FileText className="w-5 h-5" />
  },
  {
    stage: 'site_survey',
    label: 'Site Survey',
    description: 'Property assessment and measurements',
    icon: <Camera className="w-5 h-5" />
  },
  {
    stage: 'onboarding',
    label: 'Onboarding',
    description: 'Customer onboarding and initial setup',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    stage: 'design',
    label: 'Design',
    description: 'System design and engineering',
    icon: <PencilRuler className="w-5 h-5" />
  },
  {
    stage: 'permitting',
    label: 'Permitting',
    description: 'Permit application and approval',
    icon: <ClipboardCheck className="w-5 h-5" />
  },
  {
    stage: 'installation',
    label: 'Installation',
    description: 'System installation and testing',
    icon: <Wrench className="w-5 h-5" />
  },
  {
    stage: 'completed',
    label: 'Completed',
    description: 'Project completed and system activated',
    icon: <CheckCircle2 className="w-5 h-5" />
  }
]

const statusConfig: Record<string, ProposalStatus> = {
  pending: {
    status: 'pending',
    label: 'Order Received',
    description: 'We have received your order and are reviewing the details.',
    icon: <Clock className="w-6 h-6" />,
    color: 'text-gray-500'
  },
  in_progress: {
    status: 'in_progress',
    label: 'In Progress',
    description: 'Your project is actively being worked on.',
    icon: <Calendar className="w-6 h-6" />,
    color: 'text-blue-500'
  },
  completed: {
    status: 'completed',
    label: 'Completed',
    description: 'Your project has been completed.',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-green-500'
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelled',
    description: 'This project has been cancelled.',
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'text-red-500'
  }
}

export default function ProposalDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isChatExpanded, setIsChatExpanded] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setUserId(session.user.id)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      if (!profile) throw new Error('Profile not found')

      setIsAdmin(profile.is_admin || false)
      loadProposal()
    } catch (error) {
      console.error('Error checking access:', error)
      toast.error('Failed to check access')
    }
  }

  const loadProposal = async () => {
    try {
      setLoading(true)
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      if (!proposal) throw new Error('Proposal not found')

      // If the proposal is in the initial stage, automatically move it to site survey
      if (proposal.stage === 'proposal' && !isAdmin) {
        const { error: updateError } = await supabase
          .from('proposals')
          .update({
            stage: 'site_survey' as const,
            status: 'in_progress' as const
          })
          .eq('id', params.id)

        if (updateError) throw updateError

        // Reload the proposal to get updated data
        const { data: updatedProposal, error: reloadError } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', params.id)
          .single()

        if (reloadError) throw reloadError
        if (!updatedProposal) throw new Error('Failed to reload proposal')

        setProposal(updatedProposal)
      } else {
        setProposal(proposal)
      }
    } catch (error) {
      console.error('Error loading proposal:', error)
      toast.error('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const getStatusForStage = (stage: string) => {
    switch (stage) {
      case 'proposal':
        return 'pending'
      case 'site_survey':
      case 'onboarding':
      case 'design':
      case 'permitting':
      case 'installation':
        return 'in_progress'
      case 'completed':
        return 'completed'
      default:
        return 'pending'
    }
  }

  const updateProjectStage = async (newStage: string) => {
    try {
      console.log('Starting update process...')
      setUpdating(true)

      // Get the appropriate status for the new stage at the beginning
      const newStatus = getStatusForStage(newStage)

      // First, verify the proposal exists and user has access
      console.log('Fetching proposal...')
      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('id, stage, status, user_id')
        .eq('id', params.id)
        .single()

      if (fetchError) {
        console.error('Error fetching proposal:', fetchError)
        throw fetchError
      }
      if (!proposal) throw new Error('Proposal not found')

      console.log('Current proposal state:', {
        id: params.id,
        currentStage: proposal.stage,
        newStage,
        currentStatus: proposal.status,
        newStatus,
        userId,
      })

      // Then update the stage and status
      console.log('Attempting to update proposal...')
      const updateResult = await supabase
        .from('proposals')
        .update({
          stage: newStage,
          status: newStatus
        })
        .eq('id', params.id)
        .select()

      console.log('Update result:', updateResult)

      if (updateResult.error) {
        const errorDetails = {
          message: updateResult.error.message,
          code: updateResult.error.code,
          details: updateResult.error.details,
          hint: updateResult.error.hint,
          status: updateResult.status,
          statusText: updateResult.statusText,
          body: updateResult.error
        };
        console.error('Detailed update error:', errorDetails);
        throw updateResult.error
      }

      // Add a note about the stage change
      console.log('Adding system note...')
      const currentStage = projectStages.find(s => s.stage === proposal.stage)?.label
      const newStageLabel = projectStages.find(s => s.stage === newStage)?.label

      const noteResult = await supabase
        .from('project_notes')
        .insert({
          proposal_id: params.id,
          author_id: userId,
          content: `Project stage updated from ${currentStage} to ${newStageLabel}`,
          is_system_note: true
        })

      console.log('Note result:', noteResult)

      if (noteResult.error) {
        console.error('Error adding note:', {
          error: noteResult.error,
          code: noteResult.error.code,
          details: noteResult.error.details,
          message: noteResult.error.message,
          hint: noteResult.error.hint
        })
        throw noteResult.error
      }

      console.log('Update completed successfully')
      toast.success('Project stage updated successfully')

      // Update local state with the new data
      if (updateResult.data?.[0]) {
        const updatedProposal = updateResult.data[0];
        setProposal(current => ({
          ...current!,
          stage: updatedProposal.stage,
          status: updatedProposal.status
        }));
        console.log('Local state updated:', updatedProposal);
      }
    } catch (error: any) {
      console.error('Error updating project stage:', {
        errorObject: error,
        name: error?.name,
        code: error?.code,
        details: error?.details,
        message: error?.message,
        hint: error?.hint,
        status: error?.status,
        statusText: error?.statusText,
        stack: error?.stack,
        fullError: JSON.stringify(error, null, 2),
        requestData: {
          stage: newStage,
          status: getStatusForStage(newStage),
          proposalId: params.id
        }
      })
      const errorMessage = error?.message || error?.details || error?.hint || 'Unknown error occurred';
      toast.error(`Failed to update project stage: ${errorMessage}. Check console for details.`)
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Proposal Not Found</h1>
        <p className="text-gray-600 mb-4">The proposal you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => router.back()}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    )
  }

  const currentStageIndex = projectStages.findIndex(s => s.stage === proposal.stage)

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="space-y-4 sm:space-y-6">
          {/* Project Details Card */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">Project Details</h1>
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="font-medium text-sm sm:text-base break-words">{proposal.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">System Size</label>
                <p className="font-medium text-sm sm:text-base">{proposal.system_size} kW</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Price</label>
                <p className="font-medium text-sm sm:text-base">{formatCurrency(proposal.total_price)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Package Type</label>
                <p className="font-medium text-sm sm:text-base">{proposal.package_type}</p>
              </div>
            </div>
          </div>

          {/* Project Stages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Project Progress</h2>
                <p className="text-sm text-gray-500 mt-1">Track your solar installation progress</p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {currentStageIndex > 0 && (
                  <button
                    onClick={() => updateProjectStage(projectStages[currentStageIndex - 1]?.stage)}
                    disabled={updating}
                    className="px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 
                             hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous Stage</span>
                    <span className="sm:hidden">Previous</span>
                  </button>
                )}
                {currentStageIndex < projectStages.length - 1 && (
                  <button
                    onClick={() => updateProjectStage(projectStages[currentStageIndex + 1]?.stage)}
                    disabled={updating}
                    className="px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 text-white
                             hover:bg-blue-600 transition-all duration-200 
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Next Stage</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {projectStages.map((stage, index) => {
                const isComplete = index < currentStageIndex
                const isCurrent = index === currentStageIndex
                const isUpcoming = index > currentStageIndex

                return (
                  <div
                    key={stage.stage}
                    className={`
                      relative group
                      ${isComplete ? 'opacity-100' : isUpcoming ? 'opacity-60 hover:opacity-80' : 'opacity-100'}
                      transition-all duration-300 ease-in-out
                    `}
                  >
                    {/* Stage Content */}
                    <div className={`
                      flex items-center p-3 sm:p-4 rounded-xl
                      ${isCurrent ? 'bg-blue-50 ring-1 ring-blue-500/20' : 'bg-gray-50/50'}
                      ${isComplete ? 'bg-green-50/50' : ''}
                      transition-all duration-300 ease-in-out
                      hover:shadow-sm
                    `}>
                      {/* Stage Icon/Number */}
                      <div className={`
                        w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center
                        transform transition-all duration-300 ease-in-out
                        ${isComplete ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white ring-2 ring-offset-2 ring-blue-500/30' :
                            'bg-gray-100 text-gray-500'
                        }
                      `}>
                        {isComplete ? (
                          <CheckCircle2 className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        ) : (
                          stage.icon || <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>

                      {/* Stage Info */}
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`
                            font-semibold text-sm sm:text-base
                            ${isCurrent ? 'text-blue-700' : isComplete ? 'text-green-700' : 'text-gray-900'}
                          `}>
                            {stage.label}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{stage.description}</p>
                      </div>

                      {/* Status Indicator */}
                      {isComplete && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium pr-2">
                          <span>Completed</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Connector Line */}
                    {index < projectStages.length - 1 && (
                      <div className="absolute left-6 ml-[11px] top-12 bottom-0 w-[2px] h-[calc(100%_-_24px)]">
                        <div className="h-full bg-gray-100 rounded-full" />
                        <div
                          className="absolute top-0 left-0 w-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                          style={{
                            height: isComplete ? '100%' : '0%',
                            opacity: isComplete ? 1 : 0
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <ProjectDocuments proposalId={params.id} isAdmin={isAdmin} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Project Notes (Admin Only) - Moved above chat */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-6">
              <ProjectNotes proposalId={params.id} />
            </div>
          )}

          {/* Collapsible Chat Section */}
          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-bold">Messages</h2>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${isChatExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isChatExpanded && (
              <div className="p-6 pt-0">
                <ProjectMessages proposalId={params.id} isAdmin={isAdmin} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 