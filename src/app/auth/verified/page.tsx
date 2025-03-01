'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function VerificationConfirmationPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mx-auto flex flex-col items-center justify-center mb-8">
            {/* Option 1: If you've saved the image to public/hogcover.jpg */}
            {/* 
            <Image 
              src="/hogcover.jpg" 
              alt="Hedgehog saying yes" 
              width={200} 
              height={200}
              className="rounded-md"
            />
            */}

            {/* Option 2: Using an img tag with an external URL */}
            <img
              src="https://i.kym-cdn.com/photos/images/newsfeed/001/700/569/1d4.jpg"
              alt="Hedgehog saying yes"
              className="rounded-md max-w-[200px]"
            />
            <div className="text-xl font-bold mt-2 text-gray-700">haha yes</div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verified Successfully!
          </h1>

          <p className="text-gray-600 mb-8">
            Thank you for verifying your email address. Your account is now fully activated and you can access all features of our platform.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>

            <div className="pt-4">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 