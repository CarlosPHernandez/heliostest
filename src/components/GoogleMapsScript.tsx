'use client'

import { useEffect, useState } from 'react'
import React from 'react'

declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
    [key: string]: any;
  }
}

const SCRIPT_ID = 'google-maps-script'

export function GoogleMapsScript() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Enhanced debug logging
    console.log('Environment check:', {
      isDevelopment: process.env.NODE_ENV === 'development',
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyStart: apiKey ? `${apiKey.substring(0, 5)}...` : 'none'
    })

    // Function to emit loaded event
    const emitLoadedEvent = () => {
      console.log('Emitting google-maps-loaded event')
      window.dispatchEvent(new Event('google-maps-loaded'))
    }

    // Check if script is already loaded and working
    if (window.google?.maps?.places) {
      console.log('Google Maps already loaded')
      emitLoadedEvent()
      return
    }

    // Check if script tag already exists
    const existingScript = document.getElementById(SCRIPT_ID)
    if (existingScript) {
      console.log('Script tag already exists')
      return
    }

    // Validate API key
    if (!apiKey) {
      const errorMsg = 'Google Maps API key is missing'
      console.error(errorMsg)
      setError(errorMsg)
      return
    }

    // Create new script element
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true

    // Handle script load
    script.onload = () => {
      console.log('Script loaded, waiting for Places API')
      // Give a small delay to ensure Places API is initialized
      setTimeout(() => {
        if (window.google?.maps?.places) {
          console.log('Places API confirmed loaded')
          emitLoadedEvent()
        } else {
          const errorMsg = 'Places API failed to load'
          console.error(errorMsg)
          setError(errorMsg)
        }
      }, 100)
    }

    // Handle script load error
    script.onerror = (e) => {
      const errorMsg = 'Failed to load Google Maps script'
      console.error(errorMsg, e)
      setError(errorMsg)
      script.remove()
    }

    // Add script to document
    console.log('Adding script to document')
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // We don't remove the script on unmount as it should persist
      // Just clean up any error state
      setError(null)
    }
  }, []) // Empty dependency array since we don't want to reload the script

  if (error) {
    return (
      <div role="alert" className="text-red-600 text-sm p-2 bg-red-50 rounded-md mb-4">
        Error: {error}
      </div>
    )
  }

  return null
} 