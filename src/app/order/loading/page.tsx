'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calculateSolarProposal, NC_CONFIG } from '@/lib/solar-calculations'
import { getUtilityRate } from '@/lib/utility-providers'
import { Sun } from 'lucide-react'

const loadingSteps = [
  "Analyzing your roof dimensions...",
  "Calculating solar exposure...",
  "Determining optimal panel layout...",
  "Estimating energy production...",
  "Generating your custom packages..."
]

function LoadingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')
  const nextPage = searchParams.get('next') || 'packages'

  useEffect(() => {
    let stepInterval: NodeJS.Timeout
    let mounted = true

    const processData = async () => {
      try {
        // Get required data from localStorage
        const address = localStorage.getItem('address')
        const selectedUtility = localStorage.getItem('selectedUtility')
        const monthlyBill = localStorage.getItem('monthlyBill')

        if (!address || !selectedUtility || !monthlyBill) {
          throw new Error('Missing required information')
        }

        const utilityProvider = JSON.parse(selectedUtility)
        const utilityRate = getUtilityRate(utilityProvider)

        // Calculate solar proposal
        const config = {
          ...NC_CONFIG,
          utilityRate
        }
        const proposal = calculateSolarProposal(Number(monthlyBill), config)

        // Store data in localStorage
        localStorage.setItem('address', address)
        localStorage.setItem('selectedUtility', JSON.stringify(utilityProvider))
        localStorage.setItem('solarProposal', JSON.stringify(proposal))

        // Add a minimum loading time of 4 seconds
        await new Promise(resolve => setTimeout(resolve, 4000))

        if (mounted) {
          router.push(`/order/${nextPage}`)
        }
      } catch (err) {
        console.error('Error:', err)
        if (mounted) {
          setError('An error occurred while processing your information')
        }
      }
    }

    // Start loading steps animation
    stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length)
    }, 1200)

    // Start data processing
    processData()

    return () => {
      mounted = false
      clearInterval(stepInterval)
    }
  }, [router, nextPage])

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
                onClick={() => router.back()}
                className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors rounded-full px-4 py-2 hover:bg-sky-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Generating Your Solar Packages
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We're calculating the perfect solar setup for your home.
          </p>
        </div>

        <div className="max-w-2xl mx-auto animate-slide-up">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <div className="flex flex-col items-center justify-center">
              {/* Modern minimalistic loading animation */}
              <div className="relative w-40 h-40 mb-8">
                {/* Central sun ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-sky-600/30"></div>
                </div>
                {/* Pulsing sun core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-sky-600/20 animate-pulse-glow"></div>
                </div>
                {/* Energy ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-2 border-sky-400/20 border-dashed animate-spin-slow"></div>
                </div>
                {/* Orbiting Earth */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full animate-orbit">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4">
                      <div className="w-full h-full rounded-full bg-sky-600 shadow-lg shadow-sky-600/50"></div>
                    </div>
                  </div>
                </div>
                {/* Energy beams */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border border-sky-400/10 animate-pulse-subtle"></div>
                </div>
              </div>

              <p className="text-lg font-medium text-gray-900 mb-8 animate-fade-in">{loadingSteps[currentStep]}</p>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 animate-pulse origin-left"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 animate-fade-in">
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full border-4 border-sky-600/30 animate-pulse"></div>
                <p className="text-lg font-medium text-gray-900 mt-8">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoadingContent />
    </Suspense>
  )
} 