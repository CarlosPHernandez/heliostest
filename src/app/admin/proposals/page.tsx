'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, Search, Filter, ChevronRight } from 'lucide-react'

interface Proposal {
  id: string
  user_id: string
  package_type: 'standard' | 'premium'
  system_size: number
  panel_count: number
  monthly_production: number
  address: string
  monthly_bill: number
  payment_type: 'cash' | 'financing'
  status: string
  created_at: string
  updated_at: string
  user: {
    email: string
    user_metadata: {
      full_name: string
    }
  }
}

const statusOptions = [
  'saved',
  'ordered',
  'site_survey_scheduled',
  'permit_approved',
  'installation_scheduled',
  'system_activated'
]

export default function AdminProposalsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProposals = async () => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select(`
            *,
            user:user_id (
              email,
              user_metadata
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        setProposals(data)
      } catch (err) {
        console.error('Error fetching proposals:', err)
        setError('Failed to load proposals')
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [user, router])

  const handleStatusUpdate = async (proposalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposalId)

      if (error) throw error

      // Update local state
      setProposals(prev =>
        prev.map(p =>
          p.id === proposalId ? { ...p, status: newStatus } : p
        )
      )
    } catch (err) {
      console.error('Error updating status:', err)
      // You might want to show a toast notification here
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.user?.user_metadata?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Manage Proposals</h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent appearance-none"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Proposals List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {proposal.user?.user_metadata?.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {proposal.user?.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {proposal.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {proposal.system_size} kW System
                        </div>
                        <div className="text-sm text-gray-500">
                          {proposal.panel_count} Panels
                        </div>
                        <div className="text-sm text-gray-500">
                          {proposal.package_type.charAt(0).toUpperCase() + 
                           proposal.package_type.slice(1)} Package
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={proposal.status}
                          onChange={(e) => handleStatusUpdate(proposal.id, e.target.value)}
                          className="text-sm border rounded-md px-2 py-1 focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(proposal.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => router.push(`/admin/proposals/${proposal.id}`)}
                          className="text-black hover:text-gray-700 flex items-center gap-1"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProposals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No proposals found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 