import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

// POST handler for saving proposals
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { proposalData } = await request.json()

    if (!proposalData) {
      return NextResponse.json(
        { error: 'Missing proposal data' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = ['systemSize', 'numberOfPanels', 'monthlyProduction', 'address', 'monthlyBill']
    const missingFields = requiredFields.filter(field => !proposalData[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const { data: { session } } = await supabase.auth.getSession()
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
        panel_count: proposalData.numberOfPanels,
        monthly_production: proposalData.monthlyProduction,
        address: proposalData.address,
        monthly_bill: proposalData.monthlyBill,
        package_type: proposalData.packageType,
        include_battery: proposalData.includeBattery,
        battery_type: proposalData.batteryType,
        battery_count: proposalData.batteryCount,
        payment_type: proposalData.paymentType,
        down_payment: proposalData.downPayment,
        monthly_payment: proposalData.monthlyPayment,
        financing_term: proposalData.financingTerm,
        status: 'saved',
        stage: 'proposal'
      })
      .select()
      .single()

    if (error) {
      console.error('Proposal creation error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error saving proposal:', error)
    return NextResponse.json(
      { error: 'Failed to save proposal' },
      { status: 500 }
    )
  }
} 