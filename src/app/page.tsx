'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Testimonials } from '@/components/features/Testimonials'

// Array of Irish blessings or greetings related to sustainability and solar energy has been removed

export default function HomePage() {
  const router = useRouter()
  const [monthlyBill, setMonthlyBill] = useState('')
  const [error, setError] = useState('')
  // St. Patrick's Day state variables have been removed

  // Add effect to adjust body padding for the fixed banner
  useEffect(() => {
    // Function to adjust header margin based on banner height
    const adjustHeaderMargin = () => {
      const banner = document.querySelector('[data-banner]');
      const mainHeader = document.querySelector('header:not([data-banner])');

      if (banner && mainHeader) {
        // Get banner height
        const bannerHeight = banner.getBoundingClientRect().height;
        const headerHeight = mainHeader.getBoundingClientRect().height;

        // Apply to header
        if (mainHeader instanceof HTMLElement) {
          mainHeader.style.position = 'fixed';
          mainHeader.style.top = `${bannerHeight}px`;
          mainHeader.style.left = '0';
          mainHeader.style.right = '0';
          mainHeader.style.width = '100%';
          mainHeader.style.zIndex = '9998';
          mainHeader.style.borderTop = 'none';
          mainHeader.style.borderBottom = 'none';
          mainHeader.style.marginBottom = '0';
        }

        // Ensure banner is fixed and properly styled
        if (banner instanceof HTMLElement) {
          banner.style.position = 'fixed';
          banner.style.borderBottom = 'none';
        }

        // Add padding to body to account for fixed elements - exact height of banner + header
        document.body.style.paddingTop = `${bannerHeight + headerHeight}px`;
      }
    };

    // Initial adjustment
    adjustHeaderMargin();

    // Add resize listener for responsive adjustments
    window.addEventListener('resize', adjustHeaderMargin);

    // Add a class to the body to adjust layout
    document.body.classList.add('has-banner');

    // Cleanup function
    return () => {
      const mainHeader = document.querySelector('header:not([data-banner])');
      if (mainHeader instanceof HTMLElement) {
        mainHeader.style.position = '';
        mainHeader.style.top = '';
        mainHeader.style.left = '';
        mainHeader.style.right = '';
        mainHeader.style.width = '';
        mainHeader.style.zIndex = '';
      }
      document.body.classList.remove('has-banner');
      document.body.style.paddingTop = '0';
      window.removeEventListener('resize', adjustHeaderMargin);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!monthlyBill || isNaN(Number(monthlyBill))) {
      setError('Please enter a valid amount')
      return
    }

    try {
      // Store the monthly bill in localStorage
      localStorage.setItem('monthlyBill', monthlyBill)

      // Navigate to address input step
      router.push('/order/address')
    } catch (err) {
      setError('Error saving your information')
      console.error('Error:', err)
    }
  }

  const formatCurrency = (value: string) => {
    // Remove any non-digit characters except decimal point
    const digits = value.replace(/[^\d.]/g, '')

    // Ensure only one decimal point
    const parts = digits.split('.')
    if (parts.length > 2) return monthlyBill

    // Format without dollar sign and limit decimal places
    if (parts.length === 2) {
      return `${parts[0]}.${parts[1].slice(0, 2)}`
    }
    return digits
  }

  // St. Patrick's Day toggle functions have been removed

  return (
    <>
      {/* Promotional Banner - Always visible, no close button */}
      <header
        className="fixed top-0 left-0 right-0 w-full overflow-hidden animate-fade-slide-in"
        style={{ zIndex: 9999 }}
        data-banner
      >
        <div className="bg-sky-200 text-sky-800" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-center" style={{ height: 'auto', minHeight: '36px' }}>
            <div className="px-4 py-2 sm:py-1.5 sm:px-6 md:px-8 text-center">
              <p className="font-medium text-sm sm:text-base leading-tight">
                <span className="font-bold">Get 12 months of solar on us</span> — Start your quote to redeem.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mt-0">
        <div className="relative min-h-screen">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0 top-0">
            <Image
              src="/Helios ai hero image.webp"
              alt="Solar panels on a modern house"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              quality={90}
            />
          </div>

          {/* St. Patrick's Day elements have been removed */}

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-start min-h-[calc(100vh-8rem)] px-4 pt-0 hero-content-wrapper">
            <div className="max-w-3xl mx-auto text-center mt-[15vh] sm:mt-[20vh] md:mt-[22vh]">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 inline-block">
                Solar Made Simple.
              </h1>
              <p className="mt-6 text-xl sm:text-2xl leading-8 text-gray-800 max-w-2xl mx-auto font-semibold">
                Instant solar quote in seconds, no pushy salesperson needed.
              </p>

              {/* Monthly Bill Form */}
              <div className="mt-12 sm:mt-16 w-full max-w-xl mx-auto">
                <div
                  className="bg-white/85 backdrop-blur-md p-4 sm:p-6 md:p-7 rounded-xl shadow-lg border border-white/50 form-container"
                  style={{ boxShadow: '0 0 15px 2px rgba(125, 211, 252, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                    <div className="w-full sm:w-80 relative">
                      <input
                        type="text"
                        id="monthlyBill"
                        value={monthlyBill}
                        onChange={(e) => {
                          setError('')
                          setMonthlyBill(formatCurrency(e.target.value))
                        }}
                        placeholder="Average Monthly Bill"
                        className="block w-full rounded-xl py-3 px-4 text-gray-700 ring-1 ring-inset ring-gray-200 focus:ring-sky-400 placeholder:text-gray-500 focus:ring-2 sm:text-sm sm:leading-6 bg-white shadow-sm transition-all duration-300 hover:ring-gray-300"
                      />
                      {error && (
                        <p className="absolute left-0 top-full mt-1 text-sm text-red-400 bg-black/50 px-2 py-1 rounded">
                          {error}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center px-6 py-3 sm:px-8 text-sm font-semibold text-black bg-white hover:bg-gray-100 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-300 border border-gray-200 whitespace-nowrap"
                    >
                      Get Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <Testimonials />
      </main>
    </>
  )
}
