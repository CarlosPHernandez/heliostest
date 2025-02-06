import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we can modify
    const response = NextResponse.next()

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
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh the session if needed
    await supabase.auth.getSession()

    // Get the latest session state
    const { data: { session } } = await supabase.auth.getSession()

    // If accessing protected routes while not authenticated
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        // Store the attempted URL to redirect back after login
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return response
    }

    // If accessing auth pages while authenticated
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
      if (session) {
        // If there's a redirect parameter, use it, otherwise go to dashboard
        const redirectTo = new URL(
          request.nextUrl.searchParams.get('redirect') || '/dashboard',
          request.url
        )
        return NextResponse.redirect(redirectTo)
      }
      return response
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}
