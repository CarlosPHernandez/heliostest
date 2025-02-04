'use client'

import { useState } from 'react'
import { Send, User, Clock } from 'lucide-react'

interface Note {
  id: number
  content: string
  author: string
  timestamp: Date
  type: 'internal' | 'customer'
}

interface ProjectNotesProps {
  projectId: string
}

export default function ProjectNotes({ projectId }: ProjectNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      content: 'Customer requested additional information about panel specifications.',
      author: 'John Doe',
      timestamp: new Date('2024-02-10T10:30:00'),
      type: 'customer'
    },
    {
      id: 2,
      content: 'Roof measurements completed. South-facing roof area is suitable for installation.',
      author: 'Sarah Wilson',
      timestamp: new Date('2024-02-11T14:15:00'),
      type: 'internal'
    }
  ])
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<'internal' | 'customer'>('internal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    const note: Note = {
      id: Date.now(),
      content: newNote.trim(),
      author: 'Current User', // This would come from auth context in a real app
      timestamp: new Date(),
      type: noteType
    }

    setNotes(prev => [note, ...prev])
    setNewNote('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Project Notes</h2>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as 'internal' | 'customer')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="internal">Internal Note</option>
              <option value="customer">Customer Communication</option>
            </select>
          </div>
          <div className="flex gap-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="self-end inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Add Note
            </button>
          </div>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`border rounded-lg p-4 ${
              note.type === 'internal' ? 'bg-gray-50' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">{note.author}</span>
                <span className="text-sm text-gray-500">
                  {note.type === 'internal' ? '(Internal)' : '(Customer)'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {note.timestamp.toLocaleDateString()} {note.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <p className="text-gray-600">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 