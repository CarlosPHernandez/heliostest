'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ArrowUpRight,
  Clock,
  TrendingUp,
  BarChart2,
  ChevronRight
} from 'lucide-react'

export default function CRMDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return
      }

      // Get user data including role
      const { data: userData } = await supabase
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setUser(userData)

      // Fetch leads
      const { data: leadsData, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('assignedTo', session.user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching leads:', error)
      } else {
        setLeads(leadsData || [])
      }

      setLoading(false)
    }

    fetchData()
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

  // Get today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20">
      {/* Welcome Header */}
      <div className="max-w-7xl mx-auto mb-16 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-3">{formattedDate}</p>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
            <p className="text-gray-600 mt-3">Here's what's happening with your leads today.</p>
          </div>
          <div className="mt-8 md:mt-0">
            <Link
              href="/crm/leads/new"
              className="inline-flex items-center px-5 py-2.5 bg-slate-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              New Lead
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-7 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">{leads.length}</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-7 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">New Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">{leads.filter(l => l.status === 'New').length}</p>
                <p className="text-xs text-gray-500 mt-2">Require contact</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-7 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Follow Ups</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">{leads.filter(l => l.status === 'Contacted').length}</p>
                <p className="text-xs text-gray-500 mt-2">Need follow up</p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-7 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {leads.filter(l => {
                    const createdDate = new Date(l.createdAt)
                    const weekAgo = new Date()
                    weekAgo.setDate(today.getDate() - 7)
                    return createdDate >= weekAgo
                  }).length}
                </p>
                <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-8 py-10 md:px-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Ready to grow your sales?</h2>
              <p className="mt-3 text-gray-600 max-w-xl">Add new leads, track your interactions, and close more deals with our streamlined CRM.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/crm/leads/new"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-700 hover:bg-slate-800 shadow-sm transition-colors duration-200"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Lead
              </Link>
              <Link
                href="/crm/leads"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <Users className="mr-2 h-4 w-4" />
                View All Leads
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
          <Link
            href="/crm/leads"
            className="text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center"
          >
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                className="pl-12 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative w-full md:w-56">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-12 pr-10 py-3 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 w-full bg-gray-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-10">
          {filteredLeads.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                <Users className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No leads found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Get started by creating your first lead or adjust your search filters.</p>
              <Link
                href="/crm/leads/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
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
                    <th scope="col" className="px-10 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-10 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-10 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-10 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-10 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-10 py-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredLeads.slice(0, 5).map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => router.push(`/crm/leads/${lead.id}`)}
                    >
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium mr-4">
                            {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="text-sm text-gray-500 mt-1">{lead.phone}</div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-medium rounded-full 
                          ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'Contacted' ? 'bg-teal-100 text-teal-800' :
                              lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                                lead.status === 'Proposal' ? 'bg-slate-100 text-slate-800' :
                                  lead.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-red-100 text-red-800'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.source || 'Not specified'}</div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/crm/leads/${lead.id}`}
                          className="text-slate-600 hover:text-slate-900 inline-flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length > 5 && (
                <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 text-center">
                  <Link
                    href="/crm/leads"
                    className="text-sm font-medium text-slate-600 hover:text-slate-800"
                  >
                    View all {filteredLeads.length} leads
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 