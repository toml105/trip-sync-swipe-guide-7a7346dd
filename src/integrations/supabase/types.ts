export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accommodation_votes: {
        Row: {
          accommodation_id: string
          id: string
          participant_id: string
          trip_id: string
          vote_type: string
          voted_at: string
        }
        Insert: {
          accommodation_id: string
          id?: string
          participant_id: string
          trip_id: string
          vote_type: string
          voted_at?: string
        }
        Update: {
          accommodation_id?: string
          id?: string
          participant_id?: string
          trip_id?: string
          vote_type?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_votes_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "trip_accommodations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "trip_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_votes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_votes: {
        Row: {
          destination_id: string
          id: string
          participant_id: string
          trip_id: string
          vote_type: string
          voted_at: string
        }
        Insert: {
          destination_id: string
          id?: string
          participant_id: string
          trip_id: string
          vote_type: string
          voted_at?: string
        }
        Update: {
          destination_id?: string
          id?: string
          participant_id?: string
          trip_id?: string
          vote_type?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_votes_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "trip_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destination_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "trip_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destination_votes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      transportation_votes: {
        Row: {
          id: string
          participant_id: string
          transportation_id: string
          trip_id: string
          vote_type: string
          voted_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          transportation_id: string
          trip_id: string
          vote_type: string
          voted_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          transportation_id?: string
          trip_id?: string
          vote_type?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transportation_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "trip_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportation_votes_transportation_id_fkey"
            columns: ["transportation_id"]
            isOneToOne: false
            referencedRelation: "trip_transportation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportation_votes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_accommodations: {
        Row: {
          amenities: string[] | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          name: string
          price_per_night_budget: number | null
          price_per_night_luxury: number | null
          price_per_night_mid_range: number | null
          rating: number | null
          trip_id: string
          type: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          price_per_night_budget?: number | null
          price_per_night_luxury?: number | null
          price_per_night_mid_range?: number | null
          rating?: number | null
          trip_id: string
          type: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          price_per_night_budget?: number | null
          price_per_night_luxury?: number | null
          price_per_night_mid_range?: number | null
          rating?: number | null
          trip_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_accommodations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_destinations: {
        Row: {
          ai_generated: boolean | null
          best_time_to_visit: string | null
          country: string
          created_at: string
          description: string | null
          estimated_cost_budget: number | null
          estimated_cost_luxury: number | null
          estimated_cost_mid_range: number | null
          highlights: string[] | null
          id: string
          image_url: string | null
          name: string
          travel_time_info: Json | null
          trip_id: string
          weather_info: Json | null
        }
        Insert: {
          ai_generated?: boolean | null
          best_time_to_visit?: string | null
          country: string
          created_at?: string
          description?: string | null
          estimated_cost_budget?: number | null
          estimated_cost_luxury?: number | null
          estimated_cost_mid_range?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          travel_time_info?: Json | null
          trip_id: string
          weather_info?: Json | null
        }
        Update: {
          ai_generated?: boolean | null
          best_time_to_visit?: string | null
          country?: string
          created_at?: string
          description?: string | null
          estimated_cost_budget?: number | null
          estimated_cost_luxury?: number | null
          estimated_cost_mid_range?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          travel_time_info?: Json | null
          trip_id?: string
          weather_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_destinations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_participants: {
        Row: {
          email: string | null
          has_voted_accommodations: boolean | null
          has_voted_destinations: boolean | null
          has_voted_transport: boolean | null
          id: string
          joined_at: string
          name: string
          trip_id: string
          user_id: string | null
        }
        Insert: {
          email?: string | null
          has_voted_accommodations?: boolean | null
          has_voted_destinations?: boolean | null
          has_voted_transport?: boolean | null
          id?: string
          joined_at?: string
          name: string
          trip_id: string
          user_id?: string | null
        }
        Update: {
          email?: string | null
          has_voted_accommodations?: boolean | null
          has_voted_destinations?: boolean | null
          has_voted_transport?: boolean | null
          id?: string
          joined_at?: string
          name?: string
          trip_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_participants_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_transportation: {
        Row: {
          arrival_location: string
          arrival_time: string | null
          created_at: string
          departure_location: string
          departure_time: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          price_budget: number | null
          price_luxury: number | null
          price_mid_range: number | null
          provider: string
          trip_id: string
          type: string
        }
        Insert: {
          arrival_location: string
          arrival_time?: string | null
          created_at?: string
          departure_location: string
          departure_time?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          price_budget?: number | null
          price_luxury?: number | null
          price_mid_range?: number | null
          provider: string
          trip_id: string
          type: string
        }
        Update: {
          arrival_location?: string
          arrival_time?: string | null
          created_at?: string
          departure_location?: string
          departure_time?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          price_budget?: number | null
          price_luxury?: number | null
          price_mid_range?: number | null
          provider?: string
          trip_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_transportation_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget: string
          created_at: string
          creator_id: string | null
          current_stage: string | null
          departure_location: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          total_travelers: number | null
          updated_at: string
        }
        Insert: {
          budget: string
          created_at?: string
          creator_id?: string | null
          current_stage?: string | null
          departure_location?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          total_travelers?: number | null
          updated_at?: string
        }
        Update: {
          budget?: string
          created_at?: string
          creator_id?: string | null
          current_stage?: string | null
          departure_location?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          total_travelers?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_trip_preferences: {
        Row: {
          created_at: string
          id: string
          preferences_text: string
          processed_preferences: Json | null
          trip_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          preferences_text: string
          processed_preferences?: Json | null
          trip_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          preferences_text?: string
          processed_preferences?: Json | null
          trip_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_trip_preferences_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
