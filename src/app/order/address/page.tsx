'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapboxScript } from '@/components/MapboxScript'
import MapboxAddressInput from '@/components/MapboxAddressInput'
import React from 'react'
import { ChevronLeft, Info, Zap, Building, MapPin, DollarSign } from 'lucide-react'
import { NC_UTILITY_PROVIDERS, type UtilityProvider } from '@/lib/utility-providers'
import { setCookie } from '@/lib/cookies'

declare global {
  interface Window {
    mapboxgl: any;
    MapboxGeocoder: any;
  }
}


export default function AddressPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [selectedUtility, setSelectedUtility] = useState<UtilityProvider | null>(null)
  const [error, setError] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress)
    setError('')
    // Reset validation when typing
    if (isValidAddress) {
      setIsValidAddress(false)
    }
  }

  const handleAddressSelect = (place: any) => {
    console.log('Selected place:', place)
    setAddress(place.formatted_address)
    setIsValidAddress(true)
    setError('')
  }

  const handleValidationChange = (isValid: boolean) => {
    setIsValidAddress(isValid)
  }

  useEffect(() => {
    // Load saved address from localStorage if available
    const savedAddress = localStorage.getItem('address')
    if (savedAddress) {
      setAddress(savedAddress)
      setIsValidAddress(true)
    }
  }, [])

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
      <MapboxScript />
      <div className="min-h-screen" style={{ backgroundColor: '#ECECEC' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors mb-8 rounded-full px-4 py-2 hover:bg-sky-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          {/* Progress indicator */}
          <div className="mb-8 max-w-2xl mx-auto">
            {/* Desktop progress indicator */}
            <div className="hidden sm:block">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">Progress</div>
                <div className="text-xs text-gray-500">Step 1 of 2</div>
              </div>
              <div className="h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Mobile progress indicator */}
            <div className="sm:hidden">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">Progress</div>
                <div className="text-xs text-gray-500">Step 1 of 2</div>
              </div>
              <div className="h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enter Your Home Address
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto animate-slide-up">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start animate-fade-in">
                  <div className="mr-3 flex-shrink-0 pt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>{error}</div>
                </div>
              )}

              {/* Two Column Layout for Desktop, Single Column for Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
                {/* Form Inputs Section - Column 1 */}
                <div className="flex flex-col items-start gap-8 w-full">
                  {/* Address Input Section */}
                  <div className="flex flex-col items-start gap-6 w-full">
                    {/* Header Section */}
                    <div className="flex flex-col items-start gap-3 w-full">
                      <h2 className="w-full font-inter font-semibold text-base leading-6 text-[#424242]">
                        Let's confirm your home address.
                      </h2>
                      <p className="w-full font-inter font-medium text-base leading-6 text-[#6D6F72]">
                        We use your address to locate your home via aerial imagery and determine the total usable space on your roof.
                      </p>
                    </div>
                    
                    {/* Input Section */}
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1">
                        <MapboxAddressInput
                          id="address"
                          value={address}
                          onChange={handleAddressChange}
                          onSelect={handleAddressSelect}
                          onValidationChange={handleValidationChange}
                          placeholder="Enter your home address"
                          className="flex justify-center items-center px-3 py-4 gap-2 w-full h-11 bg-[#F5F5F5] rounded-lg border-none font-inter font-medium text-base leading-6 text-[#6D6F72] placeholder:text-[#6D6F72] focus:outline-none focus:ring-0"
                        />
                      </div>
                      {isValidAddress && (
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Utility Provider Section */}
                  <div className="flex flex-col items-start gap-6 w-full">
                    {/* Header Section */}
                    <div className="flex flex-col items-start gap-3 w-full">
                      <h2 className="w-full font-inter font-semibold text-base leading-6 text-[#424242]">
                        Select your utility provider.
                      </h2>
                      
                    </div>
                    
                    {/* Select Section */}
                    <div className="relative w-full z-[9998]">
                      <select
                        id="utility"
                        value={selectedUtility?.name || ''}
                        onChange={(e) => {
                          const provider = NC_UTILITY_PROVIDERS.find(p => p.name === e.target.value)
                          setSelectedUtility(provider || null)
                        }}
                        className={`w-full h-11 px-3 py-2 bg-[#F5F5F5] rounded-lg border-none font-inter font-medium text-base focus:outline-none focus:ring-0 cursor-pointer ${
                          selectedUtility?.name ? 'text-[#424242]' : 'text-[#6D6F72]'
                        }`}
                        style={{ 
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage: 'none',
                          backgroundRepeat: 'no-repeat',
                          paddingRight: '2.5rem'
                        }}
                        required
                      >
                        <option value="" disabled className="text-[#6D6F72]">Select your utility provider</option>
                        {NC_UTILITY_PROVIDERS.map((provider) => (
                          <option key={provider.name} value={provider.name} className="text-[#424242]">
                            {provider.name}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#6D6F72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Selected Utility Info */}
                    {selectedUtility && (
                      <div className="w-full p-4 bg-[#F5F5F5] rounded-lg">
                        <div className="space-y-2">
                          <p className="font-inter font-medium text-sm text-[#424242]">
                            <span className="font-semibold">Rate:</span> {typeof selectedUtility.residentialRate === 'number'
                              ? `$${selectedUtility.residentialRate.toFixed(3)}/kWh`
                              : `$${selectedUtility.residentialRate.min.toFixed(3)} - $${selectedUtility.residentialRate.max.toFixed(3)}/kWh`}
                          </p>
                          <p className="font-inter font-medium text-xs text-[#6D6F72]">{selectedUtility.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hero Image Section - Column 2 */}
                <div className="hidden lg:flex flex-col items-center justify-between h-full">
                  <div className="relative w-full max-w-lg">
                    <img
                      src="/images/herosection/mansolarhome.png"
                      alt="Man with solar panels on his home"
                      className="w-full h-auto object-cover rounded-2xl shadow-lg"
                    />
                  </div>
                  
                  {/* Continue Button - Desktop Only - Aligned with utility dropdown */}
                  <div className="w-full max-w-lg flex justify-center mt-auto">
                    <button
                      type="submit"
                      className={`w-full py-3 px-6 rounded-xl font-medium text-base transition-all duration-300 animate-fade-in animation-delay-300 ${isValidAddress
                        ? 'bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg transform hover:-translate-y-1'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      disabled={!isValidAddress}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue Button - Mobile Only */}
              <button
                type="submit"
                className={`lg:hidden w-full py-3 px-4 rounded-xl font-medium text-base transition-all duration-300 animate-fade-in animation-delay-300 ${isValidAddress
                  ? 'bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg transform hover:-translate-y-1'
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