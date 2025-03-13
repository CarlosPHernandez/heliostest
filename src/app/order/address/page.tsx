'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleMapsScript } from '@/components/GoogleMapsScript'
import React from 'react'
import { ChevronLeft, Info, Zap, Building, MapPin, DollarSign } from 'lucide-react'
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

      // Performance optimization - reduce network requests
      autocomplete.setOptions({
        debounce: 300 // Minimum time between network requests
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

  // Add custom styling to Google Maps autocomplete dropdown
  useEffect(() => {
    // Function to apply custom styles to the autocomplete dropdown
    const applyCustomStyles = () => {
      // Target the Google Maps autocomplete container
      const pacContainers = document.querySelectorAll('.pac-container');

      pacContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          // Apply custom styling to match our form aesthetic
          container.style.borderRadius = '0.75rem';
          container.style.marginTop = '4px';
          container.style.border = '1px solid #e5e7eb';
          container.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          container.style.fontFamily = 'inherit';
          container.style.zIndex = '9999';

          // Add a custom class for additional styling
          container.classList.add('custom-pac-container');
        }
      });

      // Create and inject custom CSS for deeper styling
      const styleId = 'custom-pac-styles';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          .pac-container {
            border-radius: 0.75rem !important;
            font-family: inherit !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            border: 1px solid #e5e7eb !important;
            padding: 0.5rem 0 !important;
            margin-top: 4px !important;
            background-color: white !important;
          }
          .pac-item {
            padding: 0.5rem 1rem !important;
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease !important;
          }
          .pac-item:hover {
            background-color: #f3f9fd !important;
          }
          .pac-item-selected, .pac-item-selected:hover {
            background-color: #e0f2fe !important;
          }
          .pac-icon {
            margin-right: 0.75rem !important;
          }
          .pac-item-query {
            font-size: 0.875rem !important;
            color: #111827 !important;
            font-weight: 500 !important;
          }
          .pac-matched {
            font-weight: 600 !important;
            color: #0369a1 !important;
          }
          .pac-item-context {
            font-size: 0.75rem !important;
            color: #6b7280 !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    };

    // Apply styles when the dropdown appears
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node instanceof HTMLElement && node.classList.contains('pac-container')) {
              applyCustomStyles();
              break;
            }
          }
        }
      });
    });

    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Apply styles immediately if containers already exist
    applyCustomStyles();

    // Cleanup
    return () => {
      observer.disconnect();
      const styleEl = document.getElementById('custom-pac-styles');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [isScriptLoaded]);

  // Debounced input change handler
  const debouncedHandleInputChange = debounce((value: string) => {
    setIsValidAddress(false)
    setError('')
  }, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the input value immediately for responsive typing
    setAddress(e.target.value)
    // Only debounce the validation state changes
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
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
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
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Mobile progress indicator */}
            <div className="sm:hidden">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">Progress</div>
                <div className="text-xs text-gray-500">Step 1 of 2</div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enter Your Home Address
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Finding your ideal solar setup starts with your address.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-slide-up">
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

              <div className="mb-8 transition-all duration-300 ease-in-out animate-fade-in animation-delay-100">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Home Address <span className="text-red-500">*</span>
                </label>
                <div className="relative transform transition-all duration-300 hover:translate-y-[-2px]">
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={handleInputChange}
                    placeholder={!isScriptLoaded ? "Loading address lookup..." : "Start typing your address"}
                    className={`w-full px-4 pr-10 py-3 rounded-xl border ${isValidAddress ? 'border-green-500 bg-green-50/30' : 'border-gray-300'
                      } focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder:text-gray-500 ${!isScriptLoaded ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      } shadow-sm transition-all duration-200 hover:border-sky-300 focus:shadow-md`}
                    required
                    autoComplete="off"
                    disabled={!isScriptLoaded}
                  />
                  {!isScriptLoaded && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
                    </div>
                  )}
                  {isScriptLoaded && !isValidAddress && address && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Info className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  {isScriptLoaded && isValidAddress && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-fade-in">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {isScriptLoaded && !isValidAddress && address && (
                  <p className="mt-2 text-sm text-gray-500 flex items-center animate-fade-in">
                    <Info className="h-4 w-4 mr-1 text-gray-400" />
                    Please select an address from the suggestions
                  </p>
                )}
                {isScriptLoaded && isValidAddress && (
                  <p className="mt-2 text-sm text-green-600 flex items-center animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Address verified
                  </p>
                )}
              </div>

              <div className="mb-8 transition-all duration-300 ease-in-out animate-fade-in animation-delay-200">
                <label htmlFor="utility" className="block text-sm font-medium text-gray-700 mb-2">
                  Utility Provider <span className="text-red-500">*</span>
                </label>
                <div className="relative transform transition-all duration-300 hover:translate-y-[-2px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Zap className={`h-5 w-5 ${selectedUtility ? 'text-sky-600' : 'text-gray-400'} transition-colors duration-200`} />
                  </div>
                  <select
                    id="utility"
                    value={selectedUtility?.name || ''}
                    onChange={(e) => {
                      const provider = NC_UTILITY_PROVIDERS.find(p => p.name === e.target.value)
                      setSelectedUtility(provider || null)
                    }}
                    className={`block w-full pl-10 pr-10 py-3 bg-white border ${selectedUtility ? 'border-sky-500 bg-sky-50/20' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm appearance-none transition-all duration-200 hover:border-sky-300 focus:shadow-md`}
                    required
                  >
                    <option value="">Select your utility provider</option>
                    {NC_UTILITY_PROVIDERS.map((provider) => (
                      <option key={provider.name} value={provider.name}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUtility && (
                  <div className="mt-4 p-5 bg-sky-50 rounded-xl border border-sky-100 animate-fade-in shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Rate:</span> {typeof selectedUtility.residentialRate === 'number'
                            ? `$${selectedUtility.residentialRate.toFixed(3)}/kWh`
                            : `$${selectedUtility.residentialRate.min.toFixed(3)} - $${selectedUtility.residentialRate.max.toFixed(3)}/kWh`}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500 italic">{selectedUtility.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-medium text-base transition-all duration-300 animate-fade-in animation-delay-300 ${isValidAddress
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