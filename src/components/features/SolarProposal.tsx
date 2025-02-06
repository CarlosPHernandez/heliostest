'use client'

import { useState } from 'react'
import { Shield, Zap, Check } from 'lucide-react'

interface SolarProposalProps {
  proposal: {
    standard: {
      systemSize: number
      numberOfPanels: number
      totalPrice: number
      yearlyProduction: number
      monthlyProduction: number
    }
    premium: {
      systemSize: number
      numberOfPanels: number
      totalPrice: number
      yearlyProduction: number
      monthlyProduction: number
    }
  }
  onSelect: (packageType: 'standard' | 'premium') => void
}

const FEATURES = [
  {
    name: 'High-Quality Solar Panels',
    standard: true,
    premium: true,
    description: 'Standard: Tier 1 panels | Premium: High-efficiency premium panels'
  },
  {
    name: 'Professional Installation',
    standard: true,
    premium: true
  },
  {
    name: 'System Design & Engineering',
    standard: true,
    premium: true
  },
  {
    name: 'Permitting Process',
    standard: true,
    premium: true,
    description: 'Standard: Regular process | Premium: Expedited process'
  },
  {
    name: 'Critter Guard',
    standard: false,
    premium: true,
    description: 'Protect your system from birds and small animals'
  },
  {
    name: 'Solar Edge Skirts',
    standard: false,
    premium: true,
    description: 'Enhanced aesthetics and additional protection'
  },
  {
    name: 'Extended Protection Plan',
    standard: false,
    premium: true,
    description: 'Additional coverage beyond standard warranty'
  }
]

export function SolarProposal({ proposal, onSelect }: SolarProposalProps) {
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'premium' | null>(null)
  const [showTaxCredit, setShowTaxCredit] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatProduction = (kwh: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(kwh)
  }

  const handlePackageSelect = (packageType: 'standard' | 'premium') => {
    setSelectedPackage(packageType)
    onSelect(packageType)
  }

  const calculatePriceWithTaxCredit = (price: number) => {
    return showTaxCredit ? price * 0.7 : price // 30% tax credit
  }

  return (
    <div>
      {/* Price Display Toggle */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Price Display Options</h3>
            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={() => setShowTaxCredit(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all
                  ${showTaxCredit 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Potential Incentives
                <span className="block text-xs mt-1 font-normal">
                  {showTaxCredit && "30% tax credit applied"}
                </span>
              </button>
              <button
                onClick={() => setShowTaxCredit(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all
                  ${!showTaxCredit 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Purchase Price
                <span className="block text-xs mt-1 font-normal">
                  {!showTaxCredit && "No incentives applied"}
                </span>
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center">
              {showTaxCredit 
                ? "Showing prices with 30% federal tax credit applied" 
                : "Showing original purchase prices without incentives"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Standard Package */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b">
            <h3 className="text-2xl font-semibold mb-2">Standard Package</h3>
            <p className="text-3xl font-bold mb-4">
              {formatCurrency(calculatePriceWithTaxCredit(proposal.standard.totalPrice))}
            </p>
            <p className="text-gray-600">
              {showTaxCredit && <span className="text-sm text-green-600 block mb-1">*Includes 30% federal tax credit</span>}
              Perfect for homeowners looking for a reliable and efficient solar solution.
            </p>
          </div>

          <div className="flex-1 p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">
                    {proposal.standard.numberOfPanels} Solar Panels
                  </p>
                  <p className="text-gray-500 text-sm">
                    {proposal.standard.systemSize.toFixed(1)} kW System
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">
                    {formatProduction(proposal.standard.yearlyProduction)} kWh/year
                  </p>
                  <p className="text-gray-500 text-sm">
                    Estimated Production
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">25-Year Warranty</p>
                  <p className="text-gray-500 text-sm">
                    Comprehensive coverage on panels and installation
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">Professional Installation</p>
                  <p className="text-gray-500 text-sm">
                    Expert installation by certified technicians
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => handlePackageSelect('standard')}
              className={`w-full py-3 px-6 rounded-lg text-center font-medium transition-colors
                ${selectedPackage === 'standard'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
              Select Standard Package
            </button>
          </div>
        </div>

        {/* Premium Package */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Most Popular
            </span>
          </div>

          <div className="p-6 pb-4 border-b">
            <h3 className="text-2xl font-semibold mb-2">Premium Package</h3>
            <p className="text-3xl font-bold mb-4">
              {formatCurrency(calculatePriceWithTaxCredit(proposal.premium.totalPrice))}
            </p>
            <p className="text-gray-600">
              {showTaxCredit && <span className="text-sm text-green-600 block mb-1">*Includes 30% federal tax credit</span>}
              Enhanced protection and maximum efficiency for optimal performance.
            </p>
          </div>

          <div className="flex-1 p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">
                    {proposal.premium.numberOfPanels} High-Efficiency Panels
                  </p>
                  <p className="text-gray-500 text-sm">
                    {proposal.premium.systemSize.toFixed(1)} kW System
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">
                    {formatProduction(proposal.premium.yearlyProduction)} kWh/year
                  </p>
                  <p className="text-gray-500 text-sm">
                    Enhanced Production Capacity
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">Premium Protection Package</p>
                  <p className="text-gray-500 text-sm">
                    Includes Critter Guard and Solar Edge Trim
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">Extended Warranty</p>
                  <p className="text-gray-500 text-sm">
                    30-year comprehensive coverage
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                    ✓
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">Priority Service</p>
                  <p className="text-gray-500 text-sm">
                    24/7 monitoring and premium support
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => handlePackageSelect('premium')}
              className={`w-full py-3 px-6 rounded-lg text-center font-medium transition-colors
                ${selectedPackage === 'premium'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                }`}
            >
              Select Premium Package
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 