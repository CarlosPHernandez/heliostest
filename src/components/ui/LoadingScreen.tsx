'use client'

import { useEffect, useState } from 'react'
import { Sun } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen = ({ message = 'Logging in...' }: LoadingScreenProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer sun glow */}
        <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-75" />
        
        {/* Sun with fill effect */}
        <div className="relative">
          {/* Background sun */}
          <Sun className="h-16 w-16 text-gray-200" />
          
          {/* Filling sun */}
          <div className="absolute inset-0">
            <Sun className="h-16 w-16 text-yellow-400 animate-pulse" />
          </div>
          
          {/* Rotating rays */}
          <div className="absolute inset-0 animate-spin">
            <Sun className="h-16 w-16 text-yellow-500" />
          </div>
        </div>
      </div>

      <p className="mt-6 text-lg font-medium text-gray-900">{message}</p>
      <div className="mt-3 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-full bg-yellow-400 animate-pulse origin-left"></div>
      </div>
    </div>
  )
}

export default LoadingScreen 