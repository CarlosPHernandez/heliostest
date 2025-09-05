'use client'

import { useEffect, useState } from 'react'
import React from 'react'

declare global {
  interface Window {
    mapboxgl: any;
    MapboxGeocoder: any;
    [key: string]: any;
  }
}

const MAPBOX_SCRIPT_ID = 'mapbox-gl-script'
const GEOCODER_SCRIPT_ID = 'mapbox-geocoder-script'
const MAPBOX_CSS_ID = 'mapbox-gl-css'
const GEOCODER_CSS_ID = 'mapbox-geocoder-css'

export function MapboxScript() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    // Enhanced debug logging
    console.log('Mapbox Environment check:', {
      isDevelopment: process.env.NODE_ENV === 'development',
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length,
      tokenStart: accessToken ? `${accessToken.substring(0, 8)}...` : 'none'
    })

    // Function to emit loaded event
    const emitLoadedEvent = () => {
      console.log('Emitting mapbox-loaded event')
      window.dispatchEvent(new Event('mapbox-loaded'))
      setLoading(false)
    }

    // Check if libraries are already loaded
    if (window.mapboxgl && window.MapboxGeocoder) {
      console.log('Mapbox already loaded')
      emitLoadedEvent()
      return
    }

    // Validate access token
    if (!accessToken) {
      const errorMsg = 'Mapbox access token is missing'
      console.error(errorMsg)
      setError(errorMsg)
      setLoading(false)
      return
    }

    // Set access token globally
    if (window.mapboxgl) {
      window.mapboxgl.accessToken = accessToken
    }

    const loadScript = (id: string, src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.getElementById(id)
        if (existingScript) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.id = id
        script.src = src
        script.async = true
        script.defer = true

        script.onload = () => {
          console.log(`Script loaded: ${id}`)
          resolve()
        }

        script.onerror = (e) => {
          console.error(`Failed to load script: ${id}`, e)
          reject(new Error(`Failed to load ${id}`))
        }

        document.head.appendChild(script)
      })
    }

    const loadCSS = (id: string, href: string): void => {
      // Check if CSS already exists
      const existingCSS = document.getElementById(id)
      if (existingCSS) return

      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    }

    const loadMapbox = async () => {
      try {
        // Load CSS files first
        loadCSS(MAPBOX_CSS_ID, 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css')
        loadCSS(GEOCODER_CSS_ID, 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css')

        // Load Mapbox GL JS
        await loadScript(MAPBOX_SCRIPT_ID, 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js')
        
        // Set access token after mapbox-gl loads
        if (window.mapboxgl) {
          window.mapboxgl.accessToken = accessToken
        }

        // Load Mapbox Geocoder
        await loadScript(GEOCODER_SCRIPT_ID, 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js')

        // Verify both libraries are loaded
        if (window.mapboxgl && window.MapboxGeocoder) {
          console.log('Mapbox GL and Geocoder loaded successfully')
          emitLoadedEvent()
        } else {
          throw new Error('Mapbox libraries failed to initialize')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load Mapbox'
        console.error(errorMsg)
        setError(errorMsg)
        setLoading(false)
      }
    }

    loadMapbox()

    // Cleanup function
    return () => {
      setError(null)
      setLoading(true)
    }
  }, [])

  if (error) {
    return (
      <div role="alert" className="text-red-600 text-sm p-2 bg-red-50 rounded-md mb-4">
        Error: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-blue-600 text-sm p-2 bg-blue-50 rounded-md mb-4">
        Loading Mapbox...
      </div>
    )
  }

  return null
}
