'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

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
          *,
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Proposals</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      <div className="space-y-4">
        {proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Proposals Found</h2>
            <p className="text-gray-600">
              There are currently no proposals in the system.
            </p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{proposal.address}</h2>
                  <p className="text-sm text-gray-500">
                    Customer: {proposal.profiles.name || proposal.profiles.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(proposal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/proposals/${proposal.id}`}
                  className="btn btn-ghost btn-sm"
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">System Size</p>
                  <p className="font-medium">{proposal.system_size} kW</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium">{formatCurrency(proposal.total_price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    proposal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    proposal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    proposal.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {proposal.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stage</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    proposal.stage === 'completed' ? 'bg-green-100 text-green-800' :
                    proposal.stage === 'installation' ? 'bg-purple-100 text-purple-800' :
                    proposal.stage === 'permitting' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.stage === 'design' ? 'bg-indigo-100 text-indigo-800' :
                    proposal.stage === 'onboarding' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {proposal.stage}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 