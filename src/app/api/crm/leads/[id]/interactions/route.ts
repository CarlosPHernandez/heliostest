import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/crm/leads/[id]/interactions - Get all interactions for a lead
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // For now, return dummy data
    const dummyInteractions = [
      {
        id: '1',
        type: 'Call',
        description: 'Introductory call to discuss solar panel options',
        createdBy: 'Jane Smith',
        createdAt: new Date('2023-02-15T10:15:00').toISOString(),
      },
      {
        id: '2',
        type: 'Email',
        description: 'Sent information packet with pricing and options',
        createdBy: 'Jane Smith',
        createdAt: new Date('2023-02-15T11:30:00').toISOString(),
      },
    ]

    return NextResponse.json(dummyInteractions)
  } catch (error) {
    console.error(`Error fetching interactions for lead ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    )
  }
}

// POST /api/crm/leads/[id]/interactions - Add an interaction to a lead
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()

    // Validate required fields
    if (!body.type || !body.description) {
      return NextResponse.json(
        { error: 'Interaction type and description are required' },
        { status: 400 }
      )
    }

    // For now, just return the submitted data with an ID
    const newInteraction = {
      id: `interaction-${Date.now()}`,
      type: body.type,
      description: body.description,
      leadId: id,
      createdBy: 'Current User', // This would come from auth context
      createdAt: new Date().toISOString(),
    }

    // In a real implementation, you would save to the database
    // Once your database schema is updated with the new models

    return NextResponse.json(newInteraction, { status: 201 })
  } catch (error) {
    console.error(`Error adding interaction to lead ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Failed to add interaction' },
      { status: 500 }
    )
  }
} 