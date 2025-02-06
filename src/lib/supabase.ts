import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

const authConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined
} as const

// Add redirectTo to auth config at runtime
const fullAuthConfig = {
  ...authConfig,
  redirectTo: `${siteUrl}/auth/callback`
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: fullAuthConfig
}) 