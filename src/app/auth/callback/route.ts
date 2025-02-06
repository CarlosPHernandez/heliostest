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

    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL(`/login?error=${error.message}`, requestUrl.origin)
      )
    }

    // Successful verification, redirect to dashboard
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    console.error('Callback route error:', error)
    return NextResponse.redirect(
      new URL('/login?error=unknown_error', request.url)
    )
  }
} 