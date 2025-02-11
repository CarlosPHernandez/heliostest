import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnUrl = requestUrl.searchParams.get('returnUrl') || '/dashboard'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Exchange the code for a session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error || !session) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
    }

    // If returning to proposal page, check for pending proposal
    if (returnUrl.includes('/order/proposal')) {
      // Get the proposal data from localStorage
      const pendingProposal = localStorage.getItem('pendingProposal')
      
      if (pendingProposal) {
        try {
          const proposalData = JSON.parse(pendingProposal)
          
          // Save proposal to Supabase
          const { error: proposalError } = await supabase
            .from('proposals')
            .insert([
              {
                user_id: session.user.id,
                system_size: proposalData.systemInfo.systemSize,
                number_of_panels: proposalData.systemInfo.numberOfPanels,
                total_price: proposalData.systemInfo.totalPrice,
                monthly_bill: proposalData.monthlyBill,
                address: proposalData.address,
                package_type: proposalData.packageType,
                include_battery: proposalData.includeBattery || false,
                battery_count: proposalData.batteryCount || 0,
                battery_type: proposalData.batteryType,
                warranty_package: proposalData.warranty || 'standard',
                payment_type: proposalData.paymentType || 'cash'
              }
            ])

          if (proposalError) {
            console.error('Error saving proposal:', proposalError)
            return NextResponse.redirect(new URL('/order/proposal?error=save', requestUrl.origin))
          }

          // Clear the stored proposal
          localStorage.removeItem('pendingProposal')
          return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
        } catch (error) {
          console.error('Error processing proposal:', error)
          return NextResponse.redirect(new URL('/order/proposal?error=process', requestUrl.origin))
        }
      }
    }
  }

  // Redirect to the return URL or dashboard
  return NextResponse.redirect(new URL(returnUrl, requestUrl.origin))
} 