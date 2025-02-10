import { NextResponse, type NextRequest } from 'next/server'

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

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url)

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
  ) {
    return NextResponse.next()
  }

  // Only apply protection to order routes
  if (isOrderRoute(pathname)) {
    // Allow direct access to the main order page
    if (pathname === '/order') {
      return NextResponse.next()
    }

    // Get the current step index
    const currentStepIndex = ORDER_FLOW.findIndex(route => pathname.startsWith(route))
    if (currentStepIndex === -1) {
      return NextResponse.next()
    }

    // Get required data for the current step
    const requiredData = getRequiredData(ORDER_FLOW[currentStepIndex])
    
    // Check if all required data exists in cookies/localStorage
    const storedData: { [key: string]: string | null } = {}
    requiredData.forEach(key => {
      storedData[key] = request.cookies.get(key)?.value || null
    })

    if (!checkRequiredData(storedData, requiredData)) {
      // Redirect to the appropriate step
      const lastValidStep = ORDER_FLOW.findIndex((_, index) => {
        const stepData = getRequiredData(ORDER_FLOW[index])
        return !checkRequiredData(storedData, stepData)
      })
      const redirectStep = Math.max(0, lastValidStep - 1)
      return NextResponse.redirect(new URL(ORDER_FLOW[redirectStep], request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
