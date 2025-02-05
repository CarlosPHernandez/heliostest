'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Loader2, Info } from 'lucide-react'
import Script from 'next/script'
import { NC_CONFIG, calculateSolarProposal } from '@/lib/solar-calculations'

interface UtilityProvider {
  id: string
  name: string
  rates: {
    residential: {
      basic: {
        energy: number // per kWh
        fixed: number // monthly fixed charge
      }
    }
  }
}

const UTILITY_PROVIDERS: UtilityProvider[] = [
  {
    id: 'duke-energy',
    name: 'Duke Energy',
    rates: {
      residential: {
        basic: {
          energy: 0.11,
          fixed: 14
        }
      }
    }
  },
  {
    id: 'dominion-energy',
    name: 'Dominion Energy',
    rates: {
      residential: {
        basic: {
          energy: 0.12,
          fixed: 12
        }
      }
    }
  }
]

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
  const [monthlyBill, setMonthlyBill] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autocomplete, setAutocomplete] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!monthlyBill || !selectedUtility || !address) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      // Calculate solar proposal
      const proposal = calculateSolarProposal(parseFloat(monthlyBill), NC_CONFIG)

      // Store data in localStorage
      localStorage.setItem('monthlyBill', monthlyBill)
      localStorage.setItem('utilityProvider', JSON.stringify(selectedUtility))
      localStorage.setItem('address', address)
      localStorage.setItem('solarProposal', JSON.stringify(proposal))

      // Navigate to packages page
      router.push('/order/packages')
    } catch (err) {
      console.error('Error calculating proposal:', err)
      setError('Error calculating solar proposal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initAutocomplete = () => {
    if (!window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(
      document.getElementById('address-input') as HTMLInputElement,
      {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address'],
        types: ['address']
      }
    )

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        setAddress(place.formatted_address)
        setError('')
      }
    })

    setAutocomplete(autocomplete)
  }

  return (
    <div className="min-h-screen bg-[#ececec]">
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
          <div className="bg-[#ececec] rounded-2xl p-8 border border-gray-200">
            {/* Monthly Bill Input */}
            <div className="mb-6">
              <label htmlFor="monthly-bill" className="block text-sm font-medium text-gray-700 mb-2">
                Average Monthly Electric Bill
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="monthly-bill"
                  name="monthly-bill"
                  min="0"
                  step="1"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(e.target.value)}
                  className="block w-full pl-7 pr-12 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-gray-300 focus:border-gray-300"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">/month</span>
                </div>
              </div>
            </div>

            {/* Utility Provider Selection */}
            <div className="mb-6">
              <label htmlFor="utility" className="block text-sm font-medium text-gray-700 mb-2">
                Utility Provider
              </label>
              <select
                id="utility"
                name="utility"
                value={selectedUtility?.id || ''}
                onChange={(e) => {
                  const provider = UTILITY_PROVIDERS.find(p => p.id === e.target.value)
                  setSelectedUtility(provider || null)
                }}
                className="block w-full py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-gray-300 focus:border-gray-300"
              >
                <option value="">Select your provider</option>
                {UTILITY_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              {selectedUtility && (
                <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Current rate: ${selectedUtility.rates.residential.basic.energy.toFixed(2)}/kWh
                    + ${selectedUtility.rates.residential.basic.fixed}/month fixed charge
                  </p>
                </div>
              )}
            </div>

            {/* Address Input */}
            <div className="mb-6">
              <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-2">
                Property Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address-input"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full pl-10 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-gray-300 focus:border-gray-300"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-black rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Calculating...
                </>
              ) : (
                'Get Your Solar Proposal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 