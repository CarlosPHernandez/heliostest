'use client'

import Image from 'next/image'
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react'

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/about-hero.jpg"
            alt="Solar panels installation"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050816] via-[#0B1123] to-[#050816]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-purple-900/5 to-blue-900/5" />
          <div className="absolute inset-0 bg-black/40" />

          {/* Animated System */}
          <div className="absolute inset-0 z-[1]">
            {/* Multiple Orbital Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Central Sun */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px]">
                {/* Core */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500" />

                {/* Inner Glow */}
                <div className="absolute -inset-2 rounded-full bg-white/30 blur-md animate-sun-pulse" />

                {/* Outer Glow */}
                <div className="absolute -inset-4 rounded-full bg-white/20 blur-xl animate-sun-pulse-delayed" />
              </div>

              {/* First Ring (Mercury) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full">
                {/* Main Ring */}
                <div className="absolute inset-0 rounded-full border border-white/20" />
                {/* Glow Effect */}
                <div className="absolute -inset-1 rounded-full border border-white/10 blur-sm" />
              </div>

              {/* Second Ring (Venus) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-white/15" />

              {/* Third Ring (Earth's Orbit - Most Visible) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full">
                {/* Main Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                {/* Glow Effect */}
                <div className="absolute -inset-1 rounded-full border border-white/10 blur-sm" />
              </div>

              {/* Earth Dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] animate-orbit">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
                  {/* Glowing Earth Dot */}
                  <div className="w-4 h-4 rounded-full bg-white group-hover:bg-white/90 transition-colors duration-300">
                    {/* Inner Glow */}
                    <div className="absolute inset-0 rounded-full bg-white/50 blur-sm" />
                    {/* Outer Glow */}
                    <div className="absolute -inset-2 rounded-full bg-white/20 blur-md animate-pulse" />

                    {/* Moon Orbit */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-[15px] animate-moon-orbit">
                      {/* Moon Dot */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200/90">
                          <div className="absolute inset-0 rounded-full bg-white/40 blur-[1px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes surface-wave {
            0% {
              transform: rotate(0deg) scale(1);
            }
            100% {
              transform: rotate(360deg) scale(1);
            }
          }

          @keyframes surface-pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.05);
            }
          }

          @keyframes orbit {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(0.95);
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes sun-pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.1);
            }
          }

          @keyframes sun-pulse-delayed {
            0%, 100% {
              opacity: 0.2;
              transform: scale(1);
            }
            50% {
              opacity: 0.4;
              transform: scale(1.15);
            }
          }

          @keyframes moon-orbit {
            0% {
              transform: rotate(0deg) scaleY(0.92);
            }
            50% {
              transform: rotate(180deg) scaleY(0.92);
            }
            100% {
              transform: rotate(360deg) scaleY(0.92);
            }
          }

          @keyframes gentle-bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .animate-orbit {
            animation: orbit 120s linear infinite;
          }

          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }

          .animate-sun-pulse {
            animation: sun-pulse 4s ease-in-out infinite;
          }

          .animate-sun-pulse-delayed {
            animation: sun-pulse-delayed 4s ease-in-out infinite;
            animation-delay: -2s;
          }

          .animate-moon-orbit {
            animation: moon-orbit 9s linear infinite;
          }

          .animate-gentle-bounce {
            animation: gentle-bounce 3s ease-in-out infinite;
          }
        `}</style>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.2em] text-white mb-6 font-medium animate-fade-in drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              About Helios Nexus
            </p>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight max-w-4xl animate-fade-in [animation-delay:200ms] drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
              The future of solar is here.
            </h1>
            <p className="text-xl text-white max-w-2xl font-medium leading-relaxed animate-fade-in [animation-delay:400ms] drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              We're reimagining how people access and adopt solar energy through technology and innovation.
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center w-12 h-12 hover:opacity-80 rounded-full transition-all cursor-pointer animate-gentle-bounce"
            aria-label="Scroll to Our Mission"
          >
            <ChevronDown className="h-8 w-8 text-white/80" strokeWidth={1.5} />
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-4xl font-bold mb-8 text-gray-900">Our Mission</h2>
              <p className="text-xl text-gray-800 leading-relaxed mb-8">
                To accelerate solar energy adoption, making it accessible to everyone on Earth.
              </p>
              <div className="h-1 w-20 bg-black" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-8 text-gray-900">Our Vision</h2>
              <p className="text-xl text-gray-800 leading-relaxed mb-8">
                To power the Moon and Mars with space-based solar energy, lighting humanity's path beyond Earth.
              </p>
              <div className="h-1 w-20 bg-black" />
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050816] via-[#0B1123] to-[#050816]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-purple-900/5 to-blue-900/5" />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 sm:mb-20 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">Our Journey</h2>
          <div className="space-y-16 sm:space-y-32">
            {[
              {
                year: '2023',
                quarter: 'Q4',
                title: 'The Vision Takes Flight',
                description: 'The concept of Helios Nexus emerged from a dream of revolutionizing space-based solar energy, starting with transforming how we harness solar power on Earth.',
              },
              {
                year: '2024',
                quarter: 'Q1',
                title: 'Launch Sequence Initiated',
                description: 'Helios Nexus was officially established, with a mission to bridge the gap between Earth-based solar solutions and future space energy systems.',
              },
              {
                year: '2024',
                quarter: 'Q2',
                title: 'First Milestone Achieved',
                description: 'Secured initial funding through the ACC CEO Pitch-Off, earning $7,500 to fuel our journey toward space-based solar innovation.',
              },
              {
                year: '2024',
                quarter: 'Q3',
                title: 'Earth-Side Operations',
                description: 'Developed and tested our first prototype for instant solar quotes, laying the groundwork for future space energy distribution systems.',
              },
              {
                year: '2024',
                quarter: 'Q4',
                title: 'Mission Deployment',
                description: 'Official launch of the Helios Nexus platform, marking our first step toward making solar energy accessible across Earth and beyond.',
              },
            ].map((event, index) => (
              <div key={event.year + event.quarter} className="group relative flex flex-col sm:flex-row items-start gap-6 sm:gap-12 md:gap-24">
                {/* Vertical line - Hidden on mobile, shown on larger screens */}
                <div className="hidden sm:block absolute left-[5.5rem] top-0 w-px h-full bg-white/10" />

                {/* Mobile vertical line */}
                <div className="sm:hidden absolute left-4 top-16 w-px h-[calc(100%-4rem)] bg-white/10" />

                {/* Year marker */}
                <div className="relative flex-shrink-0 z-20 pl-8 sm:pl-0 min-w-[160px]">
                  <div className="relative flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-5xl font-light text-white/80 group-hover:text-white transition-colors duration-300">
                      {event.year}
                    </span>
                    <span className="text-lg sm:text-2xl font-light text-white/60 group-hover:text-white/80 transition-colors duration-300">
                      {event.quarter}
                    </span>
                  </div>
                </div>

                {/* Content with hover effect */}
                <div className="relative bg-white/5 rounded-lg p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/10 group-hover:scale-[1.02] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] ml-8 sm:ml-0 w-full">
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white/90 group-hover:text-white transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-base sm:text-lg text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-32 relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-white opacity-50" />
        <div className="absolute inset-0 bg-grid-gray-900/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Service Areas</h2>
          <p className="text-xl text-gray-600 mb-20 max-w-3xl">
            Helios Nexus is proud to serve communities across North Carolina, bringing sustainable solar energy solutions to homes and businesses throughout the state.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                region: 'Triangle Region',
                cities: ['Raleigh', 'Durham', 'Chapel Hill', 'Cary', 'Apex', 'Wake Forest', 'Morrisville'],
                icon: '🏙️',
                description: 'Serving the vibrant Triangle area with innovative solar solutions for urban and suburban homes.'
              },
              {
                region: 'Triad Region',
                cities: ['Greensboro', 'Winston-Salem', 'High Point', 'Burlington', 'Kernersville'],
                icon: '🏘️',
                description: "Bringing sustainable energy to the Triad's diverse communities and historic neighborhoods."
              },
              {
                region: 'Charlotte Metro',
                cities: ['Charlotte', 'Concord', 'Gastonia', 'Rock Hill', 'Huntersville', 'Matthews'],
                icon: '🌆',
                description: 'Empowering Charlotte and surrounding areas with clean energy solutions for urban and suburban living.'
              },
              {
                region: 'Coastal Areas',
                cities: ['Wilmington', 'Jacksonville', 'New Bern', 'Morehead City', 'Outer Banks'],
                icon: '🌊',
                description: 'Specialized solar installations designed to withstand coastal conditions while maximizing energy production.'
              },
              {
                region: 'Western NC',
                cities: ['Asheville', 'Boone', 'Hendersonville', 'Hickory', 'Brevard'],
                icon: '⛰️',
                description: "Custom solar solutions for mountain homes, taking advantage of the region's abundant sunshine."
              },
              {
                region: 'Eastern NC',
                cities: ['Greenville', 'Rocky Mount', 'Wilson', 'Goldsboro', 'Kinston'],
                icon: '🌱',
                description: 'Helping eastern North Carolina communities harness solar power for residential and agricultural applications.'
              }
            ].map((area) => (
              <div key={area.region} className="group relative bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-4xl mb-4">{area.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {area.region}
                    </h3>
                <p className="text-gray-500 mb-4 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {area.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {area.cities.map((city) => (
                    <span key={city} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {city}
                    </span>
                  ))}
                </div>
                <div className="h-0.5 w-12 bg-blue-500/30 mt-6 group-hover:w-20 transition-all duration-300" />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600 mb-6">
              Don't see your area listed? We likely still serve your location!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 text-base font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              Contact Us For Service Availability
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050816] via-[#0B1123] to-[#050816]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-purple-900/5 to-blue-900/5" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-3 text-white">Get in Touch</h2>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl">
                Looking to invest in the future of energy? Whether you're interested in our Earth-based solutions or space technology initiatives, our team is ready to discuss opportunities.
              </p>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    id="name"
                    placeholder="Name"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <textarea
                    id="message"
                    placeholder="Message"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2.5 text-base font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-3 text-white">Connect With Us</h2>
              <p className="text-lg text-gray-300 mb-6">
                Our team is available to discuss investment opportunities and partnerships.
              </p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">Contact Information</h3>
                  <div className="space-y-4">
                    <a href="mailto:contact@heliosnexus.com" className="flex items-center text-gray-300 hover:text-white transition-colors">
                      <Mail className="h-5 w-5 mr-3" />
                      contact@heliosnexus.com
                    </a>
                    <a href="tel:3369556877" className="flex items-center text-gray-300 hover:text-white transition-colors">
                      <Phone className="h-5 w-5 mr-3" />
                      (336) 955-6877
                    </a>
                    <p className="flex items-center text-gray-300">
                      <MapPin className="h-5 w-5 mr-3" />
                      Raleigh, NC 27601
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">Business Hours</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                    <p>Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AboutPage 