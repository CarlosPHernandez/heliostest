import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define the order flow steps
const ORDER_FLOW = [
  '/order',
  '/order/address',
  '/order/packages',
  '/order/proposal',
  '/order/summary'
]

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/about',
  '/discover',
  '/shop',
  '/investors',
  '/careers',
  '/about-us',
  '/auth/callback',
  ...ORDER_FLOW // Add order flow to public routes
]

// Define routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/proposals'
]

function isOrderRoute(pathname: string): boolean {
  return ORDER_FLOW.some(route => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/auth/'))
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

function getRequiredData(step: string): string[] {
  switch (step) {
    case '/order/address':
      return ['monthlyBill']
    case '/order/packages':
      return ['monthlyBill', 'address', 'selectedUtility']
    case '/order/proposal':
      return ['monthlyBill', 'address', 'selectedUtility', 'selectedPackage', 'selectedPackageData']
    case '/order/summary':
      return ['monthlyBill', 'address', 'selectedUtility', 'selectedPackage', 'selectedPackageData', 'proposalData']
    default:
      return []
  }
}

function checkRequiredData(data: { [key: string]: string | null }, required: string[]): boolean {
  return required.every(key => data[key] !== null)
}

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

  // Handle protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }

  // Handle public routes
  if (PUBLIC_ROUTES.some(route => pathname === route)) {
    // If user is signed in and tries to access login/register, redirect to dashboard
    if (session && ['/login', '/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // Handle order flow data requirements
  if (isOrderRoute(pathname)) {
    // Allow direct access to the main order page
    if (pathname === '/order') {
      return res
    }

    // Get the current step index
    const currentStepIndex = ORDER_FLOW.findIndex(route => pathname.startsWith(route))
    if (currentStepIndex === -1) {
      return res
    }

    // Get required data for the current step
    const requiredData = getRequiredData(ORDER_FLOW[currentStepIndex])
    
    // Check if all required data exists in cookies/localStorage
    const storedData: { [key: string]: string | null } = {}
    requiredData.forEach(key => {
      storedData[key] = req.cookies.get(key)?.value || null
    })

    if (!checkRequiredData(storedData, requiredData)) {
      // Redirect to the appropriate step
      const lastValidStep = ORDER_FLOW.findIndex((_, index) => {
        const stepData = getRequiredData(ORDER_FLOW[index])
        return !checkRequiredData(storedData, stepData)
      })
      const redirectStep = Math.max(0, lastValidStep - 1)
      return NextResponse.redirect(new URL(ORDER_FLOW[redirectStep], req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
}
