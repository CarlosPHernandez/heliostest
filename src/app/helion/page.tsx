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
    <div className="w-full min-h-screen overflow-y-auto" style={{ backgroundColor: '#1c1c1c' }}>
      {/* Landing Page Header */}
      <LandingPageHeader />
      
      {/* Hero content */}
      <div className="w-full max-w-7xl mx-auto mt-24 px-4 sm:px-6 md:px-8 lg:px-16 flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-6">
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
        
        {/* Animated Chevron */}
        <div className="mt-8 sm:mt-12 md:mt-16 flex justify-center">
          <div className="animate-bounce p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Dashboard Preview - Using SVG */}
      <div className="w-full max-w-6xl mx-auto mt-8 px-2 sm:px-4 md:px-8 lg:px-16">
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
        
        {/* Divider Line - Only visible on mobile */}
        <div className="block md:hidden w-full h-px bg-gray-600 mt-4"></div>
      </div>
      
      {/* Mobile Features Section - Only visible on mobile */}
      <div className="block md:hidden w-full mt-12 pt-8 pb-12 px-4" style={{ backgroundColor: '#1c1c1c' }}>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md mb-8">
            <h2 className="text-white text-2xl font-bold mb-2">Track Your Success in Real-Time</h2>
            <p className="text-gray-300 text-sm mb-6">Monitor your sales performance with our intuitive monthly sales widget. Get instant insights into your revenue trends, conversion rates, and growth metrics all in one place.</p>
            
            {/* Monthly Sales Widget */}
            <Image
              src="/images/landingpage/MonthlySalesWidget.svg"
              alt="Monthly Sales Analytics"
              width={468}
              height={233}
              className="w-full h-auto rounded-lg"
            />
          </div>
          
          {/* Feature bullets */}
          <div className="w-full max-w-md">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-white text-sm">Real-time sales tracking and analytics</p>
              </li>
              <li className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-white text-sm">Visual performance metrics and trends</p>
              </li>
              <li className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-white text-sm">Customizable reporting dashboard</p>
              </li>
            </ul>
          </div>
          
          {/* Book Demo Button */}
          <div className="w-full max-w-md mt-10 flex justify-center">
            <a 
              href="https://cal.com/carlo-heliosnexus/15min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-12 px-8 bg-white rounded-md inline-flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="text-center text-gray-900 text-base font-medium font-inter leading-tight">Book Your Demo</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}