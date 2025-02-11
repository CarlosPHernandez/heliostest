'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Header from './Header'

interface MainLayoutProps {
  children: React.ReactNode
  showBreadcrumbs?: boolean
}

const MainLayout = ({ children, showBreadcrumbs = true }: MainLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col items-center space-y-6 p-8">
            {[
              { name: 'Discover', href: '/discover' },
              { name: 'Shop', href: '/shop' },
              { name: 'Investors', href: '/investors' },
              { name: 'Careers', href: '/careers' },
              { name: 'About Us', href: '/about-us' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xl font-medium text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/order"
              className="mt-4 bg-black text-white px-8 py-3 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Order
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Helios Nexus</h3>
              <p className="text-gray-400">
                Transforming homes with sustainable energy solutions for a greener future.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/discover" className="text-gray-400 hover:text-white">Discover</Link></li>
                <li><Link href="/shop" className="text-gray-400 hover:text-white">Shop</Link></li>
                <li><Link href="/investors" className="text-gray-400 hover:text-white">Investors</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>1234 Solar Street</li>
                <li>Sunshine City, SC 12345</li>
                <li>contact@heliosnexus.com</li>
                <li>(555) 123-4567</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {/* Add social media icons/links here */}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Helios Nexus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout 