'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface Proposal {
  id: string
  package_type: 'standard' | 'premium'
  system_size: number
  panel_count: number
  monthly_production: number
  address: string
  monthly_bill: number
  payment_type: 'cash' | 'financing'
  financing: {
    monthly_payment: number
    down_payment: number
    loan_term: number
  } | null
  status: 'saved' | 'ordered' | 'site_survey_scheduled' | 'permit_approved' | 'installation_scheduled' | 'system_activated'
  created_at: string
  updated_at: string
}

const statusSteps = [
  { key: 'saved', label: 'Proposal Saved' },
  { key: 'ordered', label: 'Order Placed' },
  { key: 'site_survey_scheduled', label: 'Site Survey Scheduled' },
  { key: 'permit_approved', label: 'Permit Approved' },
  { key: 'installation_scheduled', label: 'Installation Scheduled' },
  { key: 'system_activated', label: 'System Activated' },
]

export default function ProposalPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProposal = async () => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        setProposal(data)
      } catch (err) {
        console.error('Error fetching proposal:', err)
        setError('Failed to load your proposal')
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [user, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">No Proposal Found</h1>
          <p className="text-gray-600 mb-8">
            You haven't created a solar proposal yet.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Create Your Proposal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Your Solar Proposal</h1>
          
          {/* System Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="font-semibold mb-4">System Details</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Package Type</dt>
                  <dd className="font-medium capitalize">{proposal.package_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">System Size</dt>
                  <dd className="font-medium">{proposal.system_size} kW</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Number of Panels</dt>
                  <dd className="font-medium">{proposal.panel_count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Monthly Production</dt>
                  <dd className="font-medium">{proposal.monthly_production} kWh</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h2 className="font-semibold mb-4">Payment Details</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Payment Type</dt>
                  <dd className="font-medium capitalize">{proposal.payment_type}</dd>
                </div>
                {proposal.payment_type === 'financing' && proposal.financing && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Monthly Payment</dt>
                      <dd className="font-medium">
                        {formatCurrency(proposal.financing.monthly_payment)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Down Payment</dt>
                      <dd className="font-medium">
                        {formatCurrency(proposal.financing.down_payment)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Loan Term</dt>
                      <dd className="font-medium">{proposal.financing.loan_term} years</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Installation Progress */}
          <div>
            <h2 className="font-semibold mb-4">Installation Progress</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
              <div 
                className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-500"
                style={{ 
                  width: `${(getStatusIndex(proposal.status) / (statusSteps.length - 1)) * 100}%`
                }}
              />

              {/* Status Steps */}
              <div className="relative grid grid-cols-6 gap-4">
                {statusSteps.map((step, index) => {
                  const isCompleted = getStatusIndex(proposal.status) >= index
                  const isCurrent = proposal.status === step.key

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 
                          ${isCompleted ? 'bg-green-500' : 'bg-gray-200'} 
                          ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                      >
                        <CheckCircle2 className={`h-6 w-6 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <p className={`text-sm mt-2 text-center ${isCurrent ? 'font-medium' : ''}`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 