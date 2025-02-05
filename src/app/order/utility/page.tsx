'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Zap, Building2, AlertCircle, Info, CheckCircle, ArrowRight } from 'lucide-react'

// North Carolina utility providers with their rate information
const UTILITY_PROVIDERS = {
  'NC': [
    {
      id: 'duke-energy',
      name: 'Duke Energy',
      logo: '/utilities/duke-energy.png',
      serviceAreas: ['Charlotte', 'Raleigh', 'Durham', 'Greensboro', 'Winston-Salem', 'Asheville'],
      rates: {
        residential: {
          basic: {
            name: 'Residential Service Rate (Schedule RS)',
            facilities: 14.63, // Monthly basic facilities charge
            energy: 0.110231, // Per kWh rate
            details: 'Standard residential rate for most customers'
          },
          timeOfUse: {
            name: 'Time-of-Use Rate (Schedule RT)',
            facilities: 17.79,
            peak: 0.145372, // Summer peak rate per kWh
            offPeak: 0.081947, // Off-peak rate per kWh
            details: 'Optional rate for customers who can shift usage to off-peak hours'
          }
        }
      }
    },
    {
      id: 'dominion-energy',
      name: 'Dominion Energy North Carolina',
      logo: '/utilities/dominion-energy.png',
      serviceAreas: ['Northeastern NC', 'Outer Banks', 'Elizabeth City', 'Roanoke Rapids'],
      rates: {
        residential: {
          basic: {
            name: 'Schedule 1 - Residential Service',
            facilities: 13.85,
            energy: 0.105873,
            details: 'Basic residential service rate'
          }
        }
      }
    },
    {
      id: 'energy-united',
      name: 'EnergyUnited',
      logo: '/utilities/energy-united.png',
      serviceAreas: ['Central NC', 'Davidson County', 'Iredell County', 'Davie County'],
      rates: {
        residential: {
          basic: {
            name: 'Residential Service',
            facilities: 15.00,
            energy: 0.114500,
            details: 'Standard residential electric service'
          }
        }
      }
    }
  ]
}

export default function UtilityPage() {
  const router = useRouter()
  const [addressData, setAddressData] = useState<any>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [error, setError] = useState('')
  const [showRates, setShowRates] = useState<string | null>(null)
  const [recommendedProvider, setRecommendedProvider] = useState<string | null>(null)

  useEffect(() => {
    // Get the stored address data
    const storedAddressData = localStorage.getItem('addressData')
    if (storedAddressData) {
      const parsedData = JSON.parse(storedAddressData)
      setAddressData(parsedData)
      
      // Find recommended provider based on city/locality
      const city = parsedData.components?.locality || ''
      const recommendedProvider = UTILITY_PROVIDERS.NC.find(provider => 
        provider.serviceAreas.some(area => 
          city.toLowerCase().includes(area.toLowerCase()) || 
          area.toLowerCase().includes(city.toLowerCase())
        )
      )
      
      if (recommendedProvider) {
        setRecommendedProvider(recommendedProvider.id)
      }
    }
  }, [])

  const getStateFromAddress = () => {
    if (!addressData?.components) return null
    const stateComponent = addressData.components.administrative_area_level_1
    return stateComponent || null
  }

  const getAllProviders = () => {
    return UTILITY_PROVIDERS.NC
  }

  const handleBack = () => {
    router.back()
  }

  const handleContinue = () => {
    if (!selectedProvider) {
      setError('Please select your utility provider')
      return
    }

    // Store the selected utility provider and its rate information
    const provider = getAllProviders().find(p => p.id === selectedProvider)
    localStorage.setItem('utilityProvider', JSON.stringify({
      id: provider?.id,
      name: provider?.name,
      rates: provider?.rates
    }))
    
    // Navigate to the packages page instead of proposal
    router.push('/order/packages')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-28">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-8">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-center mb-2">
              Select Your Utility Provider
            </h1>
            <p className="text-secondary-text text-center mb-8">
              We'll use this information to calculate your potential savings with solar.
            </p>

            <div className="space-y-6">
              <div>
                <label htmlFor="utilityProvider" className="block text-sm font-medium text-gray-700 mb-2">
                  Utility Provider
                </label>
                <div className="relative">
                  <select
                    id="utilityProvider"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
                    required
                  >
                    <option value="" className="text-gray-900">Select your utility provider</option>
                    {getAllProviders().map((provider) => (
                      <option key={provider.name} value={provider.name} className="text-gray-900">
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  {selectedProvider && (
                    <button
                      type="button"
                      onClick={() => setShowRates(showRates === selectedProvider ? null : selectedProvider)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800"
                      title="View rate information"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>

              {/* Rate Information */}
              {showRates && selectedProvider && (
                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Rate Information</h3>
                  {(() => {
                    const provider = getAllProviders().find(p => p.id === selectedProvider)
                    if (!provider) return null
                    
                    const rates = []
                    const { residential } = provider.rates
                    
                    if (residential.basic) {
                      rates.push(
                        <div key="basic" className="text-sm text-blue-800">
                          <span className="font-medium">{residential.basic.name}:</span>
                          <div className="ml-2">
                            <div>Basic Charge: {formatCurrency(residential.basic.facilities)}/month</div>
                            <div>Energy Charge: {formatCurrency(residential.basic.energy)}/kWh</div>
                          </div>
                        </div>
                      )
                    }
                    if (residential.timeOfUse) {
                      rates.push(
                        <div key="tou" className="text-sm text-blue-800 mt-2">
                          <span className="font-medium">{residential.timeOfUse.name}:</span>
                          <div className="ml-2">
                            <div>Basic Charge: {formatCurrency(residential.timeOfUse.facilities)}/month</div>
                            <div>Peak Rate: {formatCurrency(residential.timeOfUse.peak)}/kWh</div>
                            <div>Off-Peak Rate: {formatCurrency(residential.timeOfUse.offPeak)}/kWh</div>
                          </div>
                        </div>
                      )
                    }
                    return rates
                  })()}
                  <p className="text-xs text-blue-700 mt-2">
                    *Rates may vary based on season and usage
                  </p>
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={handleContinue}
                  disabled={!selectedProvider}
                  className="w-full flex justify-center items-center px-6 py-3 text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 