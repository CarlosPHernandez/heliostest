'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { setCookie, clearOrderCookies } from '@/lib/cookies'

export default function OrderPage() {
  const router = useRouter()
  const [monthlyBill, setMonthlyBill] = useState<string>('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const bill = parseFloat(monthlyBill)
    if (isNaN(bill) || bill <= 0) {
      setError('Please enter a valid monthly bill amount')
      return
    }

    try {
      // Clear any existing order data
      localStorage.clear()
      clearOrderCookies()

      // Store the monthly bill
      localStorage.setItem('monthlyBill', monthlyBill)
      setCookie('monthlyBill', monthlyBill)

      router.push('/order/address')
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while saving your information')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Solar Journey
          </h1>
          <p className="text-lg text-gray-600">
            Enter your average monthly electricity bill to get started
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="monthlyBill" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Electricity Bill
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="monthlyBill"
                  id="monthlyBill"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(e.target.value)}
                  className="block w-full pl-7 pr-12 py-3 text-lg border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  placeholder="0.00"
                  aria-describedby="price-currency"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm" id="price-currency">
                    USD
                  </span>
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Calculate Your Solar Savings
              </button>
            </div>
          </form>

          <div className="mt-8 text-sm text-gray-500 text-center">
            <p>
              We'll use this information to calculate your potential solar savings
              and recommend the best system for your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 