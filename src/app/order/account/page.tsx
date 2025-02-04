'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, User, Mail, Phone, Lock, Home, Eye, EyeOff } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  })

  useEffect(() => {
    // Get stored address data
    const addressInfo = localStorage.getItem('addressData')
    if (addressInfo) {
      const parsedAddress = JSON.parse(addressInfo)
      setFormData(prev => ({
        ...prev,
        address: parsedAddress.formatted_address || ''
      }))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear any previous errors
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required'
    if (!formData.lastName.trim()) return 'Last name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format'
    if (!formData.phone.trim()) return 'Phone number is required'
    if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\D/g, ''))) return 'Invalid phone number'
    if (!formData.password) return 'Password is required'
    if (formData.password.length < 8) return 'Password must be at least 8 characters'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      // Store user data
      localStorage.setItem('userData', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      }))

      // Navigate to confirmation page
      router.push('/order/confirmation')
    } catch (err) {
      setError('Failed to create account. Please try again.')
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-28">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-8">
            <User className="h-6 w-6 text-blue-600" />
          </div>

          <h1 className="text-2xl font-semibold text-center mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Please provide your details to complete your order
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-black"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-200 pl-11 pr-4 py-3 text-sm focus:border-black focus:ring-black"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-200 pl-11 pr-4 py-3 text-sm focus:border-black focus:ring-black"
                  placeholder="(123) 456-7890"
                  required
                />
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Installation Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Home className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  readOnly
                  className="block w-full rounded-lg border border-gray-200 pl-11 pr-4 py-3 text-sm bg-gray-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Create Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-200 pl-11 pr-11 py-3 text-sm focus:border-black focus:ring-black"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Create Account & Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 