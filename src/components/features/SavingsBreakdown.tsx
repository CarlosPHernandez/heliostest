interface SavingsBreakdownProps {
  monthlyBill: number
  systemProduction: number
  utilityRate?: number
  showFinancingComparison?: boolean
  financingPayment?: number
  loanTerm?: number
}

export function SavingsBreakdown({ 
  monthlyBill, 
  systemProduction,
  utilityRate = 0.14,
  showFinancingComparison = false,
  financingPayment,
  loanTerm
}: SavingsBreakdownProps) {
  // Calculate savings
  const monthlyConsumption = monthlyBill / utilityRate
  const remainingConsumption = Math.max(0, monthlyConsumption - systemProduction)
  const estimatedNewBill = Math.round(remainingConsumption * utilityRate)
  const monthlySavings = monthlyBill - estimatedNewBill

  // Calculate projected utility bill with 3% annual increase
  const projectedBill = showFinancingComparison && loanTerm
    ? monthlyBill * Math.pow(1.03, loanTerm)
    : monthlyBill

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          {showFinancingComparison
            ? `Compare Monthly Payments`
            : `Save Est. ${formatCurrency(monthlySavings)}/mo`}
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          {showFinancingComparison
            ? 'Solar Loan vs Utility Bill'
            : 'On Your Monthly Electric Bill With Solar'}
        </p>
      </div>

      {/* Bar Chart Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-8">
          <div className="flex items-end justify-center gap-16">
            {/* Without Solar Bar */}
            <div className="w-32">
              <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
                <div className="absolute -top-8 left-0 right-0 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(showFinancingComparison ? projectedBill : monthlyBill)}
                  </span>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-gray-600 font-medium">
                  {showFinancingComparison ? 'Utility Bill' : 'Without Solar'}
                </span>
                {showFinancingComparison && (
                  <p className="text-sm text-gray-500 mt-1">
                    With 3% annual increase
                  </p>
                )}
              </div>
            </div>

            {/* With Solar Bar */}
            <div className="w-32">
              <div 
                className={`${showFinancingComparison ? 'bg-green-500' : 'bg-blue-500'} rounded-lg relative`}
                style={{
                  height: showFinancingComparison 
                    ? `${Math.min(100, (financingPayment || 0) / projectedBill * 64)}rem`
                    : `${Math.min(100, estimatedNewBill / monthlyBill * 64)}rem`
                }}
              >
                <div className="absolute -top-8 left-0 right-0 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(showFinancingComparison ? (financingPayment || 0) : estimatedNewBill)}
                  </span>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-gray-600 font-medium">
                  {showFinancingComparison ? 'Solar Payment' : 'With Solar'}
                </span>
                {showFinancingComparison && loanTerm && (
                  <p className="text-sm text-gray-500 mt-1">
                    {loanTerm}-year fixed
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Savings Details */}
          {!showFinancingComparison && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Secure Your Electricity Costs
              </h3>
              <p className="text-gray-900 font-medium mb-4">
                {formatCurrency(monthlySavings)} Avg. Monthly Savings
              </p>
              <div className="text-gray-600">
                <p className="mb-3">Savings are calculated based on:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Cash payment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Amount of electricity your system can produce ({Math.round(systemProduction)} kWh/month)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Average price of electricity in your state, increasing 2% annually
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Your average monthly electric bill of {formatCurrency(monthlyBill)}/mo
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 