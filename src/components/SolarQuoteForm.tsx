'use client'

import { useState, useEffect, useRef } from 'react'
import { sendBookingNotifications } from '@/lib/notificationService'
import { trackFormInteraction } from '@/lib/analytics'

interface QuoteFormData {
  name: string
  phone: string
  address: string
  panelCount: string
  message: string
}

interface SolarQuoteFormProps {
  isMobile?: boolean
}

export default function SolarQuoteForm({ isMobile = false }: SolarQuoteFormProps) {
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
    trackFormInteraction('solar_quote_form', 'view')

    // Track form abandonment
    const handleBeforeUnload = () => {
      if (formInteracted && !submitted) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const filledFields = Array.from(fieldInteractionsRef.current)

        trackFormInteraction('solar_quote_form', 'abandoned', {
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
      trackFormInteraction('solar_quote_form', 'started')
    }

    // Track field interaction if it's the first time
    if (!fieldInteractionsRef.current.has(name)) {
      fieldInteractionsRef.current.add(name)
      trackFormInteraction('solar_quote_form', 'field_interaction', {
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
      trackFormInteraction('solar_quote_form', 'submit_attempt', {
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
      trackFormInteraction('solar_quote_form', 'submit_success', {
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
      trackFormInteraction('solar_quote_form', 'submit_error', {
        error_message: err instanceof Error ? err.message : 'Unknown error'
      })

      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
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
            trackFormInteraction('solar_quote_form', 'reset')
          }}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-${isMobile ? '3' : '4'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label htmlFor="name" className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>
            Full Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border-0 ${isMobile ? 'py-2 text-sm' : 'py-3'} px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm`}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="phone" className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>
            Phone Number*
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border-0 ${isMobile ? 'py-2 text-sm' : 'py-3'} px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm`}
            placeholder="(123) 456-7890"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>
          Address*
        </label>
        <input
          type="text"
          id="address"
          name="address"
          required
          value={formData.address}
          onChange={handleInputChange}
          className={`block w-full rounded-lg border-0 ${isMobile ? 'py-2 text-sm' : 'py-3'} px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm`}
          placeholder="Your address"
        />
      </div>

      <div>
        <label htmlFor="panelCount" className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>
          Number of Solar Panels*
        </label>
        <select
          id="panelCount"
          name="panelCount"
          required
          value={formData.panelCount}
          onChange={handleInputChange}
          className={`block w-full rounded-lg border-0 ${isMobile ? 'py-2 text-sm' : 'py-3'} px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm`}
        >
          <option value="">Select number of panels</option>
          <option value="1-10">1-10 panels</option>
          <option value="11-20">11-20 panels</option>
          <option value="21-30">21-30 panels</option>
          <option value="31-40">31-40 panels</option>
          <option value="41+">41+ panels</option>
        </select>
      </div>

      {!isMobile && (
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information (Optional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleInputChange}
            className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm"
            placeholder="Any specific details or questions?"
          ></textarea>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`mx-auto ${isMobile ? 'w-full text-sm py-2' : 'max-w-xs py-3'} bg-black text-white px-8 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Get Your Free Quote'
          )}
        </button>
      </div>

      {!isMobile && (
        <p className="text-xs text-center text-gray-500 mt-4">
          By submitting this form, you agree to be contacted about our services. We respect your privacy and will never share your information.
        </p>
      )}
    </form>
  )
} 