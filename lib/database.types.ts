export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      special_pay_catalog: {
        Row: {
          calc_method: string
          code: string
          created_at: string | null
          default_amount_cents: number | null
          effective_from: string | null
          effective_to: string | null
          name: string
          rules: Json | null
          updated_at: string | null
        }
        Insert: {
          calc_method: string
          code: string
          created_at?: string | null
          default_amount_cents?: number | null
          effective_from?: string | null
          effective_to?: string | null
          name: string
          rules?: Json | null
          updated_at?: string | null
        }
        Update: {
          calc_method?: string
          code?: string
          created_at?: string | null
          default_amount_cents?: number | null
          effective_from?: string | null
          effective_to?: string | null
          name?: string
          rules?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_special_pay_assignments: {
        Row: {
          amount_override_cents: number | null
          code: string
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_override_cents?: number | null
          code: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_override_cents?: number | null
          code?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_special_pay_assignments_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "special_pay_catalog"
            referencedColumns: ["code"]
          },
        ]
      }
      user_profiles: {
        Row: {
          currently_deployed_czte: boolean | null
          // ... rest of fields
        }
      }
    }
  }
}
