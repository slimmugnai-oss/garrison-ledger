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
      assessments_old_20251010170109: {
        Row: {
          answers: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assessments_v2: {
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
        Relationships: [
          {
            foreignKeyName: "entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          id: number
          name: string
          path: string | null
          props: Json | null
          ua: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          path?: string | null
          props?: Json | null
          ua?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          path?: string | null
          props?: Json | null
          ua?: string | null
          user_id?: string | null
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
      refund_requests: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          reason: string | null
          status: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          reason?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          reason?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_models: {
        Row: {
          created_at: string | null
          id: string
          input: Json
          output: Json | null
          tool: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          input: Json
          output?: Json | null
          tool: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          input?: Json
          output?: Json | null
          tool?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_models_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      providers_public: {
        Row: {
          business_name: string | null
          calendly: string | null
          city: string | null
          coverage_states: string[] | null
          created_at: string | null
          email: string | null
          id: string | null
          license_id: string | null
          military_friendly: boolean | null
          name: string | null
          notes: string | null
          phone: string | null
          spouse_owned: boolean | null
          state: string | null
          stations: string[] | null
          type: string | null
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
          email?: string | null
          id?: string | null
          license_id?: string | null
          military_friendly?: boolean | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          spouse_owned?: boolean | null
          state?: string | null
          stations?: string[] | null
          type?: string | null
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
          email?: string | null
          id?: string | null
          license_id?: string | null
          military_friendly?: boolean | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          spouse_owned?: boolean | null
          state?: string | null
          stations?: string[] | null
          type?: string | null
          va_expert?: boolean | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      v_user_access: {
        Row: {
          is_premium: boolean | null
          user_id: string | null
        }
        Insert: {
          is_premium?: never
          user_id?: string | null
        }
        Update: {
          is_premium?: never
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      api_quota_inc: {
        Args: { p_day: string; p_route: string; p_user_id: string }
        Returns: {
          count: number
        }[]
      }
      assessments_save: {
        Args: { p_answers: Json; p_user_id: string }
        Returns: undefined
      }
      assessments_v2_save: {
        Args: { p_answers: Json; p_user_id: string }
        Returns: undefined
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      ping: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
