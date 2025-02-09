import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin))
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL(`/login?error=${error.message}`, requestUrl.origin)
      )
    }

    // Get the session to ensure it's properly set
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('No session after code exchange')
      return NextResponse.redirect(
        new URL('/login?error=no_session', requestUrl.origin)
      )
    }

    // Create a response with the redirect
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))

    // Set auth cookies in the response
    const authCookies = cookieStore.getAll()
    authCookies.forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, {
        path: '/',
        ...cookie,
      })
    })

    return response
  } catch (error) {
    console.error('Callback route error:', error)
    return NextResponse.redirect(
      new URL('/login?error=unknown_error', request.url)
    )
  }
} 