'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Shield, Zap, Clock, Check, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface PackageFeature {
  name: string
  standard: boolean
  premium: boolean
  description?: string
}

const FEATURES: PackageFeature[] = [
  {
    name: 'High-Quality Solar Panels',
    standard: true,
    premium: true,
    description: 'Standard: Tier 1 panels | Premium: High-efficiency premium panels'
  },
  {
    name: 'System Design & Engineering',
    standard: true,
    premium: true
  },
  {
    name: 'Professional Installation',
    standard: true,
    premium: true
  },
  {
    name: '90%+ Energy Offset',
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

export default function PackagesPage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'premium' | null>(null)
  const [systemPrice, setSystemPrice] = useState<{
    standard: number
    premium: number
  }>({ standard: 0, premium: 0 })
  const [yearlyUsage, setYearlyUsage] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get stored monthly bill and utility provider
    const monthlyBill = localStorage.getItem('monthlyBill')
    const utilityProvider = localStorage.getItem('utilityProvider')

    if (!monthlyBill || !utilityProvider) {
      setError('Missing required information. Please start over.')
      return
    }

    try {
      const yearlyBill = parseFloat(monthlyBill) * 12
      const provider = JSON.parse(utilityProvider)
      const rate = provider.rates.residential.basic.energy
      
      // Calculate yearly kWh usage
      const yearlyKwh = yearlyBill / rate
      setYearlyUsage(Math.round(yearlyKwh))

      // Calculate system prices
      const basePrice = yearlyKwh * 2.20
      setSystemPrice({
        standard: basePrice,
        premium: basePrice * 1.25 // 25% premium for premium package
      })
    } catch (err) {
      setError('Error calculating system price. Please try again.')
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleContinue = () => {
    if (!selectedPackage) {
      setError('Please select a package to continue')
      return
    }

    // Store selected package and price
    localStorage.setItem('selectedPackage', JSON.stringify({
      type: selectedPackage,
      price: systemPrice[selectedPackage],
      yearlyUsage
    }))

    router.push('/order/proposal')
  }

  const handleBack = () => {
    router.back()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-24 lg:pt-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
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

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Choose Your Solar Package
          </h1>
          <p className="text-lg text-secondary-text">
            Based on your {formatCurrency(yearlyUsage)} kWh yearly usage
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Standard Package */}
          <div className={`bg-white rounded-2xl shadow-sm p-8 border-2 transition-colors ${
            selectedPackage === 'standard' ? 'border-black' : 'border-transparent'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Standard</h2>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">
                {formatCurrency(systemPrice.standard * 0.7)}
              </p>
              <p className="text-sm text-secondary-text mt-1">
                <span className="line-through">{formatCurrency(systemPrice.standard)}</span>
                {' '}after 30% tax credit
              </p>
            </div>

            <button
              onClick={() => setSelectedPackage('standard')}
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
          <div className={`bg-white rounded-2xl shadow-sm p-8 border-2 transition-colors ${
            selectedPackage === 'premium' ? 'border-black' : 'border-transparent'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Premium</h2>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">
                {formatCurrency(systemPrice.premium * 0.7)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="line-through">{formatCurrency(systemPrice.premium)}</span>
                {' '}after 30% tax credit
              </p>
            </div>

            <button
              onClick={() => setSelectedPackage('premium')}
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

        <div className="max-w-5xl mx-auto mt-8">
          <button
            onClick={handleContinue}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedPackage}
          >
            Continue with {selectedPackage ? selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1) : ''} Package
          </button>
        </div>
      </div>
    </div>
  )
} 