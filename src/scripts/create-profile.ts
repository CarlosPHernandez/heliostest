import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createProfile() {
  try {
    // First get the user's auth data
    const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail('carlos@heliosnexus.com')

    if (authError) {
      console.error('Error getting user:', authError)
      return
    }

    if (!authData?.user) {
      console.error('User not found')
      return
    }

    // Create the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: 'carlos@heliosnexus.com',
          full_name: authData.user.user_metadata?.full_name || 'Carlos',
        }
      ])
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('Profile created successfully:', profile)
  } catch (error) {
    console.error('Error:', error)
  }
}

createProfile() 