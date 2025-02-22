import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// POST handler for saving proposals
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { proposalData } = await request.json()

    if (!proposalData) {
      return NextResponse.json(
        { error: 'Missing proposal data' },
        { status: 400 }
      )
    }

    const { data: session } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        user_id: session.user.id,
        system_size: proposalData.systemSize,
        number_of_panels: proposalData.numberOfPanels,
        total_price: proposalData.totalPrice,
        address: proposalData.address,
        package_type: proposalData.packageType,
        include_battery: proposalData.includeBattery,
        battery_type: proposalData.batteryType,
        battery_count: proposalData.batteryCount,
        payment_type: proposalData.paymentType,
        down_payment: proposalData.downPayment,
        monthly_payment: proposalData.monthlyPayment,
        financing_term: proposalData.financingTerm,
        monthly_bill: proposalData.monthlyBill,
        monthly_production: proposalData.monthlyProduction,
        status: 'pending',
        stage: 'proposal'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error saving proposal:', error)
    return NextResponse.json(
      { error: 'Failed to save proposal' },
      { status: 500 }
    )
  }
} 