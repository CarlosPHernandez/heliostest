'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'
import { LockClosedIcon, ChevronUpIcon, XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

const supabase = createClientComponentClient<Database>()

type Tables = Database['public']['Tables']
type ProfileInsert = Tables['profiles']['Insert']
type ProposalInsert = Tables['proposals']['Insert']

type PendingProposalInsert = {
  temp_user_token: string
  system_size: number
  panel_count: number
  monthly_production: number
  address: string
  monthly_bill: number
  package_type: 'standard' | 'premium'
  payment_type: 'cash' | 'financing'
  financing: {
    term: number | null
    down_payment: number | null
    monthly_payment: number | null
  } | null
  status: 'pending'
  total_price: number
  include_battery: boolean
  battery_type: string | null
  battery_count: number | null
  proposal_data: any
  synced_to_user_id: string
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [proposal, setProposal] = useState<ProposalInsert | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Form validation states
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({})
  const [touchedFields, setTouchedFields] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    terms?: boolean;
  }>({})

  // Calculate password strength
  const calculatePasswordStrength = (pass: string) => {
    let strength = 0

    // Length check
    if (pass.length >= 8) strength += 1
    if (pass.length >= 12) strength += 1

    // Character variety checks
    if (/[A-Z]/.test(pass)) strength += 1 // Has uppercase
    if (/[a-z]/.test(pass)) strength += 1 // Has lowercase
    if (/[0-9]/.test(pass)) strength += 1 // Has number
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1 // Has special char

    return Math.min(strength, 5) // Max strength of 5
  }

  // Handle field blur for validation
  const handleFieldBlur = (field: 'name' | 'email' | 'password' | 'terms') => {
    setTouchedFields({
      ...touchedFields,
      [field]: true
    })
    validateField(field)
  }

  // Validate a specific field
  const validateField = (field: 'name' | 'email' | 'password' | 'terms') => {
    const newErrors = { ...formErrors }

    switch (field) {
      case 'name':
        const nameInput = document.getElementById('name') as HTMLInputElement
        if (!nameInput?.value) {
          newErrors.name = 'Please enter your full name'
        } else {
          delete newErrors.name
        }
        break
      case 'email':
        const emailInput = document.getElementById('email') as HTMLInputElement
        if (!emailInput?.value) {
          newErrors.email = 'Please enter your email address'
        } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          delete newErrors.email
        }
        break
      case 'password':
        if (!password) {
          newErrors.password = 'Please create a password'
        } else if (password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters'
        } else {
          delete newErrors.password
        }
        break
      case 'terms':
        const termsInput = document.getElementById('terms') as HTMLInputElement
        if (!termsInput?.checked) {
          newErrors.terms = 'You must agree to the terms'
        } else {
          delete newErrors.terms
        }
        break
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(calculatePasswordStrength(newPassword))

    if (touchedFields.password) {
      validateField('password')
    }
  }

  useEffect(() => {
    // Get proposal data from URL if it exists
    const proposalParam = searchParams.get('proposal')
    if (proposalParam) {
      try {
        const parsedProposal = JSON.parse(decodeURIComponent(proposalParam))
        setProposal(parsedProposal)
      } catch (error) {
        console.error('Error parsing proposal data:', error)
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Mark all fields as touched
    const allTouched = {
      name: true,
      email: true,
      password: true,
      terms: true
    }
    setTouchedFields(allTouched)

    // Validate all fields
    let isValid = true
    const fieldsToValidate: Array<'name' | 'email' | 'password' | 'terms'> = ['name', 'email', 'password', 'terms']
    fieldsToValidate.forEach((field) => {
      if (!validateField(field)) {
        isValid = false
      }
    })

    if (!isValid) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.error-message')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    try {
      console.log('Starting registration process...')

      // Get proposal data from URL if it exists
      const urlParams = new URLSearchParams(window.location.search)
      const proposalParam = urlParams.get('proposal')
      console.log('Proposal param:', proposalParam)
      const proposal: ProposalInsert | null = proposalParam ? JSON.parse(decodeURIComponent(proposalParam)) : null
      console.log('Parsed proposal:', proposal)

      // Generate a temp user token
      const tempUserToken = crypto.randomUUID()

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })

      if (signUpError) {
        console.error('Signup error:', signUpError)
        throw signUpError
      }

      console.log('Auth data:', authData)

      if (!authData.user?.identities?.length) {
        throw new Error('Email already registered')
      }

      if (authData.user) {
        console.log('User created successfully')

        // Save proposal if it exists
        if (proposal && Object.keys(proposal).length > 0) {
          console.log('Preparing to save initial design...')
          const pendingProposalToInsert: PendingProposalInsert = {
            temp_user_token: tempUserToken,
            system_size: proposal.system_size,
            panel_count: proposal.number_of_panels,
            monthly_production: 0, // Default to 0 since it's not in the proposal type
            address: proposal.address,
            monthly_bill: 0, // Default to 0 since it's not in the proposal type
            package_type: proposal.package_type as 'standard' | 'premium',
            payment_type: (proposal.payment_type === 'finance' ? 'financing' : proposal.payment_type || 'cash') as 'cash' | 'financing',
            financing: proposal.payment_type === 'finance' ? {
              term: proposal.financing_term || null,
              down_payment: proposal.down_payment || null,
              monthly_payment: proposal.monthly_payment || null
            } : null,
            status: 'pending',
            total_price: proposal.total_price,
            include_battery: proposal.include_battery || false,
            battery_type: proposal.battery_type || null,
            battery_count: proposal.battery_count || null,
            proposal_data: proposal, // Store the original proposal data
            synced_to_user_id: authData.user.id // Link to the newly created user
          }
          console.log('Inserting initial design:', pendingProposalToInsert)

          const { data: insertedProposal, error: insertError } = await supabase
            .from('pending_proposals')
            .insert([pendingProposalToInsert])
            .select()

          if (insertError) {
            console.error('Error saving initial design:', insertError)
            throw insertError
          }
          console.log('Initial design saved:', insertedProposal)
          toast.success('Initial design saved successfully!')
        }

        // Check if email was sent
        if (authData.user.confirmation_sent_at) {
          toast.success('Registration successful! Please check your email to confirm your account.')
          setVerificationSent(true)
          setVerificationEmail(email)
          setIsLoading(false)
        } else {
          toast.warning('Account created but there might be an issue with the verification email.')

          // Redirect to the appropriate page
          const returnUrl = searchParams.get('returnUrl') || '/dashboard'
          router.push(returnUrl)
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof Error) {
        if (error.message === 'Email already registered') {
          toast.error('This email is already registered. Please try logging in instead.')
          router.push('/login')
        } else {
          toast.error(`Error: ${error.message}`)
        }
      } else {
        toast.error('An unexpected error occurred during registration')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate estimated savings over 25 years
  const calculateLifetimeSavings = () => {
    if (!proposal) return 0

    // Estimate average monthly utility bill without solar
    const estimatedMonthlyUtility = 250 // Average monthly utility bill

    // For financed systems, use the monthly payment
    const monthlySolarCost = proposal.payment_type === 'finance' && proposal.monthly_payment
      ? proposal.monthly_payment * 0.7 // After tax credit
      : (proposal.total_price * 0.7) / 300 // Approximate monthly cost for cash purchase over 25 years

    // Monthly savings
    const monthlySavings = estimatedMonthlyUtility - monthlySolarCost

    // Calculate 25-year savings (25 years × 12 months)
    return Math.max(0, monthlySavings * 12 * 25)
  }

  // Calculate the 12-month promotion savings
  const calculatePromotionSavings = () => {
    if (!proposal) return 0

    // For financed systems, use the monthly payment
    if (proposal.payment_type === 'finance' && proposal.monthly_payment) {
      return proposal.monthly_payment * 0.7 * 12 // 12 months of payments after tax credit
    } else {
      // For cash purchases, estimate what 12 months of payments would be
      return (proposal.total_price * 0.7) / 25 // Approximate 1 year of payments (25 year system life)
    }
  }

  // Calculate days remaining until April 12th
  const calculateDaysRemaining = () => {
    const today = new Date()
    const endDate = new Date(today.getFullYear(), 3, 12) // April is month 3 (0-indexed)

    // If today is past April 12th of this year, use next year's date
    if (today > endDate) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Calculate hours, minutes, seconds
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000)

    return {
      days: diffDays,
      hours: diffHours,
      minutes: diffMinutes,
      seconds: diffSeconds,
      total: diffTime
    }
  }

  // Add this new state for the countdown timer
  const [timeRemaining, setTimeRemaining] = useState(calculateDaysRemaining())

  // Add this useEffect for the countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateDaysRemaining())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Get strength label and color
  const getStrengthInfo = () => {
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-green-600']

    return {
      label: labels[passwordStrength],
      color: colors[passwordStrength]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[size:20px_20px]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.1) 1px, transparent 1px)' }} />

        {/* Top-right solar-themed gradient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-sky-100/30 via-sky-200/20 to-transparent rounded-full blur-3xl" />

        {/* Bottom-left solar-themed gradient */}
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-tr from-amber-100/20 via-amber-50/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Backdrop blur overlay for mobile when summary is open */}
      {summaryOpen && (
        <div
          className="md:hidden fixed inset-0 bg-sky-500/20 backdrop-blur-sm z-20 transition-opacity duration-300"
          onClick={() => setSummaryOpen(false)}
        />
      )}

      {/* Secure Checkout Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <LockClosedIcon className="h-5 w-5 text-sky-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">Secure Checkout</span>
          </div>
          <div className="text-sm text-gray-600">
            Step 4 of 4: Create Account
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row relative z-10">
        {/* Main Content */}
        <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Last Step: Place Your Order</h1>
              <p className="mt-2 text-gray-600">
                Create an account to complete your project and start your solar journey.
                All system designs and quotes are not finalized until after the onboarding call and review.
              </p>
            </div>

            {verificationSent ? (
              <div className="bg-white/90 backdrop-blur-sm py-8 px-6 shadow-md rounded-xl border border-gray-100">
                <div className="bg-sky-50 border border-sky-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-sky-800">Verification Email Sent</h3>
                  <p className="mt-2 text-sm text-sky-600">
                    We've sent a verification email to <strong>{verificationEmail}</strong>.
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                  <p className="mt-2 text-sm text-sky-600">
                    If you don't see the email, please check your spam folder.
                  </p>
                </div>
                <div className="mt-6 text-center">
                  <Link href="/login" className="font-medium text-sky-600 hover:text-sky-500">
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm py-8 px-6 shadow-md rounded-xl border border-gray-100">
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="John Smith"
                        required
                        onBlur={() => handleFieldBlur('name')}
                        className={`block w-full appearance-none rounded-lg border ${formErrors.name ? 'border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'} px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none transition-all duration-200 hover:border-gray-400`}
                      />
                      {formErrors.name && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {formErrors.name && touchedFields.name && (
                      <p className="mt-2 text-sm text-red-600 error-message" id="name-error">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                        onBlur={() => handleFieldBlur('email')}
                        className={`block w-full appearance-none rounded-lg border ${formErrors.email ? 'border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'} px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none transition-all duration-200 hover:border-gray-400`}
                      />
                      {formErrors.email && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {formErrors.email && touchedFields.email && (
                      <p className="mt-2 text-sm text-red-600 error-message" id="email-error">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={() => handleFieldBlur('password')}
                        className={`block w-full appearance-none rounded-lg border ${formErrors.password ? 'border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'} px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none transition-all duration-200 hover:border-gray-400`}
                      />
                      {formErrors.password && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {formErrors.password && touchedFields.password ? (
                      <p className="mt-2 text-sm text-red-600 error-message" id="password-error">
                        {formErrors.password}
                      </p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthInfo().color}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{getStrengthInfo().label}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Must be at least 8 characters. Strong passwords include uppercase, lowercase, numbers, and special characters.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          required
                          onBlur={() => handleFieldBlur('terms')}
                          className={`h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 transition-colors ${formErrors.terms ? 'border-red-300 focus:ring-red-500' : ''}`}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="terms" className={`${formErrors.terms ? 'text-red-600' : 'text-gray-600'}`}>
                          I agree to the{' '}
                          <a href="/terms" className="text-sky-600 font-medium hover:underline">Terms of Service</a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-sky-600 font-medium hover:underline">Privacy Policy</a>
                        </label>
                      </div>
                    </div>
                    {formErrors.terms && touchedFields.terms && (
                      <p className="text-sm text-red-600 error-message" id="terms-error">
                        {formErrors.terms}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex w-full justify-center rounded-xl border border-transparent bg-gradient-to-r from-sky-600 to-sky-500 py-3 px-4 text-sm font-medium text-white shadow-md hover:from-sky-700 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Creating account...' : 'Create account & complete order'}
                    </button>
                  </div>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500">Already have an account?</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Link href="/login" className="font-medium text-sky-600 hover:text-sky-800">
                      Sign in instead
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Account Benefits - Redesigned to match page aesthetic */}
            <div className="mt-8 bg-white/90 backdrop-blur-sm py-6 px-6 shadow-md rounded-xl border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your account benefits:</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Track your installation progress</h4>
                    <p className="text-xs text-gray-600 mt-1">Monitor your solar system installation in real-time</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Access real-time energy production data</h4>
                    <p className="text-xs text-gray-600 mt-1">View your system's performance and energy generation</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Manage your solar investment</h4>
                    <p className="text-xs text-gray-600 mt-1">Track savings and optimize your system's performance</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">24/7 customer support access</h4>
                    <p className="text-xs text-gray-600 mt-1">Get priority assistance whenever you need it</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary - Desktop */}
        {proposal && (
          <div className="hidden md:block w-96 bg-gray-50/95 backdrop-blur-sm border-l border-gray-200 p-6">
            <div className="sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="bg-white backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 overflow-hidden order-summary-glow">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-900">{proposal.package_type === 'premium' ? 'Premium' : 'Standard'} Solar Package</h3>
                </div>

                {/* 12 Months Solar On Us Promotion - Desktop */}
                <div className="relative overflow-hidden mb-6 border-b border-sky-200 shadow-sm">
                  <div className="bg-white">
                    {/* Header */}
                    <div className="bg-sky-600 text-white p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">12 MONTHS SOLAR ON US</h3>
                        <div className="text-xs font-medium bg-white/20 rounded-full px-3 py-1">
                          Limited Time Offer - Ends April 12th
                        </div>
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="p-5">
                      {/* Pricing Display */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xs text-sky-600 font-medium mb-1">For the first year</div>
                          <div className="text-3xl text-sky-800 font-bold">$0<span className="text-lg">/mo</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 font-medium mb-1">Regular price</div>
                          <div className="line-through text-gray-400 text-xl">${Math.round((proposal as any)?.financing?.monthly_payment || (proposal.monthly_payment || 97))}/mo</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-sky-100 my-4"></div>

                      {/* Savings Message */}
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 rounded-full bg-sky-500 mr-2"></div>
                          <p className="text-gray-700">We'll cover your first 12 monthly payments - that's</p>
                        </div>

                        <div className="bg-sky-50 rounded-lg p-4 mt-3 border border-sky-100">
                          <p className="text-2xl font-bold text-sky-800">
                            ${Math.round(calculatePromotionSavings())} in savings!
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 mt-3 text-right">
                          Terms and conditions apply.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 12 Months Solar On Us Promotion - Mobile */}
                <div className="md:hidden relative overflow-hidden mb-6 border-b border-sky-200 shadow-sm">
                  <div className="bg-white">
                    {/* Header */}
                    <div className="bg-sky-600 text-white p-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-white">12 MONTHS SOLAR ON US</h3>
                        <div className="text-xs font-medium bg-white/20 rounded-full px-2 py-0.5">
                          Limited Time
                        </div>
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="p-4">
                      {/* Pricing Display */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-xs text-sky-600 font-medium mb-1">For the first year</div>
                          <div className="text-2xl text-sky-800 font-bold">$0<span className="text-sm">/mo</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 font-medium mb-1">Regular price</div>
                          <div className="line-through text-gray-400">${Math.round((proposal as any)?.financing?.monthly_payment || (proposal.monthly_payment || 97))}/mo</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-sky-100 my-3"></div>

                      {/* Savings Message */}
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">We'll cover your first 12 monthly payments</p>
                        </div>

                        <div className="bg-sky-50 rounded-lg p-3 mt-2 border border-sky-100">
                          <p className="text-sm text-sky-700 font-medium">Total Savings:</p>
                          <p className="text-xl font-bold text-sky-800">
                            {formatCurrency(calculatePromotionSavings())}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 text-right">
                          Offer ends April 12th. Terms apply.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Installation Address:</span>
                    <span className="text-gray-900 font-medium text-right">{proposal.address}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">System Size:</span>
                    <span className="text-gray-900 font-medium">{proposal.system_size} kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Number of Panels:</span>
                    <span className="text-gray-900 font-medium">{proposal.number_of_panels}</span>
                  </div>
                  {proposal.include_battery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Battery:</span>
                      <span className="text-gray-900 font-medium">
                        {proposal.battery_type === 'franklin' ? 'Franklin' : 'QCell'}
                        {proposal.battery_count && proposal.battery_count > 1 ? ` (${proposal.battery_count})` : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900 font-medium">{proposal.payment_type === 'finance' ? 'Financing' : 'Cash'}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-sky-700">After Tax Credit*:</span>
                      <span className="font-medium text-sky-700">{formatCurrency(proposal.total_price * 0.7)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">*Estimated price after applying the 30% federal tax credit. Eligibility requirements apply.</p>
                  </div>

                  {/* Estimated Lifetime Savings */}
                  <div className="pt-3 mt-3 border-t border-gray-200 -mx-4 px-4 pb-3 rounded-b-lg relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-sky-100 to-blue-50 opacity-90"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sky-800">Estimated 25-Year Savings:</span>
                        <span className="font-bold text-sky-800 text-lg">{formatCurrency(calculateLifetimeSavings())}</span>
                      </div>
                      <p className="text-xs text-sky-700 mt-1">
                        Based on average utility costs and projected energy production.
                      </p>
                    </div>
                    <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-sky-200/30 rounded-full blur-2xl"></div>
                    <div className="absolute -left-6 -top-10 w-24 h-24 bg-blue-100/20 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Order Summary Toggle */}
      {proposal && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white backdrop-blur-sm border-t border-gray-200 shadow-lg z-30 order-summary-glow-mobile">
          <div
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => setSummaryOpen(!summaryOpen)}
          >
            <div className="flex items-center">
              <span className="font-medium text-gray-900 mr-2">Order Summary</span>
              <ChevronUpIcon className={`h-5 w-5 text-gray-500 transition-transform duration-500 ${summaryOpen ? 'rotate-180' : ''}`} />
            </div>
            {/* Show monthly payment instead of total on mobile toggle */}
            {proposal.payment_type === 'finance' && (proposal as any)?.monthly_payment ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <span className="text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-gray-800 px-1.5 py-0.5 rounded mr-1 border border-orange-300">SOLAR ON US</span>
                  <span className="font-bold text-orange-700">$0/mo</span>
                </div>
                <span className="text-xs text-orange-700">First 12 months (Save {formatCurrency(calculatePromotionSavings())})</span>
              </div>
            ) : (
              <span className="font-bold text-gray-900">{formatCurrency(proposal.total_price)}</span>
            )}
          </div>

          {/* Sliding Summary Panel with enhanced animations */}
          <div
            className={`fixed bottom-0 left-0 right-0 bg-white backdrop-blur-sm border-t border-gray-200 rounded-t-2xl shadow-xl transform transition-all duration-500 ease-reveal z-40 ${summaryOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-90'
              }`}
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              <button
                onClick={() => setSummaryOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Payment Information - Highlighted at the top for mobile with animation */}
              {proposal.payment_type === 'finance' && proposal.monthly_payment && (
                <div className={`bg-sky-50 rounded-lg border border-sky-100 p-4 relative overflow-hidden animate-pulse-subtle transition-all duration-500 delay-100 ${summaryOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-100/0 via-sky-100/50 to-sky-100/0 animate-shimmer"
                    style={{ backgroundSize: '200% 100%' }}></div>

                  {/* 12 Months Solar On Us - Badge Style for Mobile */}
                  <div className="md:hidden mt-8 mx-auto mb-4 max-w-xs relative overflow-hidden rounded-xl shadow-sm border border-sky-200">
                    <div className="bg-white">
                      {/* Header */}
                      <div className="bg-sky-600 text-white p-3">
                        <h3 className="text-lg font-bold text-white text-center">12 MONTHS SOLAR ON US</h3>
                        <div className="text-xs font-medium bg-white/20 rounded-full px-3 py-0.5 inline-block mt-1">
                          Limited Time Offer - Ends April 12th
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Price and Savings */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-xs text-sky-600 font-medium mb-1">For the first year</div>
                            <div className="text-2xl text-sky-800 font-bold">$0<span className="text-sm">/mo</span></div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 font-medium mb-1">Regular price</div>
                            <div className="line-through text-gray-400">${Math.round((proposal as any)?.financing?.monthly_payment || (proposal.monthly_payment || 97))}/mo</div>
                          </div>
                        </div>

                        {/* Savings Call-out */}
                        <div className="bg-sky-50 rounded-lg p-3 mt-3 border border-sky-100">
                          <p className="text-sm text-gray-700">We'll cover your first 12 monthly payments - that's</p>
                          <p className="text-xl font-bold text-sky-800 mt-1">
                            ${Math.round(calculatePromotionSavings())} in savings!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Regular Monthly Payment:</span>
                    <span className="text-sky-700 font-bold text-xl">{formatCurrency(proposal.monthly_payment || 97)}/mo</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-700 text-sm">After Tax Credit:</span>
                    <span className="text-sky-600 font-medium">{formatCurrency((proposal.monthly_payment || 97) * 0.7)}/mo</span>
                  </div>
                </div>
              )}

              <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-500 delay-200 ${summaryOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-98'}`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-900">{proposal.package_type === 'premium' ? 'Premium' : 'Standard'} Solar Package</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Installation Address:</span>
                    <span className="text-gray-900 font-medium text-right">{proposal.address}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">System Size:</span>
                    <span className="text-gray-900 font-medium">{proposal.system_size} kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Number of Panels:</span>
                    <span className="text-gray-900 font-medium">{proposal.number_of_panels}</span>
                  </div>
                  {proposal.include_battery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Battery:</span>
                      <span className="text-gray-900 font-medium">
                        {proposal.battery_type === 'franklin' ? 'Franklin' : 'QCell'}
                        {proposal.battery_count && proposal.battery_count > 1 ? ` (${proposal.battery_count})` : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900 font-medium">{proposal.payment_type === 'finance' ? 'Financing' : 'Cash'}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-sky-700">After Tax Credit*:</span>
                      <span className="font-medium text-sky-700">{formatCurrency(proposal.total_price * 0.7)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">*Estimated price after applying the 30% federal tax credit. Eligibility requirements apply.</p>
                  </div>

                  {/* Estimated Lifetime Savings for Mobile */}
                  <div className="pt-3 mt-3 border-t border-gray-200 -mx-4 px-4 pb-3 rounded-b-lg relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-sky-100 to-blue-50 opacity-90"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sky-800">Estimated 25-Year Savings:</span>
                        <span className="font-bold text-sky-800 text-lg">{formatCurrency(calculateLifetimeSavings())}</span>
                      </div>
                      <p className="text-xs text-sky-700 mt-1">
                        Based on average utility costs and projected energy production.
                      </p>
                    </div>
                    <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-sky-200/30 rounded-full blur-2xl"></div>
                    <div className="absolute -left-6 -top-10 w-24 h-24 bg-blue-100/20 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
              <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-500 delay-300 ${summaryOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <p className="text-sm text-gray-600">
                  By creating an account, you'll be able to track your installation progress,
                  access your solar production data, and manage your system.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.97; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 6s infinite linear;
        }
        .order-summary-glow {
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.3), 0 0 25px rgba(56, 189, 248, 0.2), 0 0 40px rgba(56, 189, 248, 0.1);
          animation: glow 2.5s ease-in-out infinite;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }
        .order-summary-glow-mobile {
          box-shadow: 0 -5px 20px rgba(56, 189, 248, 0.3), 0 -2px 10px rgba(14, 165, 233, 0.4);
          animation: glow-mobile 2.5s ease-in-out infinite;
          border-top: 1px solid rgba(56, 189, 248, 0.3);
        }
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(56, 189, 248, 0.3), 0 0 25px rgba(56, 189, 248, 0.2), 0 0 40px rgba(56, 189, 248, 0.1);
            border-color: rgba(56, 189, 248, 0.3);
          }
          50% { 
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.5), 0 0 35px rgba(56, 189, 248, 0.4), 0 0 50px rgba(56, 189, 248, 0.2);
            border-color: rgba(56, 189, 248, 0.6);
          }
        }
        @keyframes glow-mobile {
          0%, 100% { 
            box-shadow: 0 -5px 15px rgba(56, 189, 248, 0.3), 0 -2px 10px rgba(14, 165, 233, 0.4);
            border-top-color: rgba(56, 189, 248, 0.3);
          }
          50% { 
            box-shadow: 0 -8px 25px rgba(56, 189, 248, 0.5), 0 -4px 15px rgba(14, 165, 233, 0.6);
            border-top-color: rgba(56, 189, 248, 0.6);
          }
        }
        .ease-bounce {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .ease-reveal {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scale-98 {
          transform: scale(0.98);
        }
        /* Add animation for error messages */
        .error-message {
          animation: errorFadeIn 0.3s ease-in-out;
        }
        @keyframes errorFadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
} 