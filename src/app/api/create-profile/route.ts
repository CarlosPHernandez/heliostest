import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { email } = await request.json()

    // First get the user's auth data
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ error: 'Error getting user' }, { status: 500 })
    }

    const user = users?.find(u => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          email: email,
          full_name: user.user_metadata?.full_name || 'Carlos',
        }
      ])
      .select()
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Error creating profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 