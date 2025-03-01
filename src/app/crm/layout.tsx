'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Users,
  UserPlus,
  BarChart2,
  Map,
  Settings,
  LogOut,
  Loader2
} from 'lucide-react'

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Public routes that don't require authentication
  const publicRoutes = ['/crm', '/crm/register', '/crm/leads/new', '/crm/leads']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  const isNewLeadPage = pathname === '/crm/leads/new'
  const isLeadsPage = pathname === '/crm/leads'

  useEffect(() => {
    const checkUser = async () => {
      console.log('CRM Layout - Checking user for path:', pathname)

      // If we're on the new lead page or leads page, don't do any redirects
      if (isNewLeadPage || isLeadsPage) {
        console.log('On new lead page or leads page, skipping auth checks')
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session exists:', !!session)

      // If no session and not on a public route, redirect to login
      if (!session && !isPublicRoute) {
        console.log('No session, redirecting to login')
        router.push('/login?returnUrl=' + pathname)
        return
      }

      // If session exists, get user data
      if (session) {
        console.log('Session exists, getting user data')
        const { data: userData } = await supabase
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .single()

        console.log('User role:', userData?.role)
        setUser(userData)

        // If user is not a sales rep or admin and not on a public route, redirect to dashboard
        if (userData?.role !== 'sales_rep' && userData?.role !== 'admin' && !isPublicRoute) {
          console.log('User is not sales rep or admin, redirecting to dashboard')
          router.push('/dashboard')
          return
        }

        // If user is authenticated and on a public route, redirect to dashboard
        // But don't redirect from the registration page or new lead page
        if (isPublicRoute && pathname !== '/crm' && pathname !== '/crm/register' && pathname !== '/crm/leads/new') {
          console.log('User is authenticated on public route, redirecting to dashboard')
          router.push('/crm/dashboard')
          return
        }
      }

      setLoading(false)
    }

    checkUser()
  }, [supabase, router, pathname, isPublicRoute, isNewLeadPage, isLeadsPage])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // If on a public route or still loading, just render the children
  if (isPublicRoute || loading) {
    return (
      <>
        {loading && !isPublicRoute ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
            <Loader2 className="h-8 w-8 text-slate-600 animate-spin" />
          </div>
        ) : null}
        {children}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-700 text-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold">Helios CRM</h2>
          </div>

          <div className="px-6 py-2 border-t border-slate-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center">
                <span className="text-lg font-semibold">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-200">{user?.sales_title || 'Sales Representative'}</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex-1 px-4 space-y-1">
            <Link
              href="/crm/dashboard"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname === '/crm/dashboard' ? 'bg-slate-800' : 'hover:bg-slate-600'
                }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/crm/leads"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/crm/leads') ? 'bg-slate-800' : 'hover:bg-slate-600'
                }`}
            >
              <UserPlus className="mr-3 h-5 w-5" />
              Leads
            </Link>
            <Link
              href="/crm/leads/new"
              className={`flex items-center px-2 py-2 ml-6 text-sm font-medium rounded-md ${pathname === '/crm/leads/new' ? 'bg-slate-800' : 'hover:bg-slate-600'
                }`}
            >
              <span className="mr-3 h-5 w-5 flex items-center justify-center text-green-400">+</span>
              Add New Lead
            </Link>
            <Link
              href="/crm/performance"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/crm/performance') ? 'bg-slate-800' : 'hover:bg-slate-600'
                }`}
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              Performance
            </Link>
            <Link
              href="/crm/territories"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/crm/territories') ? 'bg-slate-800' : 'hover:bg-slate-600'
                }`}
            >
              <Map className="mr-3 h-5 w-5" />
              Territories
            </Link>
            <Link
              href="/crm/settings"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/crm/settings') ? 'bg-slate-800' : 'hover:bg-slate-600'
                }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>

            {/* Registration button for easy access */}
            <div className="pt-4 mt-4 border-t border-slate-600">
              <Link
                href="/crm/register"
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="mr-3 h-5 w-5" />
                Register Sales Rep
              </Link>
            </div>
          </nav>

          <div className="px-4 py-4 border-t border-slate-600">
            <button
              onClick={handleSignOut}
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-slate-600 w-full"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={isPublicRoute ? '' : 'pl-64'}>
        {children}
      </div>
    </div>
  )
} 