'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ProposalStageSelect from '@/components/features/ProposalStageSelect'

interface Proposal {
  id: string
  user_id: string
  address: string
  system_size: number
  total_price: number
  status: string
  stage: string
  created_at: string
  profiles: {
    email: string
    name: string
  }
}

export default function ProposalsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

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

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      loadProposals()
    } catch (error) {
      console.error('Error checking access:', error)
      toast.error('Failed to check access')
    }
  }

  const loadProposals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id,
          user_id,
          address,
          system_size,
          total_price,
          status,
          stage,
          created_at,
          profiles:user_id (
            email,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProposals(data || [])
    } catch (error) {
      console.error('Error loading proposals:', error)
      toast.error('Failed to load proposals')
    } finally {
      setLoading(false)
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

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">Proposals</h1>
          <Link
            href="/admin"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No proposals found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {proposal.profiles.name}
                      </h3>
                      <p className="text-sm text-gray-500">{proposal.profiles.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Created {new Date(proposal.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatCurrency(proposal.total_price)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dl className="grid grid-cols-1 gap-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Address</dt>
                          <dd className="text-sm text-gray-900">{proposal.address}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">System Size</dt>
                          <dd className="text-sm text-gray-900">{proposal.system_size} kW</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Project Status</h4>
                      <ProposalStageSelect
                        proposalId={proposal.id}
                        currentStatus={proposal.status}
                        currentStage={proposal.stage}
                        onUpdate={loadProposals}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 