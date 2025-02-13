'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, Sun, Battery, DollarSign, Calendar, ArrowRight, Loader2, PlusCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProjectDocuments from '@/components/features/ProjectDocuments'

interface Proposal {
  id: string
  user_id: string
  address: string
  system_size: number
  number_of_panels: number
  total_price: number
  package_type: string
  payment_type: string
  include_battery: boolean
  battery_type?: string
  battery_count?: number
  status: string
  stage: string
  notes?: string
  created_at: string
  status_updated_at?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      console.log('Checking user session...')
      setError(null)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      if (!session) {
        console.log('No session found, redirecting to login...')
        router.push('/login')
        return
      }

      setUser(session.user)
      await loadProposals(session.user.id)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load user data')
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  async function loadProposals(userId: string) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProposals(data || [])
      
      // Set the first active proposal as selected for documents
      const activeProposal = data?.find(p => p.status !== 'cancelled' && p.status !== 'completed')
      if (activeProposal) {
        setSelectedProposal(activeProposal.id)
      }
    } catch (error) {
      console.error('Error loading proposals:', error)
      toast.error('Failed to load proposals')
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

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Solar Projects</h1>
            <Link href="/order" className="btn btn-primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </div>

          {proposals.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">No Projects Yet</h2>
              <p className="text-gray-600 mb-4">
                Start your solar journey by creating your first project.
              </p>
              <Link href="/order" className="btn btn-primary">
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">{proposal.address}</h2>
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
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Project Documents</h2>
            {selectedProposal ? (
              <ProjectDocuments proposalId={selectedProposal} isAdmin={false} />
            ) : (
              <p className="text-center text-gray-500 py-4">
                No active project selected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 