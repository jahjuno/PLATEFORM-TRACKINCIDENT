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
      incidents: {
        Row: {
          id: string
          title: string
          description: string
          platform: string
          status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
          priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
          responsible_team: string
          created_at: string
          resolved_at: string | null
          rca_document: string | null
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          platform: string
          status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
          priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
          responsible_team: string
          created_at?: string
          resolved_at?: string | null
          rca_document?: string | null
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          platform?: string
          status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
          priority?: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
          responsible_team?: string
          created_at?: string
          resolved_at?: string | null
          rca_document?: string | null
          user_id?: string
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
  }
}