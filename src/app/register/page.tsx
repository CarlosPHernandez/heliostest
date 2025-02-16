'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    try {
      console.log('Starting registration process...')

      // Get any pending proposal from cookies
      const cookies = document.cookie.split(';')
      const pendingProposalCookie = cookies.find(cookie => cookie.trim().startsWith('pendingProposal='))
      const pendingProposal = pendingProposalCookie ? JSON.parse(decodeURIComponent(pendingProposalCookie.split('=')[1])) : null

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?${pendingProposal ? 'returnUrl=/order/proposal' : ''}`,
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
        console.log('User created successfully, attempting profile creation...')
        console.log('Email confirmation status:', authData.user.confirmation_sent_at ? 'Sent' : 'Not sent')

        // Create profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: name,
              email,
            },
          ])
          .select()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          console.error('Profile error details:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          })
          console.log('Profile creation failed, continuing with registration...')
        } else {
          console.log('Profile created successfully:', profileData)
        }

        // Check if email was sent
        if (authData.user.confirmation_sent_at) {
          toast.success('Registration successful! Please check your email to confirm your account. Check your spam folder if you don\'t see it.')
        } else {
          toast.warning('Account created but there might be an issue with the verification email. Please contact support.')
        }
      }

      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof Error && error.message === 'Email already registered') {
        toast.error('This email is already registered. Please try logging in instead.')
        router.push('/login')
      } else {
        toast.error(error instanceof Error ? error.message : 'Error registering user')
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
                  minLength={6}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 