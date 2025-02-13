'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })

      if (error) throw error

      setIsSubmitted(true)
      toast.success('Password reset instructions sent to your email')
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Failed to send reset instructions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-white">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              We've sent password reset instructions to {email}
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send reset instructions'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 