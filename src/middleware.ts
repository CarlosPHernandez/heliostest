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

function isOrderRoute(pathname: string): boolean {
  return ORDER_FLOW.some(route => pathname.startsWith(route))
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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /login or /register
  // redirect the user to /login
  if (!session && !['/login', '/register', '/reset-password'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and the current path is /login or /register
  // redirect the user to /dashboard
  if (session && ['/login', '/register'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const { pathname } = new URL(req.url)

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
  ) {
    return res
  }

  // Only apply protection to order routes
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
