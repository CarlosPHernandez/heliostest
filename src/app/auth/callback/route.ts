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

      // If returning from proposal page, process the pending proposal
      if (returnUrl.includes('/order/proposal')) {
        try {
          // Get the proposal data from cookies
          const cookieStore = cookies()
          const pendingProposalCookie = cookieStore.get('pendingProposal')

          if (pendingProposalCookie?.value) {
            const proposalData = JSON.parse(pendingProposalCookie.value)

            // Calculate total price including add-ons
            const totalPrice = proposalData.systemInfo.totalPrice +
              (proposalData.includeBattery ? (proposalData.batteryCount * (proposalData.batteryType === 'franklin' ? 8500 : 9200)) : 0) +
              (proposalData.warranty === 'extended' ? 1500 : 0)

            // Prepare proposal data with snake_case column names
            const proposalInsert = {
              user_id: session.user.id,
              system_size: proposalData.systemInfo.systemSize,
              number_of_panels: proposalData.systemInfo.numberOfPanels,
              total_price: totalPrice,
              address: proposalData.address,
              package_type: proposalData.packageType,
              include_battery: proposalData.includeBattery || false,
              battery_count: proposalData.batteryCount || 0,
              battery_type: proposalData.batteryType,
              payment_type: proposalData.paymentType || 'cash',
              financing_term: proposalData.financing?.term || null,
              down_payment: proposalData.financing?.downPayment || null,
              monthly_payment: proposalData.financing?.monthlyPayment || null,
              status: 'pending',
              stage: 'design'
            }

            console.log('Saving proposal for user:', session.user.id)
            console.log('Proposal data:', proposalInsert)

            // Save proposal to Supabase
            const { data: savedProposal, error: proposalError } = await supabase
              .from('proposals')
              .insert([proposalInsert])
              .select('*')
              .single()

            if (proposalError) {
              console.error('Error saving proposal:', {
                code: proposalError.code,
                message: proposalError.message,
                details: proposalError.details,
                hint: proposalError.hint
              })
              return NextResponse.redirect(new URL(`/order/proposal?error=${encodeURIComponent(proposalError.message)}`, requestUrl.origin))
            }

            console.log('Proposal saved successfully:', savedProposal)

            // Clear the stored proposal and redirect
            const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
            response.cookies.delete('pendingProposal')
            return response
          }
        } catch (error) {
          console.error('Error processing proposal:', error)
          return NextResponse.redirect(new URL('/order/proposal?error=process', requestUrl.origin))
        }
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