import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If accessing protected routes while not authenticated
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return res
    }

    // If accessing auth pages while authenticated
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return res
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: []
} 