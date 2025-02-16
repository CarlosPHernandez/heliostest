'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function AdminRegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-8">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Registration Request Submitted
          </h1>

          <p className="text-gray-600 mb-8">
            Thank you for your admin access request. An existing administrator will review your application
            and you will be notified via email once a decision has been made.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Please check your email to verify your account while your admin request is being reviewed.
            </p>

            <Link
              href="/login"
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 