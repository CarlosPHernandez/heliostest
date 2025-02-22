'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/hooks/useAdmin'
import { Loader2 } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  full_name: string
  created_at: string
  is_admin: boolean
}

export default function CheckAdmins() {
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      checkAdmins()
    }
  }, [isAdmin])

  const checkAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', true)

      if (error) throw error

      setAdmins(data || [])
    } catch (err) {
      console.error('Error fetching admins:', err)
      setError('Failed to fetch admin users')
    } finally {
      setLoading(false)
    }
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!isAdmin) {
    return null // The hook will handle the redirect
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Users</h1>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400">
            No admin users found
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map(admin => (
              <div
                key={admin.id}
                className="bg-[#111111] border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{admin.full_name}</h2>
                    <p className="text-gray-400">{admin.email}</p>
                  </div>
                  <div className="bg-green-500/10 px-3 py-1 rounded-full text-green-400 text-sm">
                    Admin
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Joined {new Date(admin.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 