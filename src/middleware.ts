import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
const publicPrefixes = ['/api/auth']

// Define protected routes that require authentication
const protectedRoutes = ['/profile', '/documents']

// Define admin routes
const adminRoutes = ['/admin']

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
      // Clear session cookies
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      return response
    }

    // Check for admin routes
    if (pathname.startsWith('/admin')) {
      // If not authenticated, redirect to login
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Check if user has admin role
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      // If no role found or not admin, redirect to home
      if (roleError || !data || data.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // If user is authenticated and trying to access public routes, redirect to home
    if (session && publicRoutes.includes(pathname)) {
      const response = NextResponse.redirect(new URL('/', request.url))
      // Ensure session cookies are set
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
      return response
    }

    // If user is not authenticated and trying to access protected routes, redirect to home
    if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      return response
    }

    // For all other cases, continue with the request
    const response = NextResponse.next({
      headers: requestHeaders,
    })

    // Ensure session cookies are set for authenticated users
    if (session) {
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

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    return response
  }
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
