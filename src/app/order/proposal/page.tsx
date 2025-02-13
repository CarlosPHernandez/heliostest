'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check } from 'lucide-react'
import Image from 'next/image'
import { EquipmentDetails } from '@/components/features/EquipmentDetails'
import { InstallationRoadmap } from '@/components/features/InstallationRoadmap'
import { WarrantySelection } from '@/components/features/WarrantySelection'
import { UtilityCostProjection } from '@/components/features/UtilityCostProjection'
import { calculateFinancingOptions, AVAILABLE_TERMS } from '@/lib/financing-calculations'
import { setCookie } from '@/lib/cookies'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const batteryOptions = {
  franklin: {
    name: 'Franklin WH5000',
    price: 8500,
    capacity: '5 kWh',
    description: 'High-performance home battery system with advanced energy management',
  },
  qcell: {
    name: 'Q.HOME ESS HYB-G3',
    price: 9200,
    capacity: '6 kWh',
    description: 'Premium energy storage solution with intelligent power management',
  }
}

const calculateMonthlyPayment = (totalAmount: number, downPayment: number, termYears: number) => {
  const principal = totalAmount - downPayment
  const monthlyRate = 0.0625 / 12 // 6.25% APR
  const numberOfPayments = termYears * 12

  const monthlyPayment = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  return Math.round(monthlyPayment)
}

interface SystemInfo {
  systemSize: number
  numberOfPanels: number
  totalPrice: number
  yearlyProduction: number
  monthlyProduction: number
}

type PaymentType = 'cash' | 'finance'
type WarrantyPackage = 'standard' | 'extended'

export default function ProposalPage() {
  const router = useRouter()
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
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyPackage>('standard')
  const [includeBattery, setIncludeBattery] = useState(false)
  const [batteryCount, setBatteryCount] = useState(1)
  const [selectedBattery, setSelectedBattery] = useState<'franklin' | 'qcell'>('franklin')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=20&size=800x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      setMapUrl(mapUrl)
    } catch (err) {
      console.error('Error loading proposal data:', err)
      setError(err instanceof Error ? err.message : 'Error loading proposal')
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

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      if (!systemInfo) {
        throw new Error('Missing system information')
      }

      const { data: { session } } = await supabase.auth.getSession()

      // Calculate total price including add-ons
      const totalPrice = systemInfo.totalPrice + 
        (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
        (selectedWarranty === 'extended' ? 1500 : 0)

      // Prepare proposal data
      const proposalData = {
        systemInfo: {
          ...systemInfo,
          totalPrice // Update with final price including add-ons
        },
        address,
        monthlyBill,
        packageType,
        includeBattery,
        batteryCount,
        batteryType: selectedBattery,
        warranty: selectedWarranty,
        paymentType,
        financing: paymentType === 'finance' ? {
          term: selectedTerm,
          downPayment,
          monthlyPayment: financingOptions?.monthlyPayment
        } : null
      }

      if (!session) {
        // Store proposal data in localStorage for unauthenticated users
        console.log('No session, storing proposal data for later:', proposalData)
        localStorage.setItem('pendingProposal', JSON.stringify(proposalData))
        
        // Redirect to login with return URL
        const returnUrl = '/order/proposal'
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
        return
      }

      console.log('Saving proposal to Supabase for user:', session.user.id)
      const proposalDataToSave = {
        user_id: session.user.id,
        system_size: systemInfo.systemSize,
        number_of_panels: systemInfo.numberOfPanels,
        total_price: totalPrice,
        monthly_bill: monthlyBill,
        address,
        package_type: packageType,
        include_battery: includeBattery,
        battery_count: includeBattery ? batteryCount : 0,
        battery_type: includeBattery ? selectedBattery : null,
        warranty_package: selectedWarranty,
        payment_type: paymentType,
        financing_term: paymentType === 'finance' ? Number(selectedTerm) : null,
        down_payment: paymentType === 'finance' ? Number(downPayment) : null,
        monthly_payment: paymentType === 'finance' ? Number(financingOptions?.monthlyPayment) : null
      }
      console.log('Proposal data to save:', proposalDataToSave)

      const { data: savedProposal, error: proposalError } = await supabase
        .from('proposals')
        .insert([proposalDataToSave])
        .select('*')
        .single()

      if (proposalError) {
        console.error('Error saving proposal:', proposalError)
        throw proposalError
      }

      console.log('Proposal saved successfully:', savedProposal)

      // Clear stored proposal data
      localStorage.removeItem('pendingProposal')
      
      toast.success('Proposal saved successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving proposal:', error)
      setError('Error saving proposal. Please try again.')
      toast.error('Error saving proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBatteryChange = (include: boolean) => {
    setIncludeBattery(include)
    if (!include) {
      setBatteryCount(1)
    }
  }

  const handleBatteryCountChange = (count: number) => {
    setBatteryCount(count)
  }

  const handleBatteryTypeChange = (type: 'franklin' | 'qcell') => {
    setSelectedBattery(type)
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

        {/* Utility Cost Projection */}
        <div className="mb-8">
          <UtilityCostProjection 
            monthlyBill={monthlyBill}
            utilityName="your utility provider"
          />
        </div>

        {/* Equipment Details */}
        <div className="mb-8">
          <EquipmentDetails 
            packageType={packageType}
            includeBattery={includeBattery}
            batteryCount={batteryCount}
            selectedBattery={selectedBattery}
            onBatteryChange={handleBatteryChange}
            onBatteryCountChange={handleBatteryCountChange}
            onBatteryTypeChange={handleBatteryTypeChange}
          />
        </div>

        {/* Warranty Selection */}
        <div className="mb-8">
          <WarrantySelection
            selectedWarranty={selectedWarranty}
            onSelect={(warranty) => setSelectedWarranty(warranty)}
          />
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Options</h2>
          
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
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Base System Cost</span>
                <span className="text-gray-900 font-medium">{formatCurrency(systemInfo.totalPrice)}</span>
              </div>
              
              {includeBattery && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Battery System ({batteryCount}x {batteryOptions[selectedBattery].name})</span>
                  <span className="text-gray-900 font-medium">
                    +{formatCurrency(batteryOptions[selectedBattery].price * batteryCount)}
                  </span>
                </div>
              )}

              {selectedWarranty === 'extended' && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Extended Warranty Package</span>
                  <span className="text-gray-900 font-medium">+$1,500</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(
                    systemInfo.totalPrice + 
                    (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
                    (selectedWarranty === 'extended' ? 1500 : 0)
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="text-gray-600">Federal Tax Credit (30%)</span>
                  <p className="text-sm text-gray-500">Applied in next year's tax return</p>
                </div>
                <span className="text-green-600 font-medium">
                  -{formatCurrency(
                    (systemInfo.totalPrice + 
                    (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0)) * 0.3
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-3">
                <div>
                  <span className="text-gray-900 font-semibold">Final Cost</span>
                  <p className="text-sm text-gray-500">After tax credit</p>
                </div>
                <span className="text-gray-900 font-bold text-xl">
                  {formatCurrency(
                    (systemInfo.totalPrice + 
                    (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
                    (selectedWarranty === 'extended' ? 1500 : 0)) * 0.7
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 bg-blue-50 rounded-lg px-3">
                <div>
                  <span className="text-blue-900 font-semibold">Due Today</span>
                  <p className="text-sm text-blue-800">No upfront payment required</p>
                </div>
                <span className="text-blue-900 font-bold text-xl">$0</span>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Pro Tip:</span> The federal tax credit is a dollar-for-dollar reduction 
                  in your federal income taxes. You'll receive this credit when you file your taxes for the year the 
                  system is installed and operational.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
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

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Base System Cost</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(systemInfo.totalPrice)}</span>
                </div>

                {includeBattery && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Battery System ({batteryCount}x {batteryOptions[selectedBattery].name})</span>
                    <span className="text-gray-900 font-medium">
                      +{formatCurrency(batteryOptions[selectedBattery].price * batteryCount)}
                    </span>
                  </div>
                )}

                {selectedWarranty === 'extended' && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Extended Warranty Package</span>
                    <span className="text-gray-900 font-medium">+$1,500</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(
                      systemInfo.totalPrice + 
                      (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
                      (selectedWarranty === 'extended' ? 1500 : 0)
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="text-gray-600">Down Payment</span>
                    <p className="text-sm text-gray-500">Minimum required: $0</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                      className="w-32 px-3 py-2 border rounded-md text-right"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="text-gray-600">Federal Tax Credit (30%)</span>
                    <p className="text-sm text-gray-500">Applied in next year's tax return</p>
                  </div>
                  <span className="text-green-600 font-medium">
                    -{formatCurrency(
                      (systemInfo.totalPrice + 
                      (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0)) * 0.3
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="text-gray-600">Interest Rate (APR)</span>
                    <p className="text-sm text-gray-500">Fixed rate for entire term</p>
                  </div>
                  <span className="text-gray-900 font-medium">6.25%</span>
                </div>

                <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-3">
                  <div>
                    <span className="text-gray-900 font-semibold">Monthly Payment</span>
                    <p className="text-sm text-gray-500">For {selectedTerm} years</p>
                  </div>
                  <span className="text-gray-900 font-bold text-xl">
                    {formatCurrency(
                      calculateMonthlyPayment(
                        systemInfo.totalPrice + 
                        (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
                        (selectedWarranty === 'extended' ? 1500 : 0),
                        downPayment,
                        selectedTerm
                      )
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-4 bg-blue-50 rounded-lg px-3">
                  <div>
                    <span className="text-blue-900 font-semibold">Due Today</span>
                    <p className="text-sm text-blue-800">No upfront payment required</p>
                  </div>
                  <span className="text-blue-900 font-bold text-xl">$0</span>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Pro Tip:</span> You can apply your tax credit as an additional 
                    payment within the first 18 months to reduce your monthly payments. Ask your loan officer 
                    about this option.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Place Order Button */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <div className="flex flex-col items-center">
            <button
              onClick={handlePlaceOrder}
              className="w-full max-w-md px-8 py-4 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors"
            >
              Place Order
            </button>
            
            <div className="mt-6 max-w-2xl text-center space-y-4">
              <p className="text-gray-600">
                A refundable deposit will be required to begin your solar journey. Final pricing may be adjusted 
                based on installation requirements and site evaluation.
              </p>
              
              <p className="text-gray-600">
                By placing this order, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Order Terms</a>,{' '}
                <a href="/payment-terms" className="text-blue-600 hover:text-blue-800 underline">Payment Terms</a>,{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Roadmap */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Solar Journey</h2>
          <InstallationRoadmap />
        </div>
      </div>
    </div>
  )
} 