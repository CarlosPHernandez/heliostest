'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Sun, DollarSign, Percent } from 'lucide-react'
import Image from 'next/image'

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
  const [packageType, setPackageType] = useState<'standard' | 'premium'>('standard')
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [address, setAddress] = useState('')
  const [mapUrl, setMapUrl] = useState('')

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

      // Generate Google Maps Static API URL for aerial view
      const encodedAddress = encodeURIComponent(storedAddress)
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=19&size=800x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      setMapUrl(mapUrl)
      
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

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(number))
  }

  const calculateIncentives = (totalPrice: number) => {
    const federalTaxCredit = totalPrice * 0.30 // 30% federal tax credit
    const afterIncentives = totalPrice - federalTaxCredit

    return {
      original: totalPrice,
      federalCredit: federalTaxCredit,
      final: afterIncentives
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">Loading your proposal...</p>
        </div>
      </div>
    )
  }

  if (error || !systemInfo) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 mx-auto block text-gray-600 hover:text-gray-800"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  const financials = calculateIncentives(systemInfo.totalPrice)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Solar System Proposal
          </h1>
          <p className="text-gray-600">
            {packageType === 'premium' ? 'Premium' : 'Standard'} Package for {address}
          </p>
        </div>

        {/* Aerial View */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="relative aspect-[2/1] w-full">
            <Image
              src={mapUrl}
              alt="Aerial view of property"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            Financial Breakdown
          </h2>
          
          <div className="space-y-6">
            {/* Main Price Display */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Price After Incentives</p>
              <p className="text-4xl font-bold text-gray-900">{formatCurrency(financials.final)}</p>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total System Cost</span>
                <span className="text-gray-900 font-medium">{formatCurrency(financials.original)}</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="flex items-center">
                  <Percent className="h-4 w-4 mr-1" />
                  Federal Tax Credit (30%)
                </span>
                <span>-{formatCurrency(financials.federalCredit)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center font-semibold">
                <span>Final Cost</span>
                <span>{formatCurrency(financials.final)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Sun className="h-6 w-6 mr-2" />
            System Details
          </h2>
          
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Size</span>
              <span className="text-gray-900 font-medium">{systemInfo.systemSize.toFixed(2)} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Number of Panels</span>
              <span className="text-gray-900 font-medium">{systemInfo.numberOfPanels} panels</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Yearly Production</span>
              <span className="text-gray-900 font-medium">{formatNumber(systemInfo.yearlyProduction)} kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Production</span>
              <span className="text-gray-900 font-medium">{formatNumber(systemInfo.monthlyProduction)} kWh</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.push('/order/account')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue to Account Creation
          </button>
        </div>
      </div>
    </div>
  )
} 