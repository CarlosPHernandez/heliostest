export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          is_admin: boolean
          name: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          is_admin?: boolean
          name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_admin?: boolean
          name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          user_id: string
          stage: 'proposal' | 'site_survey' | 'onboarding' | 'design' | 'permitting' | 'installation' | 'completed'
          status: 'pending' | 'in_progress' | 'approved' | 'completed' | 'cancelled'
          address: string
          system_size: number
          total_price: number
          package_type: string
          number_of_panels: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stage?: 'proposal' | 'site_survey' | 'onboarding' | 'design' | 'permitting' | 'installation' | 'completed'
          status?: 'pending' | 'in_progress' | 'approved' | 'completed' | 'cancelled'
          address: string
          system_size: number
          total_price: number
          package_type: string
          number_of_panels: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stage?: 'proposal' | 'site_survey' | 'onboarding' | 'design' | 'permitting' | 'installation' | 'completed'
          status?: 'pending' | 'in_progress' | 'approved' | 'completed' | 'cancelled'
          address?: string
          system_size?: number
          total_price?: number
          package_type?: string
          number_of_panels?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 