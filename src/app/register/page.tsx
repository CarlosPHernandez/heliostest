'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {verificationSent ? (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-blue-800">Verification Email Sent</h3>
              <p className="mt-2 text-sm text-blue-600">
                We've sent a verification email to <strong>{verificationEmail}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
              <p className="mt-2 text-sm text-blue-600">
                If you don't see the email, please check your spam folder.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Testing Only:</strong> If you're having trouble with the email link, you can
                  <Link href="/auth/verified" className="text-blue-600 hover:text-blue-500 ml-1">
                    click here to view the verification page directly
                  </Link>.
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 