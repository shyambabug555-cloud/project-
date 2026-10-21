// Auto-generated types for Supabase tables
// Matches the SQL schema in supabase/migration.sql.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          filename: string;
          src: string;
          thumbnail_src: string;
          width: number;
          height: number;
          file_size: string | null;
          mime_type: string;
          is_favorite: boolean;
          tags: string[];
          dimensions: string | null;
          camera: string | null;
          location: string | null;
          lens: string | null;
          created_at: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          src: string;
          thumbnail_src: string;
          width: number;
          height: number;
          file_size?: string | null;
          mime_type: string;
          is_favorite?: boolean;
          tags?: string[];
          dimensions?: string | null;
          camera?: string | null;
          location?: string | null;
          lens?: string | null;
          created_at?: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          src?: string;
          thumbnail_src?: string;
          width?: number;
          height?: number;
          file_size?: string | null;
          mime_type?: string;
          is_favorite?: boolean;
          tags?: string[];
          dimensions?: string | null;
          camera?: string | null;
          location?: string | null;
          lens?: string | null;
          created_at?: string;
          uploaded_at?: string;
        };
        Relationships: [];
      };
      albums: {
        Row: {
          id: string;
          name: string;
          description: string;
          cover_photo_id: string | null;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          cover_photo_id?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          cover_photo_id?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      persons: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      photo_categories: {
        Row: {
          photo_id: string;
          category_id: string;
        };
        Insert: {
          photo_id: string;
          category_id: string;
        };
        Update: {
          photo_id?: string;
          category_id?: string;
        };
        Relationships: [];
      };
      photo_albums: {
        Row: {
          photo_id: string;
          album_id: string;
        };
        Insert: {
          photo_id: string;
          album_id: string;
        };
        Update: {
          photo_id?: string;
          album_id?: string;
        };
        Relationships: [];
      };
      photo_persons: {
        Row: {
          photo_id: string;
          person_id: string;
        };
        Insert: {
          photo_id: string;
          person_id: string;
        };
        Update: {
          photo_id?: string;
          person_id?: string;
        };
        Relationships: [];
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
  };
}
