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

      // If returning from proposal page, check for pending proposal
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

            // Save proposal to Supabase
            const { error: proposalError } = await supabase
              .from('proposals')
              .insert([
                {
                  user_id: session.user.id,
                  system_size: proposalData.systemInfo.systemSize,
                  number_of_panels: proposalData.systemInfo.numberOfPanels,
                  total_price: totalPrice,
                  monthly_bill: proposalData.monthlyBill,
                  address: proposalData.address,
                  package_type: proposalData.packageType,
                  include_battery: proposalData.includeBattery || false,
                  battery_count: proposalData.batteryCount || 0,
                  battery_type: proposalData.batteryType,
                  warranty_package: proposalData.warranty || 'standard',
                  payment_type: proposalData.paymentType || 'cash',
                  financing_term: proposalData.financing?.term,
                  down_payment: proposalData.financing?.downPayment,
                  monthly_payment: proposalData.financing?.monthlyPayment
                }
              ])

            if (proposalError) {
              console.error('Error saving proposal:', proposalError)
              return NextResponse.redirect(new URL('/order/proposal?error=save', requestUrl.origin))
            }

            // Clear the stored proposal
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