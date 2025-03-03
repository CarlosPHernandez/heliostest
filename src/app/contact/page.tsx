'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Mail, Phone, Clock, ArrowRight, Users } from 'lucide-react'

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full">
        <Image
          src="/images/solar-panel-installation.jpg"
          alt="Solar panel installation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto">
              We're here to answer your questions and help you find the right solar solution
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Email Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-black hover:shadow-lg">
            <div className="p-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-6 w-6 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Email Us</h3>
              <p className="text-gray-600 mb-6">
                Our team is here to help with any questions about our products and services.
              </p>
              <a
                href="mailto:orders@heliosnexus.com"
                className="inline-flex items-center text-black font-medium hover:underline"
              >
                orders@heliosnexus.com
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-black hover:shadow-lg">
            <div className="p-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Phone className="h-6 w-6 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Call Us</h3>
              <div className="flex items-start mb-6">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-600">
                  Available Monday to Friday<br />
                  8:00 AM - 5:00 PM EST
                </p>
              </div>
              <a
                href="tel:+13369556877"
                className="inline-flex items-center text-black font-medium hover:underline"
              >
                (336) 955-6877
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Inquiry Sections */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How Can We Help?</h2>

          {/* Tabs */}
          <div className="flex justify-center mb-12 overflow-x-auto py-2 no-scrollbar">
            <div className="flex space-x-2">
              {[
                { id: 'general', label: 'General Inquiries' },
                { id: 'sales', label: 'Sales' },
                { id: 'support', label: 'Technical Support' },
                { id: 'partnerships', label: 'Partnerships' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 rounded-full whitespace-nowrap transition-all ${activeTab === tab.id
                    ? 'bg-black text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-xl p-8 md:p-12">
            {activeTab === 'general' && (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">General Inquiries</h3>
                <p className="text-gray-600 mb-6">
                  Have a question about our company or services? Our team is ready to assist you with any general inquiries you might have.
                </p>
                <div className="flex items-start mb-6">
                  <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email us at:</p>
                    <a href="mailto:info@heliosnexus.com" className="text-black hover:underline">info@heliosnexus.com</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Call our main office:</p>
                    <a href="tel:+13369556877" className="text-black hover:underline">(336) 955-6877</a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">Sales Inquiries</h3>
                <p className="text-gray-600 mb-6">
                  Interested in our solar solutions? Our sales team is ready to help you find the right products and services for your needs.
                </p>
                <div className="flex items-start mb-6">
                  <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email our sales team:</p>
                    <a href="mailto:sales@heliosnexus.com" className="text-black hover:underline">sales@heliosnexus.com</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Call sales directly:</p>
                    <a href="tel:+13369556877" className="text-black hover:underline">(336) 955-6877</a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">Technical Support</h3>
                <p className="text-gray-600 mb-6">
                  Need help with your existing solar installation? Our technical support team is here to assist you with any issues.
                </p>
                <div className="flex items-start mb-6">
                  <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email support:</p>
                    <a href="mailto:support@heliosnexus.com" className="text-black hover:underline">support@heliosnexus.com</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Call support:</p>
                    <a href="tel:+13369556877" className="text-black hover:underline">(336) 955-6877</a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'partnerships' && (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">Partnership Opportunities</h3>
                <p className="text-gray-600 mb-6">
                  Interested in partnering with Helios Nexus? We're always looking for strategic partnerships to expand our reach and impact.
                </p>
                <div className="flex items-start mb-6">
                  <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email our partnerships team:</p>
                    <a href="mailto:partnerships@heliosnexus.com" className="text-black hover:underline">partnerships@heliosnexus.com</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Schedule a partnership discussion:</p>
                    <a href="tel:+13369556877" className="text-black hover:underline">(336) 955-6877</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ContactPage 