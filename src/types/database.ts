export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          events: Json;
          total_cost_bbd: number;
          total_duration_minutes: number;
          preferences: Json;
          special_notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date: string;
          events: Json;
          total_cost_bbd: number;
          total_duration_minutes: number;
          preferences: Json;
          special_notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          events?: Json;
          total_cost_bbd?: number;
          total_duration_minutes?: number;
          preferences?: Json;
          special_notes?: string | null;
          created_at?: string | null;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          address: string;
          lat: number | null;
          lng: number | null;
          category: string;
          qr_code_id: string;
          stamp_emoji: string;
          stamp_name: string;
          is_active: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          lat?: number | null;
          lng?: number | null;
          category: string;
          qr_code_id: string;
          stamp_emoji: string;
          stamp_name: string;
          is_active?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          lat?: number | null;
          lng?: number | null;
          category?: string;
          qr_code_id?: string;
          stamp_emoji?: string;
          stamp_name?: string;
          is_active?: boolean;
          created_at?: string | null;
        };
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          plan_id: string | null;
          checked_in_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_id: string;
          plan_id?: string | null;
          checked_in_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location_id?: string;
          plan_id?: string | null;
          checked_in_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
