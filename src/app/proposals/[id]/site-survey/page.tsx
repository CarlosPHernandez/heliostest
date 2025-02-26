'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, ChevronLeft } from 'lucide-react'
import SiteSurvey from '@/components/features/SiteSurvey'
import Link from 'next/link'
import type { Database } from '@/types/database.types'

interface PageProps {
  params: {
    id: string
  }
}

type Profile = Database['public']['Tables']['profiles']['Row']
type PendingProposal = Database['public']['Tables']['pending_proposals']['Row']

export default function SiteSurveyPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [proposal, setProposal] = useState<PendingProposal | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    checkAccess()
  }, [params.id])

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // First check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, is_admin')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError)
        throw profileError
      }

      const isAdmin = profile?.is_admin ?? false

      // Only check pending_proposals since site survey is only for initial designs
      const { data: pendingProposal, error: pendingError } = await supabase
        .from('pending_proposals')
        .select('*')
        .eq('id', params.id)
        .maybeSingle()

      if (pendingError && pendingError.code !== 'PGRST116') {
        throw pendingError
      }

      // If we found a pending proposal
      if (pendingProposal) {
        setProposal(pendingProposal)

        // Check access rights
        const isOwner = !pendingProposal.synced_to_user_id || pendingProposal.synced_to_user_id === user.id

        if (isAdmin || isOwner) {
          setHasAccess(true)
        } else {
          router.push('/dashboard')
        }
      } else {
        console.error('No pending proposal found with ID:', params.id)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess || !proposal) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-white hover:text-gray-200"
          >
            <ChevronLeft className="mr-1 h-4 w-4 text-white" />
            Back to Dashboard
          </Link>
        </div>
        <SiteSurvey proposal={proposal} />
      </div>
    </div>
  )
} 