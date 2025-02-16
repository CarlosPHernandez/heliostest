'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'

interface Author {
  id: string
  full_name: string
  is_admin: boolean
}

interface DatabaseMessage {
  id: string
  content: string
  created_at: string
  is_read: boolean
  author: Author | null
}

interface Message {
  id: string
  content: string
  created_at: string
  is_read: boolean
  author: {
    name: string
    is_admin: boolean
  }
}

interface SendMessageProps {
  proposalId: string
}

export default function SendMessage({ proposalId }: SendMessageProps) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkUser()
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel('project_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_messages',
          filter: `proposal_id=eq.${proposalId}`
        },
        () => {
          loadMessages() // Reload messages when changes occur
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [proposalId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const { data: messages, error: messagesError } = await supabase
        .from('project_messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          author:profiles(
            id,
            full_name,
            is_admin
          )
        `)
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true })
        .returns<DatabaseMessage[]>()

      if (messagesError) throw messagesError

      // Transform the data to match our Message interface
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read,
        author: {
          name: msg.author?.full_name || 'Unknown',
          is_admin: msg.author?.is_admin || false
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !userId) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('project_messages')
        .insert({
          proposal_id: proposalId,
          author_id: userId,
          content: message.trim()
        })

      if (error) throw error

      setMessage('')
      toast.success('Message sent successfully')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.author.is_admin ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${msg.author.is_admin
                    ? 'bg-[#1A1A1A] border border-gray-800 text-white'
                    : 'bg-blue-500 text-white shadow-lg'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-inherit">
                      {msg.author.name}
                    </span>
                    <span className={`text-xs ${msg.author.is_admin ? 'text-gray-400' : 'text-blue-100'
                      }`}>
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="break-words text-[15px]">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800 bg-[#0A0A0A]">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-[#1A1A1A] border border-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            disabled={submitting}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || !message.trim() || !userId}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 