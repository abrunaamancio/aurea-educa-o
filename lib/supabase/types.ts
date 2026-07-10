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
      approved_students: {
        Row: {
          id: string
          email: string
          ciclo: string
          access_starts_at: string
          access_expires_at: string
          status: "active" | "expired" | "revoked"
          created_at: string
          first_login_at: string | null
        }
        Insert: {
          id?: string
          email: string
          ciclo: string
          access_starts_at: string
          access_expires_at?: string
          status?: "active" | "expired" | "revoked"
          created_at?: string
          first_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          ciclo?: string
          access_starts_at?: string
          access_expires_at?: string
          status?: "active" | "expired" | "revoked"
          created_at?: string
          first_login_at?: string | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          status: "draft" | "published"
          template_id: string
          domain: string | null
          vercel_domain_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: "draft" | "published"
          template_id?: string
          domain?: string | null
          vercel_domain_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: "draft" | "published"
          template_id?: string
          domain?: string | null
          vercel_domain_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      brandbook: {
        Row: {
          id: string
          portfolio_id: string
          colors: string[]
          fonts: string[]
          logo_light_url: string | null
          logo_dark_url: string | null
          slogan: string | null
          voice_tone: string | null
          market_sector: string | null
          raw_files: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          colors?: string[]
          fonts?: string[]
          logo_light_url?: string | null
          logo_dark_url?: string | null
          slogan?: string | null
          voice_tone?: string | null
          market_sector?: string | null
          raw_files?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          colors?: string[]
          fonts?: string[]
          logo_light_url?: string | null
          logo_dark_url?: string | null
          slogan?: string | null
          voice_tone?: string | null
          market_sector?: string | null
          raw_files?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_section: {
        Row: {
          id: string
          portfolio_id: string
          photo_url: string | null
          photo_crop_data: Json | null
          background_url: string | null
          name: string | null
          surname: string | null
          cta_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          photo_url?: string | null
          photo_crop_data?: Json | null
          background_url?: string | null
          name?: string | null
          surname?: string | null
          cta_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          photo_url?: string | null
          photo_crop_data?: Json | null
          background_url?: string | null
          name?: string | null
          surname?: string | null
          cta_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      about_section: {
        Row: {
          id: string
          portfolio_id: string
          bio_text: string | null
          source: "cv" | "brandbook" | "manual" | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          bio_text?: string | null
          source?: "cv" | "brandbook" | "manual" | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          bio_text?: string | null
          source?: "cv" | "brandbook" | "manual" | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          portfolio_id: string
          title: string
          cover_image_url: string | null
          order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          title: string
          cover_image_url?: string | null
          order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          title?: string
          cover_image_url?: string | null
          order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cases_section: {
        Row: {
          id: string
          portfolio_id: string
          active: boolean
          embed_type: "upload" | "link" | null
          file_url: string | null
          embed_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          active?: boolean
          embed_type?: "upload" | "link" | null
          file_url?: string | null
          embed_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          active?: boolean
          embed_type?: "upload" | "link" | null
          file_url?: string | null
          embed_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_section: {
        Row: {
          id: string
          portfolio_id: string
          email: string | null
          whatsapp: string | null
          linkedin_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          email?: string | null
          whatsapp?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          email?: string | null
          whatsapp?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, unknown>
  }
}
