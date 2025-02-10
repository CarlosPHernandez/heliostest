'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Shield, Zap } from 'lucide-react'
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
      description: 'High-efficiency monocrystalline panels with sleek all-black design, optimized for maximum performance and aesthetic appeal.'
    },
    inverter: {
      name: 'Enphase IQ8+',
      description: 'Advanced microinverter system providing panel-level optimization and monitoring, with built-in rapid shutdown for enhanced safety.'
    },
    monitoring: {
      name: 'Basic System Monitoring',
      description: 'Real-time monitoring of system performance, energy production, and basic fault detection through a user-friendly mobile app.'
    },
    installation: {
      name: 'Professional Installation',
      description: 'Expert installation by certified technicians, including electrical work, mounting, and system configuration.'
    }
  },
  premium: {
    panels: {
      name: 'REC Alpha Pure-R',
      description: 'Premium high-power panels featuring advanced cell technology, superior low-light performance, and enhanced durability.'
    },
    inverter: {
      name: 'Enphase IQ8M+',
      description: 'Premium microinverter system with higher power handling, enhanced performance monitoring, and future battery readiness.'
    },
    monitoring: {
      name: 'Advanced System Monitoring',
      description: 'Comprehensive monitoring with detailed performance analytics, predictive maintenance alerts, and advanced reporting features.'
    },
    installation: {
      name: 'Premium Installation',
      description: 'Priority installation service with premium mounting hardware and enhanced aesthetic considerations.'
    },
    critterGuard: {
      name: 'Critter Guard Protection',
      description: 'Premium mesh barrier system that prevents birds, squirrels, and other animals from nesting under your solar panels while maintaining system aesthetics.'
    },
    edgeTrim: {
      name: 'Solar Edge Trim',
      description: 'Professional-grade edge skirt that creates a sleek, finished look while providing additional protection against debris and pests.'
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

export default function OrderSummaryPage() {
  const router = useRouter()
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [packageType, setPackageType] = useState<'standard' | 'premium' | null>(null)
  const [warrantyPackage, setWarrantyPackage] = useState<'basic' | 'extended' | 'comprehensive'>('basic')
  const [monthlyBill, setMonthlyBill] = useState<number>(0)
  const [utilityName, setUtilityName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [includeBattery, setIncludeBattery] = useState(false)
  const [selectedBattery, setSelectedBattery] = useState<'franklin' | 'qcell'>('franklin')

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
    if (warrantyPackage !== 'basic') {
      const warrantyCosts = {
        extended: 1500,
        comprehensive: 2000
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
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">System Cost</span>
                <span className="text-gray-900 font-medium">{formatCurrency(packageData?.totalPrice || 0)}</span>
              </div>
              {warrantyPackage !== 'basic' && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">{warrantyPackage === 'comprehensive' ? 'Comprehensive' : 'Extended'} Warranty</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(warrantyPackage === 'comprehensive' ? 2000 : 1500)}
                  </span>
                </div>
              )}
              {includeBattery && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Battery Storage ({batteryOptions[selectedBattery].name})</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(batteryOptions[selectedBattery].price)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Federal Tax Credit (30%)</span>
                <span className="text-green-600 font-medium">
                  -{formatCurrency(calculateTotalCost() * 0.3)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-semibold">Final Cost</span>
                <span className="text-gray-900 font-bold text-xl">
                  {formatCurrency(calculateTotalCost() * 0.7)}
                </span>
              </div>
            </div>
          </div>

          {/* Equipment Details with Descriptions */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Components</h2>
            
            {/* Battery Toggle Section */}
            <div className="mb-8 border-b pb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Battery Backup System</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Add Battery Storage</span>
                  <button
                    onClick={() => setIncludeBattery(!includeBattery)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      includeBattery ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeBattery ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {includeBattery && (
                <div className="mt-6 space-y-6">
                  <div className="flex gap-4">
                    {(['franklin', 'qcell'] as const).map((battery) => (
                      <div
                        key={battery}
                        onClick={() => setSelectedBattery(battery)}
                        className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedBattery === battery
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{batteryOptions[battery].name}</h4>
                            <p className="text-sm text-gray-600">{batteryOptions[battery].capacity} Capacity</p>
                          </div>
                          <div className={`flex items-center justify-center w-4 h-4 border-2 rounded-full ${
                            selectedBattery === battery ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedBattery === battery && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{batteryOptions[battery].description}</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Backup Power Capabilities:</h5>
                          <ul className="space-y-1">
                            {batteryOptions[battery].backupCapabilities.map((capability, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                {capability}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="mt-4 text-lg font-bold text-gray-900">
                          {formatCurrency(batteryOptions[battery].price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rest of system components */}
            <div className="space-y-8">
              {Object.entries(packageType === 'premium' ? packageFeatures.premium : packageFeatures.standard)
                .map(([key, feature]) => (
                  <div key={key} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.name}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Equipment Details */}
          <EquipmentDetails packageType={packageType} />

          {/* Utility Cost Projection */}
          <UtilityCostProjection
            monthlyBill={monthlyBill}
            utilityName={utilityName}
          />

          {/* Warranty Selection */}
          <WarrantySelection
            selectedWarranty={warrantyPackage}
            onSelect={setWarrantyPackage}
          />

          {/* Installation Process */}
          <InstallationRoadmap />

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
    </div>
  )
} 