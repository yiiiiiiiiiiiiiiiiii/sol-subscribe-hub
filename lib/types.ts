export type SubscriptionPlan = "monthly" | "quarterly" | "yearly"

export interface Service {
  id: string
  name: string
  description: string
  category: string
  publisher_address: string
  image_url?: string
  features: string[]
  callback_url?: string
  webhook_url?: string
  webhook_events?: string[]
  monthly_price?: number
  quarterly_price?: number
  yearly_price?: number
  auto_renewal: boolean
  subscribers_count: number
  created_at: string
  updated_at?: string
}

export interface Subscription {
  id: string
  service_id: string
  subscriber_address: string
  plan: SubscriptionPlan
  price: number
  auto_renewal: boolean
  status: "active" | "expired" | "cancelled"
  transaction_hash?: string
  start_date: string
  end_date: string
  created_at: string
}
