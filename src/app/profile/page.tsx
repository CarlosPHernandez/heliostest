'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [profile, setProfile] = useState<{
    id: string
    full_name: string
    email: string
  } | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(profile)
    } catch (error) {
      toast.error('Error loading profile')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const updates = {
        full_name: formData.get('name') as string,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      loadProfile()
    } catch (error) {
      toast.error('Error updating profile')
      console.error('Error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      // Clear any stored cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=')
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      })

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Show success message and redirect
      toast.success('Signed out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out. Please try again.')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)

      // Call the delete user API endpoint
      const response = await fetch('/api/user', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      // Sign out and clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=')
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      })

      await supabase.auth.signOut()

      toast.success('Account deleted successfully')
      router.push('/register')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(error instanceof Error ? error.message : 'Error deleting account. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmation(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Settings</h3>

              <form onSubmit={handleSubmit} className="mt-5 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={profile?.full_name || ''}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Sign Out
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Delete Account Confirmation Modal */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data, including proposals and documents.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Proposals Section */}
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Your Proposals</h3>
              <ProposalsList userId={profile?.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProposalsList({ userId }: { userId: string | undefined }) {
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (userId) {
      loadProposals()
    }
  }, [userId])

  const loadProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProposals(data || [])
    } catch (error) {
      toast.error('Error loading proposals')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-md" />
  }

  if (proposals.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-4">
        You haven't created any proposals yet.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">
                {proposal.address}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {proposal.system_size}kW System • {proposal.number_of_panels} Panels
              </p>
              <p className="text-sm text-gray-500">
                Created on {new Date(proposal.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {proposal.package_type}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(proposal.total_price)}
              </span>
              <span className="text-gray-500 ml-2">
                {proposal.payment_type === 'finance' ? 'Financed' : 'Cash Purchase'}
              </span>
            </div>
            <button
              onClick={() => router.push(`/proposals/${proposal.id}`)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 