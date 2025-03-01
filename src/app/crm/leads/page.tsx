'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ChevronDown,
  PlusCircle
} from 'lucide-react'

export default function LeadsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const fetchLeads = async () => {
      console.log('Leads page - Fetching leads')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Leads page - Session exists:', !!session)

      if (!session) {
        console.log('Leads page - No session, showing empty leads list')
        setAuthenticated(false)
        setLoading(false)
        return
      }

      setAuthenticated(true)

      // Fetch leads
      const { data: leadsData, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('assignedTo', session.user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching leads:', error)
      } else {
        console.log('Leads page - Fetched leads:', leadsData?.length || 0)
        setLeads(leadsData || [])
      }

      setLoading(false)
    }

    fetchLeads()
  }, [supabase, router])

  // Filter leads based on search term and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm)

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Status options for filtering
  const statusOptions = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Leads</h1>
        <Link
          href="/crm/leads/new"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
        >
          <PlusCircle size={20} />
          <span>Add New Lead</span>
        </Link>
      </div>

      {!authenticated ? (
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view your leads</h3>
          <p className="text-gray-500 mb-6">You need to be signed in as a sales representative to view and manage leads.</p>
          <Link
            href="/login?returnUrl=/crm/leads"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first lead.</p>
                <Link
                  href="/crm/leads/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Add New Lead
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/crm/leads/${lead.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{lead.email}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                                lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                                  lead.status === 'Proposal' ? 'bg-purple-100 text-purple-800' :
                                    lead.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                                      'bg-red-100 text-red-800'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{lead.source}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/crm/leads/${lead.id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </Link>
                          <Link
                            href={`/crm/leads/${lead.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
} 