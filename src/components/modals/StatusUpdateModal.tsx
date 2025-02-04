'use client'

import { useState } from 'react'
import { X, Send } from 'lucide-react'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  currentStage: string
  currentStatus: string
  onUpdate: (data: {
    stage: string
    status: string
    notes: string
    sendEmail: boolean
  }) => void
}

const stages = [
  'Order Received',
  'Solar Design',
  'Permit Submission',
  'Installation Scheduled',
  'Installation Complete',
  'Final Inspection',
  'System Activation'
]

const statuses = ['active', 'completed', 'on-hold']

export default function StatusUpdateModal({
  isOpen,
  onClose,
  currentStage,
  currentStatus,
  onUpdate
}: StatusUpdateModalProps) {
  const [stage, setStage] = useState(currentStage)
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState('')
  const [sendEmail, setSendEmail] = useState(true)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ stage, status, notes, sendEmail })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-lg w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-6">Update Project Status</h2>
          
          <div className="space-y-6">
            {/* Stage Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Add any relevant notes about this status update..."
              />
            </div>

            {/* Email Notification */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-600">
                Send email notification to customer
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Send className="h-4 w-4 mr-2" />
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 