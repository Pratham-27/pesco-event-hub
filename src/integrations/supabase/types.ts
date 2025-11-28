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
      announcements: {
        Row: {
          created_at: string
          created_by: string
          event_id: string | null
          id: string
          is_important: boolean
          link: string | null
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id?: string | null
          id?: string
          is_important?: boolean
          link?: string | null
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string | null
          id?: string
          is_important?: boolean
          link?: string | null
          message?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_discussions: {
        Row: {
          author_id: string
          created_at: string | null
          description: string
          id: string
          likes: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          description: string
          id?: string
          likes?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          description?: string
          id?: string
          likes?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      discussion_likes: {
        Row: {
          created_at: string | null
          discussion_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discussion_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          discussion_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_likes_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "community_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          discussion_id: string
          id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          discussion_id: string
          id?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          discussion_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "community_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          created_at: string | null
          created_by: string | null
          current_attendees: number
          date: string
          description: string
          featured: boolean | null
          id: string
          location: string
          max_attendees: number
          registration_open: boolean
          status: Database["public"]["Enums"]["event_status"]
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number
          date: string
          description: string
          featured?: boolean | null
          id?: string
          location: string
          max_attendees: number
          registration_open?: boolean
          status?: Database["public"]["Enums"]["event_status"]
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number
          date?: string
          description?: string
          featured?: boolean | null
          id?: string
          location?: string
          max_attendees?: number
          registration_open?: boolean
          status?: Database["public"]["Enums"]["event_status"]
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          course: string | null
          created_at: string | null
          email: string
          id: string
          mobile: string | null
          name: string
          semester: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          course?: string | null
          created_at?: string | null
          email: string
          id: string
          mobile?: string | null
          name: string
          semester?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          course?: string | null
          created_at?: string | null
          email?: string
          id?: string
          mobile?: string | null
          name?: string
          semester?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      decrement_event_attendees: {
        Args: { event_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_event_attendees: {
        Args: { event_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "student"
      event_category:
        | "Technical"
        | "Competition"
        | "Workshop"
        | "Cultural"
        | "Industrial Visit"
      event_status: "upcoming" | "live" | "completed" | "cancelled"
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
      app_role: ["admin", "moderator", "student"],
      event_category: [
        "Technical",
        "Competition",
        "Workshop",
        "Cultural",
        "Industrial Visit",
      ],
      event_status: ["upcoming", "live", "completed", "cancelled"],
    },
  },
} as const
