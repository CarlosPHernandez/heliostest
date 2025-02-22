import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// POST handler for saving pending proposals
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { tempUserToken, proposalData } = await request.json()

    if (!tempUserToken || !proposalData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First, check if a proposal already exists for this token
    const { data: existingProposal } = await supabase
      .from('pending_proposals')
      .select('id')
      .eq('temp_user_token', tempUserToken)
      .maybeSingle()

    // Prepare the data according to the database schema
    const pendingProposalData = {
      temp_user_token: tempUserToken,
      system_size: proposalData.systemInfo?.systemSize,
      panel_count: proposalData.systemInfo?.numberOfPanels,
      monthly_production: proposalData.systemInfo?.monthlyProduction,
      monthly_bill: proposalData.monthlyBill,
      address: proposalData.address,
      package_type: proposalData.packageType,
      payment_type: proposalData.paymentType,
      financing: proposalData.paymentType === 'finance' ? {
        term: proposalData.selectedTerm,
        down_payment: proposalData.downPayment,
        monthly_payment: proposalData.monthlyPayment
      } : null,
      status: 'pending',
      proposal_data: proposalData // Store the full proposal data as JSON
    }

    let result
    if (existingProposal) {
      // Update existing proposal
      result = await supabase
        .from('pending_proposals')
        .update(pendingProposalData)
        .eq('id', existingProposal.id)
        .select()
        .single()
    } else {
      // Insert new proposal
      result = await supabase
        .from('pending_proposals')
        .insert(pendingProposalData)
        .select()
        .single()
    }

    const { data, error } = result

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })

      return NextResponse.json(
        {
          error: 'Failed to save proposal',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error saving pending proposal:', error)
    return NextResponse.json(
      {
        error: 'Failed to save proposal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET handler for fetching pending proposals
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const tempUserToken = searchParams.get('token')

    if (!tempUserToken) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pending_proposals')
      .select('*')
      .eq('temp_user_token', tempUserToken)
      .is('synced_to_user_id', null)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching pending proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
} 