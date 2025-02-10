'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, Sun, FileText, User, Settings } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  full_name: string
  email: string
}

export default function AccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadUserData = async () => {
      try {
        setUserData({
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email || ''
        })
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  const menuItems = [
    {
      title: 'My Proposals',
      description: 'View and manage your solar proposals',
      icon: Sun,
      href: '/proposal',
    },
    {
      title: 'Documents',
      description: 'Access important documents and files',
      icon: FileText,
      href: '/documents',
    },
    {
      title: 'Profile Settings',
      description: 'Update your account information',
      icon: Settings,
      href: '/profile',
    },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData?.full_name}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your solar journey and track your installation progress
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/order"
              className="block p-6 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-center"
            >
              <h3 className="text-lg font-semibold">Start New Proposal</h3>
              <p className="mt-1 text-gray-200">
                Create a new solar proposal for your property
              </p>
            </Link>
            <Link
              href="/documents"
              className="block p-6 bg-white border-2 border-black rounded-xl hover:bg-gray-50 transition-colors text-center"
            >
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <p className="mt-1 text-gray-600">
                Submit required documentation for your installation
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 