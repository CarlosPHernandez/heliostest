import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    try {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
    } catch (error) {
      console.error('Error in reset password callback:', error)
      return NextResponse.redirect(new URL('/login?error=ResetPasswordError', requestUrl.origin))
    }
  }

  // Return to login if code is missing
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 