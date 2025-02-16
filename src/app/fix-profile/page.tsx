'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function FixProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleFixProfile = async () => {
    try {
      setIsLoading(true)

      // First sign in
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'carlos@heliosnexus.com',
        password: prompt('Please enter your password') || '',
      })

      if (signInError) throw signInError

      if (!session?.user) {
        throw new Error('No user session')
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'Carlos',
          }
        ])
        .select()
        .single()

      if (profileError) throw profileError

      toast.success('Profile fixed successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error fixing profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Fix Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This will create your profile and fix the login issue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={handleFixProfile}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Fixing...' : 'Fix My Profile'}
          </button>
        </div>
      </div>
    </div>
  )
} 