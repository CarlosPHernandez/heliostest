'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { OrderDashboard } from '@/components/dashboard/OrderDashboard'

interface UserData {
  full_name: string
  email: string
}

export default function AccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        // Load user data
        setUserData({
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email || ''
        })
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Account not found</h1>
          <p className="text-gray-600">Please log in to view your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold mb-4">Welcome, {userData.full_name}!</h1>
          <p className="text-gray-600">{userData.email}</p>
        </div>

        {user && <OrderDashboard userId={user.id} />}
      </div>
    </div>
  )
} 