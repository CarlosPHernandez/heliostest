'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface SiteSurveyWithDetails {
  id: string
  proposal_id: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
  property_type: string
  proposal: {
    id: string
    address: string
    user: {
      id: string
      email: string
      profile: {
        full_name: string
      }
    }
  }
}

export default function AdminSiteSurveysPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [surveys, setSurveys] = useState<SiteSurveyWithDetails[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    checkAdmin()
    loadSurveys()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/dashboard')
    }
  }

  const loadSurveys = async () => {
    try {
      const query = supabase
        .from('site_surveys')
        .select(`
          *,
          proposal:proposals (
            id,
            address,
            user:users (
              id,
              email,
              profile:profiles (
                full_name
              )
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setSurveys(data)
    } catch (error) {
      console.error('Error loading surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Pending'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-white">Site Surveys</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[#1A1A1A] text-white border border-gray-800 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Surveys</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => loadSurveys()}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#111111] rounded-lg shadow-xl border border-gray-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#1A1A1A]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#111111] divide-y divide-gray-800">
            {surveys.map((survey) => (
              <tr key={survey.id} className="hover:bg-[#1A1A1A] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(survey.status)}
                    <span className="ml-2 text-sm text-gray-300">
                      {getStatusText(survey.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {survey.proposal.user.profile.full_name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {survey.proposal.user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white">
                    {survey.property_type}
                  </div>
                  <div className="text-sm text-gray-400">
                    {survey.proposal.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(survey.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/proposals/${survey.proposal_id}/site-survey`}
                    className="text-blue-400 hover:text-blue-300"
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
  )
} 