import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
const publicPrefixes = ['/api/auth']

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)

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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      // Clear problematic session cookies
      requestHeaders.set('Set-Cookie', 'sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
      requestHeaders.set('Set-Cookie', 'sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
      return NextResponse.redirect(new URL('/login', request.url), {
        headers: requestHeaders,
      })
    }

    const isPublicRoute = publicRoutes.includes(new URL(request.url).pathname) ||
      publicPrefixes.some(prefix => new URL(request.url).pathname.startsWith(prefix))

    // If user is signed in and trying to access public route, redirect to dashboard
    if (session && isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url), {
        headers: requestHeaders,
      })
    }

    // If user is not signed in and trying to access protected route, redirect to login
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.url)
      return NextResponse.redirect(redirectUrl, {
        headers: requestHeaders,
      })
    }

    // For all other cases, continue with the request
    return NextResponse.next({
      headers: requestHeaders,
    })
  } catch (error) {
    console.error('Middleware error:', error)
    // Clear problematic session cookies
    requestHeaders.set('Set-Cookie', 'sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
    requestHeaders.set('Set-Cookie', 'sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
    return NextResponse.redirect(new URL('/login', request.url), {
      headers: requestHeaders,
    })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
