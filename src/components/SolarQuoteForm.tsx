'use client'

import { useState, useEffect, useRef } from 'react'
import { sendBookingNotifications } from '@/lib/notificationService'

// Create a utility function for analytics tracking
const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties || {});
  }
};

interface QuoteFormData {
  name: string
  phone: string
  address: string
  panelCount: string
  message: string
}

export default function SolarQuoteForm() {
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    phone: '',
    address: '',
    panelCount: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formInteracted, setFormInteracted] = useState(false)
  const startTimeRef = useRef<number>(0)
  const fieldInteractionsRef = useRef<Set<string>>(new Set())

  // Track when the component mounts
  useEffect(() => {
    startTimeRef.current = Date.now()

    // Track form view
    trackEvent('form_view', { form_name: 'solar_quote_form' })

    // Track form abandonment
    const handleBeforeUnload = () => {
      if (formInteracted && !submitted) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const filledFields = Array.from(fieldInteractionsRef.current)

        trackEvent('form_abandoned', {
          form_name: 'solar_quote_form',
          time_spent_seconds: timeSpent,
          fields_interacted: filledFields.join(','),
          fields_count: filledFields.length,
          form_completion_percentage: calculateCompletionPercentage()
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [formInteracted, submitted])

  // Calculate form completion percentage
  const calculateCompletionPercentage = () => {
    const requiredFields = ['name', 'phone', 'address', 'panelCount']
    const filledRequiredFields = requiredFields.filter(field => formData[field as keyof QuoteFormData]?.trim() !== '')
    return Math.round((filledRequiredFields.length / requiredFields.length) * 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Track first interaction with the form
    if (!formInteracted) {
      setFormInteracted(true)
      trackEvent('form_started', { form_name: 'solar_quote_form' })
    }

    // Track field interaction if it's the first time
    if (!fieldInteractionsRef.current.has(name)) {
      fieldInteractionsRef.current.add(name)
      trackEvent('field_interaction', {
        form_name: 'solar_quote_form',
        field_name: name
      })
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (!formData.name || !formData.phone || !formData.address || !formData.panelCount) {
        throw new Error('Please fill out all required fields')
      }

      // Validate phone number (simple validation)
      const phoneRegex = /^[0-9()\-\s+]{10,15}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        throw new Error('Please enter a valid phone number')
      }

      // Track form submission attempt
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
      trackEvent('form_submit_attempt', {
        form_name: 'solar_quote_form',
        time_spent_seconds: timeSpent
      })

      console.log('Submitting quote request for:', formData.name);

      // Send booking notifications
      const notificationResult = await sendBookingNotifications({
        date: new Date(),
        customerName: formData.name,
        phone: formData.phone,
        panelCount: formData.panelCount,
        service: 'Solar Panel Cleaning Quote',
        address: formData.address,
        message: formData.message
      });

      console.log('Notification result:', notificationResult);

      if (!notificationResult.success) {
        console.warn('Warning: Notifications may not have been sent properly:', notificationResult.error);
      }

      // Here you would typically send the data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Track successful submission
      trackEvent('form_submit_success', {
        form_name: 'solar_quote_form',
        time_spent_seconds: timeSpent,
        fields_filled: Object.entries(formData)
          .filter(([_, value]) => value.trim() !== '')
          .map(([key]) => key)
          .join(',')
      })

      // Show success message
      setSubmitted(true)

      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        panelCount: '',
        message: '',
      })
    } catch (err) {
      // Track submission error
      trackEvent('form_submit_error', {
        form_name: 'solar_quote_form',
        error_message: err instanceof Error ? err.message : 'Unknown error'
      })

      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Received!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for your interest in our solar panel cleaning services. Our team will review your information and contact you within 24 hours with a personalized quote.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            // Reset tracking for new form
            startTimeRef.current = Date.now()
            fieldInteractionsRef.current = new Set()
            setFormInteracted(false)
            trackEvent('form_reset', { form_name: 'solar_quote_form' })
          }}
          className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address*
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleInputChange}
            className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
            placeholder="123 Main St, City, State, ZIP"
          />
        </div>

        <div>
          <label htmlFor="panelCount" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Solar Panels*
          </label>
          <input
            type="number"
            id="panelCount"
            name="panelCount"
            required
            min="1"
            value={formData.panelCount}
            onChange={handleInputChange}
            className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
            placeholder="Enter number of panels"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleInputChange}
            className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
            placeholder="Any special instructions or questions?"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 ring-1 ring-gray-200">
          <p className="text-gray-700 mb-2">
            By submitting this form, you'll receive:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>A personalized quote within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Flexible scheduling options</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No obligation to proceed with service</span>
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-black text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Request a Quote'}
        </button>
      </form>
    </div>
  )
} 