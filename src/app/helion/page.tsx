'use client'

import { useState } from 'react'
import Image from 'next/image'
import LandingPageHeader from '@/components/layout/LandingPageHeader'

// Define custom color variables based on your design system
const customColors = {
  'text-Static-White': 'text-white',
  'text-Text-Base': 'text-gray-900',
  'text-Text-Subtle': 'text-gray-600',
  'text-Text-Muted': 'text-gray-500',
  'text-Text-Inverted': 'text-white',
  'text-Green-500': 'text-green-500',
  'Surface-Base': 'bg-gray-50',
  'Surface-Subtle': 'bg-gray-100',
  'Surface-Inverted': 'bg-gray-900',
  'Surface-Emphasis': 'bg-blue-600',
  'Border-Base': 'border-gray-300',
  'Border-Subtle': 'border-gray-200',
  'Blue-600': 'bg-blue-600',
  'Grey-300': 'bg-gray-300',
  'Yellow-500': 'bg-yellow-500',
  'Green-500': 'bg-green-500'
}

export default function B2BSaaSLanding() {
  return (
    <div className="w-full h-screen fixed inset-0 overflow-hidden" style={{ backgroundColor: '#1c1c1c' }}>
      {/* Landing Page Header */}
      <LandingPageHeader />
      
      


      {/* Main Dashboard Preview - Using SVG */}
      <div className="w-full max-w-6xl left-1/2 transform -translate-x-1/2 bottom-0 absolute px-2 sm:px-4 md:px-8 lg:px-16">
        <div className="w-full aspect-[1008/435] max-h-[320px] sm:max-h-[380px] md:max-h-[420px] lg:max-h-[480px]">
          <Image
            src="/images/landingpage/mockupwithdash.svg"
            alt="Dashboard Preview"
            width={1008}
            height={435}
            className="w-full h-full object-contain rounded-lg"
            priority
          />
        </div>
      </div>

      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full" style={{ backgroundColor: '#1c1c1c' }}></div>
      </div>

      {/* Hero content */}
      <div className="w-full max-w-7xl left-1/2 transform -translate-x-1/2 top-[25%] sm:top-[28%] md:top-[25%] lg:top-[22%] xl:top-[20%] absolute px-4 sm:px-6 md:px-8 lg:px-16 flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-6">
        <div className="w-full flex flex-col justify-center items-center gap-2 sm:gap-3">
          <div className="w-full text-center text-white text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-bold font-inter leading-tight whitespace-nowrap">
            Your solar business. Supercharged.
          </div>
          <div className="w-full max-w-xl sm:max-w-2xl text-center text-base sm:text-lg md:text-xl font-medium font-inter leading-relaxed px-2" style={{ color: '#B0B0B0' }}>
            From first lead to final installation, manage every step of the journey in one seamless, data-driven workspace.
          </div>
        </div>
        <a 
          href="https://cal.com/carlo-heliosnexus/15min" 
          target="_blank" 
          rel="noopener noreferrer"
          data-show-left-icon="false" 
          data-show-right-icon="false" 
          data-size="Medium" 
          data-style="Inverted" 
          className="h-10 sm:h-12 px-6 sm:px-8 bg-white rounded-md inline-flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="text-center text-gray-900 text-sm sm:text-base font-medium font-inter leading-tight">Book Your Demo</div>
        </a>
      </div>
    </div>
  )
}
