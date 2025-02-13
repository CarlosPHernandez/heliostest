'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Send, Trash2, Loader2 } from 'lucide-react'

interface Note {
  id: string
  content: string
  created_at: string
  author: {
    name: string
  }
}

interface ProjectNotesProps {
  proposalId: string
}

export default function ProjectNotes({ proposalId }: ProjectNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadNotes()

    // Subscribe to new notes
    const channel = supabase
      .channel('project_notes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_notes',
          filter: `proposal_id=eq.${proposalId}`
        },
        () => {
          loadNotes() // Reload notes when changes occur
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [proposalId])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_notes')
        .select(`
          id,
          content,
          created_at,
          author:author_id (
            name
          )
        `)
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false })
        .returns<Note[]>()

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('project_notes')
        .insert({
          proposal_id: proposalId,
          content: newNote.trim()
        })

      if (error) throw error

      setNewNote('')
      toast.success('Note added successfully')
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
      
      setNotes(notes.filter(n => n.id !== noteId))
      toast.success('Note deleted successfully')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Internal Notes</h2>
      
      <form onSubmit={addNote} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="flex-1 input input-bordered"
          disabled={submitting}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !newNote.trim()}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No notes yet
        </p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{note.author.name}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{note.content}</p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 