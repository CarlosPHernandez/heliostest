'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Users, FileText, Settings, BarChart3, ChevronRight, MapPin, RefreshCw, DollarSign, ClipboardCheck, Sun, Zap, Home } from 'lucide-react'
import Link from 'next/link'
import NCProposalMap from '@/components/features/NCProposalMap'
import { toast } from 'sonner'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAdmin } from '@/hooks/useAdmin'

interface Profile {
  id: string
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

interface AdminStats {
  totalUsers: number
  totalProposals: number
  totalCapacity: number
  totalRevenue: number
}

// Add geocoding function
const geocodeAddress = async (address: string) => {
  try {
    const encodedAddress = encodeURIComponent(address)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location
      return { latitude: lat, longitude: lng }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProposals: 0,
    totalCapacity: 0,
    totalRevenue: 0
  })
  const [recentUsers, setRecentUsers] = useState<Profile[]>([])
  const [geocodingInProgress, setGeocodingInProgress] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin])

  const loadDashboardData = async () => {
    try {
      setError(null)
      await Promise.all([
        loadStats(),
        loadRecentUsers()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Error loading admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get proposals stats
      const { data: proposals } = await supabase
        .from('proposals')
        .select('system_size, total_price')

      const totalCapacity = proposals?.reduce((sum, p) => sum + (p.system_size || 0), 0) || 0
      const totalRevenue = proposals?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0

      setStats({
        totalUsers: userCount || 0,
        totalProposals: proposals?.length || 0,
        totalCapacity,
        totalRevenue
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      setRecentUsers(users)
    } catch (error) {
      console.error('Error loading recent users:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleGeocodeRefresh = async () => {
    try {
      setGeocodingInProgress(true)

      // Get all proposals without coordinates
      const { data: proposals, error: fetchError } = await supabase
        .from('proposals')
        .select('id, address')
        .or('latitude.is.null,longitude.is.null')

      if (fetchError) throw fetchError

      if (!proposals || proposals.length === 0) {
        toast.info('No proposals found that need geocoding')
        return
      }

      let successCount = 0
      let failureCount = 0

      // Update each proposal with coordinates
      for (const proposal of proposals) {
        if (!proposal.address) {
          failureCount++
          continue
        }

        const coordinates = await geocodeAddress(proposal.address)

        if (coordinates) {
          const { error: updateError } = await supabase
            .from('proposals')
            .update(coordinates)
            .eq('id', proposal.id)

          if (updateError) {
            failureCount++
          } else {
            successCount++
          }
        } else {
          failureCount++
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Geocoding completed: ${successCount} successful, ${failureCount} failed`)
      } else if (failureCount > 0) {
        toast.error(`Geocoding failed for all ${failureCount} proposals`)
      }

      // Reload the map
      window.location.reload()
    } catch (error) {
      console.error('Error updating proposals:', error)
      toast.error('Error updating proposals')
    } finally {
      setGeocodingInProgress(false)
    }
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-gray-400">Loading admin dashboard...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null // The hook will handle the redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="max-w-md text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your solar installation business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Proposals</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalProposals}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-400/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Capacity</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalCapacity.toFixed(1)} kW</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-300/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-200" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8">
          {/* Chart Section */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-8">
            {/* NC Project Map */}
            <div className="bg-[#111111] rounded-xl border border-gray-800">
              <div className="p-4 sm:p-6 border-b border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                  <div>
                    <h2 className="text-lg font-semibold text-white">North Carolina Project Map</h2>
                    <p className="text-sm text-gray-400">View all active proposals and installations across North Carolina</p>
                  </div>
                  <button
                    onClick={handleGeocodeRefresh}
                    disabled={geocodingInProgress}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${geocodingInProgress
                      ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${geocodingInProgress ? 'animate-spin' : ''}`} />
                    {geocodingInProgress ? 'Geocoding...' : 'Refresh Locations'}
                  </button>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <NCProposalMap />
              </div>
              <div className="p-4 border-t border-gray-800">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-400">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm text-gray-400">Installation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-sm text-gray-400">Permitting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm text-gray-400">Other Stages</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Solar Homes Goal Tracker */}
            <div className="bg-gradient-to-br from-[#111111] to-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-10">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Solar Homes Goal</h2>
                    <p className="text-base text-gray-400">Powering North Carolina, one home at a time</p>
                  </div>
                  <div className="bg-blue-500/10 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Sun className="h-5 sm:h-6 w-5 sm:w-6 text-blue-400" />
                      <span className="text-lg sm:text-xl font-semibold text-blue-400">{stats.totalProposals}/1,000</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 sm:mb-10">
                  <div className="h-4 bg-gray-800/50 rounded-full overflow-hidden shadow-lg">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-500 background-animate transition-all duration-500 rounded-full relative"
                      style={{
                        width: `${Math.min((stats.totalProposals / 1000) * 100, 100)}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse-fast"></div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-sm font-medium text-gray-400">{Math.floor((stats.totalProposals / 1000) * 100)}% Complete</span>
                    </div>
                    <span className="text-sm font-medium text-gray-400">Target: 1,000 homes</span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border-l-4 border-blue-600 border-t border-r border-b border-gray-800">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-400">Active Projects</p>
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.totalProposals}</p>
                      <p className="text-sm text-gray-500 mt-2">Current installations</p>
                    </div>
                  </div>

                  <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border-l-4 border-blue-400 border-t border-r border-b border-gray-800">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-400">Total Output</p>
                        <Zap className="h-5 w-5 text-blue-300" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.totalCapacity.toFixed(1)}</p>
                      <p className="text-sm text-gray-500 mt-2">Kilowatts generated</p>
                    </div>
                  </div>

                  <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border-l-4 border-blue-300 border-t border-r border-b border-gray-800">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-400">Remaining Goal</p>
                        <Home className="h-5 w-5 text-blue-200" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{Math.max(1000 - stats.totalProposals, 0)}</p>
                      <p className="text-sm text-gray-500 mt-2">Homes to reach target</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-8">
            {/* Quick Actions */}
            <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/projects"
                  className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#222222] transition-colors"
                >
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">View All Projects</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#222222] transition-colors"
                >
                  <Users className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Manage Users</span>
                </Link>
                <Link
                  href="/admin/site-surveys"
                  className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#222222] transition-colors"
                >
                  <ClipboardCheck className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300">Site Surveys</span>
                </Link>
                <Link
                  href="/admin/pending-requests"
                  className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#222222] transition-colors"
                >
                  <Users className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-300">Admin Requests</span>
                </Link>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-[#111111] rounded-xl p-4 sm:p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Users</h2>
                <Link
                  href="/admin/users"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#222222] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .background-animate {
            background-size: 200%;
            -webkit-animation: shimmer 3s linear infinite;
            animation: shimmer 3s linear infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          .animate-pulse-fast {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}</style>
      </div>
    </div>
  )
} 