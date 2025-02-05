'use client'

import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'
import CorporateLayout from '@/components/layout/CorporateLayout'

const sections = [
  {
    title: 'Company',
    items: [
      { name: 'Mission & Vision', href: '#mission' },
      { name: 'Our Story', href: '#story' },
      { name: 'Team', href: '#team' },
      { name: 'Contact', href: '#contact' },
    ],
  },
]

const AboutUsPage = () => {
  return (
    <CorporateLayout sections={sections}>
      {/* Mission & Vision */}
      <section className="mb-16">
        <div className="relative h-[50vh] rounded-xl overflow-hidden mb-12">
          <Image
            src="https://picsum.photos/id/1068/1200/600"
            alt="Solar panels installation"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="max-w-3xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Powering a Sustainable Future
              </h1>
              <p className="text-xl text-gray-200">
                Our mission is to accelerate the world's transition to sustainable energy through innovative solar solutions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To revolutionize the energy industry by making solar power accessible, affordable, and efficient for everyone. We believe in a future where clean energy is the standard, not the exception.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To be the world's leading provider of solar energy solutions, driving innovation and sustainability in every community we serve.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Our Journey</h2>
        <div className="space-y-8">
          {[
            {
              year: '2024',
              title: 'Company Founded',
              description: 'Started with a vision eliminate the door to door sales approach to solar sales.',
            },
            {
              year: '2024',
              title: 'Seed Funding',
              description: 'Helios Nexus was the winner of the ACC CEO Pitch-Off, winning first place and was awarded $7,500 in seed funding.',
            },
            {
              year: '2025',
              title: 'First Prototype',
              description: 'Helios Nexus successfully built the first prototype to enable instant solar quotes and begin taking orders from customers.',
            },
            {
              year: '2025',
              title: 'Helios Nexus Goes Live',
              description: 'Version 1.0 of the Helios Nexus platform was released to the public.',
            },
            {
              year: '2023',
              title: 'Industry Recognition',
              description: 'Named "Most Innovative Solar Company"',
            },
          ].map((event, index) => (
            <div key={event.year} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  {event.year}
                </div>
                {index !== 4 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Johnson',
              role: 'Chief Executive Officer',
              image: 'https://picsum.photos/id/1074/300/300',
            },
            {
              name: 'Michael Chen',
              role: 'Chief Technology Officer',
              image: 'https://picsum.photos/id/1075/300/300',
            },
            {
              name: 'Emily Rodriguez',
              role: 'Chief Operations Officer',
              image: 'https://picsum.photos/id/1076/300/300',
            },
          ].map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-8">Get in Touch</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <p className="flex items-center text-secondary-text">
                  <Mail className="h-5 w-5 mr-2" />
                  contact@heliosnexus.com
                </p>
                <p className="flex items-center text-secondary-text">
                  <Phone className="h-5 w-5 mr-2" />
                  (336) 955-6877
                </p>
                <p className="flex items-center text-secondary-text">
                  <MapPin className="h-5 w-5 mr-2" />
                  Raleigh, NC 27601
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Office Hours</h3>
              <div className="space-y-2 text-secondary-text">
                <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                <p>Saturday - Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  )
}

export default AboutUsPage 