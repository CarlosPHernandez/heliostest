import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/proposals',
  '/admin',
  '/crm'
]

// Define routes that require admin role
const ADMIN_ROUTES = [
  '/admin'
]

// Define routes that require sales rep role
const SALES_REP_ROUTES = [
  '/crm'
]

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/auth/callback',
  '/auth/verified',
  '/order',
  '/crm/register',
  '/crm/leads/new',
  '/crm/leads'
  // Lead detail pages are handled by regex check in the middleware
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  // For debugging
  console.log('Middleware processing path:', pathname)

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
  ) {
    return res
  }

  // Check if the route is explicitly public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    console.log('Public route detected, allowing access:', pathname)
    return res
  }

  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Session exists:', !!session)

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  // Check if the route is admin-only
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))

  // Check if the route is sales-rep-only
  const isSalesRepRoute = SALES_REP_ROUTES.some(route => pathname.startsWith(route))

  // Special case for the new lead page
  const isNewLeadPage = pathname === '/crm/leads/new'
  if (isNewLeadPage) {
    console.log('New lead page detected, allowing access')
    return res
  }

  // Special case for the leads page
  const isLeadsPage = pathname === '/crm/leads'
  if (isLeadsPage) {
    console.log('Leads page detected, allowing access')
    return res
  }

  // Special case for lead detail pages
  const isLeadDetailPage = pathname.match(/^\/crm\/leads\/[^\/]+$/)
  if (isLeadDetailPage) {
    console.log('Lead detail page detected, allowing access')
    return res
  }

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !session) {
    console.log('Protected route without session, redirecting to login:', pathname)
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check role-based access
  if (session) {
    // Get user metadata which contains the role
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = userData?.role || 'user'
    console.log('User role:', userRole)

    // If it's an admin route and user is not an admin
    if (isAdminRoute && userRole !== 'admin') {
      console.log('Admin route with non-admin user, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If it's a sales rep route and user is not a sales rep
    if (isSalesRepRoute && userRole !== 'sales_rep' && userRole !== 'admin') {
      console.log('Sales rep route with non-sales rep user, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is authenticated and trying to access login/register
    if (['/login', '/register'].includes(pathname)) {
      console.log('Authenticated user trying to access login/register, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Allow access to all other routes
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
