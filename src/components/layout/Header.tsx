'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, HomeIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

const Header = () => {
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Don't show auth-dependent UI elements until mounted
  if (!mounted) return null

  const publicNavItems = [
    { name: 'Discover', href: '/discover' },
    { name: 'Shop', href: '/shop' },
    { name: 'Investors', href: '/investors' },
    { name: 'Careers', href: '/careers' },
    { name: 'About Us', href: '/about-us' },
  ]

  const userNavItems = [
    { name: 'Dashboard', href: '/account', icon: HomeIcon },
    { name: 'My Proposals', href: '/proposal', icon: HomeIcon },
    { name: 'Documents', href: '/documents', icon: User },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-[100]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={user ? '/account' : '/'} className="flex items-center">
              <Image
                src="/logo.png"
                alt="Helios Logo"
                width={40}
                height={40}
                className="w-auto h-8"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">Helios</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {!loading && (
              <>
                {user ? (
                  <>
                    {userNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {publicNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        {item.name}
                      </Link>
                    ))}
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!loading && (
                <>
                  {user ? (
                    <>
                      {userNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="flex items-center">
                            <item.icon className="h-5 w-5 mr-2" />
                            {item.name}
                          </span>
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <span className="flex items-center">
                          <LogOut className="h-5 w-5 mr-2" />
                          Sign Out
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      {publicNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <Link
                        href="/login"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header 