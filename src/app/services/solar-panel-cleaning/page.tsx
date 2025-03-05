'use client'

import Image from 'next/image'
import { CheckCircle, Droplets, Shield, Zap, Clock } from 'lucide-react'
import Head from 'next/head'
import SolarQuoteForm from '@/components/SolarQuoteForm'

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
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-sm mb-6">
                North Carolina's #1 Fastest Growing Solar Panel Cleaning
              </h1>
              <p className="text-xl sm:text-2xl leading-8 text-white/90 max-w-2xl mx-auto drop-shadow-sm font-semibold">
                Top-rated solar cleaning service using 100% pure deionized water technology
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={scrollToBooking}
                  className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
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

          {/* Video Section - Moved to top for better user flow */}
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
                    <iframe
                      src="https://player.vimeo.com/video/1060941397?h=b74272ae15&autoplay=1&loop=1&background=1"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full rounded-xl"
                      title="Solar Panel Cleaning Process"
                    ></iframe>
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

          {/* Process Section */}
          <div className="mb-24 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">
                    Top-Rated Solar Panel Cleaning Process in North Carolina
                  </h2>
                  <div className="space-y-6">
                    {cleaningProcess.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                          <span className="font-semibold text-gray-900">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative aspect-[4/3] md:aspect-auto">
                <Image
                  src="/images/IMG_8577.jpg"
                  alt="Our pure water cleaning process in action"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent md:hidden" />
              </div>
            </div>
          </div>

          {/* Recent Work Section */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              Our Recent Work
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              See the difference our pure water cleaning system makes
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-200">
                <Image
                  src="/images/IMG_8577.jpg"
                  alt="Recent solar panel cleaning project in North Carolina"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-lg font-semibold text-white mb-1">Solar Panel Cleaning</p>
                  <p className="text-white/90">Professional cleaning for maximum efficiency</p>
                </div>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-200">
                <Image
                  src="/images/dji_fly_20250215_093358_0_1739630038935_photo_low_quality.JPEG"
                  alt="Aerial view of solar panel cleaning in progress"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-lg font-semibold text-white mb-1">Aerial Inspection</p>
                  <p className="text-white/90">Thorough assessment of panel condition</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              Frequently Asked Questions About Solar Panel Cleaning in NC
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Learn more about our professional solar panel cleaning services
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-200">
                <h3 className="text-xl font-semibold mb-3">Why do you use deionized water?</h3>
                <p className="text-gray-600">Deionized water is pure H2O with all minerals removed. This means it leaves no spots or residue on your panels, ensuring maximum sunlight absorption and energy production.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-200">
                <h3 className="text-xl font-semibold mb-3">How often should I clean my panels?</h3>
                <p className="text-gray-600">Due to North Carolina's climate, we recommend professional cleaning 2-3 times per year to maintain optimal efficiency and prevent pollen, dust, and organic matter buildup.</p>
              </div>
            </div>
          </div>

          {/* Quote Form Section */}
          <div id="booking-section">
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
        </div>
      </div>
    </>
  )
}

export default SolarCleaningPage 