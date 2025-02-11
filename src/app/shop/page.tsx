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
    image: '/products/panel-prox.jpg',
    category: 'Panels',
    description: 'High-efficiency solar panel with advanced photovoltaic technology'
  },
  {
    id: 2,
    name: 'Energy Storage Plus',
    price: 1299.99,
    rating: 4.9,
    reviews: 89,
    image: '/products/battery-plus.jpg',
    category: 'Storage',
    description: 'Next-gen energy storage solution for maximum power retention'
  },
  {
    id: 3,
    name: 'Smart Solar Controller',
    price: 299.99,
    rating: 4.7,
    reviews: 256,
    image: '/products/controller.jpg',
    category: 'Controllers',
    description: 'Intelligent control system for optimal solar performance'
  },
  {
    id: 4,
    name: 'Helios Branded Cap',
    price: 29.99,
    rating: 4.9,
    reviews: 45,
    image: '/products/cap.jpg',
    category: 'Merchandise',
    description: 'Premium quality cap with embroidered Helios logo'
  },
  {
    id: 5,
    name: 'Solar Tech T-Shirt',
    price: 24.99,
    rating: 4.8,
    reviews: 67,
    image: '/products/tshirt.jpg',
    category: 'Merchandise',
    description: 'Comfortable cotton blend t-shirt with futuristic solar design'
  }
]

const services = [
  {
    id: 1,
    name: 'Solar Installation',
    price: 'Custom Quote',
    image: '/services/installation.jpg',
    description: 'Professional installation of solar panels and systems',
    features: [
      'Expert installation team',
      'Custom system design',
      'Permits and documentation',
      '25-year warranty'
    ]
  },
  {
    id: 2,
    name: 'Energy Consultation',
    price: 'Free',
    image: '/services/consultation.jpg',
    description: 'Comprehensive energy usage analysis and recommendations',
    features: [
      'Detailed energy audit',
      'Cost savings analysis',
      'Custom solution design',
      'ROI calculation'
    ]
  },
  {
    id: 3,
    name: 'Maintenance & Repair',
    price: 'From $149',
    image: '/services/maintenance.jpg',
    description: 'Regular maintenance and repair services for solar systems',
    features: [
      'Scheduled maintenance',
      'Emergency repairs',
      'Performance monitoring',
      'System upgrades'
    ]
  }
]

const ShopPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'services' | 'products'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'all' || product.category === selectedCategory)
  )

  return (
    <ShopLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-16 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Solar Solutions & Merchandise
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Discover our premium solar products, professional services, and exclusive merchandise
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent pointer-events-none" />
      </div>

      {/* Search and Filters */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search products and services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/50 backdrop-blur-sm hover:bg-white/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'services'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/50 backdrop-blur-sm hover:bg-white/80'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/50 backdrop-blur-sm hover:bg-white/80'
              }`}
            >
              Products
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {(activeTab === 'all' || activeTab === 'services') && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white mb-1">{service.name}</h3>
                    <p className="text-blue-100">{service.price}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      {(activeTab === 'all' || activeTab === 'products') && (
        <div>
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Products & Merchandise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square rounded-t-2xl overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">{product.category}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">${product.price}</span>
                    <button className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && activeTab !== 'services' && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found matching your search.</p>
        </div>
      )}
    </ShopLayout>
  )
}

export default ShopPage 