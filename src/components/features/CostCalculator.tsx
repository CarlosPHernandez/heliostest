'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export const CostCalculator = () => {
  const [monthlyBill, setMonthlyBill] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement actual calculation logic
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Calculate Your Savings
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="monthlyBill" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Electricity Bill ($)
          </label>
          <div className="relative">
            <input
              type="number"
              id="monthlyBill"
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(e.target.value)}
              className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter amount"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Calculate Savings</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        By submitting this form, you agree to our privacy policy and terms of service.
      </p>
    </div>
  )
} 