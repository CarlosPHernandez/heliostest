'use client'

import { useState } from 'react'
import { ChevronLeft, Copy, Share2, Gift, Facebook, Twitter, Mail, MessageCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Referral {
  id: string
  name: string
  email: string
  status: 'pending' | 'completed'
  date: Date
}

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const [referrals] = useState<Referral[]>([])
  const referralLink = 'https://heliosnexus.com/ref/user123' // This would be dynamically generated

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Check out Helios Nexus for your solar needs!')}`,
    email: `mailto:?subject=${encodeURIComponent('Switch to Solar with Helios Nexus')}&body=${encodeURIComponent(`I thought you might be interested in going solar. Check it out here: ${referralLink}`)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out Helios Nexus for your solar needs! ${referralLink}`)}`,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refer Friends</h1>
          <p className="mt-2 text-gray-600">Share Helios Nexus with your friends and earn rewards!</p>
        </div>
        <Gift className="h-12 w-12 text-black" />
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
          <p className="text-3xl font-semibold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Successful Conversions</p>
          <p className="text-3xl font-semibold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Rewards Earned</p>
          <p className="text-3xl font-semibold text-black">$0</p>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Share Your Referral Link</h2>
        
        {/* Referral Link */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-600"
          />
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => window.open(shareLinks.facebook, '_blank')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            <Facebook className="h-5 w-5 mr-2" />
            Facebook
          </button>
          <button
            onClick={() => window.open(shareLinks.twitter, '_blank')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            <Twitter className="h-5 w-5 mr-2" />
            Twitter
          </button>
          <a
            href={shareLinks.email}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            <Mail className="h-5 w-5 mr-2" />
            Email
          </a>
          <button
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Referral History</h2>
        
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No referrals yet</p>
            <p className="text-sm text-gray-400">Share your referral link to start earning rewards!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {referrals.map((referral) => (
              <div key={referral.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{referral.name}</p>
                  <p className="text-sm text-gray-500">{referral.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {referral.date.toLocaleDateString()}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${referral.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {referral.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 