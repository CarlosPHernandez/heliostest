import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ProposalStageSelectProps {
  proposalId: string
  currentStatus: string
  currentStage: string
  onUpdate?: () => void
}

const stages = [
  'proposal',
  'site_survey',
  'onboarding',
  'design',
  'permitting',
  'installation',
  'completed'
] as const

const statuses = [
  'pending',
  'in_progress',
  'approved',
  'completed',
  'cancelled'
] as const

export default function ProposalStageSelect({
  proposalId,
  currentStatus,
  currentStage,
  onUpdate
}: ProposalStageSelectProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [stage, setStage] = useState(currentStage)

  const handleUpdate = async () => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('proposals')
        .update({
          status: status,
          stage: stage
        })
        .eq('id', proposalId)

      if (error) throw error

      toast.success('Project status updated successfully')
      onUpdate?.()
    } catch (error) {
      console.error('Error updating proposal:', error)
      toast.error('Failed to update project status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={loading}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stage
        </label>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={loading}
        >
          {stages.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading || (status === currentStatus && stage === currentStage)}
        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Updating...
          </>
        ) : (
          'Update Status'
        )}
      </button>
    </div>
  )
} 