'use client'

import Image from 'next/image'
import { CheckCircle, Droplets, Shield, Zap, Clock } from 'lucide-react'
import Head from 'next/head'
import SolarQuoteForm from '@/components/SolarQuoteForm'
import { useState, useEffect, useRef } from 'react'

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
  const [videoVisible, setVideoVisible] = useState(false);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const videoIframeRef = useRef<HTMLIFrameElement>(null);

  // Preload video as early as possible
  useEffect(() => {
    // Start loading after a short delay to prioritize initial page render
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Use Intersection Observer with more sensitive detection
  useEffect(() => {
    if (!videoLoaded) return;

    const options = {
      root: null,
      // Larger margin to start transition earlier
      rootMargin: '100px 0px 100px 0px',
      // Lower threshold to start transition sooner
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    };

    let prevRatio = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Get intersection ratio (0 to 1)
        const currentRatio = entry.intersectionRatio;

        // Only update if ratio has changed significantly
        if (Math.abs(currentRatio - prevRatio) > 0.1) {
          // Smoothly adjust visibility based on intersection ratio
          if (currentRatio > 0.2) {
            setVideoVisible(true);
          } else if (currentRatio < 0.1) {
            setVideoVisible(false);
          }

          prevRatio = currentRatio;
        }
      });
    }, options);

    if (videoSectionRef.current) {
      observer.observe(videoSectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [videoLoaded]);

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
        {/* Hero Section with Form Above the Fold */}
        <div className="relative overflow-hidden mb-6 md:mb-16">
          <div className="absolute inset-0">
            <Image
              src="/images/IMG_8577.jpg"
              alt="Professional solar panel cleaning in North Carolina by Helios"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
          </div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 pb-4 sm:pt-14 sm:pb-10 md:pt-20 md:pb-16">
            {/* Mobile: Stack form on top for immediate visibility */}
            <div className="flex flex-col md:hidden mb-6">
              {/* Heading text now above the form with more top padding */}
              <div className="text-center px-1 mb-4 pt-6">
                <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm mb-2">
                  Get Your Free Solar Cleaning Estimate
                </h1>
                <p className="text-sm leading-5 text-white/90 drop-shadow-sm font-semibold mb-3">
                  Top-rated solar panel cleaning service in North Carolina
                </p>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-1 text-white bg-black/30 px-3 py-1.5 rounded-full text-xs">
                    <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                    <span>Increase production by up to 30%</span>
                  </div>
                </div>
              </div>

              {/* Form below the heading */}
              <div id="booking-section-mobile" className="bg-white rounded-xl shadow-xl p-4 mb-5 border border-gray-100 max-w-md mx-auto w-full">
                <h2 className="text-lg font-bold text-center mb-2 text-gray-900">
                  Request a Free Quote
                </h2>
                <p className="text-center text-xs text-gray-600 mb-3">
                  Fill out the form below
                </p>
                <SolarQuoteForm isMobile={true} />
              </div>
            </div>

            {/* Desktop: Side-by-side layout */}
            <div className="hidden md:grid md:grid-cols-2 gap-8 items-center">
              {/* Hero Content - Left Side */}
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-sm mb-6">
                  Get Your Free Solar Cleaning Estimate
                </h1>
                <p className="text-xl leading-8 text-white/90 max-w-2xl drop-shadow-sm font-semibold mb-6">
                  Top-rated solar panel cleaning service in North Carolina
                </p>
                <ul className="space-y-3 text-white mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Increase energy production by up to 30%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Maintain manufacturer warranty requirements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Extend the lifespan of your solar investment</span>
                  </li>
                </ul>
              </div>

              {/* Quote Form - Right Side */}
              <div id="booking-section" className="bg-white rounded-2xl shadow-xl p-7 md:p-8 border border-gray-100 mt-4 md:mt-8">
                <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
                  Request a Free Quote
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Fill out the form below to receive a personalized quote
                </p>
                <SolarQuoteForm />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          {/* Location Coverage Section - Mobile Optimized */}
          <div className="mb-12 md:mb-16">
            <h3 className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 md:hidden">
              Service Areas
            </h3>
            <div className="flex flex-wrap justify-center gap-2 md:gap-0 md:block md:text-center">
              <div className="md:inline-block bg-white px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-full shadow-sm ring-1 ring-gray-200">
                <div className="flex items-center md:block">
                  <div className="flex md:hidden items-center justify-center w-6 h-6 bg-gray-100 rounded-full mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm md:text-lg text-gray-600">
                    <span className="font-medium">Serving:</span> Charlotte, Raleigh, Durham, Winston-Salem, and all surrounding areas in North Carolina
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="mb-24" ref={videoSectionRef}>
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
                  <div className="w-full h-full relative rounded-xl overflow-hidden shadow-sm" style={{ paddingBottom: '56.25%' }}>
                    {/* Optimized autoplay video with seamless loading */}
                    <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden">
                      {/* Initial loading state */}
                      {!videoLoaded && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-0 rounded-xl">
                          <div className="animate-pulse text-gray-400">Preparing video...</div>
                        </div>
                      )}

                      {/* Video iframe with seamless transition */}
                      {videoLoaded && (
                        <iframe
                          ref={videoIframeRef}
                          src="https://player.vimeo.com/video/1060941397?h=b74272ae15&autoplay=1&loop=1&background=1&muted=1&dnt=1&quality=auto"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          loading="eager"
                          className="absolute top-0 left-0 w-full h-full rounded-xl transition-opacity duration-1000"
                          style={{
                            opacity: videoVisible ? 1 : 0.3,
                            filter: videoVisible ? 'none' : 'blur(2px) brightness(0.7)'
                          }}
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