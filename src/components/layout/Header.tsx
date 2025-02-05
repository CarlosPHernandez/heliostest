'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Discover', href: '/discover' },
    { name: 'Shop', href: '/shop' },
    { name: 'Investors', href: '/investors' },
    { name: 'Careers', href: '/careers' },
    { name: 'About Us', href: '/about-us' },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-[100]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-black">
              Helios Nexus
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Link 
                href="/order"
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Order
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-900" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div 
        className={`fixed inset-0 z-[200] md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu panel */}
        <div 
          className={`absolute top-0 left-0 w-full bg-white shadow-xl transition-all duration-300 ${
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <Link 
              href="/" 
              className="text-xl font-bold text-black"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Helios Nexus
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-gray-900" />
            </button>
          </div>
          
          <nav className="px-6 py-6">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="block py-2 text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors hover:pl-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t">
              <Link 
                href="/order"
                className="block w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Order
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Header 