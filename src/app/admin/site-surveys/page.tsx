'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, AlertCircle, Clock, ChevronLeft, Search, ArrowRight, Camera } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAdmin()
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
        return
      }

      loadSurveys()
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/dashboard')
    }
  }

  const loadSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from('site_surveys')
        .select(`
          *,
          proposal:proposals (
            id,
            address,
            user_id,
            user:profiles!proposals_user_id_fkey (
              id,
              email,
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform and filter out any null proposals or incomplete data
      const validSurveys = data
        .filter(survey => survey.proposal && survey.proposal.user)
        .map(survey => ({
          ...survey,
          proposal: {
            ...survey.proposal,
            user: {
              ...survey.proposal.user,
              profile: {
                full_name: survey.proposal.user.full_name || 'Unknown User'
              }
            }
          }
        }))

      console.log('Loaded surveys:', validSurveys)
      setSurveys(validSurveys)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
  }

  const filteredSurveys = surveys
    .filter(survey =>
      filter === 'all' || survey.status === filter
    )
    .filter(survey =>
      searchQuery === '' ||
      survey.proposal.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.proposal.user.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.proposal.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-[#111111] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Site Surveys</h1>
              <p className="text-sm text-gray-400">Manage and review customer site surveys</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by address or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111111] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-[#111111] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Surveys</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={loadSurveys}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Surveys Grid */}
        <div className="grid gap-6">
          {filteredSurveys.length === 0 ? (
            <div className="text-center py-12 bg-[#111111] rounded-xl border border-gray-800">
              <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Surveys Found</h3>
              <p className="text-gray-400">
                {searchQuery || filter !== 'all'
                  ? "No surveys match your search criteria"
                  : "No site surveys have been submitted yet"}
              </p>
            </div>
          ) : (
            filteredSurveys.map((survey) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">
                        {survey.proposal.address}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Submitted on {new Date(survey.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(survey.status)}`}>
                      {getStatusIcon(survey.status)}
                      <span className="ml-2 text-sm font-medium">{getStatusText(survey.status)}</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Customer</p>
                      <p className="text-white">{survey.proposal.user.profile.full_name}</p>
                      <p className="text-gray-400 text-sm">{survey.proposal.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Property Type</p>
                      <p className="text-white">{survey.property_type || 'Not specified'}</p>
                    </div>
                  </div>

                  <Link
                    href={`/proposals/${survey.proposal_id}/site-survey`}
                    className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors group"
                  >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 