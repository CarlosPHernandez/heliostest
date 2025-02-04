'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Star } from 'lucide-react'
import ShopLayout from '@/components/layout/ShopLayout'

const products = [
  {
    id: 1,
    name: 'Solar Panel Pro X',
    price: 599.99,
    rating: 4.8,
    reviews: 128,
    image: 'https://picsum.photos/id/1067/400/400',
    category: 'Panels',
  },
  {
    id: 2,
    name: 'Energy Storage Plus',
    price: 1299.99,
    rating: 4.9,
    reviews: 89,
    image: 'https://picsum.photos/id/1071/400/400',
    category: 'Storage',
  },
  {
    id: 3,
    name: 'Smart Solar Controller',
    price: 299.99,
    rating: 4.7,
    reviews: 256,
    image: 'https://picsum.photos/id/1069/400/400',
    category: 'Controllers',
  },
  // Add more products...
]

const ShopPage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ShopLayout>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex text-sm text-gray-600">
          <li>
            <a href="#" className="hover:text-gray-900">Home</a>
          </li>
          <li className="mx-2">/</li>
          <li className="text-gray-900">Shop</li>
        </ol>
      </nav>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">${product.price}</span>
                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found matching your search.</p>
        </div>
      )}
    </ShopLayout>
  )
}

export default ShopPage 