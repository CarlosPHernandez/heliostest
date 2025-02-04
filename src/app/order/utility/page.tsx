'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Zap, Building2, AlertCircle, Info, CheckCircle } from 'lucide-react'

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
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-center mb-2">
              Select Your Utility Provider
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Please confirm your utility provider for accurate savings calculations.
            </p>

            {addressData ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Selected Address:
                  </p>
                  <p className="font-medium text-gray-900">
                    {addressData.formatted_address}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4">
                    {getAllProviders().map((provider) => (
                      <div key={provider.id} className="space-y-3">
                        <label
                          className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                            ${selectedProvider === provider.id ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}
                        >
                          <input
                            type="radio"
                            name="utility"
                            value={provider.id}
                            checked={selectedProvider === provider.id}
                            onChange={(e) => {
                              setSelectedProvider(e.target.value)
                              setError('')
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Zap className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{provider.name}</p>
                                <p className="text-sm text-gray-500">
                                  Service areas: {provider.serviceAreas.join(', ')}
                                </p>
                              </div>
                            </div>
                            {recommendedProvider === provider.id && (
                              <div className="flex items-center text-green-600 text-sm font-medium">
                                <CheckCircle className="h-5 w-5 mr-1" />
                                Recommended
                              </div>
                            )}
                          </div>
                        </label>
                        
                        <button
                          onClick={() => setShowRates(showRates === provider.id ? null : provider.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-4"
                        >
                          <Info className="h-4 w-4" />
                          {showRates === provider.id ? 'Hide rates' : 'View rates'}
                        </button>

                        {showRates === provider.id && (
                          <div className="ml-4 p-4 bg-gray-50 rounded-lg text-sm">
                            <h4 className="font-medium text-gray-900 mb-3">Current Rates:</h4>
                            {Object.entries(provider.rates.residential).map(([key, rate]: [string, any]) => (
                              <div key={key} className="mb-4 last:mb-0">
                                <p className="font-medium text-gray-800 mb-2">{rate.name}</p>
                                <ul className="space-y-1 text-gray-600">
                                  <li>• Basic Facilities Charge: {formatCurrency(rate.facilities)}/month</li>
                                  {rate.energy && (
                                    <li>• Energy Charge: {formatCurrency(rate.energy)}/kWh</li>
                                  )}
                                  {rate.peak && (
                                    <>
                                      <li>• Peak Rate: {formatCurrency(rate.peak)}/kWh</li>
                                      <li>• Off-Peak Rate: {formatCurrency(rate.offPeak)}/kWh</li>
                                    </>
                                  )}
                                  <li className="text-xs text-gray-500 mt-2">{rate.details}</li>
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleContinue}
                    className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Address Not Found
                </h3>
                <p className="text-gray-600">
                  Please go back and enter your address to see available utility providers.
                </p>
                <button
                  onClick={handleBack}
                  className="mt-6 inline-flex items-center text-sm font-medium text-black hover:text-gray-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Address Input
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 