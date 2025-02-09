import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

// Get the redirect URL with the intended destination
const getRedirectTo = () => {
  if (typeof window === 'undefined') return `${siteUrl}/auth/callback`
  
  // Get the redirect parameter from the current URL
  const params = new URLSearchParams(window.location.search)
  const redirectPath = params.get('redirect') || '/dashboard'
  
  // Create the callback URL with the redirect parameter
  const callbackUrl = new URL('/auth/callback', siteUrl)
  callbackUrl.searchParams.set('next', redirectPath)
  
  return callbackUrl.toString()
}

const authConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  flowType: 'pkce',
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    name: 'sb-auth',
    lifetime: 60 * 60 * 24 * 7, // 7 days
    domain: '',
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  }
} as const

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...authConfig,
    redirectTo: getRedirectTo()
  }
}) 