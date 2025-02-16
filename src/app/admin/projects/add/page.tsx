'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

declare global {
  interface Window {
    google: any
  }
}

interface ProjectFormData {
  customer_name: string
  email: string
  phone: string
  address: string
  system_size: number
  total_price: number
  number_of_panels: number
  package_type: string
  payment_type: string
  include_battery: boolean
  battery_type?: string
  battery_count?: number
  status: string
  stage: string
  notes?: string
}

export default function AddProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [autocomplete, setAutocomplete] = useState<any>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
    system_size: 0,
    total_price: 0,
    number_of_panels: 0,
    package_type: 'standard',
    payment_type: 'cash',
    include_battery: false,
    status: 'pending',
    stage: 'onboarding'
  })

  useEffect(() => {
    // Initialize Google Places Autocomplete when the script is loaded
    const initAutocomplete = () => {
      if (!window.google?.maps?.places) {
        console.error('Google Places API not available')
        toast.error('Address autocomplete is not available')
        return
      }

      try {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          document.getElementById('address-input'),
          {
            componentRestrictions: { country: 'us' },
            types: ['address'],
            fields: ['formatted_address', 'geometry']
          }
        )

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace()
          if (place.formatted_address) {
            setFormData(prev => ({
              ...prev,
              address: place.formatted_address
            }))
          }
        })

        setAutocomplete(autocompleteInstance)
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error)
        toast.error('Failed to initialize address autocomplete')
      }
    }

    // If Google Maps is already loaded, initialize autocomplete
    if (window.google?.maps?.places) {
      initAutocomplete()
    }

    // Cleanup
    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // First check if user exists in auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error('Authentication error: ' + sessionError.message)
      }

      if (!session?.user?.id) {
        throw new Error('Not authenticated. Please log in first.')
      }

      // Check if current user is admin
      const { data: adminProfile, error: adminProfileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (adminProfileError) {
        console.error('Admin check error:', adminProfileError)
        throw new Error('Error checking admin status')
      }

      if (!adminProfile?.is_admin) {
        throw new Error('Access denied. Admin privileges required.')
      }

      // Check if customer profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle()

      let customerId: string

      if (existingProfile?.id) {
        // Use existing profile
        customerId = existingProfile.id

        // Update the profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: formData.customer_name,
            phone: formData.phone
          })
          .eq('id', customerId)

        if (updateError) {
          console.error('Profile update error:', updateError)
          throw new Error('Failed to update user profile')
        }
      } else {
        // Generate a secure random password
        const password = Math.random().toString(36).slice(-12) +
          Math.random().toString(36).slice(-12) +
          '!@#$'

        // Create auth user using Supabase auth API
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
          options: {
            data: {
              name: formData.customer_name
            }
          }
        })

        if (signUpError) {
          console.error('User creation error:', signUpError)
          throw new Error('Failed to create user account')
        }

        if (!data.user?.id) {
          throw new Error('Failed to create user - no ID returned')
        }

        customerId = data.user.id

        // Create profile
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: customerId,
            name: formData.customer_name,
            email: formData.email,
            phone: formData.phone,
            is_admin: false
          })

        if (createProfileError) {
          console.error('Profile creation error:', createProfileError)
          throw new Error('Failed to create user profile')
        }
      }

      // Create the proposal
      const { error: proposalError } = await supabase
        .from('proposals')
        .insert({
          user_id: customerId,
          address: formData.address,
          system_size: formData.system_size,
          total_price: formData.total_price,
          number_of_panels: formData.number_of_panels,
          package_type: formData.package_type,
          payment_type: formData.payment_type,
          include_battery: formData.include_battery,
          battery_type: formData.battery_type,
          battery_count: formData.battery_count,
          status: formData.status,
          stage: formData.stage,
          notes: formData.notes
        })

      if (proposalError) {
        console.error('Proposal creation error:', proposalError)
        throw new Error('Failed to create proposal')
      }

      toast.success('Project added successfully')
      router.push('/admin/projects')
    } catch (error) {
      console.error('Error adding project:', error)
      toast.error('Failed to add project: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 :
        type === 'checkbox' ? (e.target as HTMLInputElement).checked :
          value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-medium">Add New Project</h1>
          <button
            onClick={() => router.push('/admin/projects')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Projects
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Customer Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    id="address-input"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Start typing an address..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">System Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">System Size (kW)</label>
                  <input
                    type="number"
                    name="system_size"
                    value={formData.system_size}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Number of Panels</label>
                  <input
                    type="number"
                    name="number_of_panels"
                    value={formData.number_of_panels}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Total Price ($)</label>
                  <input
                    type="number"
                    name="total_price"
                    value={formData.total_price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Package Type</label>
                  <select
                    name="package_type"
                    value={formData.package_type}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Payment Type</label>
                  <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="finance">Finance</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Project Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="design">Design</option>
                    <option value="permitting">Permitting</option>
                    <option value="installation">Installation</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="include_battery"
                  checked={formData.include_battery}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Include Battery</label>
              </div>

              {formData.include_battery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Battery Type</label>
                    <select
                      name="battery_type"
                      value={formData.battery_type || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Battery Type</option>
                      <option value="tesla">Tesla Powerwall</option>
                      <option value="enphase">Enphase</option>
                      <option value="lg">LG</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Battery Count</label>
                    <input
                      type="number"
                      name="battery_count"
                      value={formData.battery_count || ''}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Adding Project...
                </>
              ) : (
                'Add Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 