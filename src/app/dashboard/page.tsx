'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Please sign in to access the dashboard')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.user_metadata?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            You are now signed in with {user?.email}
          </p>
          
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/order')}
                className="p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start Solar Order
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 