'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, Send } from 'lucide-react'

export default function NewNotePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [noteContent, setNoteContent] = useState('')

  useEffect(() => {
    const fetchLeadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/signin')
        return
      }

      // Fetch lead details to verify access and get lead name
      const { data: lead, error } = await supabase
        .from('Lead')
        .select('firstName, lastName')
        .eq('id', params.id)
        .eq('assignedTo', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching lead:', error)
        setError('Lead not found or you do not have permission to add notes.')
        setLoading(false)
        return
      }

      setLeadName(`${lead.firstName} ${lead.lastName}`)
      setLoading(false)
    }

    fetchLeadData()
  }, [supabase, params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('You must be logged in to add a note')
      }

      const now = new Date().toISOString()
      const noteId = `note-${Date.now()}`

      // Create the note record
      const { error } = await supabase
        .from('LeadNote')
        .insert({
          id: noteId,
          content: noteContent,
          leadId: params.id,
          createdBy: session.user.id,
          createdAt: now,
          updatedAt: now
        })

      if (error) {
        throw error
      }

      // Update the lead's updatedAt timestamp
      await supabase
        .from('Lead')
        .update({ updatedAt: now })
        .eq('id', params.id)

      setSuccess(true)
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/crm/leads/${params.id}`)
      }, 1500)
    } catch (error: any) {
      console.error('Error adding note:', error)
      setError(error.message || 'Failed to add note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href={`/crm/leads/${params.id}`}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lead
        </Link>
        <h1 className="text-2xl font-bold">Add Note</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">Note added successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Add Note for {leadName}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Record important information about this lead
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Note Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                required
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-2 text-sm text-gray-500">
                Add any important details, follow-up items, or observations about this lead.
              </p>
            </div>

            <div className="flex justify-end">
              <Link
                href={`/crm/leads/${params.id}`}
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save Note
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 