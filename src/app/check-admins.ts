import { supabase } from '@/lib/supabase'

export async function checkAdmins() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true)

    if (error) {
      console.error('Error fetching admin profiles:', error)
      return
    }

    console.log('Admin users:', profiles)
    return profiles
  } catch (error) {
    console.error('Error:', error)
  }
} 