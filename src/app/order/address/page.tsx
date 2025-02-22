'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleMapsScript } from '@/components/GoogleMapsScript'
import React from 'react'
import { ChevronLeft, Info } from 'lucide-react'
import { NC_UTILITY_PROVIDERS, type UtilityProvider } from '@/lib/utility-providers'
import { setCookie } from '@/lib/cookies'

declare global {
  interface Window {
    initializeAutocomplete: () => void;
    google: any;
  }
}

// Debounce function to limit API calls
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default function AddressPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [selectedUtility, setSelectedUtility] = useState<UtilityProvider | null>(null)
  const [error, setError] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const autocompleteRef = useRef<any>(null)
  const sessionTokenRef = useRef<any>(null)
  const initializationAttempted = useRef(false)

  const createSessionToken = () => {
    if (window.google?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }
  }

  const initAutocomplete = () => {
    try {
      // Prevent multiple initialization attempts
      if (initializationAttempted.current) {
        console.log('Initialization already attempted')
        return
      }
      initializationAttempted.current = true

      console.log('Initializing autocomplete...')
      const input = document.getElementById('address') as HTMLInputElement
      if (!input) {
        console.error('Address input element not found')
        return
      }

      if (!window.google?.maps?.places) {
        console.error('Google Maps Places API not loaded')
        return
      }

      // Clean up existing autocomplete instance if it exists
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }

      // Create a new session token
      createSessionToken()

      // Create the autocomplete instance with optimized options
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry'],
        types: ['address'],
        sessionToken: sessionTokenRef.current
      })

      // Store the instance in ref
      autocompleteRef.current = autocomplete

      // Handle place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        console.log('Selected place:', place)

        if (place.formatted_address) {
          setAddress(place.formatted_address)
          setIsValidAddress(true)
          setError('')
          // Create a new session token for the next search
          createSessionToken()
        } else {
          setIsValidAddress(false)
          setError('Please select a valid address from the suggestions')
        }
      })

      // Add error handling for quota limits
      const errorListener = autocomplete.addListener('place_changed_failed', () => {
        console.error('Place selection failed')
        setError('Unable to process address selection. Please try again.')
      })

      setIsScriptLoaded(true)
      console.log('Autocomplete initialized successfully')
    } catch (err) {
      console.error('Error initializing autocomplete:', err)
      if (err instanceof Error && err.message.includes('quota')) {
        setError('Address lookup service is temporarily unavailable. Please try again later.')
      } else {
        setError('Error initializing address lookup')
      }
    }
  }

  useEffect(() => {
    // Reset initialization flag when component mounts
    initializationAttempted.current = false
    setIsScriptLoaded(false)

    // Listen for the Google Maps script load event
    const handleGoogleMapsLoaded = () => {
      console.log('Google Maps loaded event received in AddressPage')
      // Ensure we're not already initialized
      if (!initializationAttempted.current) {
        setIsScriptLoaded(true)
        initAutocomplete()
      }
    }

    window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded)

    // If Google Maps is already loaded, initialize immediately
    if (window.google?.maps?.places) {
      console.log('Google Maps already loaded in AddressPage, initializing immediately')
      setIsScriptLoaded(true)
      initAutocomplete()
    }

    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded)
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
      if (sessionTokenRef.current) {
        sessionTokenRef.current = null
      }
      // Reset initialization flag on cleanup
      initializationAttempted.current = false
      setIsScriptLoaded(false)
    }
  }, [])

  // Debounced input change handler
  const debouncedHandleInputChange = debounce((value: string) => {
    setAddress(value)
    setIsValidAddress(false)
    setError('')
  }, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleInputChange(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidAddress) {
      setError('Please select a valid address from the suggestions')
      return
    }

    if (!address.trim()) {
      setError('Please enter your address')
      return
    }

    if (!selectedUtility) {
      setError('Please select your utility provider')
      return
    }

    try {
      localStorage.setItem('address', address)
      localStorage.setItem('selectedUtility', JSON.stringify(selectedUtility))

      setCookie('address', address)
      setCookie('selectedUtility', JSON.stringify(selectedUtility))

      router.push('/order/loading?next=packages')
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while processing your information')
    }
  }

  return (
    <>
      <GoogleMapsScript />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
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

              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Home Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={handleInputChange}
                    placeholder={!isScriptLoaded ? "Loading address lookup..." : "Start typing your address"}
                    className={`w-full px-4 py-3 rounded-lg border ${isValidAddress ? 'border-green-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500 ${!isScriptLoaded ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      }`}
                    required
                    autoComplete="off"
                    disabled={!isScriptLoaded}
                  />
                  {!isScriptLoaded && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  {isScriptLoaded && !isValidAddress && address && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Info className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
                {isScriptLoaded && !isValidAddress && address && (
                  <p className="mt-2 text-sm text-gray-500">
                    Please select an address from the suggestions
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="utility" className="block text-sm font-medium text-gray-700 mb-2">
                  Utility Provider
                </label>
                <select
                  id="utility"
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
                className={`w-full py-2 px-4 rounded-md ${isValidAddress
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                disabled={!isValidAddress}
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
} 