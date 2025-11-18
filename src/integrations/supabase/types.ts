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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          project_id: string
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id: string
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          invoice_date: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_date?: string | null
          status: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_date?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_article_seo: {
        Row: {
          article_id: string | null
          canonical_url: string | null
          created_at: string | null
          focus_keyword: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          schema_markup: Json | null
          twitter_card_type: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          canonical_url?: string | null
          created_at?: string | null
          focus_keyword?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          schema_markup?: Json | null
          twitter_card_type?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          canonical_url?: string | null
          created_at?: string | null
          focus_keyword?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          schema_markup?: Json | null
          twitter_card_type?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_seo_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: string
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cli_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          token_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          token_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          token_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      env_exposure_findings: {
        Row: {
          created_at: string | null
          description: string
          environment_id: string | null
          finding_type: string
          id: string
          location: string | null
          project_id: string | null
          recommendation: string | null
          resolved_at: string | null
          resolved_by: string | null
          scan_id: string | null
          severity: string
          status: string
          variable_name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          environment_id?: string | null
          finding_type: string
          id?: string
          location?: string | null
          project_id?: string | null
          recommendation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_id?: string | null
          severity: string
          status?: string
          variable_name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          environment_id?: string | null
          finding_type?: string
          id?: string
          location?: string | null
          project_id?: string | null
          recommendation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_id?: string | null
          severity?: string
          status?: string
          variable_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "env_exposure_findings_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "env_exposure_findings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "env_exposure_findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "env_exposure_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      env_exposure_scans: {
        Row: {
          completed_at: string | null
          critical_findings_count: number | null
          findings_count: number | null
          high_findings_count: number | null
          id: string
          low_findings_count: number | null
          medium_findings_count: number | null
          scan_results: Json | null
          scan_type: string
          started_at: string | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          critical_findings_count?: number | null
          findings_count?: number | null
          high_findings_count?: number | null
          id?: string
          low_findings_count?: number | null
          medium_findings_count?: number | null
          scan_results?: Json | null
          scan_type: string
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          critical_findings_count?: number | null
          findings_count?: number | null
          high_findings_count?: number | null
          id?: string
          low_findings_count?: number | null
          medium_findings_count?: number | null
          scan_results?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      environments: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "environments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          created_by: string
          environment_id: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          created_by: string
          environment_id: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          created_by?: string
          environment_id?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "secrets_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
        ]
      }
      security_leak_detections: {
        Row: {
          affected_tables: string[] | null
          affected_users: string[] | null
          auto_resolved: boolean | null
          created_at: string | null
          description: string
          detection_method: string | null
          detection_type: string
          id: string
          leaked_data_sample: string | null
          metadata: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source: string
        }
        Insert: {
          affected_tables?: string[] | null
          affected_users?: string[] | null
          auto_resolved?: boolean | null
          created_at?: string | null
          description: string
          detection_method?: string | null
          detection_type: string
          id?: string
          leaked_data_sample?: string | null
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          source: string
        }
        Update: {
          affected_tables?: string[] | null
          affected_users?: string[] | null
          auto_resolved?: boolean | null
          created_at?: string | null
          description?: string
          detection_method?: string | null
          detection_type?: string
          id?: string
          leaked_data_sample?: string | null
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source?: string
        }
        Relationships: []
      }
      security_scan_schedules: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          last_run_at: string | null
          next_run_at: string | null
          notification_emails: string[] | null
          scan_type: string
          schedule_cron: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          notification_emails?: string[] | null
          scan_type: string
          schedule_cron: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          notification_emails?: string[] | null
          scan_type?: string
          schedule_cron?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_page_metadata: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          custom_meta_tags: Json | null
          id: string
          meta_description: string | null
          meta_title: string | null
          no_follow: boolean | null
          no_index: boolean | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_path: string
          page_title: string
          schema_markup: Json | null
          twitter_card_type: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          custom_meta_tags?: Json | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          no_follow?: boolean | null
          no_index?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_path: string
          page_title: string
          schema_markup?: Json | null
          twitter_card_type?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          custom_meta_tags?: Json | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          no_follow?: boolean | null
          no_index?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_path?: string
          page_title?: string
          schema_markup?: Json | null
          twitter_card_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          bing_webmaster_id: string | null
          created_at: string | null
          default_meta_tags: Json | null
          default_og_image: string | null
          favicon_url: string | null
          google_analytics_id: string | null
          google_search_console_id: string | null
          id: string
          robots_txt: string | null
          site_description: string | null
          site_name: string | null
          structured_data_organization: Json | null
          updated_at: string | null
        }
        Insert: {
          bing_webmaster_id?: string | null
          created_at?: string | null
          default_meta_tags?: Json | null
          default_og_image?: string | null
          favicon_url?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          id?: string
          robots_txt?: string | null
          site_description?: string | null
          site_name?: string | null
          structured_data_organization?: Json | null
          updated_at?: string | null
        }
        Update: {
          bing_webmaster_id?: string | null
          created_at?: string | null
          default_meta_tags?: Json | null
          default_og_image?: string | null
          favicon_url?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          id?: string
          robots_txt?: string | null
          site_description?: string | null
          site_name?: string | null
          structured_data_organization?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sitemap_entries: {
        Row: {
          auto_generated: boolean | null
          change_frequency: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          last_modified: string | null
          priority: number | null
          url: string
        }
        Insert: {
          auto_generated?: boolean | null
          change_frequency?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_modified?: string | null
          priority?: number | null
          url: string
        }
        Update: {
          auto_generated?: boolean | null
          change_frequency?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_modified?: string | null
          priority?: number | null
          url?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string
          project_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by: string
          project_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string
          project_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          api_calls_count: number | null
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          projects_count: number | null
          secrets_count: number | null
          team_members_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_calls_count?: number | null
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          projects_count?: number | null
          secrets_count?: number | null
          team_members_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_calls_count?: number | null
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          projects_count?: number | null
          secrets_count?: number | null
          team_members_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_plan_limits: { Args: { user_uuid: string }; Returns: Json }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_max_requests: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      copy_environment_secrets: {
        Args: { p_source_env_id: string; p_target_env_id: string }
        Returns: number
      }
      create_environment: {
        Args: { p_name: string; p_project_id: string }
        Returns: string
      }
      delete_environment: {
        Args: { p_environment_id: string }
        Returns: boolean
      }
      delete_secret: { Args: { p_secret_id: string }; Returns: boolean }
      generate_cli_token: {
        Args: { p_expires_in_days?: number; p_name: string }
        Returns: Json
      }
      get_environment_secrets: {
        Args: { p_environment_id: string }
        Returns: {
          created_at: string
          description: string
          environment_id: string
          id: string
          key: string
          updated_at: string
          value: string
        }[]
      }
      get_plan_limits: {
        Args: { plan_type: Database["public"]["Enums"]["subscription_plan"] }
        Returns: Json
      }
      get_rate_limit_status: {
        Args: {
          p_endpoint: string
          p_max_requests: number
          p_window_seconds?: number
        }
        Returns: Json
      }
      has_project_access: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { article_slug: string }
        Returns: undefined
      }
      pull_encrypted_blob: {
        Args: { p_project_id: string; p_since_version?: number }
        Returns: Json
      }
      push_encrypted_blob: {
        Args: {
          p_checksum: string
          p_encrypted_data: string
          p_project_id: string
        }
        Returns: Json
      }
      revoke_cli_token: { Args: { p_token_id: string }; Returns: boolean }
      upsert_secret:
        | {
            Args: {
              p_description?: string
              p_environment_id: string
              p_key: string
              p_value: string
            }
            Returns: string
          }
        | {
            Args: { p_environment_id: string; p_key: string; p_value: string }
            Returns: string
          }
      validate_cli_token: { Args: { p_token: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "member" | "viewer"
      subscription_plan: "free" | "team" | "enterprise"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
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
    Enums: {
      app_role: ["admin", "member", "viewer"],
      subscription_plan: ["free", "team", "enterprise"],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
    },
  },
} as const
