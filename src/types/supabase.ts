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
      internship_company_profiles: {
        Row: {
          id: string
          session_id: string
          company_name: string
          company_overview: string
          company_mission: string
          team_structure: string
          company_values: string
          clients_or_products: string
          headquarters_location: string
          company_logo_url: string | null
          supervisor_name: string
          background_story: string
          industry: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          company_name: string
          company_overview: string
          company_mission: string
          team_structure: string
          company_values: string
          clients_or_products: string
          headquarters_location: string
          company_logo_url?: string | null
          supervisor_name: string
          background_story: string
          industry: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          company_name?: string
          company_overview?: string
          company_mission?: string
          team_structure?: string
          company_values?: string
          clients_or_products?: string
          headquarters_location?: string
          company_logo_url?: string | null
          supervisor_name?: string
          background_story?: string
          industry?: string
          created_at?: string
          updated_at?: string
        }
      }
      internship_company_details: {
        Row: {
          id: string
          session_id: string
          name: string
          industry: string
          description: string
          mission: string
          vision: string
          values: Json
          founded_year: number
          size: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          industry: string
          description: string
          mission: string
          vision: string
          values: Json
          founded_year: number
          size: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          industry?: string
          description?: string
          mission?: string
          vision?: string
          values?: Json
          founded_year?: number
          size?: string
          created_at?: string
          updated_at?: string
        }
      }
      internship_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          start_date: string
          created_at: string
          duration_weeks: number
          status: string
          job_title: string
          industry: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          start_date: string
          created_at?: string
          duration_weeks: number
          status?: string
          job_title: string
          industry: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          start_date?: string
          created_at?: string
          duration_weeks?: number
          status?: string
          job_title?: string
          industry?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 