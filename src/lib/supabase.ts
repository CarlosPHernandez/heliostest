import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

// Get the redirect URL with the intended destination
export function getRedirectTo(url: string) {
  const params = new URLSearchParams(new URL(url).search)
  const redirectPath = params.get('redirect') || '/'
  return redirectPath
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    cookieOptions: {
      name: 'sb-auth',
      lifetime: 60 * 60 * 24 * 7, // 7 days
      domain: '',
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    },
    redirectTo: getRedirectTo(siteUrl)
  }
}) 