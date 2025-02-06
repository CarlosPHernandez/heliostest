'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Info } from 'lucide-react'
import Image from 'next/image'
import { SavingsBreakdown } from '@/components/features/SavingsBreakdown'
import { calculateFinancingOptions, AVAILABLE_TERMS } from '@/lib/financing-calculations'

interface SystemInfo {
  systemSize: number
  numberOfPanels: number
  totalPrice: number
  yearlyProduction: number
  monthlyProduction: number
}

type PaymentType = 'cash' | 'finance'

export default function ProposalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [packageType, setPackageType] = useState<'standard' | 'premium'>('standard')
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [address, setAddress] = useState('')
  const [monthlyBill, setMonthlyBill] = useState<number>(0)
  const [mapUrl, setMapUrl] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType>('cash')
  const [selectedTerm, setSelectedTerm] = useState(AVAILABLE_TERMS[1]) // Default to 15 years

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
  const financingOptions = systemInfo ? calculateFinancingOptions(systemInfo.totalPrice, federalTaxCredit) : null

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

        {/* Payment Type Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setPaymentType('cash')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                paymentType === 'cash'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cash Purchase
            </button>
            <button
              onClick={() => setPaymentType('finance')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                paymentType === 'finance'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Financing
            </button>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {paymentType === 'cash' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cash Purchase</h2>
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
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Financing Options</h2>
              <div className="space-y-6">
                {/* Loan Terms Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Loan Term
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AVAILABLE_TERMS.map(term => (
                      <button
                        key={term}
                        onClick={() => setSelectedTerm(term)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedTerm === term
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {term} Years
                      </button>
                    ))}
                  </div>
                </div>

                {financingOptions && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">System Cost</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(systemInfo.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Interest Rate (APR)</span>
                      <span className="text-gray-900 font-medium">6.25%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Monthly Payment</span>
                        <div className="group relative">
                          <Info className="h-4 w-4 text-gray-400" />
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md mb-2">
                            Before applying tax credit
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(financingOptions[selectedTerm].monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Monthly Payment with Tax Credit</span>
                        <div className="group relative">
                          <Info className="h-4 w-4 text-gray-400" />
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md mb-2">
                            After applying 30% tax credit to principal
                          </div>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(financingOptions[selectedTerm].monthlyPaymentAfterCredit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-900 font-semibold">Total Cost of Financing</span>
                      <span className="text-gray-900 font-bold text-xl">
                        {formatCurrency(financingOptions[selectedTerm].totalCost)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-4">
                      Total interest paid over {selectedTerm} years: {formatCurrency(financingOptions[selectedTerm].totalInterest)}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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