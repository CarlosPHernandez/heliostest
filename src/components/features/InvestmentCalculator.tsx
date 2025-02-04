'use client'

import { useState } from 'react'
import { Calculator, DollarSign, Percent } from 'lucide-react'

interface CalculationResult {
  totalInvestment: number
  potentialReturns: number
  annualDividends: number
  projectedValue: number
}

export const InvestmentCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState('')
  const [timeHorizon, setTimeHorizon] = useState('')
  const [result, setResult] = useState<CalculationResult | null>(null)

  // Constants for calculations
  const ANNUAL_GROWTH_RATE = 0.12 // 12% average annual growth
  const DIVIDEND_YIELD = 0.04 // 4% annual dividend yield

  const calculateInvestment = (e: React.FormEvent) => {
    e.preventDefault()
    
    const investment = parseFloat(initialInvestment)
    const years = parseFloat(timeHorizon)
    
    if (isNaN(investment) || isNaN(years)) return

    // Calculate compound growth: A = P(1 + r)^t
    const projectedValue = investment * Math.pow(1 + ANNUAL_GROWTH_RATE, years)
    
    // Calculate potential returns (profit)
    const potentialReturns = projectedValue - investment
    
    // Calculate annual dividends based on average investment value
    const averageValue = (investment + projectedValue) / 2
    const annualDividends = averageValue * DIVIDEND_YIELD

    setResult({
      totalInvestment: investment,
      potentialReturns,
      annualDividends,
      projectedValue
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-semibold">Investment Calculator</h2>
      </div>

      <form onSubmit={calculateInvestment} className="space-y-4">
        <div>
          <label htmlFor="investment" className="block text-sm font-medium text-gray-700 mb-1">
            Initial Investment ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="number"
              id="investment"
              min="1000"
              step="1000"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="10000"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="timeHorizon" className="block text-sm font-medium text-gray-700 mb-1">
            Investment Period (Years)
          </label>
          <div className="relative">
            <input
              type="number"
              id="timeHorizon"
              min="1"
              max="30"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="pl-4 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="5"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Calculate Returns
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-lg">Projected Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Investment</p>
              <p className="text-xl font-bold">${result.totalInvestment.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Projected Value</p>
              <p className="text-xl font-bold">${Math.round(result.projectedValue).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Potential Returns</p>
              <p className="text-xl font-bold text-green-600">+${Math.round(result.potentialReturns).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Est. Annual Dividends</p>
              <p className="text-xl font-bold text-blue-600">${Math.round(result.annualDividends).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            <p>* Calculations based on:</p>
            <ul className="list-disc list-inside">
              <li>Average annual growth rate: {ANNUAL_GROWTH_RATE * 100}%</li>
              <li>Dividend yield: {DIVIDEND_YIELD * 100}%</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 