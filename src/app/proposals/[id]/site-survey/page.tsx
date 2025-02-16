'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import SiteSurvey from '@/components/features/SiteSurvey'

interface PageProps {
  params: {
    id: string
  }
}

export default function SiteSurveyPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

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

      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('user_id')
        .eq('id', params.id)
        .single()

      if (error) throw error

      // Check if user owns the proposal or is an admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (proposal.user_id === user.id || profile?.is_admin) {
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
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-8">Site Survey</h1>
      <SiteSurvey
        proposalId={params.id}
        onComplete={() => router.push('/dashboard')}
      />
    </div>
  )
} 