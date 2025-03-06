import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      metadata: session.metadata,
      status: session.status,
      payment_status: session.payment_status
    })
  } catch (err: any) {
    console.error('Error fetching session:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
} 