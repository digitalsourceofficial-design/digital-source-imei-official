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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      orders: {
        Row: {
          brand: string
          created_at: string
          expiration_date: string | null
          failure_reason: string | null
          garansi_bulan: number | null
          harga: number
          imei: string
          layanan_id: string
          layanan_nama: string
          model: string
          notification_sent: boolean | null
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_proof: string | null
          referral_code: string | null
          status: Database["public"]["Enums"]["order_status"]
          timeline: Json
          unblock_date: string | null
          whatsapp: string
        }
        Insert: {
          brand: string
          created_at?: string
          expiration_date?: string | null
          failure_reason?: string | null
          garansi_bulan?: number | null
          harga: number
          imei: string
          layanan_id: string
          layanan_nama: string
          model: string
          notification_sent?: boolean | null
          order_id: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof?: string | null
          referral_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          timeline?: Json
          unblock_date?: string | null
          whatsapp: string
        }
        Update: {
          brand?: string
          created_at?: string
          expiration_date?: string | null
          failure_reason?: string | null
          garansi_bulan?: number | null
          harga?: number
          imei?: string
          layanan_id?: string
          layanan_nama?: string
          model?: string
          notification_sent?: boolean | null
          order_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof?: string | null
          referral_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          timeline?: Json
          unblock_date?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_layanan_id_fkey"
            columns: ["layanan_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          history: Json
          referral_code: string
          total_komisi: number
          total_user: number
        }
        Insert: {
          created_at?: string
          history?: Json
          referral_code: string
          total_komisi?: number
          total_user?: number
        }
        Update: {
          created_at?: string
          history?: Json
          referral_code?: string
          total_komisi?: number
          total_user?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          estimasi: string
          garansi: string
          garansi_bulan: number | null
          harga: number
          nama: string
          service_id: string
          success_rate: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          estimasi: string
          garansi: string
          garansi_bulan?: number | null
          harga: number
          nama: string
          service_id: string
          success_rate?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          estimasi?: string
          garansi?: string
          garansi_bulan?: number | null
          harga?: number
          nama?: string
          service_id?: string
          success_rate?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          company: Json
          id: number
          payment: Json
          referral: Json
          updated_at: string
        }
        Insert: {
          company?: Json
          id?: number
          payment?: Json
          referral?: Json
          updated_at?: string
        }
        Update: {
          company?: Json
          id?: number
          payment?: Json
          referral?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      keep_alive: { Args: never; Returns: string }
    }
    Enums: {
      order_status:
        | "pesanan_dibuat"
        | "pembayaran_diterima"
        | "dalam_proses"
        | "berhasil_unblock"
        | "selesai"
        | "gagal"
      payment_method: "bank" | "ewallet" | "qris"
      referral_history_status: "pending" | "paid"
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
      order_status: [
        "pesanan_dibuat",
        "pembayaran_diterima",
        "dalam_proses",
        "berhasil_unblock",
        "selesai",
        "gagal",
      ],
      payment_method: ["bank", "ewallet", "qris"],
      referral_history_status: ["pending", "paid"],
    },
  },
} as const
