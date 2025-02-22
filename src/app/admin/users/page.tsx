'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, ChevronLeft, Search, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

export default function UserManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (!session) {
        router.push('/login?returnUrl=/admin/users')
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

      loadUsers()
    } catch (error) {
      console.error('Admin access error:', error)
      setError(error instanceof Error ? error.message : 'Error loading user management')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(users)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, is_admin: !currentStatus }
          : user
      ))

      toast.success(`Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully`)
    } catch (error) {
      console.error('Error toggling admin status:', error)
      toast.error('Failed to update admin status')
    }
  }

  const filteredUsers = users.filter(user =>
    (user?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-gray-400">Loading user management...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2.5 hover:bg-gray-800 rounded-full transition-colors duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              User Management
            </h1>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* User List */}
        <div className="grid gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-gradient-to-b from-gray-900 to-gray-900/50 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white/90">{user.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${user.is_admin
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                    }`}
                >
                  {user.is_admin ? (
                    <>
                      <UserX className="h-4 w-4" />
                      Revoke Admin
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Make Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 