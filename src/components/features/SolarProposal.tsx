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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatProduction = (kwh: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(kwh)
  }

  const handlePackageSelect = (packageType: 'standard' | 'premium') => {
    setSelectedPackage(packageType)
    onSelect(packageType)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Standard Package */}
      <div
        className={`bg-white rounded-2xl shadow-sm p-8 border-2 transition-colors ${
          selectedPackage === 'standard' ? 'border-black' : 'border-transparent'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Standard</h2>
          <Shield className="h-6 w-6 text-blue-600" />
        </div>

        <div className="mb-6">
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(proposal.standard.totalPrice * 0.7)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <span className="line-through">{formatCurrency(proposal.standard.totalPrice)}</span>
            {' '}after 30% tax credit
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">System Size</p>
            <p className="text-lg font-semibold">{proposal.standard.systemSize.toFixed(2)} kW</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Number of Panels</p>
            <p className="text-lg font-semibold">{proposal.standard.numberOfPanels} panels</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monthly Production</p>
            <p className="text-lg font-semibold">{formatProduction(proposal.standard.monthlyProduction)} kWh</p>
          </div>
        </div>

        <button
          onClick={() => handlePackageSelect('standard')}
          className={`w-full rounded-lg px-4 py-3 text-sm font-semibold mb-6 ${
            selectedPackage === 'standard'
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Select Standard Package
        </button>

        <ul className="space-y-4">
          {FEATURES.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.standard ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 flex-shrink-0" />
              )}
              <div>
                <p className="text-gray-700">{feature.name}</p>
                {feature.description && feature.standard && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {feature.description.split('|')[0].trim()}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Premium Package */}
      <div
        className={`bg-white rounded-2xl shadow-sm p-8 border-2 transition-colors ${
          selectedPackage === 'premium' ? 'border-black' : 'border-transparent'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Premium</h2>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(proposal.premium.totalPrice * 0.7)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <span className="line-through">{formatCurrency(proposal.premium.totalPrice)}</span>
            {' '}after 30% tax credit
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">System Size</p>
            <p className="text-lg font-semibold">{proposal.premium.systemSize.toFixed(2)} kW</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Number of Panels</p>
            <p className="text-lg font-semibold">{proposal.premium.numberOfPanels} panels</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monthly Production</p>
            <p className="text-lg font-semibold">{formatProduction(proposal.premium.monthlyProduction)} kWh</p>
          </div>
        </div>

        <button
          onClick={() => handlePackageSelect('premium')}
          className={`w-full rounded-lg px-4 py-3 text-sm font-semibold mb-6 ${
            selectedPackage === 'premium'
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Select Premium Package
        </button>

        <ul className="space-y-4">
          {FEATURES.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.premium ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 flex-shrink-0" />
              )}
              <div>
                <p className="text-gray-700">{feature.name}</p>
                {feature.description && feature.premium && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {feature.description.includes('|')
                      ? feature.description.split('|')[1].trim()
                      : feature.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 