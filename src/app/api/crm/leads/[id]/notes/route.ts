import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/crm/leads/[id]/notes - Get all notes for a lead
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user has access to this lead
    const { data: lead, error: leadError } = await supabase
      .from('Lead')
      .select('id')
      .eq('id', id)
      .eq('assignedTo', session.user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found or you do not have permission to access it' },
        { status: 404 }
      )
    }

    // Fetch notes for the lead
    const { data: notes, error: notesError } = await supabase
      .from('LeadNote')
      .select('*')
      .eq('leadId', id)
      .order('createdAt', { ascending: false })

    if (notesError) {
      console.error(`Error fetching notes for lead ${id}:`, notesError)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    // Get user information for each note
    const userIds = [...new Set(notes.map(note => note.createdBy))]
    const { data: users } = await supabase
      .from('User')
      .select('id, name')
      .in('id', userIds)

    // Map user names to notes
    const notesWithUserNames = notes.map(note => {
      const user = users?.find(u => u.id === note.createdBy)
      return {
        ...note,
        createdByName: user?.name || 'Unknown User'
      }
    })

    return NextResponse.json(notesWithUserNames)
  } catch (error) {
    console.error(`Error fetching notes for lead ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST /api/crm/leads/[id]/notes - Add a note to a lead
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params
    const body = await req.json()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user has access to this lead
    const { data: lead, error: leadError } = await supabase
      .from('Lead')
      .select('id')
      .eq('id', id)
      .eq('assignedTo', session.user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found or you do not have permission to access it' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!body.content) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const noteId = `note-${Date.now()}`

    // Create the note
    const { data: newNote, error: noteError } = await supabase
      .from('LeadNote')
      .insert({
        id: noteId,
        content: body.content,
        leadId: id,
        createdBy: session.user.id,
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single()

    if (noteError) {
      console.error(`Error creating note for lead ${id}:`, noteError)
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      )
    }

    // Update the lead's updatedAt timestamp
    await supabase
      .from('Lead')
      .update({ updatedAt: now })
      .eq('id', id)

    // Get user information
    const { data: user } = await supabase
      .from('User')
      .select('name')
      .eq('id', session.user.id)
      .single()

    // Return the new note with user name
    return NextResponse.json({
      ...newNote,
      createdByName: user?.name || 'Unknown User'
    }, { status: 201 })
  } catch (error) {
    console.error(`Error adding note to lead ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
} 