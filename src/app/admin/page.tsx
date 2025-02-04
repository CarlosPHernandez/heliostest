'use client'

import { useState } from 'react'
import { Search, Filter, MoreVertical, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  customerName: string
  address: string
  systemSize: string
  currentStage: string
  status: 'active' | 'completed' | 'on-hold'
  lastUpdated: Date
  progress: number
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [projects] = useState<Project[]>([
    {
      id: 'PRJ001',
      customerName: 'John Smith',
      address: '123 Solar Street, Sunnyville, CA 90210',
      systemSize: '8.4 kW',
      currentStage: 'Solar Design',
      status: 'active',
      lastUpdated: new Date('2024-02-10'),
      progress: 35
    },
    {
      id: 'PRJ002',
      customerName: 'Sarah Johnson',
      address: '456 Energy Lane, Powertown, CA 90211',
      systemSize: '10.2 kW',
      currentStage: 'Proposal Ready',
      status: 'active',
      lastUpdated: new Date('2024-02-12'),
      progress: 45
    },
    {
      id: 'PRJ003',
      customerName: 'Michael Brown',
      address: '789 Green Ave, Ecoville, CA 90212',
      systemSize: '6.8 kW',
      currentStage: 'Installation Complete',
      status: 'completed',
      lastUpdated: new Date('2024-02-08'),
      progress: 100
    }
  ])

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'on-hold':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700'
      case 'active':
        return 'bg-blue-50 text-blue-700'
      case 'on-hold':
        return 'bg-yellow-50 text-yellow-700'
    }
  }

  const filteredProjects = projects.filter(project =>
    project.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="mt-2 text-gray-600">Monitor and manage all solar installation projects</p>
          </div>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            New Project
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
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
                      <Link 
                        href={`/admin/projects/${project.id}`}
                        className="text-black font-medium hover:underline"
                      >
                        {project.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{project.customerName}</div>
                        <div className="text-sm text-gray-500">{project.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.systemSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.currentStage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(project.status)}
                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 mt-1">{project.progress}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.lastUpdated.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 