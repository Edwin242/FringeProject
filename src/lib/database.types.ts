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
      admin_roles: {
        Row: {
          description: string | null
          id: string
          permissions: Json | null
          role_name: string
        }
        Insert: {
          description?: string | null
          id?: string
          permissions?: Json | null
          role_name: string
        }
        Update: {
          description?: string | null
          id?: string
          permissions?: Json | null
          role_name?: string
        }
        Relationships: []
      }
      administrators: {
        Row: {
          id: string
          role_id: string | null
        }
        Insert: {
          id: string
          role_id?: string | null
        }
        Update: {
          id?: string
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "administrators_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "administrators_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_description: string
          action_type: string
          administrator_id: string | null
          id: string
          timestamp: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          administrator_id?: string | null
          id?: string
          timestamp?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          administrator_id?: string | null
          id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_administrator_id_fkey"
            columns: ["administrator_id"]
            isOneToOne: false
            referencedRelation: "administrators"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string | null
          customer_id: string | null
          event_id: string | null
          id: string
          quantity: number
          status: string | null
          ticket_type_id: string | null
          total_price: number | null
        }
        Insert: {
          booking_date?: string | null
          customer_id?: string | null
          event_id?: string | null
          id?: string
          quantity: number
          status?: string | null
          ticket_type_id?: string | null
          total_price?: number | null
        }
        Update: {
          booking_date?: string | null
          customer_id?: string | null
          event_id?: string | null
          id?: string
          quantity?: number
          status?: string | null
          ticket_type_id?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_images: {
        Row: {
          caption: string | null
          created_at: string | null
          event_id: string | null
          id: string
          image_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          image_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string | null
          description: string | null
          id: string
          image_url: Json | null
          name: string
          schedule: string
          status: string | null
          venue_id: string | null
        }
        Insert: {
          capacity?: number | null
          category?: string | null
          description?: string | null
          id?: string
          image_url?: Json | null
          name: string
          schedule: string
          status?: string | null
          venue_id?: string | null
        }
        Update: {
          capacity?: number | null
          category?: string | null
          description?: string | null
          id?: string
          image_url?: Json | null
          name?: string
          schedule?: string
          status?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_date: string | null
          id: string
          invoice_number: string
          payment_status: string | null
          total_amount: number | null
          transaction_id: string | null
        }
        Insert: {
          billing_date?: string | null
          id?: string
          invoice_number: string
          payment_status?: string | null
          total_amount?: number | null
          transaction_id?: string | null
        }
        Update: {
          billing_date?: string | null
          id?: string
          invoice_number?: string
          payment_status?: string | null
          total_amount?: number | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          description: string | null
          id: string
          method_type: string
        }
        Insert: {
          description?: string | null
          id?: string
          method_type: string
        }
        Update: {
          description?: string | null
          id?: string
          method_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          registration_date: string | null
          role: string | null
        }
        Insert: {
          address?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          registration_date?: string | null
          role?: string | null
        }
        Update: {
          address?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          registration_date?: string | null
          role?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          id: string
          reason: string | null
          refund_amount: number | null
          refund_date: string | null
          transaction_id: string | null
        }
        Insert: {
          id?: string
          reason?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          transaction_id?: string | null
        }
        Update: {
          id?: string
          reason?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_bookings: {
        Row: {
          booking_id: string | null
          id: string
          is_checked_in: boolean | null
          seat_id: string | null
        }
        Insert: {
          booking_id?: string | null
          id?: string
          is_checked_in?: boolean | null
          seat_id?: string | null
        }
        Update: {
          booking_id?: string | null
          id?: string
          is_checked_in?: boolean | null
          seat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seat_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_bookings_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          id: string
          row_number: number | null
          section: string | null
          status: string | null
          venue_id: string | null
        }
        Insert: {
          id?: string
          row_number?: number | null
          section?: string | null
          status?: string | null
          venue_id?: string | null
        }
        Update: {
          id?: string
          row_number?: number | null
          section?: string | null
          status?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seats_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          config_name: string
          config_value: string | null
          description: string | null
          id: string
        }
        Insert: {
          config_name: string
          config_value?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          config_name?: string
          config_value?: string | null
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          capacity: number | null
          category: string
          description: string | null
          event_id: string | null
          id: string
          price: number | null
        }
        Insert: {
          capacity?: number | null
          category: string
          description?: string | null
          event_id?: string | null
          id?: string
          price?: number | null
        }
        Update: {
          capacity?: number | null
          category?: string
          description?: string | null
          event_id?: string | null
          id?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          booking_id: string | null
          date: string | null
          id: string
          payment_method_id: string | null
          status: string | null
          transaction_reference: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          date?: string | null
          id?: string
          payment_method_id?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          date?: string | null
          id?: string
          payment_method_id?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          description: string | null
          id: string
          location_id: string | null
          name: string
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          description?: string | null
          id?: string
          location_id?: string | null
          name: string
        }
        Update: {
          address?: string | null
          capacity?: number | null
          description?: string | null
          id?: string
          location_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
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
