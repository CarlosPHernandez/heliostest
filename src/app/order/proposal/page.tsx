'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
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
  const [downPayment, setDownPayment] = useState<number>(0)
  const [financingOptions, setFinancingOptions] = useState<any>(null)

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

      const parsedPackageData = JSON.parse(storedPackageData)
      setPackageType(storedPackageType as 'standard' | 'premium')
      setSystemInfo(parsedPackageData)
      setAddress(storedAddress)
      setMonthlyBill(Number(storedMonthlyBill))

      // Calculate financing options
      const federalTaxCredit = parsedPackageData.totalPrice * 0.3
      const options = calculateFinancingOptions(
        parsedPackageData.totalPrice,
        federalTaxCredit,
        downPayment,
        Number(storedMonthlyBill)
      )
      setFinancingOptions(options)

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
  }, [downPayment])

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

  const handlePlaceOrder = () => {
    try {
      // Save proposal data including payment type and financing details
      const proposalData = {
        packageType,
        systemInfo,
        address,
        monthlyBill,
        paymentType,
        financing: paymentType === 'finance' ? {
          term: selectedTerm,
          downPayment,
          monthlyPayment: financingOptions[selectedTerm].monthlyPaymentWithDownPaymentAndCredit
        } : null
      }
      
      localStorage.setItem('proposalData', JSON.stringify(proposalData))
      router.push('/order/summary')
    } catch (err) {
      console.error('Error saving proposal:', err)
      setError('Failed to save proposal data')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">Loading proposal...</p>
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
  const currentMonthlyPayment = paymentType === 'finance' && financingOptions
    ? financingOptions[selectedTerm].monthlyPaymentWithDownPaymentAndCredit
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Solar Proposal
          </h1>
          <p className="text-gray-600">
            Review your customized solar design and choose your preferred payment option.
          </p>
        </div>

        {/* Property Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Overview</h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Address:</span><br />
                  {address}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">System Size:</span><br />
                  {systemInfo.systemSize.toFixed(1)} kW
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Number of Panels:</span><br />
                  {systemInfo.numberOfPanels} panels
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Estimated Production:</span><br />
                  {formatNumber(systemInfo.yearlyProduction)} kWh/year
                </p>
              </div>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={mapUrl}
                alt="Property aerial view"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Options</h2>
          
          {/* Payment Type Toggle */}
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

          {paymentType === 'cash' ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Purchase</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">System Price</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financing Options</h3>
              <div className="space-y-6">
                {/* Down Payment Input */}
                <div>
                  <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="downPayment"
                      value={downPayment || ''}
                      onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                      className="pl-8 pr-4 py-3 w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                      placeholder="Enter amount"
                      min="0"
                      max={systemInfo.totalPrice}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {((downPayment / systemInfo.totalPrice) * 100).toFixed(1)}% of total cost
                  </p>
                </div>

                {/* Loan Term Selection */}
                <div>
                  <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Loan Term
                  </label>
                  <select
                    id="loanTerm"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(Number(e.target.value))}
                    className="w-full px-4 py-3 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                  >
                    {AVAILABLE_TERMS.map(term => (
                      <option key={term} value={term}>{term} Years</option>
                    ))}
                  </select>
                </div>

                {financingOptions && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">System Price</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(systemInfo.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Down Payment</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(downPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Federal Tax Credit (30%)</span>
                      <span className="text-green-600 font-medium">-{formatCurrency(federalTaxCredit)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Interest Rate (APR)</span>
                      <span className="text-gray-900 font-medium">6.25%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Monthly Payment</span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(financingOptions[selectedTerm]?.monthlyPaymentWithDownPayment || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-900 font-semibold">Monthly Payment with Tax Credit</span>
                      <span className="text-green-600 font-bold text-xl">
                        {formatCurrency(financingOptions[selectedTerm]?.monthlyPaymentWithDownPaymentAndCredit || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Savings Breakdown */}
        <div className="mb-8">
          <SavingsBreakdown
            monthlyBill={monthlyBill}
            systemProduction={systemInfo.monthlyProduction}
            showFinancingComparison={paymentType === 'finance'}
            financingPayment={currentMonthlyPayment}
            loanTerm={paymentType === 'finance' ? selectedTerm : undefined}
          />
        </div>

        {/* Place Order Button */}
        <div className="flex flex-col items-center mt-8">
          <button
            onClick={handlePlaceOrder}
            className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Place Order
          </button>
          <p className="mt-4 text-sm text-gray-500 text-center max-w-xl">
            Refundable deposit until you accept your design. Quoted price is subject to change based on installation complexity.
          </p>
          <p className="mt-2 text-sm text-gray-500 text-center max-w-xl">
            By submitting this order, you are agreeing to our{' '}
            <a href="/terms" className="underline hover:text-gray-700">Order Terms</a>,{' '}
            <a href="/payment-terms" className="underline hover:text-gray-700">Payment Terms</a>, and{' '}
            <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
} 