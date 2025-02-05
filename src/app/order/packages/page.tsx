'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { SolarProposal } from '@/components/features/SolarProposal'

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
      localStorage.setItem('selectedPackage', packageType)
      localStorage.setItem('selectedPackageData', JSON.stringify(selectedPackageData))
      
      // Navigate to the next step
      router.push('/order/proposal')
    } catch (err) {
      console.error('Error saving package selection:', err)
      setError('Failed to save your package selection')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 mx-auto block text-secondary-text hover:text-gray-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-secondary-text">Loading proposal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
            Choose Your Solar Package
          </h1>
          <p className="text-secondary-text max-w-2xl mx-auto">
            Select the package that best fits your needs. Both options include professional installation, 
            warranties, and our commitment to quality.
          </p>
        </div>

        <SolarProposal 
          proposal={proposal} 
          onSelect={handlePackageSelect}
        />
      </div>
    </div>
  )
} 