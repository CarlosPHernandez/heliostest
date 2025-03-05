'use client'

import { loadStripe } from '@stripe/stripe-js'
import { useState, useEffect } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import BookingCalendar from './BookingCalendar'
import { sendBookingNotifications } from '@/lib/notificationService'
import { useAuth } from '@/contexts/AuthContext'

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Add error handling for stripe initialization
stripePromise.catch(err => {
  console.error('Error initializing Stripe:', err);
});

interface PricingOption {
  name: string
  pricePerPanel: number
  description: string
  features: string[]
  maxPanels?: number
}

const pricingOptions: PricingOption[] = [
  {
    name: 'Basic Clean',
    pricePerPanel: 12,
    description: 'Perfect for residential solar panels',
    maxPanels: 20,
    features: [
      'Deionized water cleaning',
      'Up to 20 panels',
      'Basic inspection',
      'Same day service'
    ]
  },
  {
    name: 'Premium Clean',
    pricePerPanel: 15,
    description: 'Ideal for larger installations',
    maxPanels: 30,
    features: [
      'Deionized water cleaning',
      'Up to 30 panels',
      'Detailed inspection report',
      'Priority scheduling',
      'Performance analysis'
    ]
  },
  {
    name: 'Commercial',
    pricePerPanel: 20,
    description: 'For commercial installations',
    features: [
      'Deionized water cleaning',
      'Unlimited panels',
      'Comprehensive inspection',
      '24/7 priority support',
      'Maintenance plan',
      'Insurance certificate'
    ]
  }
]

export default function StripeCheckout() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [panelCount, setPanelCount] = useState<string>('')
  const [showPricing, setShowPricing] = useState(false)
  const [error, setError] = useState<string>('')
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()

  const calculatePrice = (count: number, plan: PricingOption) => {
    return count * plan.pricePerPanel
  }

  const handlePanelCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPanelCount(value)

    if (value && parseInt(value) > 0) {
      const count = parseInt(value)
      const appropriatePlan = getRecommendedPlan(count)
      if (appropriatePlan) {
        setSelectedPlan(appropriatePlan)
        setTotalPrice(calculatePrice(count, appropriatePlan))
      }
    } else {
      setTotalPrice(0)
    }
  }

  const handlePanelCountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(panelCount)
    if (!count || count <= 0) {
      setError('Please enter a valid number of panels')
      return
    }
    if (count > 100) {
      setError('For installations over 100 panels, please contact us directly')
      return
    }
    setError('')
    setShowPricing(true)
  }

  const getRecommendedPlan = (count: number): PricingOption => {
    if (count <= 20) return pricingOptions[0]
    if (count <= 30) return pricingOptions[1]
    return pricingOptions[2]
  }

  const handleDateTimeSelect = (date: Date | undefined, time: string | undefined) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const handleCheckout = async (plan: PricingOption) => {
    try {
      if (!selectedDate) {
        setError('Please select a date for your cleaning')
        return
      }

      setLoading(plan.name)
      setError('')

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Stripe configuration is missing')
      }

      const calculatedTotal = parseInt(panelCount) * plan.pricePerPanel;
      console.log('Sending checkout request:', {
        plan: plan.name,
        panelCount,
        totalAmount: calculatedTotal,
        date: selectedDate,
        time: selectedTime
      });

      // Send booking notifications
      await sendBookingNotifications({
        date: selectedDate,
        time: selectedTime,
        customerName: user?.user_metadata?.full_name || 'Customer',
        email: user?.email,
        panelCount,
        service: `Solar Panel Cleaning (${plan.name})`,
      });

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.name,
          panelCount: parseInt(panelCount),
          totalAmount: calculatedTotal,
          appointmentDate: selectedDate?.toISOString(),
          appointmentTime: selectedTime || 'No specific time'
        }),
      })

      const data = await response.json()
      console.log('Checkout response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.sessionId) {
        throw new Error('Invalid checkout session')
      }

      console.log('Loading Stripe...');
      // Redirect to checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Unable to initialize payment system')
      }

      console.log('Redirecting to checkout...');
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        console.error('Stripe redirect error:', error);
        throw error
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(
        err instanceof Error ? err.message : 'Unable to process your payment at this time. Please try again or contact support if the problem persists.'
      )
    } finally {
      setLoading(null)
    }
  }

  if (!showPricing) {
    return (
      <div className="max-w-md mx-auto">
        <form onSubmit={handlePanelCountSubmit} className="space-y-6">
          <div>
            <label htmlFor="panelCount" className="block text-sm font-medium text-gray-700 mb-2">
              How many solar panels do you need cleaned?
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="panelCount"
                id="panelCount"
                min="1"
                max="100"
                value={panelCount}
                onChange={handlePanelCountChange}
                className="block w-full rounded-xl py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Enter number of panels"
              />
            </div>
            {panelCount && !error && (
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Estimated total: ${totalPrice}</span>
                </div>
                {selectedPlan && (
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended plan: {selectedPlan.name} (${selectedPlan.pricePerPanel}/panel)
                  </p>
                )}
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            View Pricing Details
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    )
  }

  const recommendedPlan = getRecommendedPlan(parseInt(panelCount))

  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <p className="text-lg text-gray-600">
          Based on your {panelCount} panels, we recommend the{' '}
          <span className="font-semibold text-gray-900">{recommendedPlan.name}</span> package
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          Total Price: ${totalPrice}
        </p>
        <button
          onClick={() => setShowPricing(false)}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Change panel count
        </button>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-6">Select Your Appointment</h2>
        <BookingCalendar
          onDateTimeSelect={handleDateTimeSelect}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pricingOptions.map((option) => {
          const isRecommended = option.name === recommendedPlan.name
          const isDisabled = Boolean(option.maxPanels && parseInt(panelCount) > option.maxPanels)
          const price = calculatePrice(parseInt(panelCount), option)

          return (
            <div
              key={option.name}
              className={`bg-white rounded-xl shadow-sm ring-1 ${isRecommended ? 'ring-2 ring-black' : 'ring-gray-200'
                } p-8 hover:shadow-md transition-shadow relative`}
            >
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{option.name}</h3>
              <p className="text-gray-600 mb-6">{option.description}</p>
              <div className="space-y-2 mb-6">
                <p className="text-lg text-gray-600">${option.pricePerPanel} per panel</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${price}
                  <span className="text-lg font-normal text-gray-500"> total</span>
                </p>
              </div>
              <ul className="space-y-4 mb-8">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-green-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(option)}
                disabled={loading === option.name || isDisabled}
                className={`w-full ${isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
                  } py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50`}
              >
                {loading === option.name
                  ? 'Processing...'
                  : isDisabled
                    ? 'Too many panels'
                    : 'Select Plan'}
              </button>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mt-6">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
    </div>
  )
} 