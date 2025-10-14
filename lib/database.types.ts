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
      api_quota: {
        Row: {
          count: number
          day: string
          route: string
          user_id: string
        }
        Insert: {
          count?: number
          day?: string
          route: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          route?: string
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          answers: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          block_type: string
          created_at: string | null
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
      entitlements: {
        Row: {
          current_period_end: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feed_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          promoted_slug: string | null
          published_at: string | null
          raw_html: string | null
          source_id: string
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          promoted_slug?: string | null
          published_at?: string | null
          raw_html?: string | null
          source_id: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          promoted_slug?: string | null
          published_at?: string | null
          raw_html?: string | null
          source_id?: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      plan_cache: {
        Row: {
          ai_enhanced: boolean | null
          ai_model: string | null
          assessment_hash: string
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          plan_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_enhanced?: boolean | null
          ai_model?: string | null
          assessment_hash: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          plan_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_enhanced?: boolean | null
          ai_model?: string | null
          assessment_hash?: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          plan_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          business_name: string | null
          calendly: string | null
          city: string | null
          coverage_states: string[] | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          license_id: string | null
          military_friendly: boolean | null
          name: string | null
          notes: string | null
          phone: string | null
          spouse_owned: boolean | null
          state: string | null
          stations: string[] | null
          status: string
          type: string
          updated_at: string | null
          va_expert: boolean | null
          website: string | null
          zip: string | null
        }
        Insert: {
          business_name?: string | null
          calendly?: string | null
          city?: string | null
          coverage_states?: string[] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          license_id?: string | null
          military_friendly?: boolean | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          spouse_owned?: boolean | null
          state?: string | null
          stations?: string[] | null
          status?: string
          type: string
          updated_at?: string | null
          va_expert?: boolean | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          business_name?: string | null
          calendly?: string | null
          city?: string | null
          coverage_states?: string[] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          license_id?: string | null
          military_friendly?: boolean | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          spouse_owned?: boolean | null
          state?: string | null
          stations?: string[] | null
          status?: string
          type?: string
          updated_at?: string | null
          va_expert?: boolean | null
          website?: string | null
          zip?: string | null
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
          activated_at?: string | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_applied?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_applied?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bah_amount: number | null
          branch: string | null
          career_interests: string[] | null
          children: Json | null
          clearance_level: string | null
          communication_pref: string | null
          component: string | null
          content_difficulty_pref: string | null
          created_at: string | null
          current_base: string | null
          debt_amount_range: string | null
          deployment_count: number | null
          deployment_status: string | null
          education_goals: string[] | null
          emergency_fund_range: string | null
          financial_priorities: string[] | null
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
        }
        Insert: {
          bah_amount?: number | null
          branch?: string | null
          career_interests?: string[] | null
          children?: Json | null
          clearance_level?: string | null
          communication_pref?: string | null
          component?: string | null
          content_difficulty_pref?: string | null
          created_at?: string | null
          current_base?: string | null
          debt_amount_range?: string | null
          deployment_count?: number | null
          deployment_status?: string | null
          education_goals?: string[] | null
          emergency_fund_range?: string | null
          financial_priorities?: string[] | null
          has_efmp?: boolean | null
          housing_situation?: string | null
          last_assessment_at?: string | null
          last_deployment_date?: string | null
          last_login_at?: string | null
          long_term_goal?: string | null
          marital_status?: string | null
          monthly_income_range?: string | null
          mos_afsc_rate?: string | null
          next_base?: string | null
          num_children?: number | null
          owns_rental_properties?: boolean | null
          pcs_count?: number | null
          pcs_date?: string | null
          plan_generated_count?: number | null
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          rank?: string | null
          retirement_age_target?: number | null
          spouse_career_field?: string | null
          spouse_employed?: boolean | null
          spouse_military?: boolean | null
          time_in_service_months?: number | null
          timezone?: string | null
          tsp_allocation?: string | null
          tsp_balance_range?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          bah_amount?: number | null
          branch?: string | null
          career_interests?: string[] | null
          children?: Json | null
          clearance_level?: string | null
          communication_pref?: string | null
          component?: string | null
          content_difficulty_pref?: string | null
          created_at?: string | null
          current_base?: string | null
          debt_amount_range?: string | null
          deployment_count?: number | null
          deployment_status?: string | null
          education_goals?: string[] | null
          emergency_fund_range?: string | null
          financial_priorities?: string[] | null
          has_efmp?: boolean | null
          housing_situation?: string | null
          last_assessment_at?: string | null
          last_deployment_date?: string | null
          last_login_at?: string | null
          long_term_goal?: string | null
          marital_status?: string | null
          monthly_income_range?: string | null
          mos_afsc_rate?: string | null
          next_base?: string | null
          num_children?: number | null
          owns_rental_properties?: boolean | null
          pcs_count?: number | null
          pcs_date?: string | null
          plan_generated_count?: number | null
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          rank?: string | null
          retirement_age_target?: number | null
          spouse_career_field?: string | null
          spouse_employed?: boolean | null
          spouse_military?: boolean | null
          time_in_service_months?: number | null
          timezone?: string | null
          tsp_allocation?: string | null
          tsp_balance_range?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string
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
          activated_at?: string | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_applied?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_applied?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
