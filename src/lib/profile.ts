import { supabase } from './supabase'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>) {
  const { error } = await supabase
    .from('profiles')
    .insert([profile])

  if (error) {
    throw error
  }
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    throw uploadError
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  await updateProfile(userId, { avatar_url: publicUrl })

  return publicUrl
} 