'use client'

import { useState } from 'react'
import { sendSMSAction } from '@/app/actions'

export default function SMSTest() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber || !message) {
      alert('Please enter both phone number and message')
      return
    }

    try {
      setStatus('loading')

      // Format phone number to E.164 format if not already
      let formattedNumber = phoneNumber
      if (!phoneNumber.startsWith('+')) {
        formattedNumber = `+${phoneNumber.replace(/\D/g, '')}`
      }

      const response = await sendSMSAction(formattedNumber, message)

      setResult(response)
      setStatus(response.success ? 'success' : 'error')
    } catch (error) {
      console.error('Error sending SMS:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
      setStatus('error')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">SMS Test</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (E.164 format, e.g., +1234567890)
          </label>
          <input
            id="phoneNumber"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="+1234567890"
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
          {status === 'loading' ? 'Sending...' : 'Send SMS'}
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