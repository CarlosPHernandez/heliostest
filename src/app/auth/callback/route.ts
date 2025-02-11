import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnUrl = requestUrl.searchParams.get('returnUrl') || '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !user) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    // If returning to proposal page, check for pending proposal
    if (returnUrl.includes('/order/proposal')) {
      const pendingProposal = await supabase
        .from('local_storage')
        .select('value')
        .eq('key', 'pendingProposal')
        .single()

      if (pendingProposal.data) {
        const proposalData = JSON.parse(pendingProposal.data.value)
        
        // Save proposal to Supabase
        const { error: proposalError } = await supabase
          .from('proposals')
          .insert([
            {
              user_id: user.id,
              system_size: proposalData.systemInfo.systemSize,
              number_of_panels: proposalData.systemInfo.numberOfPanels,
              total_price: proposalData.systemInfo.totalPrice,
              monthly_bill: proposalData.monthlyBill,
              address: proposalData.address,
              package_type: proposalData.packageType,
              include_battery: proposalData.includeBattery,
              battery_count: proposalData.batteryCount,
              battery_type: proposalData.batteryType,
              warranty_package: proposalData.warranty,
              payment_type: proposalData.paymentType,
              financing_term: proposalData.financing?.term,
              down_payment: proposalData.financing?.downPayment,
              monthly_payment: proposalData.financing?.monthlyPayment
            }
          ])

        if (!proposalError) {
          // Clean up stored proposal
          await supabase
            .from('local_storage')
            .delete()
            .eq('key', 'pendingProposal')

          return NextResponse.redirect(new URL('/profile', requestUrl.origin))
        }
      }
    }
  }

  return NextResponse.redirect(new URL(returnUrl, requestUrl.origin))
} 