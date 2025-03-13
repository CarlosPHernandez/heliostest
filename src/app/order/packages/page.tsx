'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { SolarProposal } from '@/components/features/SolarProposal'
import { setCookie } from '@/lib/cookies'

export default function PackagesPage() {
  const router = useRouter()
  const [proposal, setProposal] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load the solar proposal from localStorage
    const storedProposal = localStorage.getItem('solarProposal')
    if (!storedProposal) {
      setError('No proposal data found')
      return
    }

    try {
      const parsedProposal = JSON.parse(storedProposal)
      setProposal(parsedProposal)
    } catch (err) {
      console.error('Error parsing proposal:', err)
      setError('Error loading proposal data')
    }
  }, [])

  const handlePackageSelect = (packageType: 'standard' | 'premium') => {
    try {
      // Store the complete package information
      const selectedPackageData = packageType === 'standard' ? proposal.standard : proposal.premium

      // Store in localStorage
      localStorage.setItem('selectedPackage', packageType)
      localStorage.setItem('selectedPackageData', JSON.stringify(selectedPackageData))

      // Store in cookies
      setCookie('selectedPackage', packageType)
      setCookie('selectedPackageData', JSON.stringify(selectedPackageData))

      // Navigate to the next step
      router.push('/order/proposal')
    } catch (err) {
      console.error('Error saving package selection:', err)
      setError('Failed to save your package selection')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 animate-fade-in">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
              <div className="mr-3 flex-shrink-0 pt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>{error}</div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors rounded-full px-4 py-2 hover:bg-sky-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <p className="ml-3 text-gray-600">Loading proposal...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors mb-8 rounded-full px-4 py-2 hover:bg-sky-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Solar Package
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Compare our packages and select the perfect solar solution for your home.
          </p>
        </div>

        <div className="animate-slide-up">
          <SolarProposal
            proposal={proposal}
            onSelect={handlePackageSelect}
          />
        </div>
      </div>
    </div>
  )
} 