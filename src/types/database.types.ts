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
          full_name: string
          email: string
          phone: string | null
          address: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          user_id: string
          address: string
          system_size: number
          total_price: number
          number_of_panels: number
          package_type: 'standard' | 'premium' | 'elite'
          payment_type: 'cash' | 'finance' | 'lease'
          include_battery: boolean
          battery_type: string | null
          battery_count: number | null
          down_payment: number | null
          monthly_payment: number | null
          financing_term: number | null
          status: 'pending' | 'in_progress' | 'approved' | 'completed' | 'cancelled'
          stage: 'proposal' | 'onboarding' | 'design' | 'permitting' | 'installation' | 'completed'
          notes: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          system_size: number
          total_price: number
          number_of_panels: number
          package_type: 'standard' | 'premium' | 'elite'
          payment_type?: 'cash' | 'finance' | 'lease'
          include_battery?: boolean
          battery_type?: string | null
          battery_count?: number | null
          down_payment?: number | null
          monthly_payment?: number | null
          financing_term?: number | null
          status?: 'pending' | 'in_progress' | 'approved' | 'completed' | 'cancelled'
          stage?: 'proposal' | 'onboarding' | 'design' | 'permitting' | 'installation' | 'completed'
          notes?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          system_size?: number
          total_price?: number
          number_of_panels?: number
          package_type?: 'standard' | 'premium' | 'elite'
          payment_type?: 'cash' | 'finance' | 'lease'
          include_battery?: boolean
          battery_type?: string | null
          battery_count?: number | null
          down_payment?: number | null
          monthly_payment?: number | null
          financing_term?: number | null
          status?: 'pending' | 'in_progress' | 'approved' | 'completed' | 'cancelled'
          stage?: 'proposal' | 'onboarding' | 'design' | 'permitting' | 'installation' | 'completed'
          notes?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      pending_proposals: {
        Row: {
          id: string
          user_id: string | null
          package_type: 'standard' | 'premium' | null
          system_size: number
          panel_count: number
          monthly_production: number
          address: string
          monthly_bill: number
          payment_type: 'cash' | 'finance' | null
          financing: any | null
          status: 'pending' | 'saved'
          include_battery: boolean
          battery_type: string | null
          battery_count: number | null
          total_price: number
          temp_user_token: string | null
          synced_to_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          package_type?: 'standard' | 'premium' | null
          system_size: number
          panel_count: number
          monthly_production: number
          address: string
          monthly_bill: number
          payment_type?: 'cash' | 'finance' | null
          financing?: any | null
          status?: 'pending' | 'saved'
          include_battery?: boolean
          battery_type?: string | null
          battery_count?: number | null
          total_price: number
          temp_user_token?: string | null
          synced_to_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          package_type?: 'standard' | 'premium' | null
          system_size?: number
          panel_count?: number
          monthly_production?: number
          address?: string
          monthly_bill?: number
          payment_type?: 'cash' | 'finance' | null
          financing?: any | null
          status?: 'pending' | 'saved'
          include_battery?: boolean
          battery_type?: string | null
          battery_count?: number | null
          total_price?: number
          temp_user_token?: string | null
          synced_to_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      site_surveys: {
        Row: {
          id: string
          proposal_id: string
          property_type: string | null
          ownership_type: string | null
          is_hoa: boolean | null
          roof_age: number | null
          roof_material: string | null
          roof_condition: string | null
          roof_obstructions: string[] | null
          attic_access: boolean | null
          electrical_panel_location: string | null
          electrical_system_capacity: number | null
          status: 'pending' | 'in_progress' | 'completed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          property_type?: string | null
          ownership_type?: string | null
          is_hoa?: boolean | null
          roof_age?: number | null
          roof_material?: string | null
          roof_condition?: string | null
          roof_obstructions?: string[] | null
          attic_access?: boolean | null
          electrical_panel_location?: string | null
          electrical_system_capacity?: number | null
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          property_type?: string | null
          ownership_type?: string | null
          is_hoa?: boolean | null
          roof_age?: number | null
          roof_material?: string | null
          roof_condition?: string | null
          roof_obstructions?: string[] | null
          attic_access?: boolean | null
          electrical_panel_location?: string | null
          electrical_system_capacity?: number | null
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 