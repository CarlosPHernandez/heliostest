'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Loader2 } from 'lucide-react'
import Script from 'next/script'

declare global {
  interface Window {
    google: any
    initAutocomplete: () => void
  }
}

export default function AddressPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [autocomplete, setAutocomplete] = useState<any>(null)

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

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initAutocomplete`}
        strategy="afterInteractive"
      />

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
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-center mb-2">
              Where Would You Like Solar Panels Installed?
            </h1>
            <p className="text-gray-600 text-center mb-8">
              We'll use your address to analyze your roof's solar potential and find available incentives in your area.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="block w-full rounded-lg py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                    disabled={isLoading}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                <p className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  Start typing your address and select from the dropdown suggestions for the most accurate results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 