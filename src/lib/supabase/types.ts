// ─────────────────────────────────────────────────────────────────────────────
// Supabase Database Types — Agenta
// Generated manually to match the schema below.
// Run `npx supabase gen types typescript` after linking your project to auto-generate.
// ─────────────────────────────────────────────────────────────────────────────

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
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string | null
          id_number: string | null
          avatar_url: string | null
          is_verified: boolean
          role: "buyer" | "seller" | "both"
          member_since: string
          created_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          phone?: string | null
          id_number?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          role?: "buyer" | "seller" | "both"
          member_since?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
      }
      properties: {
        Row: {
          id: string
          seller_id: string | null
          address: string
          city: string
          rooms: number
          sqm: number
          floor: number
          total_floors: number
          price: number
          year_built: number | null
          parking: string | null
          hoa: number | null
          ac: string | null
          hot_water: string | null
          elevator: boolean
          balcony: boolean
          storage: boolean
          description: string | null
          kitchen_wall: string | null
          ceiling_height: number | null
          windows: number | null
          natural_light: string | null
          facing: string | null
          scan_date: string | null
          ai_agent_active: boolean
          status: "active" | "sold" | "draft"
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>
      }
      property_photos: {
        Row: {
          id: string
          property_id: string
          url: string
          position: number
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["property_photos"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["property_photos"]["Insert"]>
      }
      price_history: {
        Row: {
          id: string
          property_id: string
          price: number
          recorded_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["price_history"]["Row"], "id"> & { id?: string }
        Update: Partial<Database["public"]["Tables"]["price_history"]["Insert"]>
      }
      buyer_profiles: {
        Row: {
          id: string
          user_id: string
          budget_min: number | null
          budget_max: number | null
          rooms_min: number | null
          cities: string[]
          semantic_tags: string[]
          free_text: string | null
          purpose: "primary" | "investment"
          has_kids: boolean
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["buyer_profiles"]["Row"], "id" | "updated_at"> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["buyer_profiles"]["Insert"]>
      }
      saved_properties: {
        Row: {
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["saved_properties"]["Row"], "created_at"> & {
          created_at?: string
        }
        Update: never
      }
      visits: {
        Row: {
          id: string
          buyer_id: string
          property_id: string
          scheduled_at: string
          status: "pending" | "confirmed" | "completed" | "cancelled"
          seller_name: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["visits"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["visits"]["Insert"]>
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          reviewer_id: string
          visit_id: string | null
          rating: number
          text: string | null
          tags: string[]
          match_rating: number | null
          helpful_count: number
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "helpful_count"> & {
          id?: string
          created_at?: string
          helpful_count?: number
        }
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          type: "new_match" | "price_drop" | "visit_confirmed" | "new_property" | "info"
          property_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["alerts"]["Row"], "id" | "created_at" | "is_read"> & {
          id?: string
          created_at?: string
          is_read?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>
      }
      match_scores: {
        Row: {
          id: string
          user_id: string
          property_id: string
          score: number
          ai_summary: string | null
          match_tags: string[]
          status: "new" | "scheduled" | "visited" | "not_interested"
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["match_scores"]["Row"], "id" | "updated_at"> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["match_scores"]["Insert"]>
      }
      notification_preferences: {
        Row: {
          user_id: string
          email_matches: boolean
          push_matches: boolean
          email_visits: boolean
          push_visits: boolean
          price_drops: boolean
          weekly_report: boolean
          new_neighborhood: boolean
          ai_insights: boolean
        }
        Insert: Partial<Database["public"]["Tables"]["notification_preferences"]["Row"]> & {
          user_id: string
        }
        Update: Partial<Database["public"]["Tables"]["notification_preferences"]["Row"]>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Property = Database["public"]["Tables"]["properties"]["Row"]
export type BuyerProfile = Database["public"]["Tables"]["buyer_profiles"]["Row"]
export type Visit = Database["public"]["Tables"]["visits"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Alert = Database["public"]["Tables"]["alerts"]["Row"]
export type MatchScore = Database["public"]["Tables"]["match_scores"]["Row"]
