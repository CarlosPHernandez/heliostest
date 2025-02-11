import Link from 'next/link'
import { CookiePreferences } from '@/components/features/CookiePreferences'

export function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Helios Nexus</h2>
          <p className="text-gray-300 mb-8">Shaping the Future of Sustainable Energy</p>
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap gap-6">
            <Link href="/investors" className="text-gray-300 hover:text-white transition-colors">
              Investors
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
              News
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/careers" className="text-gray-300 hover:text-white transition-colors">
              Careers
            </Link>
          </nav>
        </div>

        {/* Footer Bottom */}
        <div className="space-y-4 text-sm text-gray-400">
          <CookiePreferences />

          <p className="text-gray-400">
            We are committed to providing an accessible website experience for all users. If you encounter any issues, please contact us at{' '}
            <a href="mailto:accessibility@heliosnexus.com" className="text-gray-300 hover:text-white transition-colors">
              accessibility@heliosnexus.com
            </a>
          </p>

          <p className="text-gray-400">
            Your privacy is important to us. Please review our{' '}
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            {' '}and{' '}
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
              Order Terms
            </Link>
          </p>

          <p className="text-gray-400">
            This website may contain forward-looking statements, which involve risks and uncertainties. Actual results may differ.
          </p>

          <p className="text-gray-400">
            Helios Nexus © 2024, All Rights Reserved. Helios Nexus™ is a trademark of Helios Nexus, Inc.
          </p>
        </div>
      </div>
    </footer>
  )
} 