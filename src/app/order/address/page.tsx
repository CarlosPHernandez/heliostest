'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Info } from 'lucide-react'
import Script from 'next/script'
import { calculateSolarProposal, NC_CONFIG } from '@/lib/solar-calculations'
import { NC_UTILITY_PROVIDERS, UtilityProvider, getUtilityRate } from '@/lib/utility-providers'

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              componentRestrictions?: { country: string }
              fields?: string[]
              types?: string[]
            }
          ) => any
        }
      }
    }
  }
}

export default function AddressPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [selectedUtility, setSelectedUtility] = useState<UtilityProvider | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate inputs
    if (!address || !selectedUtility) {
      setError('Please fill in all required fields')
      return
    }

    try {
      // Get the monthly bill from localStorage
      const monthlyBill = localStorage.getItem('monthlyBill')
      if (!monthlyBill) {
        setError('Monthly bill information not found')
        return
      }

      // Get the utility rate for the selected provider
      const utilityRate = getUtilityRate(selectedUtility)

      // Calculate solar proposal with the correct utility rate
      const config = {
        ...NC_CONFIG,
        utilityRate
      }
      const proposal = calculateSolarProposal(Number(monthlyBill), config)
      
      // Store data in localStorage
      localStorage.setItem('address', address)
      localStorage.setItem('selectedUtility', JSON.stringify(selectedUtility))
      localStorage.setItem('solarProposal', JSON.stringify(proposal))
      
      // Navigate to packages page
      router.push('/order/packages')
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while processing your information')
    }
  }

  const initAutocomplete = () => {
    const input = document.getElementById('address') as HTMLInputElement
    if (!input) return

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address'],
      types: ['address']
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        setAddress(place.formatted_address)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={initAutocomplete}
      />

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
          <h1 className="text-3xl font-bold text-secondary-text mb-4">
            Let's Get Started
          </h1>
          <p className="text-secondary-text max-w-2xl mx-auto">
            Please provide your address and utility information so we can calculate your solar savings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-background rounded-2xl p-8 border border-gray-200">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {/* Address Input */}
            <div className="mb-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Installation Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-gray-300 focus:border-gray-300"
                placeholder="Enter your address"
                required
              />
            </div>

            {/* Utility Provider Selection */}
            <div className="mb-6">
              <label htmlFor="utility" className="block text-sm font-medium text-gray-700 mb-2">
                Utility Provider
              </label>
              <select
                id="utility"
                name="utility"
                value={selectedUtility?.name || ''}
                onChange={(e) => {
                  const provider = NC_UTILITY_PROVIDERS.find(p => p.name === e.target.value)
                  setSelectedUtility(provider || null)
                }}
                className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-gray-300 focus:border-gray-300"
                required
              >
                <option value="">Select your utility provider</option>
                {NC_UTILITY_PROVIDERS.map((provider) => (
                  <option key={provider.name} value={provider.name}>
                    {provider.name}
                  </option>
                ))}
              </select>
              {selectedUtility && (
                <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>Service Area: {selectedUtility.serviceArea}</p>
                    <p>Rate: {typeof selectedUtility.residentialRate === 'number' 
                      ? `$${selectedUtility.residentialRate.toFixed(3)}/kWh`
                      : `$${selectedUtility.residentialRate.min.toFixed(3)} - $${selectedUtility.residentialRate.max.toFixed(3)}/kWh`}
                    </p>
                    <p className="text-xs mt-1">{selectedUtility.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 