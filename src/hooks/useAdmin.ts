import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useAdmin(redirectTo: string | null = '/dashboard') {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function checkAdmin() {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session) {
          if (mounted) {
            setIsAdmin(false)
            setLoading(false)
          }
          return
        }

        // Get profile with admin status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()

        if (profileError) throw profileError

        if (mounted) {
          setIsAdmin(profile?.is_admin ?? false)
          if (!profile?.is_admin && redirectTo) {
            router.push(redirectTo)
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to check admin status'))
          setIsAdmin(false)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Initial check
    checkAdmin()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, redirectTo])

  return { isAdmin, loading, error }
} 