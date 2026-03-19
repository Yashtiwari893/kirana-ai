export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string
          owner_name: string
          shop_name: string
          whatsapp_number: string
          eleven_za_api_key: string | null
          plan: 'free' | 'basic' | 'pro'
          working_hours_start: string
          working_hours_end: string
          bot_greeting: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['shops']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['shops']['Insert']>
      }
      products: {
        Row: {
          id: string
          shop_id: string
          name: string
          name_aliases: string[]
          price: number
          unit: string
          category: string
          stock_qty: number
          reorder_level: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      customers: {
        Row: {
          id: string
          shop_id: string
          whatsapp_number: string
          name: string | null
          tags: string[]
          total_orders: number
          total_spend: number
          last_order_at: string | null
          reorder_score: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      orders: {
        Row: {
          id: string
          shop_id: string
          customer_id: string
          items: Json
          total_amount: number
          status: 'received' | 'packed' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed'
          raw_message: string
          cancel_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      broadcasts: {
        Row: {
          id: string
          shop_id: string
          message_text: string
          audience_segment: 'all' | 'regular' | 'new' | 'premium' | 'churned'
          sent_count: number
          read_count: number
          scheduled_at: string | null
          sent_at: string | null
          status: 'draft' | 'scheduled' | 'sent' | 'failed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['broadcasts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['broadcasts']['Insert']>
      }
    }
  }
}

export type Shop = Database['public']['Tables']['shops']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Broadcast = Database['public']['Tables']['broadcasts']['Row']

export interface OrderItem {
  product_id: string | null
  name: string
  quantity: number
  unit: string
  price: number
  matched: boolean
}
