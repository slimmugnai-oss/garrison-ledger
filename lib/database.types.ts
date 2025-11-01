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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          code_used: string
          conversion_date: string | null
          created_at: string
          id: string
          referee_reward_amount: number | null
          referee_reward_given_at: string | null
          referred_user_id: string
          referrer_reward_amount: number | null
          referrer_reward_given_at: string | null
          referrer_user_id: string
          status: string
        }
        Insert: {
          code_used: string
          conversion_date?: string | null
          created_at?: string
          id?: string
          referee_reward_amount?: number | null
          referee_reward_given_at?: string | null
          referred_user_id: string
          referrer_reward_amount?: number | null
          referrer_reward_given_at?: string | null
          referrer_user_id: string
          status?: string
        }
        Update: {
          code_used?: string
          conversion_date?: string | null
          created_at?: string
          id?: string
          referee_reward_amount?: number | null
          referee_reward_given_at?: string | null
          referred_user_id?: string
          referrer_reward_amount?: number | null
          referrer_reward_given_at?: string | null
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      user_referral_stats: {
        Row: {
          last_referral_at: string | null
          total_conversions: number
          total_earnings_cents: number
          total_referrals_sent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          last_referral_at?: string | null
          total_conversions?: number
          total_earnings_cents?: number
          total_referrals_sent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          last_referral_at?: string | null
          total_conversions?: number
          total_earnings_cents?: number
          total_referrals_sent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reward_credits: {
        Row: {
          amount_cents: number
          created_at: string
          description: string | null
          id: string
          related_referral_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description?: string | null
          id?: string
          related_referral_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string | null
          id?: string
          related_referral_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reward_credits_related_referral_id_fkey"
            columns: ["related_referral_id"]
            isOneToOne: false
            referencedRelation: "referral_conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      // ... rest of tables omitted for brevity - keeping only referral tables at top
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
      [key: string]: any
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_or_create_referral_code: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_referral_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          last_referral_at: string
          total_conversions: number
          total_earnings_cents: number
          user_id: string
        }[]
      }
      get_user_credit_balance: { Args: { p_user_id: string }; Returns: number }
      process_referral_conversion: {
        Args: { p_referred_user_id: string }
        Returns: boolean
      }
      record_referral_usage: {
        Args: { p_code: string; p_referred_user_id: string }
        Returns: boolean
      }
      [key: string]: any
    }
    Enums: {
      [key: string]: any
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
