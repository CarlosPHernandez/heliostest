'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Users, FileText, Settings, BarChart3, ChevronRight } from 'lucide-react'
import Link from 'next/link'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProposals: 0,
    totalCapacity: 0,
    totalRevenue: 0
  })
  const [recentUsers, setRecentUsers] = useState<Profile[]>([])

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (!session) {
        router.push('/login?returnUrl=/admin')
        return
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      // Load admin dashboard data
      await Promise.all([
        loadStats(),
        loadRecentUsers()
      ])
    } catch (error) {
      console.error('Admin access error:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-gray-400">Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-medium mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-medium">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Total Proposals</p>
                <p className="text-2xl font-medium">{stats.totalProposals}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Total Capacity</p>
                <p className="text-2xl font-medium">{stats.totalCapacity.toFixed(1)} kW</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <Settings className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-medium">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-gray-400">Manage user accounts and permissions</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link
            href="/admin/proposals"
            className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="h-6 w-6 text-green-400" />
                <div>
                  <h3 className="font-medium">Proposal Management</h3>
                  <p className="text-sm text-gray-400">View and manage all proposals</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </div>

        {/* Recent Users */}
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Recent Users</h2>
            <Link
              href="/admin/users"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 