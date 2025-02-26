import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnUrl = requestUrl.searchParams.get('returnUrl') || '/dashboard'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })

    try {
      // Exchange the code for a session
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError || !session) {
        console.error('Auth callback error:', sessionError)
        return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
      }

      // Create or update the user's profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || '',
          updated_at: new Date().toISOString(),
          is_admin: false // Explicitly set is_admin to false for new users
        }, {
          onConflict: 'id',
          ignoreDuplicates: false // We want to update if exists
        })

      if (profileError) {
        console.error('Error creating profile:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        })

        // Try an insert if upsert failed
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || '',
            updated_at: new Date().toISOString(),
            is_admin: false
          })

        if (insertError) {
          console.error('Insert fallback error:', insertError)
          return NextResponse.redirect(new URL('/login?error=profile_creation', requestUrl.origin))
        }
      }

      // Verify profile was created
      const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileCheckError || !profile) {
        console.error('Profile verification failed:', profileCheckError)
        return NextResponse.redirect(new URL('/login?error=profile_verification', requestUrl.origin))
      }

      // Check for any pending proposals that need to be moved
      const { data: pendingProposals, error: pendingError } = await supabase
        .from('pending_proposals')
        .select('*')
        .eq('temp_user_token', code)
        .is('synced_to_user_id', null)

      if (pendingError) {
        console.error('Error checking pending proposals:', pendingError)
      } else if (pendingProposals?.length > 0) {
        console.log('Found pending proposals to link:', pendingProposals.length)

        // Update the pending proposals to link them to the user
        for (const pendingProposal of pendingProposals) {
          const { error: updateError } = await supabase
            .from('pending_proposals')
            .update({
              synced_to_user_id: session.user.id,
              synced_at: new Date().toISOString()
            })
            .eq('id', pendingProposal.id)

          if (updateError) {
            console.error('Error linking pending proposal to user:', updateError)
          }
        }
      }

      // If returning from proposal page, clear the cookie
      if (returnUrl.includes('/order/proposal')) {
        const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
        response.cookies.delete('pendingProposal')
        return response
      }

      // Default redirect
      return NextResponse.redirect(new URL(returnUrl, requestUrl.origin))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 