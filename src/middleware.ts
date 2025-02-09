import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define public routes that should always be accessible
const PUBLIC_ROUTES = ['/', '/auth/callback', '/login', '/register']
const PUBLIC_PREFIXES = ['/discover', '/shop', '/investors', '/careers', '/about-us', '/order']

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)

  // Create a response object that we can modify
  let response = NextResponse.next()

  // Create a Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Ensure cookies are set with proper options for cross-domain
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
            path: '/',
          })
        },
      },
    }
  )

  try {
    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
      // Clear any invalid session cookies
      response.cookies.delete('sb-auth-token')
      return response
    }

    // Special handling for auth callback
    if (requestUrl.pathname === '/auth/callback') {
      return response
    }

    // If user is logged in
    if (session) {
      // Allow access to dashboard
      if (requestUrl.pathname.startsWith('/dashboard')) {
        return response
      }

      // Redirect to dashboard if trying to access auth routes
      if (requestUrl.pathname === '/login' || requestUrl.pathname === '/register') {
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    } else {
      // If not logged in and trying to access dashboard
      if (requestUrl.pathname.startsWith('/dashboard')) {
        const redirectUrl = new URL('/login', requestUrl.origin)
        redirectUrl.searchParams.set('redirect', requestUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Clear any problematic session cookies on error
    response.cookies.delete('sb-auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
