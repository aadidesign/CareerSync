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
      applications: {
        Row: {
          applied_at: string | null
          company: string | null
          created_at: string
          id: string
          job_id: string | null
          job_title: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          company?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_title?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          company?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_title?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      job_skills: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          skill: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id?: string | null
          skill?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string | null
          skill?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      jobs: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          experience_level: string | null
          id: string
          is_remote: boolean | null
          job_type: string | null
          location: string | null
          logo_url: string | null
          posted_at: string | null
          salary_max: number | null
          salary_min: number | null
          source: string | null
          source_url: string | null
          title: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          experience_level?: string | null
          id?: string
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          logo_url?: string | null
          posted_at?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          source_url?: string | null
          title?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          experience_level?: string | null
          id?: string
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          logo_url?: string | null
          posted_at?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          source_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          email: string | null
          full_name: string | null
          id: string
          notification_settings: Json | null
          payment_method: Json | null
          shipping_address: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          notification_settings?: Json | null
          payment_method?: Json | null
          shipping_address?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          notification_settings?: Json | null
          payment_method?: Json | null
          shipping_address?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_application_note: {
        Args: {
          application_id: string
          note_content: string
        }
        Returns: undefined
      }
      add_application_status_history: {
        Args: {
          application_id: string
          status_value: string
        }
        Returns: undefined
      }
      create_application: {
        Args: {
          job_id: string
          notes_content: string
        }
        Returns: {
          id: string
        }
      }
      create_webhook: {
        Args: {
          webhook_name: string
          webhook_url: string
          webhook_events: string[]
        }
        Returns: {
          id: string
        }
      }
      delete_webhook: {
        Args: {
          webhook_id: string
        }
        Returns: undefined
      }
      get_application_by_id: {
        Args: {
          application_id: string
        }
        Returns: {
          id: string
          job_id: string
          user_id: string
          status: string
          applied_at: string
          updated_at: string
          job_title: string
          company: string
        }
      }
      get_application_notes: {
        Args: {
          application_id: string
        }
        Returns: {
          id: string
          content: string
          created_at: string
          created_by: string
        }[]
      }
      get_application_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total: number
          applied: number
          interview: number
          offer: number
          rejected: number
        }
      }
      get_application_status_history: {
        Args: {
          application_id: string
        }
        Returns: {
          id: string
          status: string
          date: string
          updated_by: string
        }[]
      }
      get_matching_preferences: {
        Args: Record<PropertyKey, never>
        Returns: {
          job_titles: string[]
          locations: string[]
          is_remote: boolean
          min_salary: number
          max_salary: number
          threshold: number
          skills: string[]
        }
      }
      get_notification_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          email_alerts: boolean
          push_alerts: boolean
          sms_alerts: boolean
          telegram_alerts: boolean
          whatsapp_alerts: boolean
        }
      }
      get_user_applications: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          job_id: string
          user_id: string
          status: string
          applied_at: string
          updated_at: string
          job_title: string
          company: string
        }[]
      }
      get_user_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          url: string
          events: string[]
          active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      update_application_status: {
        Args: {
          application_id: string
          new_status: string
        }
        Returns: undefined
      }
      update_matching_preferences: {
        Args: {
          job_titles: string[]
          user_locations: string[]
          is_remote: boolean
          min_salary: number
          max_salary: number
          threshold: number
          user_skills: string[]
        }
        Returns: undefined
      }
      update_notification_settings: {
        Args: {
          email_alerts: boolean
          push_alerts: boolean
          sms_alerts: boolean
          telegram_alerts: boolean
          whatsapp_alerts: boolean
        }
        Returns: undefined
      }
      update_webhook: {
        Args: {
          webhook_id: string
          webhook_name: string
          webhook_url: string
          webhook_events: string[]
          webhook_active: boolean
        }
        Returns: undefined
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & { row: any })
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & { row: any })
      ? PublicTableNameOrOptions
      : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]["Row"]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & { row: any })
    ? (Database["public"]["Tables"] & { row: any })[PublicTableNameOrOptions]["Row"]
    : never

export type NotificationSettings = {
  email_alerts: boolean;
  push_alerts: boolean;
  sms_alerts: boolean;
  telegram_alerts: boolean;
  whatsapp_alerts: boolean;
};

export interface MatchingPreferences {
  jobTitles: string[];
  skills: string[];
  locations: string[];
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  matchThreshold: number;
};

export interface RPCResponse<T> {
  data: T | null;
  error: {
    message: string;
    details: string;
    hint: string;
    code: string;
  } | null;
}
