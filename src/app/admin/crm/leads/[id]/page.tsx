'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Send,
  Calendar
} from 'lucide-react'

// Dummy data for a single lead
const DUMMY_LEAD = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  address: '123 Main St, Charlotte, NC 28202',
  status: 'New',
  source: 'Website',
  createdAt: new Date('2023-02-15').toISOString(),
  updatedAt: new Date('2023-02-15').toISOString(),
}

// Dummy data for notes
const DUMMY_NOTES = [
  {
    id: '1',
    content: 'Initial contact made. Customer is interested in solar panel installation for their home.',
    createdBy: 'Jane Smith',
    createdAt: new Date('2023-02-15T10:30:00').toISOString(),
  },
  {
    id: '2',
    content: 'Scheduled a follow-up call for next week to discuss options in more detail.',
    createdBy: 'Jane Smith',
    createdAt: new Date('2023-02-15T14:45:00').toISOString(),
  },
]

// Dummy data for interactions
const DUMMY_INTERACTIONS = [
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

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [lead, setLead] = useState(DUMMY_LEAD)
  const [notes, setNotes] = useState(DUMMY_NOTES)
  const [interactions, setInteractions] = useState(DUMMY_INTERACTIONS)
  const [newNote, setNewNote] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  // Fetch lead data
  useEffect(() => {
    // This would be replaced with actual API call
    console.log('Fetching lead with ID:', id)

    // For demo purposes, we're using dummy data
    // In a real app, you would fetch from your API
  }, [id])

  // Handle adding a new note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newNote.trim()) return

    setIsSubmittingNote(true)

    try {
      // This would be replaced with actual API call
      console.log('Adding note:', newNote)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Add the new note to the list
      const newNoteObj = {
        id: `note-${Date.now()}`,
        content: newNote,
        createdBy: 'Current User', // This would come from auth context
        createdAt: new Date().toISOString(),
      }

      setNotes(prev => [newNoteObj, ...prev])
      setNewNote('')
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Failed to add note. Please try again.')
    } finally {
      setIsSubmittingNote(false)
    }
  }

  // Handle deleting the lead
  const handleDeleteLead = async () => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return
    }

    try {
      // This would be replaced with actual API call
      console.log('Deleting lead with ID:', id)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to CRM dashboard after successful deletion
      router.push('/admin/crm')
      router.refresh()
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Failed to delete lead. Please try again.')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/admin/crm"
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">
            {lead.firstName} {lead.lastName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/crm/leads/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Edit size={18} />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDeleteLead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Lead Information</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{lead.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{lead.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{lead.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                          lead.status === 'Proposal' ? 'bg-purple-100 text-purple-800' :
                            lead.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-red-100 text-red-800'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium">{lead.source}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Phone size={18} />
                  <span>Call Lead</span>
                </button>

                <button className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Mail size={18} />
                  <span>Send Email</span>
                </button>

                <Link
                  href={`/admin/crm/leads/${id}/schedule`}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Calendar size={18} />
                  <span>Schedule Meeting</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Interactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Note Form */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Add Note</h2>

              <form onSubmit={handleAddNote}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this lead..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingNote ? 'Adding...' : (
                      <>
                        <Plus size={18} />
                        <span>Add Note</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Notes List */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>

              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800 mb-2">{note.content}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{note.createdBy}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notes yet</p>
              )}
            </div>
          </div>

          {/* Interactions List */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Interactions</h2>

                <Link
                  href={`/admin/crm/leads/${id}/interactions/new`}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  <span>Add Interaction</span>
                </Link>
              </div>

              {interactions.length > 0 ? (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{interaction.type}</span>
                        <span className="text-sm text-gray-500">{new Date(interaction.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-800">{interaction.description}</p>
                      <p className="text-sm text-gray-500 mt-2">By: {interaction.createdBy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No interactions recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 