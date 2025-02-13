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
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import ProjectDocuments from '@/components/features/ProjectDocuments'

interface ProposalStatus {
  status: string
  label: string
  description: string
  icon: JSX.Element
  color: string
}

const projectStages = [
  {
    stage: 'proposal',
    label: 'Proposal',
    description: 'Initial proposal and customer agreement'
  },
  {
    stage: 'onboarding',
    label: 'Onboarding',
    description: 'Document collection and verification'
  },
  {
    stage: 'design',
    label: 'Design',
    description: 'System design and engineering'
  },
  {
    stage: 'permitting',
    label: 'Permitting',
    description: 'Permit application and approval'
  },
  {
    stage: 'installation',
    label: 'Installation',
    description: 'System installation and testing'
  },
  {
    stage: 'completed',
    label: 'Completed',
    description: 'Project completed and system activated'
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
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [updating, setUpdating] = useState(false)

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      setIsAdmin(profile?.is_admin || false)
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
      setProposal(proposal)
    } catch (error) {
      console.error('Error loading proposal:', error)
      toast.error('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const updateProjectStage = async (newStage: string) => {
    try {
      setUpdating(true)
      const { error } = await supabase
        .from('proposals')
        .update({ 
          stage: newStage,
          status: newStage === 'completed' ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success('Project stage updated successfully')
      loadProposal()
    } catch (error) {
      console.error('Error updating project stage:', error)
      toast.error('Failed to update project stage')
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
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Project Details</h1>
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="font-medium">{proposal.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">System Size</label>
                <p className="font-medium">{proposal.system_size} kW</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Price</label>
                <p className="font-medium">{formatCurrency(proposal.total_price)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Package Type</label>
                <p className="font-medium">{proposal.package_type}</p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Project Stage</h2>
              <div className="space-y-4">
                {projectStages.map((stage, index) => {
                  const isComplete = index < currentStageIndex
                  const isCurrent = index === currentStageIndex
                  const isUpcoming = index > currentStageIndex

                  return (
                    <div
                      key={stage.stage}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrent ? 'border-blue-500 bg-blue-50' :
                        isComplete ? 'border-green-500 bg-green-50' :
                        'border-gray-200'
                      }`}
                    >
                      <div>
                        <h3 className="font-medium">{stage.label}</h3>
                        <p className="text-sm text-gray-500">{stage.description}</p>
                      </div>
                      {isCurrent && !updating && (
                        <button
                          onClick={() => updateProjectStage(projectStages[index + 1]?.stage)}
                          className="btn btn-primary btn-sm"
                          disabled={!projectStages[index + 1]}
                        >
                          Next Stage
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      )}
                      {isComplete && (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <ProjectDocuments proposalId={params.id} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  )
} 