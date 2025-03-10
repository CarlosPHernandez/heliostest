'use client'

import Image from 'next/image'
import { CheckCircle, Droplets, Shield, Zap, Clock } from 'lucide-react'
import Head from 'next/head'
import SolarQuoteForm from '@/components/SolarQuoteForm'
import { useState, useEffect } from 'react'

// Structured data for rich results
const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Helios Solar Panel Cleaning",
  "image": "/images/IMG_8577.jpg",
  "description": "Professional solar panel cleaning services in North Carolina",
  "@id": "https://helios.com",
  "url": "https://helios.com/services/solar-panel-cleaning",
  "telephone": "YOUR-PHONE-NUMBER",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "YOUR-STREET-ADDRESS",
    "addressLocality": "YOUR-CITY",
    "addressRegion": "NC",
    "postalCode": "YOUR-ZIP",
    "addressCountry": "US"
  },
  "areaServed": {
    "@type": "State",
    "name": "North Carolina"
  },
  "priceRange": "$$"
}

const benefits = [
  {
    title: 'Pure Deionized Water',
    description: 'Spot-free cleaning using 100% pure deionized water, ensuring no mineral residue or damage to your panels',
    icon: Droplets,
  },
  {
    title: 'Maximum Performance',
    description: "Boost your solar efficiency by up to 30% with our professional cleaning process",
    icon: Zap,
  },
  {
    title: 'Safe & Gentle Process',
    description: 'Our specialized equipment and pure water technique protects your valuable investment',
    icon: Shield,
  },
  {
    title: 'Quick & Efficient',
    description: 'Professional service with minimal disruption to your daily routine',
    icon: Clock,
  },
]

const cleaningProcess = [
  {
    title: 'Pure Deionized Water',
    description: 'We use 100% deionized water that leaves zero residue, ensuring maximum light transmission to your solar cells.',
  },
  {
    title: 'Gentle Cleaning System',
    description: 'Our soft-bristle brushes and pure water system safely remove dirt, pollen, and bird droppings.',
  },
  {
    title: 'Spot-Free Results',
    description: 'The deionized water evaporates completely clean, leaving no water spots or mineral deposits.',
  },
]

const SolarCleaningPage = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Load video after page has loaded
  useEffect(() => {
    // Minimal delay to ensure smooth loading
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-section')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <Head>
        <title>Solar Panel Cleaning Services | Book Online | Helios</title>
        <meta
          name="description"
          content="Professional solar panel cleaning services in North Carolina. Increase your solar efficiency by up to 30%. Local experts, satisfaction guaranteed. Book your cleaning today."
        />
        <meta
          name="keywords"
          content="solar panel cleaning, North Carolina solar cleaning, professional solar maintenance, solar efficiency, Charlotte solar panel cleaning, NC solar services, solar panel maintenance"
        />
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-[#FBFBFB]">
        {/* Hero Section */}
        <div className="relative overflow-hidden mb-16">
          <div className="absolute inset-0">
            <Image
              src="/images/IMG_8577.jpg"
              alt="Professional solar panel cleaning in North Carolina by Helios"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-sm mb-6">
                Maximize Your Solar Savings
              </h1>
              <p className="text-xl sm:text-2xl leading-8 text-white/90 max-w-2xl mx-auto drop-shadow-sm font-semibold">
                Top-rated solar cleaning service using 100% pure deionized water technology
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={scrollToBooking}
                  className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Your Quote
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* Location Coverage Section */}
          <div className="mb-16 text-center">
            <div className="inline-block bg-white px-6 py-3 rounded-full shadow-sm ring-1 ring-gray-200">
              <p className="text-lg text-gray-600">
                Serving Charlotte, Raleigh, Durham, Winston-Salem, and all surrounding areas in North Carolina
              </p>
            </div>
          </div>

          {/* Quote Form Section */}
          <div id="booking-section" className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              Request a Free Quote
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Fill out the form below to receive a personalized quote for your solar panel cleaning needs
            </p>
            <div className="max-w-4xl mx-auto">
              <SolarQuoteForm />
            </div>
          </div>

          {/* Video Section */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              See Our Process in Action
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Watch how our professional team delivers exceptional solar panel cleaning results
            </p>
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Video on the left */}
                <div className="p-4 md:p-6 flex items-center justify-center">
                  <div className="w-full h-full relative" style={{ paddingBottom: '56.25%' }}>
                    {/* Optimized autoplay video */}
                    <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden">
                      {/* Simple loading placeholder */}
                      {!videoLoaded && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-0">
                          <div className="animate-pulse text-gray-400">Loading video...</div>
                        </div>
                      )}
                      {/* Iframe with loading="lazy" for better performance */}
                      {videoLoaded && (
                        <iframe
                          src="https://player.vimeo.com/video/1060941397?h=b74272ae15&autoplay=1&loop=1&background=1&muted=1"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          className="absolute top-0 left-0 w-full h-full rounded-xl z-10"
                          title="Solar Panel Cleaning Process"
                        ></iframe>
                      )}
                    </div>
                  </div>
                </div>

                {/* Benefits checklist on the right */}
                <div className="p-8 md:p-12 flex items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">
                      Why Clean Your Solar Panels?
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Increase energy production by up to 30%</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Remove harmful debris that can damage panels</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Extend the lifespan of your solar investment</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Maintain manufacturer warranty requirements</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Improve the appearance of your home</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Reduce your carbon footprint with optimal efficiency</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section - Moved after Video Section */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              What Our Customers Say
            </h2>
            <p className="text-center text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Read what our satisfied customers have to say about our solar panel cleaning service
            </p>

            {/* Swipeable carousel for all screen sizes */}
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 gap-4 md:gap-6">
                {/* First Review */}
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 flex-shrink-0 w-[85vw] md:w-[400px] snap-center">
                  <div className="flex flex-col">
                    {/* Customer Image */}
                    <div className="w-full h-48 relative">
                      <div className="w-full h-full rounded-t-xl overflow-hidden">
                        <Image
                          src="/images/cleansolarpanels.jpg"
                          alt="Clean solar panels testimonial"
                          fill
                          className="object-cover rounded-t-xl"
                          sizes="(max-width: 768px) 85vw, 400px"
                          priority
                        />
                      </div>
                    </div>
                    {/* Review Content */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600">5.0</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        "I was skeptical about how much difference cleaning would make, but wow! My 22-panel system was covered in pollen and bird droppings. The crew arrived on time, finished in about an hour, and were super professional. I checked my SolarEdge app the next day and saw a 19% increase in production. Definitely worth every penny!"
                      </p>
                      <div className="font-semibold">John D.</div>
                      <div className="text-sm text-gray-500">Charlotte, NC</div>
                    </div>
                  </div>
                </div>

                {/* Second Review */}
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 flex-shrink-0 w-[85vw] md:w-[400px] snap-center">
                  <div className="flex flex-col">
                    {/* Customer Image */}
                    <div className="w-full h-48 relative">
                      <div className="w-full h-full rounded-t-xl overflow-hidden">
                        <Image
                          src="/images/IMG_8855.jpeg"
                          alt="Before and after solar panel cleaning"
                          fill
                          className="object-cover rounded-t-xl"
                          sizes="(max-width: 768px) 85vw, 400px"
                        />
                      </div>
                    </div>
                    {/* Review Content */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600">5.0</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        "My 5kW system hadn't been cleaned since installation two years ago. I called Helios after noticing my production dropping. No pushy sales tactics, just honest service. They explained everything they were doing and why. After cleaning, I saw my Duke Energy bill drop by $42 the first month! I've already scheduled my next cleaning for the fall."
                      </p>
                      <div className="font-semibold">Sarah M.</div>
                      <div className="text-sm text-gray-500">Raleigh, NC</div>
                    </div>
                  </div>
                </div>

                {/* Third Review */}
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 flex-shrink-0 w-[85vw] md:w-[400px] snap-center">
                  <div className="flex flex-col">
                    {/* Customer Image */}
                    <div className="w-full h-48 relative">
                      <div className="w-full h-full rounded-t-xl overflow-hidden">
                        {/* Using the new solarclean3.jpg image */}
                        <Image
                          src="/images/solarclean3.jpg"
                          alt="Solar panel cleaning results"
                          fill
                          className="object-cover rounded-t-xl"
                          sizes="(max-width: 768px) 85vw, 400px"
                        />
                      </div>
                    </div>
                    {/* Review Content */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600">5.0</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        "The team at Helios did an amazing job cleaning our solar panels. We've had them for 3 years and never cleaned them. The difference in energy production was immediate and significant. Very professional service from start to finish!"
                      </p>
                      <div className="font-semibold">Michael T.</div>
                      <div className="text-sm text-gray-500">Durham, NC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-6 gap-2">
              <button className="w-3 h-3 rounded-full bg-green-600"></button>
              <button className="w-3 h-3 rounded-full bg-gray-300"></button>
              <button className="w-3 h-3 rounded-full bg-gray-300"></button>
            </div>

            <style jsx global>{`
              /* Hide scrollbar for Chrome, Safari and Opera */
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              
              /* Hide scrollbar for IE, Edge and Firefox */
              .scrollbar-hide {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
              }
            `}</style>
          </div>

          {/* Benefits Section */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              North Carolina's #1 Fastest Growing Solar Panel Cleaning Solution
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Our deionized water cleaning system delivers superior results while protecting your investment
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-8 hover:shadow transition-all duration-300 ring-1 ring-gray-200 hover:ring-gray-300"
                >
                  <div className="bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <benefit.icon className="h-6 w-6 text-gray-900" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SolarCleaningPage 