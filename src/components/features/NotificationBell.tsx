'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  created_at: string
  proposal_id: string
  is_read: boolean
  author: {
    name: string
  }
}

export default function NotificationBell() {
  const [messages, setMessages] = useState<Message[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
    
    // Subscribe to new messages
    const channel = supabase
      .channel('project_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages'
        },
        (payload) => {
          loadMessages() // Reload messages when new one arrives
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_messages')
        .select(`
          id,
          content,
          created_at,
          proposal_id,
          is_read,
          author:author_id (
            name
          )
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .returns<Message[]>()

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('project_messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error
      
      setMessages(messages.filter(m => m.id !== messageId))
      toast.success('Message marked as read')
    } catch (error) {
      console.error('Error marking message as read:', error)
      toast.error('Failed to mark message as read')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-gray-500"
      >
        <Bell className="h-6 w-6" />
        {messages.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {messages.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Notifications</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No new notifications</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {message.author.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsRead(message.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 