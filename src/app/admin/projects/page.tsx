'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, Loader2, PlusCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Project {
  id: string
  user_id: string
  address: string
  system_size: number
  total_price: number
  status: string
  stage: string
  created_at: string
  customer: {
    name: string
    email: string
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      // First check if user is admin
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      if (!session?.user?.id) {
        throw new Error('No authenticated user')
      }

      // Check admin status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      if (!profile?.is_admin) {
        throw new Error('User is not an admin')
      }

      // Load proposals with detailed error logging
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
          customer:profiles!proposals_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Proposals query error:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      // Transform the data to match our Project interface
      const transformedProjects = data.map(project => ({
        ...project,
        customer: {
          name: project.customer?.full_name || 'Unknown',
          email: project.customer?.email || 'No email'
        }
      }))

      setProjects(transformedProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageColor = (stage: string | null) => {
    if (!stage) return 'bg-gray-100 text-gray-800'

    switch (stage.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'installation':
        return 'bg-purple-100 text-purple-800'
      case 'permitting':
        return 'bg-yellow-100 text-yellow-800'
      case 'design':
        return 'bg-indigo-100 text-indigo-800'
      case 'onboarding':
        return 'bg-blue-100 text-blue-800'
      case 'proposal':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-medium">Projects</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Link
              href="/admin/projects/add"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Project
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow px-4">
            <h2 className="text-xl font-semibold mb-2">No Projects Found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? "No projects match your search criteria"
                : "Start by adding your first project"}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/projects/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Project
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.customer.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {project.system_size} kW
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatCurrency(project.total_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(project.stage)}`}>
                          {project.stage || 'Proposal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <Link
                          href={`/proposals/${project.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 