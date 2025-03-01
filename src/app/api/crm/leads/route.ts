import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Schema for lead data validation
const leadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.string().optional(),
  status: z.string(),
  assignedTo: z.string().optional().nullable(),
  territoryId: z.string().optional().nullable(),
})

// GET /api/crm/leads - Get all leads
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Only admin and sales_rep can access this endpoint
    if (userData?.role !== 'admin' && userData?.role !== 'sales_rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters for filtering
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    const territoryId = url.searchParams.get('territoryId')
    const assignedTo = url.searchParams.get('assignedTo')

    // Build the where clause for filtering
    let whereClause: any = {}

    if (status && status !== 'All') {
      whereClause.status = status
    }

    if (territoryId) {
      whereClause.territoryId = territoryId
    }

    // For sales reps, only show leads assigned to them or in their territories
    if (userData?.role === 'sales_rep') {
      // Get the territories this sales rep is assigned to
      const { data: userTerritories } = await supabase
        .from('UserTerritory')
        .select('territoryId')
        .eq('userId', session.user.id)

      const territoryIds = userTerritories?.map(t => t.territoryId) || []

      // Show leads that are either assigned to this user or in their territories
      whereClause = {
        ...whereClause,
        or: [
          { assignedTo: session.user.id },
          { territoryId: { in: territoryIds } }
        ]
      }
    } else if (assignedTo) {
      // If admin is filtering by assignedTo
      whereClause.assignedTo = assignedTo
    }

    // Execute the query
    let query = supabase
      .from('Lead')
      .select(`
        *,
        assignedUser:User(id, name, email),
        territory:SalesTerritory(id, name)
      `)
      .order('createdAt', { ascending: false })

    // Apply where clause
    if (Object.keys(whereClause).length > 0) {
      query = query.match(whereClause)
    }

    // Apply search if provided
    if (search) {
      const searchLower = search.toLowerCase()
      query = query.or(`firstName.ilike.%${searchLower}%,lastName.ilike.%${searchLower}%,email.ilike.%${searchLower}%,phone.ilike.%${searchLower}%`)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

// POST /api/crm/leads - Create a new lead
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role and permissions
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Only admin and sales_rep can create leads
    if (userData?.role !== 'admin' && userData?.role !== 'sales_rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If user is a sales rep, check if they have permission to create leads
    if (userData?.role === 'sales_rep') {
      const { data: permissions } = await supabase
        .from('CrmPermission')
        .select('canCreateLeads')
        .eq('userId', session.user.id)
        .single()

      if (!permissions?.canCreateLeads) {
        return NextResponse.json({ error: 'You do not have permission to create leads' }, { status: 403 })
      }
    }

    // Parse and validate request body
    const body = await req.json()
    const validationResult = leadSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.format()
      }, { status: 400 })
    }

    // Generate a unique ID for the lead
    const id = `lead-${Date.now()}`

    // If no assignedTo is provided and user is a sales rep, assign to self
    let assignedTo = validationResult.data.assignedTo
    if (!assignedTo && userData?.role === 'sales_rep') {
      assignedTo = session.user.id
    }

    // If no territoryId is provided and user is a sales rep, use their primary territory
    let territoryId = validationResult.data.territoryId
    if (!territoryId && userData?.role === 'sales_rep') {
      const { data: primaryTerritory } = await supabase
        .from('UserTerritory')
        .select('territoryId')
        .eq('userId', session.user.id)
        .eq('isPrimary', true)
        .single()

      territoryId = primaryTerritory?.territoryId || null
    }

    // Create the lead
    const { data: newLead, error } = await supabase
      .from('Lead')
      .insert({
        id,
        firstName: validationResult.data.firstName,
        lastName: validationResult.data.lastName,
        email: validationResult.data.email,
        phone: validationResult.data.phone,
        address: validationResult.data.address,
        source: validationResult.data.source || 'Website',
        status: validationResult.data.status,
        assignedTo,
        territoryId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Lead created successfully',
      lead: newLead
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}

// PATCH /api/crm/leads - Update multiple leads (bulk update)
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role and permissions
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Only admin and sales_rep can update leads
    if (userData?.role !== 'admin' && userData?.role !== 'sales_rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If user is a sales rep, check if they have permission to edit leads
    if (userData?.role === 'sales_rep') {
      const { data: permissions } = await supabase
        .from('CrmPermission')
        .select('canEditLeads')
        .eq('userId', session.user.id)
        .single()

      if (!permissions?.canEditLeads) {
        return NextResponse.json({ error: 'You do not have permission to edit leads' }, { status: 403 })
      }
    }

    // Parse request body
    const body = await req.json()
    const { ids, updates } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Lead IDs are required' }, { status: 400 })
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    // Validate updates
    const validationResult = leadSchema.partial().safeParse(updates)

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.format()
      }, { status: 400 })
    }

    // For sales reps, verify they can only update their assigned leads
    if (userData?.role === 'sales_rep') {
      // Get the territories this sales rep is assigned to
      const { data: userTerritories } = await supabase
        .from('UserTerritory')
        .select('territoryId')
        .eq('userId', session.user.id)

      const territoryIds = userTerritories?.map(t => t.territoryId) || []

      // Check if all leads are assigned to this user or in their territories
      const { data: accessibleLeads, error } = await supabase
        .from('Lead')
        .select('id')
        .in('id', ids)
        .or(`assignedTo.eq.${session.user.id},territoryId.in.(${territoryIds.join(',')})`)

      if (error) {
        console.error('Error checking lead access:', error)
        return NextResponse.json({ error: 'Failed to verify lead access' }, { status: 500 })
      }

      const accessibleLeadIds = accessibleLeads?.map(lead => lead.id) || []

      if (accessibleLeadIds.length !== ids.length) {
        return NextResponse.json({
          error: 'You do not have permission to update some of these leads'
        }, { status: 403 })
      }
    }

    // Update the leads
    const { data: updatedLeads, error } = await supabase
      .from('Lead')
      .update({
        ...validationResult.data,
        updatedAt: new Date().toISOString(),
      })
      .in('id', ids)
      .select()

    if (error) {
      console.error('Error updating leads:', error)
      return NextResponse.json({ error: 'Failed to update leads' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Leads updated successfully',
      count: updatedLeads?.length || 0
    })
  } catch (error) {
    console.error('Error updating leads:', error)
    return NextResponse.json({ error: 'Failed to update leads' }, { status: 500 })
  }
} 