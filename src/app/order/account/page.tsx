'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { saveNewProposal, ProposalData } from '@/lib/proposals'

interface AccountFormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: string
}

export default function AccountPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<AccountFormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load saved address from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('address')
    if (savedAddress) {
      setFormData(prev => ({ ...prev, address: savedAddress }))
    }
  }, [])

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      return 'All fields are required'
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'Please enter a valid email address'
    }

    if (!formData.phone.match(/^\+?[\d\s-]{10,}$/)) {
      return 'Please enter a valid phone number'
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate form
      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        setIsLoading(false)
        return
      }

      // Load proposal data
      const proposalData: ProposalData = {
        package_type: localStorage.getItem('selectedPackage') ?? 'standard',
        system_size: JSON.parse(localStorage.getItem('selectedPackageData') || '{}').systemSize || 0,
        panel_count: JSON.parse(localStorage.getItem('selectedPackageData') || '{}').numberOfPanels || 0,
        monthly_production: JSON.parse(localStorage.getItem('selectedPackageData') || '{}').monthlyProduction || 0,
        address: localStorage.getItem('address') ?? '',
        monthly_bill: parseFloat(localStorage.getItem('monthlyBill') || '0'),
        payment_type: localStorage.getItem('paymentType') ?? 'cash',
        financing: localStorage.getItem('financingDetails') ? JSON.parse(localStorage.getItem('financingDetails')) : null,
        status: 'saved'
      }

      // Register user with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.address
          }
        }
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // Try to save the proposal, but don't worry if it fails
      // It will be saved in localStorage and can be saved later after email verification
      await saveNewProposal(authData.user.id, proposalData)

      // Clear localStorage except pendingProposal
      localStorage.removeItem('selectedPackage')
      localStorage.removeItem('selectedPackageData')
      localStorage.removeItem('address')
      localStorage.removeItem('monthlyBill')
      localStorage.removeItem('paymentType')
      localStorage.removeItem('financingDetails')

      // Show success message
      toast.success('Account created successfully! Please check your email to verify your account.')

      // Redirect to login
      router.push('/login?message=Please check your email to verify your account')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-gray-600">
            Set up your account to save your solar proposal and track your installation progress.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 