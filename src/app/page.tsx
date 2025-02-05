'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const [monthlyBill, setMonthlyBill] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!monthlyBill || isNaN(Number(monthlyBill.replace('$', '')))) {
      setError('Please enter a valid amount')
      return
    }

    // Store the monthly bill in localStorage for now
    localStorage.setItem('monthlyBill', monthlyBill.replace('$', ''))
    
    // Navigate to address input step
    router.push('/order/address')
  }

  const formatCurrency = (value: string) => {
    // Remove any non-digit characters except decimal point
    const digits = value.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = digits.split('.')
    if (parts.length > 2) return monthlyBill
    
    // Format with dollar sign and limit decimal places
    if (parts.length === 2) {
      return `$${parts[0]}.${parts[1].slice(0, 2)}`
    }
    return `$${digits}`
  }

  return (
    <div className="relative min-h-screen pt-16">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Helios ai hero image.webp"
          alt="Solar panels on a modern house"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Solar Made Simple
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-100 max-w-2xl mx-auto">
            Start your journey to energy independence. Find out how much you could save by switching to solar power.
          </p>

          {/* Monthly Bill Form */}
          <div className="mt-10 w-full max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex-1 min-w-0">
                <label htmlFor="monthlyBill" className="sr-only">
                  Average Monthly Electric Bill
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="monthlyBill"
                    value={monthlyBill}
                    onChange={(e) => {
                      setError('')
                      setMonthlyBill(formatCurrency(e.target.value))
                    }}
                    placeholder="Average Monthly Bill"
                    className="block w-full rounded-lg py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm"
                  />
                  {error && (
                    <p className="absolute left-0 top-full mt-1 text-sm text-red-400 bg-black/50 px-2 py-1 rounded">
                      {error}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 text-sm font-semibold text-black bg-white rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
