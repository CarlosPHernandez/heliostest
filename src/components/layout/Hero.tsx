'use client'

import Image from 'next/image'
import { CostCalculator } from '@/components/features/CostCalculator'

const Hero = () => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Helios ai hero image.webp"
          alt="Modern house with solar panels"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="flex flex-col items-center gap-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800 drop-shadow-lg">
              Solar Made Simple.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-800 drop-shadow-lg max-w-2xl mx-auto">
              Transform your home with sustainable energy solutions. Calculate your potential savings and take the first step towards a greener future.
            </p>
          </div>

          <div className="w-full max-w-md">
            <CostCalculator />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero 