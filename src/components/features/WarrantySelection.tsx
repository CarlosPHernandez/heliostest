import { Shield, Check } from 'lucide-react'

interface WarrantySelectionProps {
  selectedWarranty: 'standard' | 'extended'
  onSelect: (warranty: 'standard' | 'extended') => void
}

const warrantyOptions = {
  standard: {
    title: 'Standard Warranty',
    price: 0,
    coverage: [
      '25-year panel performance warranty',
      '10-year inverter warranty',
      '10-year workmanship warranty',
    ]
  },
  extended: {
    title: 'Extended Warranty',
    price: 1500,
    coverage: [
      '25-year panel performance warranty',
      '25-year inverter warranty',
      '25-year workmanship warranty',
      'Annual maintenance included',
    ]
  }
}

export function WarrantySelection({ selectedWarranty, onSelect }: WarrantySelectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Select Your Warranty</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.entries(warrantyOptions) as [keyof typeof warrantyOptions, typeof warrantyOptions[keyof typeof warrantyOptions]][]).map(([key, option]) => (
          <div
            key={key}
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              selectedWarranty === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
            onClick={() => onSelect(key)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-900">{option.title}</h3>
              <div className={`flex items-center justify-center w-5 h-5 border-2 rounded-full ${
                selectedWarranty === key ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {selectedWarranty === key && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-4">
              {option.price === 0 ? 'Included' : formatCurrency(option.price)}
            </p>
            <ul className="space-y-2">
              {option.coverage.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
} 