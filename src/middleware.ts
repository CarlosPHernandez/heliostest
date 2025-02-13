import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/about',
  '/discover',
  '/shop',
  '/order',
  '/order/address',
  '/order/packages',
  '/order/proposal',
  '/order/summary',
  '/auth/callback'
]

// Define routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/proposals'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
  ) {
    return res
  }

  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  
  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route)

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login/register
  if (session && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
