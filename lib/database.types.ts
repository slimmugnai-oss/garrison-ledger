export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      content_blocks: {
        Row: {
          block_type: string
          created_at: string | null
          domain: string | null
          est_read_min: number
          hlevel: number | null
          horder: number
          html: string
          id: string
          search_tsv: unknown | null
          slug: string
          source_page: string
          summary: string | null
          tags: string[]
          text_content: string | null
          title: string
          topics: string[] | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          block_type?: string
          created_at?: string | null
          domain?: string | null
          est_read_min?: number
          hlevel?: number | null
          horder?: number
          html: string
          id?: string
          search_tsv?: unknown | null
          slug: string
          source_page: string
          summary?: string | null
          tags?: string[]
          text_content?: string | null
          title: string
          topics?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          block_type?: string
          created_at?: string | null
          domain?: string | null
          est_read_min?: number
          hlevel?: number | null
          horder?: number
          html?: string
          id?: string
          search_tsv?: unknown | null
          slug?: string
          source_page?: string
          summary?: string | null
          tags?: string[]
          text_content?: string | null
          title?: string
          topics?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          bah_amount: number | null
          birth_year: number | null
          branch: string | null
          career_interests: string[] | null
          children: Json | null
          clearance_level: string | null
          communication_pref: string | null
          component: string | null
          content_difficulty_pref: string | null
          created_at: string | null
          current_base: string | null
          current_pay_grade: string | null
          debt_amount_range: string | null
          deployment_count: number | null
          deployment_status: string | null
          education_goals: string[] | null
          education_level: string | null
          emergency_fund_range: string | null
          financial_priorities: string[] | null
          gender: string | null
          has_efmp: boolean | null
          housing_situation: string | null
          last_assessment_at: string | null
          last_deployment_date: string | null
          last_login_at: string | null
          long_term_goal: string | null
          marital_status: string | null
          monthly_income_range: string | null
          mos_afsc_rate: string | null
          next_base: string | null
          num_children: number | null
          owns_rental_properties: boolean | null
          pcs_count: number | null
          pcs_date: string | null
          plan_generated_count: number | null
          profile_completed: boolean | null
          profile_completed_at: string | null
          rank: string | null
          retirement_age_target: number | null
          spouse_age: number | null
          spouse_career_field: string | null
          spouse_employed: boolean | null
          spouse_military: boolean | null
          time_in_service_months: number | null
          timezone: string | null
          tsp_allocation: string | null
          tsp_balance_range: string | null
          updated_at: string | null
          urgency_level: string | null
          user_id: string
          years_of_service: number | null
        }
        Insert: {
          age?: number | null
          birth_year?: number | null
          gender?: string | null
          years_of_service?: number | null
          education_level?: string | null
          spouse_age?: number | null
          current_pay_grade?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          birth_year?: number | null
          gender?: string | null
          years_of_service?: number | null
          education_level?: string | null
          spouse_age?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          activated_at: string | null
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          reward_applied: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          referred_id: string
          referrer_id: string
          status?: string | null
          reward_applied?: boolean | null
          activated_at?: string | null
        }
        Update: {
          status?: string | null
          reward_applied?: boolean | null
          activated_at?: string | null
        }
        Relationships: []
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
