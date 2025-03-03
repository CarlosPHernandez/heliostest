import Link from 'next/link'
import { CookiePreferences } from '@/components/features/CookiePreferences'

export function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-white">Helios Nexus</h2>
          <p className="text-gray-300 text-lg mb-8">Shaping the Future of Sustainable Energy</p>

          {/* Navigation Links */}
          <nav className="flex flex-wrap gap-6">
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors font-medium">
              About Us
            </Link>
            <Link href="/services/solar-panel-cleaning" className="text-gray-300 hover:text-white transition-colors font-medium">
              Services
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors font-medium">
              Contact
            </Link>
            <Link href="/careers" className="text-gray-300 hover:text-white transition-colors font-medium">
              Careers
            </Link>
          </nav>
        </div>

        {/* Footer Bottom */}
        <div className="space-y-4 text-base text-gray-400">
          <CookiePreferences />

          <p className="text-gray-400 font-medium">
            We are committed to providing an accessible website experience for all users. If you encounter any issues, please contact us at{' '}
            <a href="mailto:Support@heliosnexus.com" className="text-gray-300 hover:text-white transition-colors">
              Support@heliosnexus.com
            </a>
          </p>

          <p className="text-gray-400 font-medium">
            Your privacy is important to us. Please review our{' '}
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            {', '}
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
              Order Terms
            </Link>
            {', and '}
            <Link href="/payment-terms" className="text-gray-300 hover:text-white transition-colors">
              Payment Terms
            </Link>
          </p>

          <p className="text-gray-400 font-medium">
            This website may contain forward-looking statements, which involve risks and uncertainties. Actual results may differ.
          </p>

          <p className="text-gray-400 font-medium">
            Helios Nexus © 2024, All Rights Reserved. Helios Nexus™ is a trademark of Helios Nexus, Inc.
          </p>
        </div>
      </div>
    </footer>
  )
} 