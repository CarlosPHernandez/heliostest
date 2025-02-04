'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

const DiscoverPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const products = [
    {
      id: 1,
      title: 'Solar Panel Pro X',
      description: 'High-efficiency solar panels with advanced tracking technology',
      image: 'https://picsum.photos/id/1067/800/600',
    },
    {
      id: 2,
      title: 'Energy Storage Plus',
      description: 'Next-generation battery storage for 24/7 power availability',
      image: 'https://picsum.photos/id/1071/800/600',
    },
    {
      id: 3,
      title: 'Smart Solar Controller',
      description: 'AI-powered system for optimal energy management',
      image: 'https://picsum.photos/id/1069/800/600',
    },
  ]

  const features = [
    {
      title: 'Advanced Tracking',
      description: 'Dual-axis tracking system for maximum sun exposure',
      icon: '🌞',
    },
    {
      title: 'Smart Integration',
      description: 'Seamless connection with home automation systems',
      icon: '🏠',
    },
    {
      title: 'Weather Adaptive',
      description: 'Real-time adjustments based on weather conditions',
      icon: '🌤',
    },
    {
      title: 'Energy Analytics',
      description: 'Detailed insights into your energy production and usage',
      icon: '📊',
    },
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gray-900">
        <div className="absolute inset-0">
          <Image
            src={products[currentSlide].image}
            alt={products[currentSlide].title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {products[currentSlide].title}
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              {products[currentSlide].description}
            </p>
            <button className="bg-white text-black px-8 py-3 rounded-md hover:bg-gray-100 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? products.length - 1 : prev - 1))}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === products.length - 1 ? 0 : prev + 1))}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
            <Image
              src="https://picsum.photos/id/1070/1920/1080"
              alt="Video thumbnail"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <Play className="h-8 w-8 text-black" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest updates on our products and technology innovations.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-black"
              required
            />
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </MainLayout>
  )
}

export default DiscoverPage 