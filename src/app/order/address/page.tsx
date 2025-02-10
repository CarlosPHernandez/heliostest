'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Info, Check } from 'lucide-react'
import Script from 'next/script'
import { NC_CONFIG } from '@/lib/solar-calculations'
import { NC_UTILITY_PROVIDERS, type UtilityProvider } from '@/lib/utility-providers'
import { setCookie } from '@/lib/cookies'

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}

export default function AddressPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [selectedUtility, setSelectedUtility] = useState<UtilityProvider | null>(null)
  const [error, setError] = useState('')
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [isValidAddress, setIsValidAddress] = useState(false)

  // Initialize Google Maps autocomplete
  useEffect(() => {
    // Define the initialization function
    const initializeAutocomplete = () => {
      const input = document.getElementById('address') as HTMLInputElement
      if (!input) return

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address'],
          types: ['address']
        })

        // Reset validation when user types
        input.addEventListener('input', () => {
          setIsValidAddress(false)
          setError('')
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            setAddress(place.formatted_address)
            setIsValidAddress(true)
            setError('')
          } else {
            setIsValidAddress(false)
            setError('Please select a valid address from the suggestions')
          }
        })

        // Mark input as having autocomplete initialized
        input.setAttribute('data-autocomplete', 'true')
      } catch (err) {
        console.error('Error initializing autocomplete:', err)
      }
    }

    // Set up the global callback
    if (typeof window !== 'undefined') {
      window.initAutocomplete = () => {
        initializeAutocomplete()
        setIsGoogleLoaded(true)
      }
    }

    // Clean up function
    return () => {
      if (typeof window !== 'undefined') {
        const input = document.getElementById('address') as HTMLInputElement
        if (input && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(input)
        }
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate address
    if (!isValidAddress) {
      setError('Please select a valid address from the suggestions')
      return
    }

    // Validate inputs
    if (!address.trim()) {
      setError('Please enter your address')
      return
    }

    if (!selectedUtility) {
      setError('Please select your utility provider')
      return
    }

    try {
      // Store data in localStorage and cookies
      localStorage.setItem('address', address)
      localStorage.setItem('selectedUtility', JSON.stringify(selectedUtility))
      
      setCookie('address', address)
      setCookie('selectedUtility', JSON.stringify(selectedUtility))

      // Show loading screen
      router.push('/order/loading?next=packages')
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while processing your information')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initAutocomplete`}
        strategy="afterInteractive"
        onError={(e) => {
          console.error('Error loading Google Maps:', e)
          setError('Error loading address lookup. Please try again later.')
        }}
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
            Enter Your Home Address
          </h1>
          <p className="text-secondary-text max-w-2xl mx-auto">
            We use your address to locate your home via aerial imagery and determine the total usable space on your roof.
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
                Home Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Start typing your address"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isValidAddress ? 'border-green-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500`}
                  required
                  disabled={!isGoogleLoaded}
                />
                {isValidAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {!isGoogleLoaded && (
                <p className="mt-2 text-sm text-gray-500">Loading address lookup...</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Please select an address from the suggestions that appear as you type
              </p>
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