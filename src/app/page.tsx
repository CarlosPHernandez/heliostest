'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clover } from 'lucide-react'
import Image from 'next/image'
import { Testimonials } from '@/components/features/Testimonials'

// Array of Irish blessings or greetings related to sustainability and solar energy
const irishGreetings = [
  "May the sun shine bright upon your panels, and bring energy and savings to your home!",
  "May your solar journey be as bright as the morning sun and as rewarding as finding a pot o' gold!",
  "Here's to green energy bringing you good fortune and sustainable savings!",
  "May your energy bills be light and your solar production plentiful, today and always!",
  "Here's to the greenest energy of all - straight from the sun to your home!"
];

export default function HomePage() {
  const router = useRouter()
  const [monthlyBill, setMonthlyBill] = useState('')
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [greenTheme, setGreenTheme] = useState(false)
  const [leprechaunVisible, setLeprechaunVisible] = useState(false)

  // Show the toast only once per session
  useEffect(() => {
    const hasSeenToast = sessionStorage.getItem('hasSeenIrishGreeting');

    if (!hasSeenToast) {
      // Show toast immediately instead of after 2 seconds
      const randomGreeting = irishGreetings[Math.floor(Math.random() * irishGreetings.length)];
      setGreeting(randomGreeting);
      setShowToast(true);
      sessionStorage.setItem('hasSeenIrishGreeting', 'true');
    }
  }, []);

  // Auto-hide toast after 7 seconds
  // useEffect(() => {
  //   if (showToast) {
  //     const timer = setTimeout(() => {
  //       setShowToast(false);
  //     }, 7000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [showToast]);

  // Return to normal theme after 10 seconds
  useEffect(() => {
    if (greenTheme) {
      const timer = setTimeout(() => {
        setGreenTheme(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [greenTheme]);

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

  // Toggle green theme
  const toggleGreenTheme = () => {
    setGreenTheme(true);
    setLeprechaunVisible(false);
  }

  // Toggle leprechaun visibility
  const toggleLeprechaun = () => {
    setLeprechaunVisible(!leprechaunVisible);
  }

  return (
    <>
      {/* Promotional Banner - Always visible, no close button */}
      <header
        className={`fixed top-0 left-0 right-0 w-full overflow-hidden animate-fade-slide-in ${greenTheme ? 'bg-green-500' : ''}`}
        style={{ zIndex: 9999 }}
        data-banner
      >
        <div className={greenTheme ? "bg-green-500 text-white" : "bg-sky-200 text-sky-800"} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-center" style={{ height: 'auto', minHeight: '36px' }}>
            <div className="px-4 py-2 sm:py-1.5 sm:px-6 md:px-8 text-center">
              <p className="font-medium text-sm sm:text-base leading-tight">
                <span className="font-bold">{greenTheme ? '☘️ Get lucky with solar today! ☘️' : 'Get 12 months of solar on us'}</span> — Start your quote to redeem.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={`relative z-10 mt-0 ${greenTheme ? 'green-theme' : ''}`}>
        <div className="relative min-h-screen">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0 top-0">
            <Image
              src="/Helios ai hero image.webp"
              alt="Solar panels on a modern house"
              fill
              className={`object-cover ${greenTheme ? 'brightness-75 hue-rotate-90' : ''}`}
              priority
              sizes="100vw"
              quality={90}
            />
            {greenTheme && (
              <div className="absolute inset-0 bg-green-500/20 mix-blend-overlay"></div>
            )}
          </div>

          {/* Hidden Leprechaun Icon */}
          <div
            className="fixed bottom-6 right-6 z-50 cursor-pointer transition-all duration-300 hover:scale-110"
            onClick={toggleLeprechaun}
          >
            <div className="w-8 h-8 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-full shadow-md">
              <Clover className="h-5 w-5 text-green-600" />
            </div>
          </div>

          {/* Leprechaun */}
          {leprechaunVisible && (
            <div
              className="fixed bottom-20 right-6 z-50 bg-white p-3 rounded-lg shadow-lg transition-all duration-300 animate-bounce-subtle"
              onClick={toggleGreenTheme}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-2 cursor-pointer hover:bg-green-500 transition-colors">
                  <span className="text-white text-xl">☘️</span>
                </div>
                <p className="text-xs text-green-800 font-medium">Click for<br />Irish luck!</p>
              </div>
            </div>
          )}

          {/* Irish Greeting Toast */}
          {showToast && (
            <>
              {/* Semi-transparent overlay */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowToast(false)}
              />

              <div className="fixed sm:top-40 top-60 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-full animate-slide-down">
                <div className="mx-4 bg-green-50 border border-green-300 rounded-lg overflow-hidden shadow-xl">
                  {/* Close button positioned at top-right of GIF */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 sm:right-6 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors duration-200"
                    onClick={() => setShowToast(false)}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Dancing Leprechaun GIF */}
                  <div className="w-full">
                    <div className="relative sm:pt-[56.25%] pt-[85%]"> {/* Even taller ratio on mobile */}
                      <img
                        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExY25haG0zYzJtcGZ0YXc4MmlqNDBvZHB4anVmc3F2dmVqa2lkYmJnOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/37QUVxlBIduYqVVAjV/giphy.gif"
                        alt="Dancing leprechaun celebrating St. Patrick's Day"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Toast Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <span className="text-2xl">☘️</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm sm:text-base font-medium text-green-800">{greeting}</p>
                        <p className="mt-1 text-xs sm:text-sm font-bold text-green-600">Happy St. Patrick's Day from Helios Solar!</p>
                      </div>
                    </div>

                    {/* Click to dismiss */}
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        onClick={() => setShowToast(false)}
                      >
                        <span>Continue to site</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-start min-h-[calc(100vh-8rem)] px-4 pt-0 hero-content-wrapper">
            <div className="max-w-3xl mx-auto text-center mt-[15vh] sm:mt-[20vh] md:mt-[22vh]">
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight ${greenTheme ? 'text-green-50' : 'text-gray-900'} inline-block`}>
                Solar Made Simple.
              </h1>
              <p className={`mt-6 text-xl sm:text-2xl leading-8 ${greenTheme ? 'text-green-100' : 'text-gray-800'} max-w-2xl mx-auto font-semibold`}>
                Instant solar quote in seconds, no pushy salesperson needed.
              </p>

              {/* Monthly Bill Form */}
              <div className="mt-12 sm:mt-16 w-full max-w-xl mx-auto">
                <div
                  className={`${greenTheme ? 'bg-green-100/90' : 'bg-white/85'} backdrop-blur-md p-5 sm:p-8 md:p-10 rounded-xl shadow-lg border ${greenTheme ? 'border-green-200/50' : 'border-white/50'} form-container`}
                  style={{ boxShadow: greenTheme ? '0 0 15px 2px rgba(22, 163, 74, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 0 15px 2px rgba(125, 211, 252, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
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
                        className={`block w-full rounded-xl py-3 px-4 text-gray-700 ring-1 ring-inset ${greenTheme ? 'ring-green-200 focus:ring-green-500' : 'ring-gray-200 focus:ring-sky-400'} placeholder:text-gray-500 focus:ring-2 sm:text-sm sm:leading-6 bg-white shadow-sm transition-all duration-300 hover:ring-gray-300`}
                      />
                      {error && (
                        <p className="absolute left-0 top-full mt-1 text-sm text-red-400 bg-black/50 px-2 py-1 rounded">
                          {error}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 sm:px-8 text-sm font-semibold ${greenTheme ? 'text-white bg-green-600 hover:bg-green-700' : 'text-black bg-white hover:bg-gray-100'} rounded-xl shadow-md focus:outline-none focus:ring-2 ${greenTheme ? 'focus:ring-green-400' : 'focus:ring-gray-300'} focus:ring-offset-2 transition-all duration-300 border ${greenTheme ? 'border-green-500' : 'border-gray-200'}`}
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

      {/* Add CSS for animations and theme */}
      <style jsx global>{`
        .animate-slide-down {
          animation: slideDown 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards, pulseBriefly 2s ease-in-out 0.8s;
        }
        
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translate(-50%, -30px) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, 5px) scale(1.02);
          }
          75% {
            transform: translate(-50%, -3px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        
        @media (min-width: 640px) {
          @keyframes slideDown {
            0% {
              opacity: 0;
              transform: translate(-50%, -50px) scale(0.9);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, 10px) scale(1.02);
            }
            75% {
              transform: translate(-50%, -5px) scale(0.99);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0) scale(1);
            }
          }
        }
        
        @keyframes pulseBriefly {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, 0) scale(1.03); }
        }
        
        .animate-bounce-subtle {
          animation: bounceSlight 2s infinite ease-in-out;
        }
        
        @keyframes bounceSlight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .green-theme .testimonial-item {
          border-color: #86efac !important;
          background-color: rgba(240, 253, 244, 0.9) !important;
        }
        
        .green-theme .testimonial-item h3,
        .green-theme .testimonial-item strong {
          color: #166534 !important;
        }
      `}</style>
    </>
  )
}
