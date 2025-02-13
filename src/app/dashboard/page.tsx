'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, Sun, Battery, DollarSign, Calendar, ArrowRight, Loader2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Proposal {
  id: string
  user_id: string
  address: string
  system_size: number
  number_of_panels: number
  total_price: number
  package_type: string
  payment_type: string
  include_battery: boolean
  battery_type?: string
  battery_count?: number
  status: string
  notes?: string
  created_at: string
  status_updated_at?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      console.log('Checking user session...')
      setError(null)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      console.log('Session check complete:', session ? 'Session found' : 'No session')
      
      if (!session?.user) {
        console.log('No session or user, redirecting to login...')
        router.push('/login?returnUrl=/dashboard')
        return
      }

      setUser(session.user)
      console.log('User set:', session.user.id)

      // Fetch proposals after confirming user is authenticated
      console.log('Fetching proposals...')
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (proposalsError) {
        console.error('Proposals fetch error:', proposalsError)
        throw proposalsError
      }

      // Log the raw data received
      console.log('Raw proposals data:', proposalsData)

      if (!proposalsData) {
        console.log('No proposals data returned')
        setProposals([])
        return
      }

      // Validate each proposal
      const validProposals = proposalsData.map(proposal => {
        console.log('Processing proposal:', proposal)
        return {
          id: proposal.id,
          user_id: proposal.user_id,
          address: proposal.address,
          system_size: proposal.system_size,
          number_of_panels: proposal.number_of_panels,
          total_price: proposal.total_price,
          package_type: proposal.package_type,
          payment_type: proposal.payment_type,
          include_battery: proposal.include_battery,
          battery_type: proposal.battery_type,
          battery_count: proposal.battery_count,
          status: proposal.status,
          notes: proposal.notes,
          created_at: proposal.created_at,
          status_updated_at: proposal.status_updated_at
        }
      })

      console.log('Processed proposals:', validProposals)
      setProposals(validProposals)
    } catch (error) {
      console.error('Dashboard error:', error)
      setError(error instanceof Error ? error.message : 'Error loading dashboard')
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

  const calculateTotalInvestment = () => {
    return proposals.reduce((total, proposal) => total + proposal.total_price, 0)
  }

  const calculateTotalCapacity = () => {
    return proposals.reduce((total, proposal) => total + proposal.system_size, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true)
              setError(null)
              checkUser()
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('No user found, redirecting...')
    router.push('/login?returnUrl=/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.name || 'User'}!
          </h1>
          <p className="text-blue-100">
            Manage your solar proposals and track your clean energy journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Sun className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total System Capacity</p>
                <p className="text-2xl font-bold">{calculateTotalCapacity().toFixed(1)} kW</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(calculateTotalInvestment())}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Battery className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Proposals</p>
                <p className="text-2xl font-bold">{proposals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link
            href="/order"
            className="group flex items-center justify-between p-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <span className="font-medium">Start New Solar Order</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/profile"
            className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">View Profile</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/shop"
            className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">Browse Shop</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Proposals Section */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Solar Projects</h2>
          {proposals.length === 0 && (
            <button
              onClick={() => router.push('/order/proposal')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Proposal
            </button>
          )}
        </div>
        
        {proposals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Sun className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Proposals Yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Start your solar journey by creating a new proposal.
            </p>
            <button
              onClick={() => router.push('/order/proposal')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Proposal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/proposals/${proposal.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        {proposal.address}
                      </h2>
                      <p className="text-sm text-gray-500 capitalize">
                        Status: {proposal.status.split('_').join(' ')}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Sun className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">System Size</p>
                        <p className="font-medium">{proposal.system_size} kW</p>
                      </div>
                    </div>
                    
                    {proposal.include_battery && (
                      <div className="flex items-center gap-3">
                        <Battery className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Battery System</p>
                          <p className="font-medium">
                            {proposal.battery_count}x {proposal.battery_type}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Investment</p>
                        <p className="font-medium">{formatCurrency(proposal.total_price)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 