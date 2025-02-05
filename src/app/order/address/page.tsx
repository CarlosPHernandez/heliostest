'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Loader2, Info } from 'lucide-react'
import Script from 'next/script'

declare global {
  interface Window {
    google: any
    initAutocomplete: () => void
  }
}

interface UtilityProvider {
  id: string
  name: string
  rates: {
    residential: {
      basic: {
        name: string
        facilities: number
        energy: number
      }
      timeOfUse?: {
        name: string
        facilities: number
        peak: number
        offPeak: number
      }
    }
  }
}

export default function AddressPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [showRates, setShowRates] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [autocomplete, setAutocomplete] = useState<any>(null)

  const getAllProviders = (): UtilityProvider[] => [
    {
      id: 'fpl',
      name: 'Florida Power & Light',
      rates: {
        residential: {
          basic: {
            name: 'Standard Rate',
            facilities: 25,
            energy: 0.12
          },
          timeOfUse: {
            name: 'Time of Use Rate',
            facilities: 25,
            peak: 0.18,
            offPeak: 0.08
          }
        }
      }
    },
    {
      id: 'duke',
      name: 'Duke Energy',
      rates: {
        residential: {
          basic: {
            name: 'Standard Rate',
            facilities: 30,
            energy: 0.13
          },
          timeOfUse: {
            name: 'Time of Use Rate',
            facilities: 30,
            peak: 0.20,
            offPeak: 0.09
          }
        }
      }
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  useEffect(() => {
    // Initialize Google Places Autocomplete
    window.initAutocomplete = () => {
      if (!document.getElementById('address-input')) return

      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById('address-input') as HTMLInputElement,
        {
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'geometry', 'formatted_address'],
          types: ['address']
        }
      )

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry) {
          setError('Please select a valid address from the dropdown')
          return
        }

        // Store the selected address and coordinates
        const addressData = {
          formatted_address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          components: place.address_components.reduce((acc: any, component: any) => {
            const type = component.types[0]
            acc[type] = component.long_name
            return acc
          }, {})
        }

        localStorage.setItem('addressData', JSON.stringify(addressData))
        
        // Navigate to utility provider selection
        router.push('/order/utility')
      })

      setAutocomplete(autocomplete)
    }
  }, [router])

  const handleContinue = () => {
    if (!address || !selectedProvider) {
      setError('Please enter your address and select a utility provider')
      return
    }
    
    // Store both address and provider data
    localStorage.setItem('selectedProvider', selectedProvider)
    
    // Navigate to the next step (packages)
    router.push('/order/packages')
  }

  return (
    <div className="min-h-screen bg-[#ececec]">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initAutocomplete`}
        strategy="afterInteractive"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-28">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="bg-[#ececec] rounded-xl shadow-sm p-6 lg:p-8 border border-gray-200">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-8">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-secondary-text text-center mb-2">
              Where Would You Like Solar Panels Installed?
            </h1>
            <p className="text-secondary-text text-center mb-8">
              We'll use your address to analyze your roof's solar potential and find available incentives in your area.
            </p>

            <div className="space-y-6">
              {/* Address Input */}
              <div>
                <label htmlFor="address-input" className="block text-sm font-medium text-secondary-text mb-2">
                  Property Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="address-input"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter your address"
                    className="block w-full rounded-lg py-3 px-4 text-secondary-text ring-1 ring-inset ring-blue-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6 animate-pulse-subtle bg-white"
                    disabled={isLoading}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Utility Provider Selection */}
              <div>
                <label htmlFor="utility-provider" className="block text-sm font-medium text-secondary-text mb-2">
                  Utility Provider
                </label>
                <div className="relative">
                  <select
                    id="utility-provider"
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value)
                      setShowRates(false)
                    }}
                    className="block w-full rounded-lg py-3 px-4 text-secondary-text ring-1 ring-inset ring-blue-300 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6 animate-pulse-subtle bg-white"
                  >
                    <option value="">Select your utility provider</option>
                    {getAllProviders().map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  {selectedProvider && (
                    <button
                      type="button"
                      onClick={() => setShowRates(!showRates)}
                      className="absolute right-3 top-3 text-blue-500 hover:text-blue-600"
                      title="View rate information"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Rate Information */}
                {showRates && selectedProvider && (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-blue-100">
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
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="bg-white rounded-lg p-4 text-sm text-blue-700 border border-blue-100">
                <p className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  Start typing your address and select from the dropdown suggestions for the most accurate results.
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-black rounded-xl shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 