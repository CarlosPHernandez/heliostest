'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

interface Proposal {
  id: string
  system_size: number
  number_of_panels: number
  total_price: number
  monthly_bill: number
  address: string
  package_type: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState<Proposal[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (!session) {
        // If no session, redirect to login
        router.push('/login?returnUrl=/dashboard')
        return
      }

      setUser(session.user)

      // Fetch proposals after confirming user is authenticated
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (proposalsError) throw proposalsError
      setProposals(proposals || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error loading dashboard data')
    } finally {
      setLoading(false)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!user) {
    return null // Return null as we're redirecting in checkUser
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.user_metadata?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            You are now signed in with {user?.email}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

        {/* Proposals Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Solar Proposals</h2>
          
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't created any proposals yet.</p>
              <button
                onClick={() => router.push('/order')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                Create Your First Proposal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/proposals/${proposal.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {proposal.address}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {proposal.system_size.toFixed(1)}kW System • {proposal.number_of_panels} Panels
                      </p>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(proposal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {proposal.package_type}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(proposal.total_price)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 