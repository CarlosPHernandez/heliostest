'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Home, Zap, Calendar, Upload, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface OrderFormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string

  // Property Details
  address: string
  propertyType: 'single-family' | 'multi-family' | 'commercial'
  roofType: string
  roofAge: string

  // Energy Usage
  averageMonthlyBill: string
  utilityProvider: string
  utilityBill?: File

  // Consultation
  preferredDate?: Date
  preferredTime?: string
  contactMethod: 'phone' | 'email' | 'either'

  // Additional Notes
  notes?: string
}

const initialFormData: OrderFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  propertyType: 'single-family',
  roofType: '',
  roofAge: '',
  averageMonthlyBill: '',
  utilityProvider: '',
  contactMethod: 'either',
}

export default function OrderPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OrderFormData>(initialFormData)

  const updateFormData = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here we'll handle the form submission and create a new project
    console.log('Form submitted:', formData)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Property Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateFormData('propertyType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="single-family">Single Family Home</option>
                  <option value="multi-family">Multi-Family Home</option>
                  <option value="commercial">Commercial Property</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roof Type
                </label>
                <input
                  type="text"
                  value={formData.roofType}
                  onChange={(e) => updateFormData('roofType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., Asphalt Shingle, Metal, Tile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roof Age (approximate)
                </label>
                <input
                  type="text"
                  value={formData.roofAge}
                  onChange={(e) => updateFormData('roofAge', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., 5 years"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Energy Usage</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Monthly Electric Bill
                </label>
                <input
                  type="text"
                  value={formData.averageMonthlyBill}
                  onChange={(e) => updateFormData('averageMonthlyBill', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., $150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utility Provider
                </label>
                <input
                  type="text"
                  value={formData.utilityProvider}
                  onChange={(e) => updateFormData('utilityProvider', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Recent Utility Bill (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) updateFormData('utilityBill', file)
                    }}
                    className="hidden"
                    id="utility-bill"
                  />
                  <label
                    htmlFor="utility-bill"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, JPG, or PNG up to 10MB
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Schedule Consultation</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <select
                  value={formData.contactMethod}
                  onChange={(e) => updateFormData('contactMethod', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="either">Either</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  onChange={(e) => updateFormData('preferredDate', new Date(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  onChange={(e) => updateFormData('preferredTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select a time</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="evening">Evening (4PM - 7PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Any additional information you'd like us to know..."
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review & Submit</h2>
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 text-gray-900">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 text-gray-900">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 text-gray-900">{formData.phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Property Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2 text-gray-900">{formData.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Property Type:</span>
                    <span className="ml-2 text-gray-900">{formData.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Roof Type:</span>
                    <span className="ml-2 text-gray-900">{formData.roofType}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Energy Usage</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Monthly Bill:</span>
                    <span className="ml-2 text-gray-900">{formData.averageMonthlyBill}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Utility Provider:</span>
                    <span className="ml-2 text-gray-900">{formData.utilityProvider}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Consultation Preferences</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Contact Method:</span>
                    <span className="ml-2 text-gray-900">{formData.contactMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Preferred Date:</span>
                    <span className="ml-2 text-gray-900">
                      {formData.preferredDate?.toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Preferred Time:</span>
                    <span className="ml-2 text-gray-900">{formData.preferredTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-28">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${(currentStep / 5) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Personal Info</span>
              <span>Property</span>
              <span>Energy</span>
              <span>Schedule</span>
              <span>Review</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                  ${currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                >
                  Submit Order
                  <CheckCircle className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 