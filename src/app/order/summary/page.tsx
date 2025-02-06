'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Shield, Zap } from 'lucide-react'
import { SavingsBreakdown } from '@/components/features/SavingsBreakdown'

interface PackageData {
  systemSize: number
  numberOfPanels: number
  totalPrice: number
  yearlyProduction: number
  monthlyProduction: number
}

export default function OrderSummaryPage() {
  const router = useRouter()
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [packageType, setPackageType] = useState<'standard' | 'premium' | null>(null)
  const [monthlyBill, setMonthlyBill] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load saved data from localStorage
    const savedPackageType = localStorage.getItem('selectedPackage')
    const savedPackageData = localStorage.getItem('selectedPackageData')
    const savedMonthlyBill = localStorage.getItem('monthlyBill')

    if (!savedPackageType || !savedPackageData || !savedMonthlyBill) {
      router.push('/order/packages')
      return
    }

    setPackageType(savedPackageType as 'standard' | 'premium')
    setPackageData(JSON.parse(savedPackageData))
    setMonthlyBill(Number(savedMonthlyBill))
  }, [router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    // Here you would implement the order submission logic
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulated API call
    router.push('/dashboard')
  }

  if (!packageData || !packageType) {
    return <div>Loading...</div>
  }

  const taxCreditAmount = packageData.totalPrice * 0.3 // 30% tax credit
  const finalPrice = packageData.totalPrice - taxCreditAmount

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Summary</h1>
          <p className="text-lg text-gray-600">Review your solar system package</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Package Overview */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {packageType === 'premium' ? 'Premium' : 'Standard'} Package
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatCurrency(finalPrice)}
                    </p>
                    <p className="text-green-600 font-medium">
                      After {formatCurrency(taxCreditAmount)} tax credit
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-gray-600 mb-2">System Specifications:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-900">
                        <Zap className="h-5 w-5 text-blue-500" />
                        {packageData.systemSize.toFixed(1)} kW System Size
                      </li>
                      <li className="flex items-center gap-2 text-gray-900">
                        <Shield className="h-5 w-5 text-blue-500" />
                        {packageData.numberOfPanels} Solar Panels
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8">
                <h3 className="font-semibold text-gray-900 mb-4">Package Includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Professional Installation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">25-Year Warranty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">System Monitoring</span>
                  </li>
                  {packageType === 'premium' && (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Critter Guard Protection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Solar Edge Trim</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Extended Protection Plan</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Savings Breakdown */}
          <SavingsBreakdown
            monthlyBill={monthlyBill}
            systemProduction={packageData.monthlyProduction}
          />

          {/* Submit Order Button */}
          <div className="flex justify-center pt-8">
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="px-8 py-4 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              {isSubmitting ? 'Processing...' : 'Submit Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 