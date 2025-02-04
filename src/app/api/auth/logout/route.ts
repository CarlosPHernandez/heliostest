import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    // Clear the session cookies
    const cookieStore = cookies()
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
} 