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
      job_applications: {
        Row: {
          applied_at: string
          candidate_email: string
          candidate_name: string
          candidate_phone: string
          cover_letter: string | null
          external_id: string | null
          id: string
          job_id: string
          match_score: number | null
          notes: string | null
          resume_url: string
          skills: string[]
          status: string
          summary: string | null
        }
        Insert: {
          applied_at?: string
          candidate_email: string
          candidate_name: string
          candidate_phone: string
          cover_letter?: string | null
          external_id?: string | null
          id?: string
          job_id: string
          match_score?: number | null
          notes?: string | null
          resume_url: string
          skills: string[]
          status?: string
          summary?: string | null
        }
        Update: {
          applied_at?: string
          candidate_email?: string
          candidate_name?: string
          candidate_phone?: string
          cover_letter?: string | null
          external_id?: string | null
          id?: string
          job_id?: string
          match_score?: number | null
          notes?: string | null
          resume_url?: string
          skills?: string[]
          status?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          company: string
          created_at: string
          deadline: string
          department: string
          employment_type: string
          experience_level: string
          external_id: string | null
          id: string
          location: string
          qualifications: string
          request_data: Json | null
          responsibilities: string
          salary_currency: string
          salary_max: number
          salary_min: number
          skills_required: string[]
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          deadline: string
          department: string
          employment_type: string
          experience_level: string
          external_id?: string | null
          id?: string
          location: string
          qualifications: string
          request_data?: Json | null
          responsibilities: string
          salary_currency: string
          salary_max: number
          salary_min: number
          skills_required: string[]
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          deadline?: string
          department?: string
          employment_type?: string
          experience_level?: string
          external_id?: string | null
          id?: string
          location?: string
          qualifications?: string
          request_data?: Json | null
          responsibilities?: string
          salary_currency?: string
          salary_max?: number
          salary_min?: number
          skills_required?: string[]
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
