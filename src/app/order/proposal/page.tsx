'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface SystemInfo {
  systemSize: number
  numberOfPanels: number
  totalPrice: number
  yearlyProduction: number
  monthlyProduction: number
}

export default function ProposalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [packageType, setPackageType] = useState<'standard' | 'premium' | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [address, setAddress] = useState('')

  useEffect(() => {
    try {
      // Load all required data from localStorage
      const storedPackageType = localStorage.getItem('selectedPackage')
      const storedPackageData = localStorage.getItem('selectedPackageData')
      const storedAddress = localStorage.getItem('address')

      if (!storedPackageType || !storedPackageData || !storedAddress) {
        throw new Error('Missing required information. Please start over.')
      }

      setPackageType(storedPackageType as 'standard' | 'premium')
      setSystemInfo(JSON.parse(storedPackageData))
      setAddress(storedAddress)
      setLoading(false)
    } catch (err) {
      console.error('Error loading proposal data:', err)
      setError(err instanceof Error ? err.message : 'Error loading proposal')
      setLoading(false)
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleBack = () => {
    router.back()
  }

  const handleContinue = () => {
    router.push('/order/account')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-secondary-text">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="text-secondary-text hover:text-gray-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!systemInfo || !packageType) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">System information not found</p>
            <button
              onClick={() => router.push('/')}
              className="text-secondary-text hover:text-gray-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-text mb-4">
            Your Solar Proposal
          </h1>
          <p className="text-secondary-text max-w-2xl mx-auto">
            Review your {packageType} solar package details below
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-6">System Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500">Installation Address</dt>
                  <dd className="text-lg font-medium">{address}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">System Size</dt>
                  <dd className="text-lg font-medium">{systemInfo.systemSize.toFixed(2)} kW</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Number of Panels</dt>
                  <dd className="text-lg font-medium">{systemInfo.numberOfPanels} panels</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-6">Production & Savings</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500">Monthly Production</dt>
                  <dd className="text-lg font-medium">
                    {Math.round(systemInfo.monthlyProduction)} kWh
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Yearly Production</dt>
                  <dd className="text-lg font-medium">
                    {Math.round(systemInfo.yearlyProduction)} kWh
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Total Investment</dt>
                  <dd className="text-lg font-medium text-black">
                    {formatCurrency(systemInfo.totalPrice)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue to Account Setup
          </button>
        </div>
      </div>
    </div>
  )
} 