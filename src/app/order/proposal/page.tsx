'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Info } from 'lucide-react'
import Image from 'next/image'
import { EquipmentDetails } from '@/components/features/EquipmentDetails'
import { InstallationRoadmap } from '@/components/features/InstallationRoadmap'
import { WarrantySelection } from '@/components/features/WarrantySelection'
import { UtilityCostProjection } from '@/components/features/UtilityCostProjection'
import { calculateFinancingOptions, AVAILABLE_TERMS } from '@/lib/financing-calculations'
import { setCookie } from '@/lib/cookies'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Database } from '../../../types/database.types'

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

type PendingProposal = {
  temp_user_token: string
  system_size: number
  panel_count: number
  monthly_production: number
  address: string
  monthly_bill: number
  package_type: string
  payment_type: string
  financing: {
    term: number
    down_payment: number
    monthly_payment: number
  } | null
}

type ProposalInsert = {
  user_id: string
  system_size: number
  number_of_panels: number
  total_price: number
  address: string
  package_type: string
  include_battery: boolean
  battery_type: string | null
  battery_count: number | null
  payment_type: string
  down_payment: number | null
  monthly_payment: number | null
  financing_term: number | null
  monthly_bill: number
  monthly_production: number
  status: 'pending'
  stage: 'proposal'
}

type ProposalResponse = {
  id: string
  [key: string]: any
}

export default function ProposalPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [packageType, setPackageType] = useState<'standard' | 'premium'>('standard')
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [address, setAddress] = useState('')
  const [monthlyBill, setMonthlyBill] = useState<number>(0)
  const [mapUrl, setMapUrl] = useState('')
  const [mapError, setMapError] = useState<string | null>(null)
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
    // Load data from localStorage
    const loadData = async () => {
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
        console.log('Stored address:', storedAddress)
        console.log('Encoded address:', encodedAddress)
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        console.log('API Key available:', !!apiKey)

        if (!apiKey) {
          throw new Error('Google Maps API key is not configured')
        }

        // Construct the Static Maps API URL with proper parameters
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?`
          + `center=${encodedAddress}`
          + `&zoom=20`
          + `&size=800x400`
          + `&scale=2`  // For higher resolution
          + `&maptype=satellite`
          + `&key=${apiKey}`

        console.log('Map URL:', mapUrl)

        // Verify the URL is valid
        try {
          new URL(mapUrl)
          setMapUrl(mapUrl)
          setMapError(null)
        } catch (err) {
          console.error('Invalid map URL:', err)
          setMapError('Invalid map URL configuration')
        }
      } catch (err) {
        console.error('Error loading proposal data:', err)
        setError(err instanceof Error ? err.message : 'Error loading proposal')
      }
    }

    loadData()
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
    try {
      setIsSubmitting(true);
      setError('');

      // Validate required data
      if (!systemInfo) {
        throw new Error('System information is missing. Please start over.');
      }

      if (!address) {
        throw new Error('Address is missing. Please start over.');
      }

      const proposalData: ProposalInsert = {
        user_id: '', // Set after registration
        system_size: systemInfo.systemSize,
        number_of_panels: systemInfo.numberOfPanels,
        total_price: systemInfo.totalPrice +
          (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
          (selectedWarranty === 'extended' ? 1500 : 0),
        address,
        package_type: packageType,
        include_battery: includeBattery,
        battery_type: includeBattery ? selectedBattery : null,
        battery_count: includeBattery ? batteryCount : null,
        payment_type: paymentType,
        down_payment: paymentType === 'finance' ? downPayment : null,
        monthly_payment: paymentType === 'finance' ? calculateMonthlyPayment(
          systemInfo.totalPrice +
          (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
          (selectedWarranty === 'extended' ? 1500 : 0),
          downPayment,
          selectedTerm
        ) : null,
        financing_term: paymentType === 'finance' ? selectedTerm : null,
        monthly_bill: monthlyBill,
        monthly_production: systemInfo.monthlyProduction,
        status: 'pending',
        stage: 'proposal',
      };

      const encodedProposal = encodeURIComponent(JSON.stringify(proposalData));
      router.push(`/register?proposal=${encodedProposal}`);
    } catch (error) {
      console.error('Error saving proposal:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors mb-8 rounded-full px-4 py-2 hover:bg-sky-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Solar Proposal
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Review your customized solar design and choose your preferred payment option.
          </p>
        </div>

        {/* Property Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8 animate-fade-in">
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
              {mapError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                  <p>Failed to load aerial view</p>
                </div>
              ) : (
                <Image
                  src={mapUrl}
                  alt="Property aerial view"
                  fill
                  className="object-cover"
                  unoptimized={true}
                  onError={(e) => {
                    console.error('Error loading aerial image. Details:', {
                      mapUrl,
                      error: e,
                      status: (e.target as HTMLImageElement).naturalWidth === 0 ? 'Zero width' : 'Unknown error'
                    })
                    setMapError('Failed to load aerial image')
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Utility Cost Projection */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <UtilityCostProjection
            monthlyBill={monthlyBill}
            utilityName="your utility provider"
          />
        </div>

        {/* Equipment Details */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
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
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="relative">
            <WarrantySelection
              selectedWarranty={selectedWarranty}
              onSelect={(warranty) => setSelectedWarranty(warranty)}
            />

            {/* Comparison Tooltip */}
            <div className="absolute top-8 right-8">
              <div className="group relative">
                <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Info className="w-5 h-5 text-gray-500" />
                </button>
                <div className="absolute right-0 z-10 w-72 p-4 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <h4 className="font-medium text-gray-900 mb-2">Warranty Comparison</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <div></div>
                      <div className="font-medium text-gray-700">Standard</div>
                      <div className="font-medium text-gray-700">Extended</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">Panel Warranty</div>
                      <div className="text-gray-900">25 years</div>
                      <div className="text-gray-900">25 years</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">Inverter Warranty</div>
                      <div className="text-gray-900">10 years</div>
                      <div className="text-gray-900 font-medium text-sky-700">25 years</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">Workmanship</div>
                      <div className="text-gray-900">10 years</div>
                      <div className="text-gray-900 font-medium text-sky-700">25 years</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">Maintenance</div>
                      <div className="text-gray-900">Not included</div>
                      <div className="text-gray-900 font-medium text-sky-700">Annual</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">Cost</div>
                      <div className="text-gray-900">Included</div>
                      <div className="text-gray-900 font-medium text-sky-700">$1,500</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Options</h2>

          {/* Payment Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setPaymentType('cash')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${paymentType === 'cash'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Cash Purchase
              </button>
              <button
                onClick={() => setPaymentType('finance')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${paymentType === 'finance'
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

              <div className="flex justify-between items-center py-4 bg-sky-50 rounded-lg px-3">
                <div>
                  <span className="text-sky-900 font-semibold">Due Today</span>
                  <p className="text-sm text-sky-800">No upfront payment required</p>
                </div>
                <span className="text-sky-900 font-bold text-xl">$0</span>
              </div>

              <div className="mt-4 p-4 bg-sky-50 rounded-lg">
                <p className="text-sm text-sky-800">
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

                {/* Loan Term Selection with Visual Feedback */}
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_TERMS.map(term => {
                      // Calculate monthly payment for this term
                      const payment = calculateMonthlyPayment(
                        systemInfo.totalPrice +
                        (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
                        (selectedWarranty === 'extended' ? 1500 : 0),
                        downPayment,
                        term
                      );

                      return (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setSelectedTerm(term)}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${selectedTerm === term
                            ? 'border-sky-600 bg-sky-50 shadow-sm'
                            : 'border-gray-200 hover:border-sky-300 hover:bg-sky-50/50'
                            }`}
                        >
                          <span className="text-xl font-semibold text-gray-900">{term}</span>
                          <span className="text-sm text-gray-600">Years</span>
                          <span className={`mt-2 font-medium ${selectedTerm === term ? 'text-sky-700' : 'text-gray-700'}`}>
                            {formatCurrency(payment)}/mo
                          </span>
                          {selectedTerm === term && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-sky-600 rounded-full flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Info className="w-4 h-4 flex-shrink-0 text-sky-600" />
                    <p>Longer terms have lower monthly payments but higher total interest costs.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 mt-6">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700 font-medium">Base System Cost</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(systemInfo.totalPrice)}</span>
                </div>

                {includeBattery && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700 font-medium">Battery System ({batteryCount}x {batteryOptions[selectedBattery].name})</span>
                    <span className="text-gray-900 font-medium">
                      +{formatCurrency(batteryOptions[selectedBattery].price * batteryCount)}
                    </span>
                  </div>
                )}

                {selectedWarranty === 'extended' && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700 font-medium">Extended Warranty Package</span>
                    <span className="text-gray-900 font-medium">+$1,500</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(
                      systemInfo.totalPrice +
                      (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
                      (selectedWarranty === 'extended' ? 1500 : 0)
                    )}
                  </span>
                </div>

                <div className="py-4 border-b">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-gray-700 font-medium">Down Payment</span>
                      <p className="text-sm text-gray-500">Minimum required: $0</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-medium text-base">
                        {formatCurrency(downPayment)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({Math.round((downPayment / (systemInfo.totalPrice +
                          (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0) +
                          (selectedWarranty === 'extended' ? 1500 : 0))) * 100)}% of total)
                      </span>
                    </div>
                  </div>

                  {/* Down Payment Slider */}
                  <div className="w-full flex items-center gap-2 mt-3">
                    <span className="text-xs font-medium text-gray-500">$0</span>
                    <div className="relative flex-grow">
                      <input
                        type="range"
                        min="0"
                        max={Math.round(systemInfo.totalPrice * 0.5)} // Max 50% of system cost
                        step="1000"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                        style={{
                          '--range-thumb-size': '20px',
                          '--range-track-height': '8px',
                        } as React.CSSProperties}
                      />
                      <style jsx>{`
                        input[type=range]::-webkit-slider-thumb {
                          width: var(--range-thumb-size);
                          height: var(--range-thumb-size);
                          background: #0284c7;
                          border-radius: 50%;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                          cursor: pointer;
                        }
                        input[type=range]::-moz-range-thumb {
                          width: var(--range-thumb-size);
                          height: var(--range-thumb-size);
                          background: #0284c7;
                          border-radius: 50%;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                          cursor: pointer;
                        }
                        input[type=range]::-webkit-slider-runnable-track {
                          height: var(--range-track-height);
                          background: #e5e7eb;
                          border-radius: 0.5rem;
                        }
                        input[type=range]::-moz-range-track {
                          height: var(--range-track-height);
                          background: #e5e7eb;
                          border-radius: 0.5rem;
                        }
                      `}</style>
                    </div>
                    <span className="text-xs font-medium text-gray-500">50%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <span className="text-gray-700 font-medium">Federal Tax Credit (30%)</span>
                    <p className="text-sm text-gray-500">Applied in next year's tax return</p>
                  </div>
                  <span className="text-sky-600 font-medium">
                    -{formatCurrency(
                      (systemInfo.totalPrice +
                        (includeBattery ? batteryOptions[selectedBattery].price * batteryCount : 0)) * 0.3
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <span className="text-gray-700 font-medium">Interest Rate (APR)</span>
                    <p className="text-sm text-gray-500">Fixed rate for entire term</p>
                  </div>
                  <span className="text-gray-900 font-medium">6.25%</span>
                </div>

                <div className="flex justify-between items-center py-5 bg-gray-50 rounded-lg px-4 mt-6">
                  <div>
                    <span className="text-gray-900 font-semibold">Monthly Payment</span>
                    <p className="text-sm text-gray-500">For {selectedTerm} years</p>
                  </div>
                  <span className="text-gray-900 font-bold text-2xl">
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

                <div className="flex justify-between items-center py-4 bg-sky-50 rounded-lg px-4 mt-2">
                  <div>
                    <span className="text-sky-900 font-semibold">Due Today</span>
                    <p className="text-sm text-sky-800">No upfront payment required</p>
                  </div>
                  <span className="text-sky-900 font-bold text-xl">$0</span>
                </div>

                <div className="mt-4 p-4 bg-sky-50 rounded-lg">
                  <p className="text-sm text-sky-800">
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
        <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl shadow-lg border border-sky-100 p-8 sm:p-10 mb-16 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full px-8 py-5 bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-xl font-semibold text-lg hover:from-sky-700 hover:to-sky-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                <span>{isSubmitting ? 'Processing...' : 'Place Order'}</span>
              </button>
            </div>

            <div className="mt-6 max-w-2xl text-center">
              <p className="text-gray-600 mt-5">
                Final pricing may be adjusted based on installation requirements and site evaluation. By placing this order, you agree to our{' '}
                <a href="/terms" className="text-sky-600 hover:text-sky-800 font-medium">Order Terms</a>,{' '}
                <a href="/payment-terms" className="text-sky-600 hover:text-sky-800 font-medium">Payment Terms</a>,{' '}
                and{' '}
                <a href="/privacy" className="text-sky-600 hover:text-sky-800 font-medium">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Roadmap */}
        <div className="animate-fade-in mt-16 mb-8" style={{ animationDelay: '600ms' }}>
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 bg-sky-100 rounded-full text-sky-800 text-sm font-medium mb-3">
              What's Next
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 relative inline-block">
              Your Solar Journey
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transform origin-left animate-pulse-subtle"></div>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Here's what to expect after placing your order. Our streamlined process ensures a smooth transition to clean, renewable energy.
            </p>
          </div>
          <InstallationRoadmap />
        </div>
      </div>
    </div>
  )
} 