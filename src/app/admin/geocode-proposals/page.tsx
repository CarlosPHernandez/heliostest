'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function GeocodeProposals() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const geocodeAddress = async (address: string) => {
    try {
      console.log('Geocoding address:', address)
      const encodedAddress = encodeURIComponent(address)
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`

      console.log('Fetching from URL:', url)
      const response = await fetch(url)
      const data = await response.json()

      console.log('Geocoding API response:', data)

      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location
        console.log('Successfully geocoded:', { lat, lng })
        return { latitude: lat, longitude: lng }
      } else {
        console.error('Geocoding failed:', {
          status: data.status,
          error_message: data.error_message,
          results: data.results
        })
        return null
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  const updateProposals = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all proposals without coordinates
      const { data: proposals, error: fetchError } = await supabase
        .from('proposals')
        .select('id, address')
        .or('latitude.is.null,longitude.is.null')

      if (fetchError) {
        console.error('Error fetching proposals:', fetchError)
        throw fetchError
      }

      if (!proposals || proposals.length === 0) {
        console.log('No proposals found that need geocoding')
        toast.info('No proposals found that need geocoding')
        setLoading(false)
        return
      }

      setProgress({ current: 0, total: proposals.length })
      console.log(`Found ${proposals.length} proposals to geocode`)

      let successCount = 0
      let failureCount = 0

      // Update each proposal with coordinates
      for (const proposal of proposals) {
        console.log(`Processing proposal ${proposal.id} with address: ${proposal.address}`)

        if (!proposal.address) {
          console.warn(`Proposal ${proposal.id} has no address`)
          failureCount++
          continue
        }

        const coordinates = await geocodeAddress(proposal.address)

        if (coordinates) {
          console.log(`Updating proposal ${proposal.id} with coordinates:`, coordinates)
          const { error: updateError } = await supabase
            .from('proposals')
            .update(coordinates)
            .eq('id', proposal.id)

          if (updateError) {
            console.error(`Error updating proposal ${proposal.id}:`, updateError)
            failureCount++
          } else {
            console.log(`Successfully updated proposal ${proposal.id}`)
            successCount++
          }
        } else {
          console.warn(`Could not geocode address for proposal ${proposal.id}: ${proposal.address}`)
          failureCount++
        }

        setProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }

      // Show detailed success message
      const message = `Geocoding completed: ${successCount} successful, ${failureCount} failed`
      console.log(message)
      if (successCount > 0) {
        toast.success(message)
      } else {
        toast.error(message)
      }

      // Give the toast time to show before redirecting
      setTimeout(() => {
        router.push('/admin')
      }, 2000)

    } catch (error) {
      console.error('Error updating proposals:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error updating proposals'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-medium mb-4">Geocode Proposals</h1>
          <p className="text-gray-600 mb-6">
            Update proposals with latitude and longitude coordinates based on their addresses.
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                Processing proposals... {progress.current} of {progress.total}
              </p>
            </div>
          ) : (
            <button
              onClick={updateProposals}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Geocoding
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 