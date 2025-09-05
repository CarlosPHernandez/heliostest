'use client'

import { useEffect, useRef, useState } from 'react'
import React from 'react'

interface MapboxAddressInputProps {
  value: string
  onChange: (address: string) => void
  onSelect?: (place: any) => void
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
  onValidationChange?: (isValid: boolean) => void
}

interface MapboxPlace {
  place_name: string
  center: [number, number]
  geometry: {
    coordinates: [number, number]
  }
  context?: Array<{
    id: string
    text: string
  }>
}

export default function MapboxAddressInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter your address",
  className = "",
  id = "mapbox-address-input",
  disabled = false,
  onValidationChange
}: MapboxAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const geocoderRef = useRef<any>(null)
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(false)
  const [suggestions, setSuggestions] = useState<MapboxPlace[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleMapboxLoaded = () => {
      console.log('Mapbox loaded event received in AddressInput')
      setIsMapboxLoaded(true)
    }

    // Check if Mapbox is already loaded
    if (window.mapboxgl && window.MapboxGeocoder) {
      setIsMapboxLoaded(true)
    } else {
      window.addEventListener('mapbox-loaded', handleMapboxLoaded)
    }

    return () => {
      window.removeEventListener('mapbox-loaded', handleMapboxLoaded)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

  const searchAddresses = async (query: string) => {
    if (!query.trim()) return

    try {
      setIsLoading(true)
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      
      if (!accessToken) {
        throw new Error('Mapbox access token is missing')
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${accessToken}&` +
        `country=US&` +
        `types=address,poi&` +
        `limit=5&` +
        `autocomplete=true`

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Mapbox Geocoding API error:', response.status, errorText)
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      
      setSuggestions(data.features || [])
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error searching addresses:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      if (newValue.length > 2) {
        searchAddresses(newValue)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    // Reset validation
    if (onValidationChange) {
      onValidationChange(false)
    }
  }

  const handleSuggestionSelect = (place: MapboxPlace) => {
    onChange(place.place_name)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)

    if (onSelect) {
      onSelect({
        formatted_address: place.place_name,
        geometry: {
          location: {
            lat: place.center[1],
            lng: place.center[0]
          }
        },
        place_id: place.place_name // Use place_name as fallback ID
      })
    }

    if (onValidationChange) {
      onValidationChange(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setSuggestions([])
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }, 200)
  }

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        disabled={disabled || !isMapboxLoaded}
        autoComplete="off"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute w-full mt-1 rounded-lg max-h-60 overflow-auto z-[9999]"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            opacity: 1,
          }}
        >
          {suggestions.map((place, index) => (
            <button
              key={`${place.place_name}-${index}`}
              type="button"
              className={`w-full text-left px-4 py-3 border-none cursor-pointer transition-all duration-150 ease-in-out focus:outline-none font-inter font-medium text-base ${
                index === 0 ? 'rounded-t-lg' : ''
              } ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}`}
              style={{
                backgroundColor: index === selectedIndex ? '#F5F5F5' : '#ffffff',
                opacity: 1,
                color: '#424242',
              }}
              onMouseEnter={() => {
                setSelectedIndex(index)
                // Change background on hover
                const target = event?.target as HTMLElement
                if (target && index !== selectedIndex) {
                  target.style.backgroundColor = '#f9fafb'
                }
              }}
              onMouseLeave={() => {
                // Reset background when not selected
                const target = event?.target as HTMLElement
                if (target && index !== selectedIndex) {
                  target.style.backgroundColor = '#ffffff'
                }
              }}
              onClick={() => handleSuggestionSelect(place)}
            >
              <div className="w-full">
                <div 
                  className="text-base font-medium truncate font-inter leading-6"
                  style={{ 
                    color: '#424242',
                  }}
                >
                  {place.place_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !isLoading && value.length > 2 && (
        <div 
          className="absolute w-full mt-1 rounded-xl z-[9999]"
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e5e7eb',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            opacity: 1,
          }}
        >
          <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No addresses found
          </div>
        </div>
      )}
    </div>
  )
}
