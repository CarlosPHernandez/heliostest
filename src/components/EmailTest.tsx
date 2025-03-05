'use client'

import { useState } from 'react'
import { sendEmailAction } from '@/app/actions'

export default function EmailTest() {
  const [emailAddress, setEmailAddress] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailAddress || !subject || !message) {
      alert('Please fill out all fields')
      return
    }

    try {
      setStatus('loading')

      const response = await sendEmailAction(
        emailAddress,
        subject,
        message,
        message.replace(/\n/g, '<br>')
      )

      setResult(response)
      setStatus(response.success ? 'success' : 'error')
    } catch (error) {
      console.error('Error sending email:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
      setStatus('error')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Email Test</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="emailAddress"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="recipient@example.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Email subject"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            rows={4}
            placeholder="Enter your message here"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      {status !== 'idle' && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <div className={`p-4 rounded-md ${status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 