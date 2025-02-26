'use client'

import { useState, useEffect } from 'react'
import { ClipboardCheck, AlertCircle, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import type { Database } from '@/types/database.types'

interface SiteSurveyStatusProps {
  proposalId: string
}

interface SiteSurvey {
  id: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
}

export default function SiteSurveyStatus({ proposalId }: SiteSurveyStatusProps) {
  const [survey, setSurvey] = useState<SiteSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialDesign, setIsInitialDesign] = useState(false)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadSurveyStatus()
  }, [proposalId])

  const loadSurveyStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.error('No active session')
        return
      }

      // Check if this is an initial design (pending proposal)
      const { data: pendingProposal, error: pendingError } = await supabase
        .from('pending_proposals')
        .select('id')
        .eq('id', proposalId)
        .maybeSingle()

      if (pendingError && pendingError.code !== 'PGRST116') {
        console.error('Error checking pending proposals:', pendingError)
      }

      setIsInitialDesign(!!pendingProposal)

      // Get site survey status
      const { data, error } = await supabase
        .from('site_surveys')
        .select('id, status, created_at')
        .eq('proposal_id', proposalId)
        .maybeSingle()

      if (error) {
        if (error.code === 'PGRST116') {
          // No survey found - this is expected for new proposals
          setSurvey(null)
        } else {
          console.error('Error loading survey status:', error)
        }
      } else {
        setSurvey(data)
      }
    } catch (error) {
      console.error('Error loading survey status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 bg-[#111111] rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  // If this is a final design, don't show the site survey section
  if (!isInitialDesign) {
    return null
  }

  if (!survey) {
    return (
      <div className="bg-[#111111] p-4 rounded-lg border border-yellow-500/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-400">Site Survey Required</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-300">
                Complete a site survey to help us create your final design proposal.
              </p>
            </div>
            <div className="mt-4">
              <Link
                href={`/proposals/${proposalId}/site-survey`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Start Survey
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (survey.status === 'completed') {
    return (
      <div className="bg-[#111111] p-4 rounded-lg border border-green-500/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <ClipboardCheck className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-400">Site Survey Completed</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-300">
                Your site survey has been completed and submitted. Our team will review the information and prepare your final design proposal.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111111] p-4 rounded-lg border border-blue-500/20">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-400">Site Survey In Progress</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-300">
              Please complete the site survey to help us create your final design proposal.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href={`/proposals/${proposalId}/site-survey`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Survey
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 