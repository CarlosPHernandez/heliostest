'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import BookingCalendar from './BookingCalendar'
import { sendBookingNotifications } from '@/lib/notificationService'

interface QuoteFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  panelCount: string
  roofType: string
  message: string
}

export default function SolarQuoteForm() {
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'NC',
    zipCode: '',
    panelCount: '',
    roofType: '',
    message: '',
  })

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateTimeSelect = (date: Date | undefined, time: string | undefined) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone ||
        !formData.address || !formData.city || !formData.zipCode ||
        !formData.panelCount || !formData.roofType) {
        throw new Error('Please fill out all required fields')
      }

      if (!selectedDate) {
        throw new Error('Please select a preferred date')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate phone number (simple validation)
      const phoneRegex = /^[0-9()\-\s+]{10,15}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        throw new Error('Please enter a valid phone number')
      }

      console.log('Submitting quote request for:', formData.name);

      // Send booking notifications
      const notificationResult = await sendBookingNotifications({
        date: selectedDate,
        time: selectedTime,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        panelCount: formData.panelCount,
        service: 'Solar Panel Cleaning Quote',
        address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
        message: formData.message
      });

      console.log('Notification result:', notificationResult);

      if (!notificationResult.success) {
        console.warn('Warning: Notifications may not have been sent properly:', notificationResult.error);
      }

      // Here you would typically send the data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Show success message
      setSubmitted(true)

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: 'NC',
        zipCode: '',
        panelCount: '',
        roofType: '',
        message: '',
      })
      setSelectedDate(undefined)
      setSelectedTime(undefined)
    } catch (err) {
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
          onClick={() => setSubmitted(false)}
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
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                placeholder="your.email@example.com"
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
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Property Information</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City*
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                  placeholder="Charlotte"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State*
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                >
                  <option value="NC">North Carolina</option>
                  <option value="SC">South Carolina</option>
                  <option value="VA">Virginia</option>
                  <option value="GA">Georgia</option>
                </select>
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code*
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                  placeholder="28202"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Solar Panel Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label htmlFor="roofType" className="block text-sm font-medium text-gray-700 mb-1">
                Roof Type*
              </label>
              <select
                id="roofType"
                name="roofType"
                required
                value={formData.roofType}
                onChange={handleInputChange}
                className="block w-full rounded-xl py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
              >
                <option value="">Select roof type</option>
                <option value="Asphalt Shingle">Asphalt Shingle</option>
                <option value="Metal">Metal</option>
                <option value="Tile">Tile</option>
                <option value="Flat">Flat</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Preferred Appointment</h3>
          <BookingCalendar
            onDateTimeSelect={handleDateTimeSelect}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
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