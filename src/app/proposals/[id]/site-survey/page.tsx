'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, ChevronLeft } from 'lucide-react'
import SiteSurvey from '@/components/features/SiteSurvey'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

export default function SiteSurveyPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [proposal, setProposal] = useState<any>(null)

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

      const { data: proposalData, error } = await supabase
        .from('proposals')
        .select('*, profiles(full_name)')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProposal(proposalData)

      // Check if user owns the proposal or is an admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (proposalData.user_id === user.id || profile?.is_admin) {
        setHasAccess(true)
      } else {
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
      <div className="flex justify-center items-center min-h-screen bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-32">
      {/* Header */}
      <div className="bg-[#111111] border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Site Survey</h1>
              <p className="text-sm text-gray-400">{proposal?.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#111111] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          <SiteSurvey
            proposalId={params.id}
            onComplete={() => router.push('/dashboard')}
          />
        </div>
      </div>
    </div>
  )
} 