import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
const publicPrefixes = ['/api/auth']

// Define protected routes that require authentication
const protectedRoutes = ['/profile', '/documents', '/account', '/dashboard']

// Define admin routes
const adminRoutes = ['/admin']

// Define public order routes (quote flow)
const publicOrderRoutes = ['/order/proposal', '/order/address', '/order/utility']

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)

  // Skip middleware for static files and API routes
  const { pathname } = new URL(request.url)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
  ) {
    return NextResponse.next()
  }

  // Allow unauthenticated access to public order routes
  if (publicOrderRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            requestHeaders.set('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
          },
          remove(name: string, options: any) {
            requestHeaders.set('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
          },
        },
      }
    )

    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Handle session errors
    if (sessionError) {
      console.error('Session error:', sessionError)
      return handleAuthError(request)
    }

    // If user is authenticated and trying to access public routes or home page, redirect to dashboard
    if (session) {
      if (publicRoutes.includes(pathname) || pathname === '/') {
        const response = NextResponse.redirect(new URL('/dashboard', request.url))
        setAuthCookies(response, session)
        return response
      }

      // Check for admin routes
      if (pathname.startsWith('/admin')) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        if (roleError || !roleData || roleData.role !== 'admin') {
          return NextResponse.redirect(new URL('/account', request.url))
        }
      }
    } else {
      // If user is not authenticated and trying to access protected routes, redirect to login
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        clearAuthCookies(response)
        return response
      }
    }

    // For all other cases, continue with the request
    const response = NextResponse.next({ headers: requestHeaders })

    // Ensure session cookies are set for authenticated users
    if (session) {
      setAuthCookies(response, session)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return handleAuthError(request)
  }
}

function setAuthCookies(response: NextResponse, session: any) {
  response.cookies.set('sb-access-token', session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  response.cookies.set('sb-refresh-token', session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')
}

function handleAuthError(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  clearAuthCookies(response)
  return response
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
