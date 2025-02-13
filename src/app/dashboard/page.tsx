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
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Energy Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-gray-900 rounded-2xl p-8 overflow-hidden mb-8">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-medium">
                Demo Home
                <span className="block text-green-400 text-sm font-normal mt-1">Charging</span>
              </h1>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                  <span className="sr-only">Information</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Energy Flow Visualization */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div>
                <p className="text-2xl font-medium">{(calculateTotalCapacity() * 0.15).toFixed(1)} kW</p>
                <p className="text-gray-400 text-sm">PANEL 1</p>
              </div>
              <div>
                <p className="text-2xl font-medium">{calculateTotalCapacity().toFixed(1)} kW</p>
                <p className="text-gray-400 text-sm">SOLAR</p>
              </div>
              <div>
                <p className="text-2xl font-medium">{(calculateTotalCapacity() * 0.12).toFixed(1)} kW</p>
                <p className="text-gray-400 text-sm">HOME</p>
              </div>
            </div>

            {/* House Visualization Placeholder */}
            <div className="relative aspect-video bg-gray-800 rounded-lg mb-8 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">House Visualization</p>
              </div>
            </div>

            {/* Energy Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-2xl font-medium">{(calculateTotalCapacity() * 4.9).toFixed(1)} kW</p>
                <p className="text-gray-400 text-sm">POWERWALL - 89%</p>
              </div>
              <div>
                <p className="text-2xl font-medium">0 kW</p>
                <p className="text-gray-400 text-sm">GRID</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <Battery className="h-5 w-5 text-green-400" />
              <span className="font-medium">Get Powerwall</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-yellow-400" />
              <div className="text-left">
                <span className="font-medium block">Energy</span>
                <span className="text-sm text-gray-400">{(calculateTotalCapacity() * 10.6).toFixed(1)} kWh Generated Today</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <div className="text-left">
                <span className="font-medium block">Impact</span>
                <span className="text-sm text-gray-400">64% Self-Powered Today</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <Link
            href="/order"
            className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-red-400" />
              <span className="font-medium">New Solar Order</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>

        {/* Weather Status */}
        <div className="mt-8 p-4 bg-gray-900 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="font-medium">Morning - Sunny</p>
                <p className="text-sm text-gray-400">Generating energy from solar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <ChevronRight className="h-5 w-5 text-gray-400 -rotate-180" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Proposals Section - Only show if there are proposals */}
        {proposals.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-medium text-white mb-4">Recent Proposals</h2>
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Link
                  key={proposal.id}
                  href={`/proposals/${proposal.id}`}
                  className="block bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white mb-1">
                          {proposal.address}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {proposal.system_size}kW System • {proposal.number_of_panels} Panels
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-white">
                          {formatCurrency(proposal.total_price)}
                        </p>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 