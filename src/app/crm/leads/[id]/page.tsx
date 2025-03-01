'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  Edit,
  MessageSquare,
  ArrowLeft,
  Clock,
  Briefcase,
  DollarSign,
  Plus,
  Send,
  AlertCircle
} from 'lucide-react'

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<any>(null)
  const [interactions, setInteractions] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const fetchLeadData = async () => {
      console.log('Lead detail page - Fetching lead data for ID:', params.id)
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Lead detail page - Session exists:', !!session)

      if (!session) {
        console.log('Lead detail page - No session, showing login prompt')
        setAuthenticated(false)
        setLoading(false)
        return
      }

      setAuthenticated(true)

      // Fetch lead details
      const { data: leadData, error: leadError } = await supabase
        .from('Lead')
        .select('*')
        .eq('id', params.id)
        .eq('assignedTo', session.user.id)
        .single()

      if (leadError) {
        console.error('Error fetching lead:', leadError)
        if (leadError.code === 'PGRST116') {
          // No rows returned - lead not found or not assigned to this user
          console.log('Lead not found or not assigned to this user')
          setAuthError(true)
          setLoading(false)
          return
        }
        return
      }

      console.log('Lead detail page - Lead data fetched successfully')
      setLead(leadData)

      // Fetch interactions
      const { data: interactionData, error: interactionError } = await supabase
        .from('Interaction')
        .select('*')
        .eq('leadId', params.id)
        .order('createdAt', { ascending: false })

      if (interactionError) {
        console.error('Error fetching interactions:', interactionError)
      } else {
        setInteractions(interactionData || [])
      }

      // Fetch notes
      const { data: noteData, error: noteError } = await supabase
        .from('LeadNote')
        .select('*, User:createdBy(name)')
        .eq('leadId', params.id)
        .order('createdAt', { ascending: false })

      if (noteError) {
        console.error('Error fetching notes:', noteError)
      } else {
        // Format notes with user names
        const formattedNotes = noteData?.map(note => ({
          ...note,
          createdByName: note.User?.name || 'Unknown User'
        })) || []
        setNotes(formattedNotes)
      }

      setLoading(false)
    }

    fetchLeadData()
  }, [supabase, params.id, router])

  // Handle adding a new note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newNote.trim()) return

    setIsSubmittingNote(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('You must be logged in to add a note')
      }

      const now = new Date().toISOString()
      const noteId = `note-${Date.now()}`

      // Create the note record
      const { data: newNoteData, error } = await supabase
        .from('LeadNote')
        .insert({
          id: noteId,
          content: newNote,
          leadId: params.id,
          createdBy: session.user.id,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update the lead's updatedAt timestamp
      await supabase
        .from('Lead')
        .update({ updatedAt: now })
        .eq('id', params.id)

      // Add the new note to the state
      setNotes(prev => [newNoteData, ...prev])
      setNewNote('')
    } catch (error: any) {
      console.error('Error adding note:', error)
      alert(error.message || 'Failed to add note. Please try again.')
    } finally {
      setIsSubmittingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view lead details</h3>
          <p className="text-gray-500 mb-6">You need to be signed in as a sales representative to view lead details.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/login?returnUrl=/crm/leads/${params.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </Link>
            <Link
              href="/crm/leads"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lead not found</h3>
          <p className="text-gray-500 mb-6">This lead doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/crm/leads"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Link>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Lead not found or you don't have permission to view it.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/crm/leads"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
      </div>
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'Qualified':
        return 'bg-green-100 text-green-800'
      case 'Proposal':
        return 'bg-purple-100 text-purple-800'
      case 'Won':
        return 'bg-emerald-100 text-emerald-800'
      case 'Lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/crm/leads"
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
        <div className="flex space-x-3">
          <Link
            href={`/crm/leads/${params.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Lead
          </Link>
          <Link
            href={`/crm/leads/${params.id}/interactions/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Interaction
          </Link>
        </div>
      </div>

      {/* Lead header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold leading-6 text-gray-900">
              {lead.firstName} {lead.lastName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {lead.company ? `${lead.jobTitle} at ${lead.company}` : lead.jobTitle}
            </p>
          </div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColorClass(lead.status)}`}>
            {lead.status}
          </span>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:text-indigo-900">
                  {lead.email || 'Not provided'}
                </a>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Phone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:text-indigo-900">
                  {lead.phone || 'Not provided'}
                </a>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Company
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {lead.company || 'Not provided'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {lead.address ? (
                  <>
                    {lead.address}
                    {lead.city && `, ${lead.city}`}
                    {lead.state && `, ${lead.state}`}
                    {lead.zipCode && ` ${lead.zipCode}`}
                    {lead.country && `, ${lead.country}`}
                  </>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Source
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {lead.source || 'Not specified'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Potential Value
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {lead.potentialValue ? `$${lead.potentialValue.toLocaleString()}` : 'Not specified'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(lead.createdAt)} at {formatTime(lead.createdAt)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(lead.updatedAt)} at {formatTime(lead.updatedAt)}
              </dd>
            </div>
            {lead.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {lead.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Notes section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Notes</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Add and view notes about this lead
            </p>
          </div>
          <Link
            href={`/crm/leads/${params.id}/notes/new`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Link>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {/* Add note form */}
          <form onSubmit={handleAddNote} className="mb-6">
            <label htmlFor="new-note" className="block text-sm font-medium text-gray-700 mb-2">
              Quick Note
            </label>
            <div className="flex items-start">
              <textarea
                id="new-note"
                name="new-note"
                rows={3}
                className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingNote}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmittingNote ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Notes list */}
          {notes.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">No notes have been added yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notes.map((note) => (
                <li key={note.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {note.createdByName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{note.createdByName}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(note.createdAt)} at {formatTime(note.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-line">{note.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Interactions section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Interactions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Communication history with this lead
            </p>
          </div>
          <Link
            href={`/crm/leads/${params.id}/interactions/new`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Interaction
          </Link>
        </div>

        {interactions.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-sm text-gray-500">No interactions recorded yet.</p>
            <Link
              href={`/crm/leads/${params.id}/interactions/new`}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Add First Interaction
            </Link>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {interactions.map((interaction) => (
                <li key={interaction.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {interaction.type}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {formatDate(interaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {interaction.contactedBy || 'Unknown'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>
                        {formatTime(interaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-900 whitespace-pre-line">
                      {interaction.notes}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 