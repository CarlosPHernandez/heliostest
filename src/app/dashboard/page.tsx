'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, Calendar, Phone, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Proposal {
  id: string
  proposal_data: {
    packageType: string
    systemInfo: {
      systemSize: number
      panelCount: number
      monthlyProduction: number
    }
    address: string
    monthlyBill: string
    paymentType: 'cash' | 'financing'
    financing?: {
      monthlyPayment: number
      downPayment: number
      loanTerm: number
    }
  }
  status: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Don't fetch proposal until auth state is confirmed
    if (authLoading) return

    // If no user after auth loading is done, redirect to login
    if (!user) {
      router.replace('/login')
      return
    }

    const fetchProposal = async () => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          // Only throw if it's not a "no rows" error
          if (error.code !== 'PGRST116') {
            throw error
          }
          // For no rows, just set proposal to null
          setProposal(null)
        } else {
          setProposal(data)
        }
      } catch (err) {
        console.error('Error fetching proposal:', err)
        setError('Failed to load your proposal. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [user, authLoading, router])

  // Show loading state while auth is being checked
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  // If no user after auth check, don't render anything (redirect will happen)
  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Solar Journey</h1>
            <p className="mt-4 text-lg text-gray-600">
              Ready to start saving with solar? Let's create your personalized proposal.
            </p>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Get Your Solar Proposal
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <p className="text-sm text-gray-500">
                Takes only a few minutes to get a customized solar solution for your home.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FileText className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Custom Design</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get a solar system designed specifically for your home and energy needs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Calendar className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Easy Process</h3>
              <p className="mt-2 text-sm text-gray-500">
                Simple steps from proposal to installation with expert guidance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Phone className="h-8 w-8 text-black mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Expert Support</h3>
              <p className="mt-2 text-sm text-gray-500">
                Our team is here to help you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TypeScript type guard to ensure proposal is not null
  const proposalData = proposal.proposal_data
  const systemInfo = proposalData.systemInfo
  const financing = proposalData.paymentType === 'financing' ? proposalData.financing : null

  const installationSteps = [
    { title: 'Site Survey', description: 'Our team will visit your property to assess installation requirements', status: 'pending' },
    { title: 'Design Review', description: 'Review and approve your custom solar system design', status: 'pending' },
    { title: 'Permitting', description: 'Obtain necessary permits and approvals', status: 'pending' },
    { title: 'Installation', description: 'Professional installation of your solar system', status: 'pending' },
    { title: 'Inspection', description: 'Final inspection and utility connection', status: 'pending' },
  ]

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Solar Journey</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => window.open('/documents/proposal.pdf', '_blank')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Proposal
            </button>
            <button
              onClick={() => router.push('/schedule')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Survey
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">System Size</p>
              <p className="text-lg font-medium text-gray-900">{systemInfo.systemSize} kW</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Solar Panels</p>
              <p className="text-lg font-medium text-gray-900">{systemInfo.panelCount} Panels</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Production</p>
              <p className="text-lg font-medium text-gray-900">{systemInfo.monthlyProduction} kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Payment Type</p>
              <p className="text-lg font-medium text-gray-900 capitalize">{proposalData.paymentType}</p>
            </div>
            {financing && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Monthly Payment</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${financing.monthlyPayment.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Down Payment</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${financing.downPayment.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loan Term</p>
                  <p className="text-lg font-medium text-gray-900">{financing.loanTerm} years</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Installation Progress</h2>
          <div className="space-y-6">
            {installationSteps.map((step, index) => (
              <div key={step.title} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center
                    ${step.status === 'completed' ? 'bg-green-100 text-green-600' :
                      step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'}
                  `}>
                    {index + 1}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">Need assistance? Contact our support team</p>
          <button
            className="mt-2 inline-flex items-center text-black hover:text-gray-600"
          >
            <Phone className="h-4 w-4 mr-2" />
            (555) 123-4567
          </button>
        </div>
      </div>
    </div>
  )
} 