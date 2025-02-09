import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  try {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession()

    // Special handling for auth callback
    if (requestUrl.pathname === '/auth/callback') {
      return response
    }

    // If accessing protected routes while not authenticated
    if (requestUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        // Store the attempted URL to redirect back after login
        const redirectUrl = new URL('/login', requestUrl.origin)
        redirectUrl.searchParams.set('redirect', requestUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return response
    }

    // If accessing auth pages while authenticated
    if (requestUrl.pathname.startsWith('/login') || requestUrl.pathname.startsWith('/register')) {
      if (session) {
        // If there's a redirect parameter, use it, otherwise go to dashboard
        const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard'
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/auth/callback']
}
