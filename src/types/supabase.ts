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
      colors: {
        Row: {
          id: string
          name: string
          hex_code: string
          photo_url: string | null
          origin: {
            name: string
            coordinates: [number, number]
            photo_url: string | null
          }
          process: {
            source_material: string
            type: 'pigment' | 'dye' | 'ink'
            application?: string
            recipe: string
            season: string
          }
          media_urls: string[]
          submitted_by: {
            name?: string
            email: string
          }
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['colors']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['colors']['Insert']>
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
  }
} 