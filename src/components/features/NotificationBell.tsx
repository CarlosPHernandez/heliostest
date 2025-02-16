'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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

interface DatabaseMessage {
  id: string
  content: string
  created_at: string
  proposal_id: string
  is_read: boolean
  profiles: {
    full_name: string
  } | null
}

export default function NotificationBell() {
  const [messages, setMessages] = useState<Message[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
          profiles:author_id (
            full_name
          )
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .returns<DatabaseMessage[]>()

      if (error) throw error

      // Transform the data to match our Message interface
      const transformedMessages = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        proposal_id: msg.proposal_id,
        is_read: msg.is_read,
        author: {
          name: msg.profiles?.full_name || 'Unknown'
        }
      }))

      setMessages(transformedMessages)
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
        .update({
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .match({ id: messageId, is_read: false })

      if (error) throw error

      // Remove the message from the local state
      setMessages(messages.filter(m => m.id !== messageId))
      toast.success('Message marked as read')
    } catch (error) {
      console.error('Error marking message as read:', error)
      toast.error('Failed to mark message as read')
    }
  }

  const handleMessageClick = (proposalId: string) => {
    router.push(`/proposals/${proposalId}?openChat=true`)
    setShowDropdown(false)
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
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 max-h-[80vh] bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                {messages.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {messages.length} unread
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-[calc(80vh-80px)] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="bg-gray-50 rounded-full p-3 mb-4">
                    <Bell className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-center">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleMessageClick(message.proposal_id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.author.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(message.id)
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark as read
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 