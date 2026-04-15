/**
 * Type adapters for Razorpay plugin compatibility between Medusa v2.7.1 and v2.13.1
 * Handles differences in AbstractPaymentProvider interface and related types
 */

import { PaymentSessionStatus } from "@medusajs/utils"

/**
 * Medusa v2.7.1 to v2.13.1 API compatibility adapter
 * Maps old API calls to new ones when needed
 */
export interface RazorpayCompatibilityConfig {
  key_id: string
  key_secret: string
  razorpay_account?: string
  automatic_expiry_period?: number
  manual_expiry_period?: number
  refund_speed?: string
  webhook_secret?: string
  providers?: Array<{
    id: string
    options: Record<string, any>
  }>
}

/**
 * Wrapper for payment provider options to handle version differences
 */
export interface VersionedPaymentOptions {
  // v2.7.1 attributes
  providers?: Array<{
    id: string
    options: Record<string, any>
  }>
  // v2.13.1 attributes (merged with above for compatibility)
  [key: string]: any
}

/**
 * Payment intent data structure that works with both versions
 */
export interface UnifiedPaymentIntent {
  id: string
  amount: number
  currency: string
  customer_id?: string
  description?: string
  metadata?: Record<string, any>
  status: string
  error?: string
  raw?: any
}

/**
 * Session data that works across versions
 */
export interface UnifiedPaymentSession {
  id: string
  provider_id: string
  amount: number
  currency: string
  status: PaymentSessionStatus
  data: Record<string, any>
}

/**
 * Error handling adapter
 */
export interface VersionedMedusaError extends Error {
  __isProviderError?: boolean
  code?: string
  originalError?: any
}
