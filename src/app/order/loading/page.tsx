'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUtilityRate, calculateSolarProposal, NC_CONFIG } from '@/lib/solarCalculator'

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

        // Add a minimum loading time of 3.5 seconds
        await new Promise(resolve => setTimeout(resolve, 3500))

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
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-secondary-text hover:text-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* Modern minimalistic loading animation */}
          <div className="relative w-40 h-40 mb-8">
            {/* Central sun ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-blue-600/30"></div>
            </div>
            {/* Pulsing sun core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 animate-pulse-glow"></div>
            </div>
            {/* Energy ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-blue-400/20 border-dashed animate-spin-slow"></div>
            </div>
            {/* Orbiting Earth */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full animate-orbit">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4">
                  <div className="w-full h-full rounded-full bg-blue-600 shadow-lg shadow-blue-600/50"></div>
                </div>
              </div>
            </div>
            {/* Energy beams */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border border-blue-400/10 animate-pulse-subtle"></div>
            </div>
          </div>

          <p className="text-lg font-medium text-gray-900 mb-8">{loadingSteps[currentStep]}</p>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-blue-600/30 animate-pulse"></div>
            <p className="text-lg font-medium text-gray-900 mt-8">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoadingContent />
    </Suspense>
  )
} 