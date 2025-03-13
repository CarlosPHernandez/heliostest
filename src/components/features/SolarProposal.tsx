'use client'

import { useState, useRef, useEffect } from 'react'
import { Shield, Zap, Check, ChevronLeft, ChevronRight } from 'lucide-react'

interface SolarProposalProps {
  proposal: {
    standard: {
      systemSize: number
      numberOfPanels: number
      totalPrice: number
      yearlyProduction: number
      monthlyProduction: number
    }
    premium: {
      systemSize: number
      numberOfPanels: number
      totalPrice: number
      yearlyProduction: number
      monthlyProduction: number
    }
  }
  onSelect: (packageType: 'standard' | 'premium') => void
}

const FEATURES = [
  {
    name: 'High-Quality Solar Panels',
    standard: true,
    premium: true,
    description: 'Standard: Tier 1 panels | Premium: High-efficiency premium panels'
  },
  {
    name: 'Professional Installation',
    standard: true,
    premium: true
  },
  {
    name: 'System Design & Engineering',
    standard: true,
    premium: true
  },
  {
    name: 'Permitting Process',
    standard: true,
    premium: true,
    description: 'Standard: Regular process | Premium: Expedited process'
  },
  {
    name: 'Critter Guard',
    standard: false,
    premium: true,
    description: 'Protect your system from birds and small animals'
  },
  {
    name: 'Solar Edge Skirts',
    standard: false,
    premium: true,
    description: 'Enhanced aesthetics and additional protection'
  },
  {
    name: 'Extended Protection Plan',
    standard: false,
    premium: true,
    description: 'Additional coverage beyond standard warranty'
  }
]

export function SolarProposal({ proposal, onSelect }: SolarProposalProps) {
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'premium' | null>(null)
  const [showTaxCredit, setShowTaxCredit] = useState(true)
  const [activePackage, setActivePackage] = useState<'standard' | 'premium'>('standard')
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const swipeContainerRef = useRef<HTMLDivElement>(null)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatProduction = (kwh: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(kwh)
  }

  const handlePackageSelect = (packageType: 'standard' | 'premium') => {
    setSelectedPackage(packageType)
    onSelect(packageType)
  }

  const calculatePriceWithTaxCredit = (price: number) => {
    return showTaxCredit ? price * 0.7 : price // 30% tax credit
  }

  // Handle swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isMobile) return

    const minSwipeDistance = 50
    if (touchStart - touchEnd > minSwipeDistance) {
      // Swiped left, go to premium
      setActivePackage('premium')
    }

    if (touchEnd - touchStart > minSwipeDistance) {
      // Swiped right, go to standard
      setActivePackage('standard')
    }
  }

  // Package card component to avoid duplication
  const PackageCard = ({ type }: { type: 'standard' | 'premium' }) => {
    const isStandard = type === 'standard'
    const packageData = isStandard ? proposal.standard : proposal.premium

    return (
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 hover:shadow-xl ${isMobile && type !== activePackage ? 'hidden' : ''}`}>
        {!isStandard && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
            <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-sky-600 text-white shadow-sm">
              Most Popular
            </span>
          </div>
        )}

        {/* Package title with indicator dots for mobile */}
        <div className="p-5 sm:p-6 pb-3 sm:pb-4 border-b">
          <div className="mb-1">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {isStandard ? 'Standard' : 'Premium'} Package
            </h3>
          </div>

          {isMobile && (
            <div className="flex space-x-1 mb-2">
              <div className={`h-2 w-2 rounded-full ${activePackage === 'standard' ? 'bg-sky-600' : 'bg-gray-300'}`}></div>
              <div className={`h-2 w-2 rounded-full ${activePackage === 'premium' ? 'bg-sky-600' : 'bg-gray-300'}`}></div>
            </div>
          )}

          <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
            {formatCurrency(calculatePriceWithTaxCredit(packageData.totalPrice))}
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            {showTaxCredit && <span className="text-xs sm:text-sm text-green-600 block mb-1 font-medium">*Includes 30% federal tax credit</span>}
            {isStandard
              ? 'Perfect for homeowners looking for a reliable and efficient solar solution.'
              : 'Enhanced protection and maximum efficiency for optimal performance.'}
          </p>
        </div>

        <div className="flex-1 p-5 sm:p-6">
          <ul className="space-y-3 sm:space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-sky-100 text-sky-600">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
              </div>
              <div className="ml-3">
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {packageData.numberOfPanels} {isStandard ? 'Solar' : 'High-Efficiency'} Panels
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {packageData.systemSize.toFixed(1)} kW System
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-sky-100 text-sky-600">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
              </div>
              <div className="ml-3">
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {formatProduction(packageData.yearlyProduction)} kWh/year
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {isStandard ? 'Estimated Production' : 'Enhanced Production Capacity'}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-sky-100 text-sky-600">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
              </div>
              <div className="ml-3">
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {isStandard ? '25-Year' : 'Extended'} Warranty
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {isStandard
                    ? 'Comprehensive coverage on panels and installation'
                    : '30-year comprehensive coverage'}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-sky-100 text-sky-600">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
              </div>
              <div className="ml-3">
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {isStandard ? 'Professional Installation' : 'Premium Protection Package'}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {isStandard
                    ? 'Expert installation by certified technicians'
                    : 'Includes Critter Guard and Solar Edge Trim'}
                </p>
              </div>
            </li>
            {!isStandard && (
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-sky-100 text-sky-600">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium text-sm sm:text-base">Priority Service</p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    24/7 monitoring and premium support
                  </p>
                </div>
              </li>
            )}
          </ul>
        </div>

        <div className="p-5 sm:p-6 pt-0">
          <button
            onClick={() => handlePackageSelect(type)}
            className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl text-center font-medium transition-all duration-300 shadow-md text-sm sm:text-base
              ${selectedPackage === type
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : type === 'standard'
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:-translate-y-1'
                  : 'bg-gray-900 text-white hover:bg-black hover:shadow-lg hover:-translate-y-1'
              }`}
          >
            Select {type === 'standard' ? 'Standard' : 'Premium'} Package
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Price Display Toggle */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setShowTaxCredit(true)}
            className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-all ${showTaxCredit
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Potential Incentives*
          </button>
          <button
            onClick={() => setShowTaxCredit(false)}
            className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-all ${!showTaxCredit
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Purchase Price
          </button>
        </div>
      </div>

      {/* Swipe Instructions for Mobile */}
      {isMobile && (
        <div className="text-center mb-4 text-xs text-gray-500 flex items-center justify-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Swipe to compare packages</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      )}

      <div
        ref={swipeContainerRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <PackageCard type="standard" />
        <PackageCard type="premium" />
      </div>

      {showTaxCredit && (
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 bg-sky-50 p-3 sm:p-4 rounded-xl border border-sky-100">
          <p>*The 30% federal tax credit is a tax incentive that allows you to deduct 30% of the cost of installing a solar energy system from your federal taxes. Eligibility and benefits may vary based on your specific tax situation. Please consult with a tax professional.</p>
        </div>
      )}
    </div>
  )
} 