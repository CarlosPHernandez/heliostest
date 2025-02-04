'use client'

import { useState } from 'react'
import { ShoppingCart, Filter, X } from 'lucide-react'
import MainLayout from './MainLayout'

interface ShopLayoutProps {
  children: React.ReactNode
}

const ShopLayout = ({ children }: ShopLayoutProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <MainLayout>
      <div className="relative min-h-screen">
        {/* Mobile Filter Button */}
        <div className="fixed bottom-4 right-4 md:hidden z-40">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="bg-black text-white p-3 rounded-full shadow-lg"
          >
            <Filter className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Button */}
        <div className="fixed bottom-4 right-20 md:right-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-black text-white p-3 rounded-full shadow-lg"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isFilterOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 w-64 bg-white border-r transition-transform duration-200 ease-in-out z-30`}
        >
          <div className="h-full overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="md:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Add filter components here */}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div
          className={`fixed inset-y-0 right-0 transform ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          } w-80 bg-white border-l shadow-xl transition-transform duration-200 ease-in-out z-50`}
        >
          <div className="h-full overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Add cart items here */}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:ml-64 p-4 sm:p-6 lg:p-8">
          {children}
        </div>

        {/* Overlay */}
        {(isFilterOpen || isCartOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => {
              setIsFilterOpen(false)
              setIsCartOpen(false)
            }}
          />
        )}
      </div>
    </MainLayout>
  )
}

export default ShopLayout 