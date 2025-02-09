import React, { useState } from 'react';

const Packages = () => {
  // Add state for tax credit toggle
  const [showTaxCredit, setShowTaxCredit] = useState(false);

  // Calculate prices with and without tax credit (30% federal tax credit)
  const packagePrices = {
    standard: {
      withoutCredit: 25000,
      withCredit: 25000 * 0.7  // 30% tax credit applied
    },
    premium: {
      withoutCredit: 35000,
      withCredit: 35000 * 0.7  // 30% tax credit applied
    }
  };

  return (
    <div className="py-24">
      <div className="container">
        {/* Add toggle switch */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <span>Show prices without tax credit</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showTaxCredit}
              onChange={() => setShowTaxCredit(!showTaxCredit)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all">
            </div>
          </label>
          <span>Show prices with tax credit</span>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Standard Package */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Standard Package</h3>
            <p className="text-3xl font-bold mb-4">
              ${showTaxCredit 
                ? packagePrices.standard.withCredit.toLocaleString() 
                : packagePrices.standard.withoutCredit.toLocaleString()}
            </p>
            {/* ... rest of package details ... */}
          </div>

          {/* Premium Package */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Premium Package</h3>
            <p className="text-3xl font-bold mb-4">
              ${showTaxCredit 
                ? packagePrices.premium.withCredit.toLocaleString() 
                : packagePrices.premium.withoutCredit.toLocaleString()}
            </p>
            {/* ... rest of package details ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages; 