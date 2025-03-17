import { TrendingUp, AlertCircle } from 'lucide-react'

interface UtilityCostProjectionProps {
  monthlyBill: number
  utilityName: string
}

export function UtilityCostProjection({ monthlyBill, utilityName }: UtilityCostProjectionProps) {
  const calculateTotalCost = (monthlyBill: number): number => {
    let totalCost = 0
    let yearlyBill = monthlyBill * 12

    // Calculate cost for each year with 3% increase
    for (let year = 0; year < 25; year++) {
      totalCost += yearlyBill
      yearlyBill *= 1.03 // 3% increase
    }

    return Math.round(totalCost)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalCost = calculateTotalCost(monthlyBill)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">25-Year Utility Cost Projection</h2>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center text-center p-6 bg-red-50 rounded-lg">
          <p className="text-4xl font-bold text-red-600 mb-2">
            {formatCurrency(totalCost)}
          </p>
          <p className="text-gray-700">
            Projected payments to {utilityName} over the next 25 years
          </p>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            This projection assumes a conservative 3% annual increase in electricity rates,
            based on historical trends. Actual rates may vary and could be higher due to
            inflation and market conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-1">Current Monthly Bill</p>
            <p className="text-gray-600">{formatCurrency(monthlyBill)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-1">Projected Monthly Bill in 25 Years</p>
            <p className="text-gray-600">{formatCurrency(monthlyBill * Math.pow(1.03, 25))}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 