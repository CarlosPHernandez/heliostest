'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Shield, Zap, Battery } from 'lucide-react'
import { EquipmentDetails } from '@/components/features/EquipmentDetails'
import { InstallationRoadmap } from '@/components/features/InstallationRoadmap'
import { WarrantySelection } from '@/components/features/WarrantySelection'
import { UtilityCostProjection } from '@/components/features/UtilityCostProjection'

interface PackageData {
  systemSize: number
  numberOfPanels: number
  totalPrice: number
  yearlyProduction: number
  monthlyProduction: number
}

const packageFeatures = {
  standard: {
    panels: {
      name: 'Q CELLS Q.PEAK DUO BLK ML-G10+',
      features: [
        '400W high-efficiency panels',
        'Sleek all-black design',
        '20.4% efficiency rating',
        'Enhanced durability',
        '25-year performance warranty'
      ]
    },
    inverter: {
      name: 'Enphase IQ8+',
      features: [
        'Panel-level optimization',
        'Built-in rapid shutdown',
        'Real-time monitoring',
        '25-year warranty'
      ]
    },
    monitoring: {
      name: 'Basic System Monitoring',
      features: [
        'Real-time production tracking',
        'Mobile app access',
        'Basic fault detection',
        'Monthly performance reports'
      ]
    },
    installation: {
      name: 'Professional Installation',
      features: [
        'Certified technicians',
        'Standard mounting hardware',
        'Full system testing',
        'Local permits & inspections'
      ]
    }
  },
  premium: {
    panels: {
      name: 'REC Alpha Pure-R',
      features: [
        '430W premium panels',
        'Advanced cell technology',
        '22.3% efficiency rating',
        'Superior low-light performance',
        '25-year premium warranty'
      ]
    },
    inverter: {
      name: 'Enphase IQ8M+',
      features: [
        'Enhanced power handling',
        'Advanced monitoring features',
        'Battery-ready system',
        '25-year premium warranty'
      ]
    },
    monitoring: {
      name: 'Advanced System Monitoring',
      features: [
        'Detailed analytics dashboard',
        'Predictive maintenance',
        'Advanced diagnostics',
        'Custom performance reports'
      ]
    },
    installation: {
      name: 'Premium Installation',
      features: [
        'Priority installation team',
        'Premium mounting hardware',
        'Enhanced aesthetics',
        'Expedited permits'
      ]
    },
    critterGuard: {
      name: 'Critter Guard Protection',
      features: [
        'Premium mesh barrier',
        'Pest prevention',
        'Maintains system aesthetics',
        'Weather-resistant materials'
      ]
    },
    edgeTrim: {
      name: 'Solar Edge Trim',
      features: [
        'Professional edge skirt',
        'Enhanced aesthetics',
        'Additional debris protection',
        'Weather-sealed design'
      ]
    }
  }
}

const batteryOptions = {
  franklin: {
    name: 'Franklin WH5000',
    price: 8500,
    capacity: '5 kWh',
    description: 'High-performance home battery system with advanced energy management',
    backupCapabilities: [
      'Refrigerator (18-20 hours)',
      'WiFi & Internet (30+ hours)',
      'Home Security System (24+ hours)',
      'Critical Lighting (24+ hours)',
      'Phone & Laptop Charging (30+ hours)',
      'TV & Entertainment (10-12 hours)',
    ]
  },
  qcell: {
    name: 'Q.HOME ESS HYB-G3',
    price: 9200,
    capacity: '6 kWh',
    description: 'Premium energy storage solution with intelligent power management',
    backupCapabilities: [
      'Refrigerator (20-24 hours)',
      'WiFi & Internet (35+ hours)',
      'Home Security System (30+ hours)',
      'Critical Lighting (30+ hours)',
      'Phone & Laptop Charging (35+ hours)',
      'TV & Entertainment (12-15 hours)',
      'Small HVAC Load (6-8 hours)',
    ]
  }
}

type PaymentType = 'cash' | 'finance'
type WarrantyPackage = 'standard' | 'extended'

export default function OrderSummaryPage() {
  const router = useRouter()
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [packageType, setPackageType] = useState<'standard' | 'premium' | null>(null)
  const [warrantyPackage, setWarrantyPackage] = useState<WarrantyPackage>('standard')
  const [monthlyBill, setMonthlyBill] = useState<number>(0)
  const [utilityName, setUtilityName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [includeBattery, setIncludeBattery] = useState(false)
  const [selectedBattery, setSelectedBattery] = useState<'franklin' | 'qcell'>('franklin')
  const [paymentType, setPaymentType] = useState<PaymentType>('finance')
  const [selectedTerm, setSelectedTerm] = useState(25) // Default to 25 years
  const [error, setError] = useState('')
  const [proposalData, setProposalData] = useState<any>(null)

  useEffect(() => {
    // Load saved data from localStorage
    const savedPackageType = localStorage.getItem('selectedPackage')
    const savedPackageData = localStorage.getItem('selectedPackageData')
    const savedMonthlyBill = localStorage.getItem('monthlyBill')
    const savedUtility = localStorage.getItem('selectedUtility')

    if (!savedPackageType || !savedPackageData || !savedMonthlyBill || !savedUtility) {
      router.push('/order/packages')
      return
    }

    try {
      setPackageType(savedPackageType as 'standard' | 'premium')
      setPackageData(JSON.parse(savedPackageData))
      setMonthlyBill(Number(savedMonthlyBill))
      const utilityData = JSON.parse(savedUtility)
      setUtilityName(utilityData.name)
    } catch (err) {
      console.error('Error parsing data:', err)
      router.push('/order/packages')
    }
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
    router.push('/')
  }

  const calculateTotalCost = () => {
    if (!packageData) return 0
    
    let total = packageData.totalPrice
    
    // Add warranty cost if not basic
    if (warrantyPackage !== 'standard') {
      const warrantyCosts = {
        extended: 1500,
      }
      total += warrantyCosts[warrantyPackage]
    }

    // Add battery cost if selected
    if (includeBattery) {
      total += batteryOptions[selectedBattery].price
    }
    
    return total
  }

  const calculateMonthlyPayments = () => {
    const total = calculateTotalCost()
    // Apply 30% tax credit
    const afterTaxCredit = total * 0.7
    
    if (!packageData) return null
    
    return {
      totalCost: total,
      taxCredit: total * 0.3,
      finalCost: afterTaxCredit,
      monthly: afterTaxCredit / 12 // Simplified monthly calculation
    }
  }

  if (!packageData || !packageType) {
    return <div>Loading...</div>
  }

  const taxCreditAmount = packageData.totalPrice * 0.3 // 30% tax credit
  const finalPrice = packageData.totalPrice - taxCreditAmount

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Summary</h1>
          <p className="text-lg text-gray-600">Review your solar system package</p>
        </div>

        {/* Equipment Details */}
        <div className="mb-8">
          <EquipmentDetails packageType={packageType || 'standard'} />
        </div>

        {/* Warranty Options */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Warranty Coverage</h3>
              <p className="text-sm text-gray-600">Choose your preferred warranty package</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Warranty */}
            <div
              onClick={() => setWarrantyPackage('standard')}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                warrantyPackage === 'standard'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Standard Warranty</h4>
                  <p className="text-sm text-gray-600 mt-1">Included with your system</p>
                </div>
                <div className={`flex items-center justify-center w-5 h-5 border-2 rounded-full ${
                  warrantyPackage === 'standard' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {warrantyPackage === 'standard' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  25-year panel performance warranty
                </li>
                <li className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  10-year inverter warranty
                </li>
                <li className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  10-year workmanship warranty
                </li>
              </ul>
              <p className="mt-4 text-lg font-bold text-gray-900">Included</p>
            </div>

            {/* Extended Warranty */}
            <div
              onClick={() => setWarrantyPackage('extended')}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                warrantyPackage === 'extended'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Extended Warranty</h4>
                  <p className="text-sm text-gray-600 mt-1">Maximum protection and peace of mind</p>
                </div>
                <div className={`flex items-center justify-center w-5 h-5 border-2 rounded-full ${
                  warrantyPackage === 'extended' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {warrantyPackage === 'extended' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  25-year panel performance warranty
                </li>
                <li className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  25-year inverter warranty
                </li>
                <li className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  25-year workmanship warranty
                </li>
                <li className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  Annual maintenance included
                </li>
              </ul>
              <p className="mt-4 text-lg font-bold text-gray-900">$1,500</p>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-xl shadow-sm p-8">
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
                <span className="text-gray-600">System Cost</span>
                <span className="text-gray-900 font-medium">{formatCurrency(calculateTotalCost())}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Federal Tax Credit (30%)</span>
                <span className="text-green-600 font-medium">-{formatCurrency(calculateTotalCost() * 0.3)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-semibold">Final Cost</span>
                <span className="text-gray-900 font-bold text-xl">{formatCurrency(calculateTotalCost() * 0.7)}</span>
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
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={25}>25 Years</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">System Cost</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(calculateTotalCost())}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Federal Tax Credit (30%)</span>
                  <span className="text-green-600 font-medium">-{formatCurrency(calculateTotalCost() * 0.3)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Interest Rate (APR)</span>
                  <span className="text-gray-900 font-medium">6.25%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-900 font-semibold">Monthly Payment</span>
                  <span className="text-gray-900 font-bold text-xl">
                    {formatCurrency((calculateTotalCost() * 0.7) / (selectedTerm * 12))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Installation Roadmap */}
        <div className="mt-16">
          <InstallationRoadmap />
        </div>

        {/* Submit Order Button */}
        <div className="flex flex-col items-center mt-8">
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="px-8 py-4 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {isSubmitting ? 'Processing...' : 'Submit Order'}
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