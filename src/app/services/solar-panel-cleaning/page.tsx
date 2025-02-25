'use client'

import Image from 'next/image'
import { CheckCircle, Droplets, Shield, Zap, Clock } from 'lucide-react'
import Head from 'next/head'
import SolarCleaningBooking from '@/components/SolarCleaningBooking'
import StripeCheckout from '@/components/StripeCheckout'

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
                Pure Water Solar Panel Cleaning
              </h1>
              <p className="text-xl sm:text-2xl leading-8 text-white/90 max-w-2xl mx-auto drop-shadow-sm font-semibold">
                North Carolina's premier solar cleaning service using 100% deionized water
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
              <p className="text-lg text-secondary-text">
                Serving Charlotte, Raleigh, Durham, Winston-Salem, and all surrounding areas in North Carolina
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              The Pure Water Advantage
            </h2>
            <p className="text-center text-lg text-secondary-text mb-12 max-w-2xl mx-auto">
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
                  <p className="text-secondary-text">{benefit.description}</p>
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
                    Our Pure Water Cleaning Process
                  </h2>
                  <div className="space-y-6">
                    {cleaningProcess.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                          <span className="font-semibold text-gray-900">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                          <p className="text-secondary-text">{step.description}</p>
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
            <p className="text-center text-lg text-secondary-text mb-12 max-w-2xl mx-auto">
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
              Common Questions
            </h2>
            <p className="text-center text-lg text-secondary-text mb-12 max-w-2xl mx-auto">
              Learn more about our professional cleaning service
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-200">
                <h3 className="text-xl font-semibold mb-3">Why do you use deionized water?</h3>
                <p className="text-secondary-text">Deionized water is pure H2O with all minerals removed. This means it leaves no spots or residue on your panels, ensuring maximum sunlight absorption and energy production.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-200">
                <h3 className="text-xl font-semibold mb-3">How often should I clean my panels?</h3>
                <p className="text-secondary-text">Due to North Carolina's climate, we recommend professional cleaning 2-3 times per year to maintain optimal efficiency and prevent pollen, dust, and organic matter buildup.</p>
              </div>
            </div>
          </div>

          {/* Booking Form Section */}
          <div id="booking-section">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              Choose Your Cleaning Plan
            </h2>
            <p className="text-center text-lg text-secondary-text mb-12 max-w-2xl mx-auto">
              Select the perfect plan for your solar panel cleaning needs
            </p>
            <div className="max-w-7xl mx-auto">
              <StripeCheckout />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SolarCleaningPage 