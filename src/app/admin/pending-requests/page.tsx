'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PendingRequest {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  reason: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function PendingAdminRequests() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadPendingRequests()
  }, [])

  const loadPendingRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('pending_admin_registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setRequests(requests)
    } catch (error) {
      console.error('Error loading requests:', error)
      toast.error('Failed to load pending requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: PendingRequest) => {
    setProcessingId(request.id)
    try {
      // 1. Update the pending registration status
      const { error: updateError } = await supabase
        .from('pending_admin_registrations')
        .update({
          status: 'approved',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (updateError) throw updateError

      // 2. Set the user as admin in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', request.user_id)

      if (profileError) throw profileError

      toast.success('Admin request approved')
      loadPendingRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (request: PendingRequest) => {
    setProcessingId(request.id)
    try {
      const { error } = await supabase
        .from('pending_admin_registrations')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (error) throw error

      toast.success('Admin request rejected')
      loadPendingRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Pending Admin Requests
            </h1>
            <p className="mt-1 text-gray-500">
              Review and manage pending administrator access requests.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No pending requests found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.full_name}
                      </h3>
                      <p className="text-gray-500">{request.email}</p>
                      {request.phone && (
                        <p className="text-gray-500">{request.phone}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        Requested on {formatDate(request.created_at)}
                      </p>
                    </div>
                    {request.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={!!processingId}
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${processingId
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {processingId === request.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          disabled={!!processingId}
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${processingId
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {processingId === request.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Reason for Request</h4>
                    <p className="mt-1 text-gray-600">{request.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 