'use client'

import { useState } from 'react'

const LandingPageHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header data-landing-header className="w-full h-16 sm:h-20 fixed top-0 left-0 z-50" style={{ backgroundColor: '#1c1c1c' }}>
        <div className="w-full h-full flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20">
          {/* Logo */}
          <div className="flex justify-start items-center gap-2 sm:gap-2.5">
            <div className="flex justify-start items-center gap-1.5">
              <div className="flex justify-start items-center gap-[3.24px]">
                <div className="w-[4.86px] h-[4.86px] relative bg-white rounded-full"></div>
                <div className="w-[4.86px] h-[4.86px] relative bg-white rounded-[588.50px]"></div>
                <div className="w-2 h-2 relative bg-white rounded-[588.50px]"></div>
              </div>
            </div>
            <div className="flex justify-start items-center">
              <div className="justify-start text-white text-lg sm:text-xl font-semibold font-inter leading-loose">Helios Nexus</div>
              <div className="justify-start text-white text-xs font-semibold font-inter leading-loose">™</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:inline-flex justify-start items-center gap-6 md:gap-8 lg:gap-12">
            <a 
              href="https://cal.com/carlo-heliosnexus/15min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 flex justify-center items-center gap-2"
            >
              <div className="text-center justify-start text-white text-sm font-medium font-inter leading-tight cursor-pointer hover:text-gray-200 transition-colors">Contact Us</div>
            </a>
            <div className="p-2 flex justify-center items-center gap-2">
              <div className="text-center justify-start text-white text-sm font-medium font-inter leading-tight cursor-pointer hover:text-gray-200 transition-colors">Sign In</div>
            </div>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1"
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`sm:hidden fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-64 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: '#1c1c1c' }}>
          <div className="flex flex-col pt-20 px-6 space-y-6">
            <a 
              href="https://cal.com/carlo-heliosnexus/15min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center py-3 border-b border-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="text-white text-base font-medium font-inter">Contact Us</div>
            </a>
            <div 
              className="flex items-center py-3 border-b border-gray-700 cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="text-white text-base font-medium font-inter">Sign In</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LandingPageHeader
