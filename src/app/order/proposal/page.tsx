'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { SavingsBreakdown } from '@/components/features/SavingsBreakdown'

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
  const [monthlyBill, setMonthlyBill] = useState<number>(0)
  const [mapUrl, setMapUrl] = useState('')

  useEffect(() => {
    try {
      // Load all required data from localStorage
      const storedPackageType = localStorage.getItem('selectedPackage')
      const storedPackageData = localStorage.getItem('selectedPackageData')
      const storedAddress = localStorage.getItem('address')
      const storedMonthlyBill = localStorage.getItem('monthlyBill')

      if (!storedPackageType || !storedPackageData || !storedAddress || !storedMonthlyBill) {
        throw new Error('Missing required information. Please start over.')
      }

      setPackageType(storedPackageType as 'standard' | 'premium')
      setSystemInfo(JSON.parse(storedPackageData))
      setAddress(storedAddress)
      setMonthlyBill(Number(storedMonthlyBill))

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
    const federalTaxCredit = totalPrice * 0.3 // 30% federal tax credit
    return {
      federalTaxCredit,
      finalPrice: totalPrice - federalTaxCredit
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (error || !systemInfo) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={() => router.push('/order')}
            className="mt-4 mx-auto block text-gray-600 hover:text-gray-800"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  const { federalTaxCredit, finalPrice } = calculateIncentives(systemInfo.totalPrice)

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        {/* Property Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Overview</h2>
              <p className="text-gray-600 mb-4">{address}</p>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-medium">System Size:</span> {systemInfo.systemSize.toFixed(1)} kW
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">Number of Panels:</span> {systemInfo.numberOfPanels}
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">Yearly Production:</span> {formatNumber(systemInfo.yearlyProduction)} kWh
                </p>
              </div>
            </div>
            <div className="relative h-48 md:h-full min-h-[200px] rounded-lg overflow-hidden">
              {mapUrl && (
                <Image
                  src={mapUrl}
                  alt="Property aerial view"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">System Cost</span>
              <span className="text-gray-900 font-medium">{formatCurrency(systemInfo.totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Federal Tax Credit (30%)</span>
              <span className="text-green-600 font-medium">-{formatCurrency(federalTaxCredit)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 font-semibold">Final Cost</span>
              <span className="text-gray-900 font-bold text-xl">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Savings Breakdown */}
        <SavingsBreakdown
          monthlyBill={monthlyBill}
          systemProduction={systemInfo.monthlyProduction}
        />

        {/* Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push('/order/summary')}
            className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue to Order Summary
          </button>
        </div>
      </div>
    </div>
  )
} 