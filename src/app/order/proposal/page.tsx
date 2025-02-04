'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Home, Sun, Shield, Calculator, ArrowRight, Info } from 'lucide-react'
import Image from 'next/image'

interface FinanceOption {
  term: number
  rate: number
  monthlyPayment: number
  totalCost: number
}

export default function ProposalPage() {
  const router = useRouter()
  const [showFinancing, setShowFinancing] = useState(false)
  const [error, setError] = useState('')
  const [systemDetails, setSystemDetails] = useState<any>(null)
  const [addressData, setAddressData] = useState<any>(null)
  const [financeOptions, setFinanceOptions] = useState<FinanceOption[]>([])

  useEffect(() => {
    // Get stored data
    const packageData = localStorage.getItem('selectedPackage')
    const addressInfo = localStorage.getItem('addressData')

    if (!packageData || !addressInfo) {
      setError('Missing system information. Please start over.')
      return
    }

    try {
      const parsedPackage = JSON.parse(packageData)
      const parsedAddress = JSON.parse(addressInfo)
      setSystemDetails(parsedPackage)
      setAddressData(parsedAddress)

      // Calculate financing options
      const netCost = parsedPackage.price * 0.7 // After 30% tax credit
      const terms = [10, 15, 20, 25]
      const rate = 0.0625 // 6.25% interest rate

      const options = terms.map(term => {
        const monthlyRate = rate / 12
        const numPayments = term * 12
        const monthlyPayment = (netCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                             (Math.pow(1 + monthlyRate, numPayments) - 1)
        
        return {
          term,
          rate: rate * 100,
          monthlyPayment,
          totalCost: monthlyPayment * numPayments
        }
      })

      setFinanceOptions(options)
    } catch (err) {
      setError('Error loading system details. Please try again.')
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleBack = () => {
    router.back()
  }

  const handleOrder = () => {
    // Navigate to account creation instead of confirmation
    router.push('/order/account')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-24 lg:pt-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 text-center">
            <div className="text-red-500 mb-4">Error loading proposal</div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 inline-flex items-center text-sm font-medium text-black hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-28">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - System Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Your Solar System Proposal
              </h1>

              {/* Aerial View */}
              <div className="aspect-video relative rounded-lg overflow-hidden mb-6 bg-gray-100">
                <Image
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${addressData?.lat},${addressData?.lng}&zoom=19&size=600x300&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                  alt="Aerial view of property"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 mb-6">
                <Home className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Installation Address</p>
                  <p className="text-gray-600">{addressData?.formatted_address}</p>
                </div>
              </div>

              {/* System Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Yearly Usage</span>
                  <span className="font-medium text-gray-900">{systemDetails?.yearlyUsage.toLocaleString()} kWh</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Selected Package</span>
                  <span className="font-medium text-gray-900 capitalize">{systemDetails?.type}</span>
                </div>
                {systemDetails?.type === 'premium' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Premium Upgrades</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• High-efficiency Premium Panels</li>
                      <li>• Critter Guard Protection</li>
                      <li>• Solar Edge Skirts</li>
                      <li>• Extended Protection Plan</li>
                      <li>• Expedited Permitting</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Financial Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">System Cost</span>
                  <span className="font-medium text-gray-900">{formatCurrency(systemDetails?.price)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b text-green-600">
                  <span>Federal Tax Credit (30%)</span>
                  <span className="font-medium">-{formatCurrency(systemDetails?.price * 0.3)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="font-medium text-gray-900">Net Cost</span>
                  <span className="font-bold text-gray-900">{formatCurrency(systemDetails?.price * 0.7)}</span>
                </div>
              </div>

              {/* Financing Options */}
              <button
                onClick={() => setShowFinancing(!showFinancing)}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-200"
              >
                <Calculator className="h-4 w-4" />
                {showFinancing ? 'Hide' : 'View'} Financing Options
              </button>

              {showFinancing && (
                <div className="mt-6 space-y-4">
                  {financeOptions.map((option) => (
                    <div
                      key={option.term}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{option.term} Year Term</span>
                        <span className="text-sm text-gray-600">{option.rate}% APR</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Monthly Payment</span>
                        <span className="font-medium text-gray-900">{formatCurrency(option.monthlyPayment)}</span>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    * Rates are estimates. Final terms subject to credit approval.
                  </p>
                </div>
              )}
            </div>

            {/* Order Button */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
              <button
                onClick={handleOrder}
                className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Place Order
                <ArrowRight className="h-4 w-4 ml-2 inline-block" />
              </button>
              
              <div className="mt-4 flex items-start gap-3 text-sm text-gray-600">
                <Info className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <p>
                  By placing an order, you're requesting a detailed site survey and custom design. 
                  This is not a final commitment to purchase. Our team will contact you to schedule 
                  a site visit and finalize your custom solar solution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 