'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'

interface SendMessageProps {
  proposalId: string
}

export default function SendMessage({ proposalId }: SendMessageProps) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    } catch (error) {
      console.error('Error checking user:', error)
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Send Message to Customer</h2>
      
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 input input-bordered"
          disabled={submitting}
        />
        <button
          type="submit"
          className="btn btn-primary"
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
  )
} 