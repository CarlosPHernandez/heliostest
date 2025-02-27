'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Testimonials } from '@/components/features/Testimonials'

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

    const billAmount = monthlyBill.replace('$', '')

    try {
      // Store the monthly bill in localStorage
      localStorage.setItem('monthlyBill', billAmount)

      // Navigate to address input step
      router.push('/order/address')
    } catch (err) {
      setError('Error saving your information')
      console.error('Error:', err)
    }
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
    <main>
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
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center -mt-20 min-h-[calc(100vh-4rem)] px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 drop-shadow-sm">
              Solar Made Simple.
            </h1>
            <p className="mt-8 text-xl sm:text-2xl leading-8 text-secondary-text max-w-2xl mx-auto drop-shadow-sm font-semibold">
              Instant solar quote in seconds, no pushy salesperson needed.
            </p>

            {/* Monthly Bill Form */}
            <div className="mt-12 w-full max-w-xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-3 justify-center">
                <div className="w-64">
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
                      className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
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
                  className="flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-black bg-white rounded-xl shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all duration-300"
                >
                  Get Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <Testimonials />
    </main>
  )
}
