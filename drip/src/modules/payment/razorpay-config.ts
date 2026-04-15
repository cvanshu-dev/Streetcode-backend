/**
 * Razorpay Payment Configuration Helper
 * Provides utility functions for Razorpay payment provider setup and validation
 */

/**
 * Razorpay payment configuration interface
 */
export interface RazorpayPaymentConfig {
  key_id: string
  key_secret: string
  razorpay_account?: string
  automatic_expiry_period?: number // 12 minutes to 30 days in minutes
  manual_expiry_period?: number
  refund_speed?: "normal" | "optimized"
  webhook_secret?: string
}

/**
 * Validate Razorpay configuration
 * Returns validation result with detailed error messages
 */
export function validateRazorpayConfig(
  config: Partial<RazorpayPaymentConfig>
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!config.key_id) {
    errors.push("Missing required: key_id")
  }

  if (!config.key_secret) {
    errors.push("Missing required: key_secret")
  }

  // Validate key format (Razorpay keys have specific patterns)
  if (config.key_id && !config.key_id.startsWith("rzp_")) {
    warnings.push("key_id should start with 'rzp_' (test: 'rzp_test_', live: 'rzp_live_')")
  }

  // Check optional fields
  if (!config.webhook_secret && process.env.NODE_ENV === "production") {
    warnings.push(
      "webhook_secret not set; webhook validation will be disabled in production"
    )
  }

  // Validate expiry periods if set
  if (config.automatic_expiry_period !== undefined) {
    if (config.automatic_expiry_period < 12) {
      errors.push("automatic_expiry_period must be at least 12 minutes")
    }
    if (config.automatic_expiry_period > 43200) {
      // 30 days in minutes
      errors.push("automatic_expiry_period cannot exceed 30 days (43200 minutes)")
    }
  }

  if (config.manual_expiry_period !== undefined) {
    if (config.manual_expiry_period < 1) {
      errors.push("manual_expiry_period must be at least 1 minute")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get Razorpay configuration from environment variables
 */
export function getRazorpayConfigFromEnv(): Partial<RazorpayPaymentConfig> {
  return {
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
    razorpay_account:
      process.env.RAZORPAY_TEST_ACCOUNT || process.env.RAZORPAY_ACCOUNT,
    automatic_expiry_period: parseInt(
      process.env.RAZORPAY_EXPIRY_PERIOD || "30"
    ),
    manual_expiry_period: parseInt(
      process.env.RAZORPAY_MANUAL_EXPIRY || "20"
    ),
    refund_speed:
      (process.env.RAZORPAY_REFUND_SPEED as "normal" | "optimized") || "normal",
    webhook_secret:
      process.env.RAZORPAY_TEST_WEBHOOK_SECRET ||
      process.env.RAZORPAY_WEBHOOK_SECRET,
  }
}

/**
 * Check if Razorpay is in test mode (sandbox)
 */
export function isRazorpayTestMode(): boolean {
  const keyId = process.env.RAZORPAY_ID || ""
  return keyId.startsWith("rzp_test_")
}

/**
 * Get Razorpay mode as string
 */
export function getRazorpayMode(): string {
  if (isRazorpayTestMode()) {
    return "test (sandbox)"
  }
  return "live"
}

/**
 * Format amount to Razorpay format (paise - smallest unit)
 * Razorpay expects amounts in paise (1 rupee = 100 paise)
 */
export function formatAmountForRazorpay(amountInCurrency: number): number {
  // Multiply by 100 to convert to paise
  return Math.round(amountInCurrency * 100)
}

/**
 * Format amount from Razorpay format (paise) to currency
 */
export function formatAmountFromRazorpay(amountInPaise: number): number {
  // Divide by 100 to convert from paise
  return Math.round(amountInPaise / 100)
}

/**
 * Validate Razorpay signature for webhooks
 * Used to verify that webhooks came from Razorpay
 */
export function validateRazorpayWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn("Webhook secret not configured - skipping signature validation")
    return true
  }

  const crypto = require("crypto")

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")

  return signature === expectedSignature
}

/**
 * Get Razorpay payment status labels for UI
 */
export const RAZORPAY_PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Payment Pending",
  authorized: "Payment Authorized",
  captured: "Payment Captured",
  canceled: "Payment Canceled",
  failed: "Payment Failed",
  error: "Payment Error",
  success: "Payment Successful",
  requires_more: "Requires Additional Information",
}

/**
 * Get Razorpay error message from error code
 */
export function getRazorpayErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    BAD_REQUEST_ERROR: "Invalid payment request",
    GATEWAY_ERROR: "Payment gateway error",
    INVALID_ARGUMENT: "Invalid payment argument",
    RESOURCE_NOT_FOUND: "Payment resource not found",
    BAD_REQUEST: "Bad payment request",
    TIMEOUT: "Payment processing timeout",
    NETWORK_ERROR: "Network connection error",
    SERVER_ERROR: "Server error while processing payment",
  }

  return errorMessages[errorCode] || "Payment processing failed"
}

/**
 * Create Razorpay webhook URL for this deployment
 */
export function createRazorpayWebhookUrl(baseUrl: string): string {
  return `${baseUrl}/store/razorpay/webhooks`
}

/**
 * Get all required environment variables for Razorpay
 */
export function getRequiredRazorpayEnvVars(): {
  name: string
  required: boolean
  description: string
}[] {
  return [
    {
      name: "RAZORPAY_ID",
      required: true,
      description: "Razorpay API Key ID (from dashboard)",
    },
    {
      name: "RAZORPAY_SECRET",
      required: true,
      description: "Razorpay API Key Secret (from dashboard)",
    },
    {
      name: "RAZORPAY_ACCOUNT",
      required: false,
      description: "Razorpay Account ID for multi-account setup",
    },
    {
      name: "RAZORPAY_TEST_ACCOUNT",
      required: false,
      description: "Razorpay Test Account ID",
    },
    {
      name: "RAZORPAY_WEBHOOK_SECRET",
      required: false,
      description: "Webhook signature secret for production",
    },
    {
      name: "RAZORPAY_TEST_WEBHOOK_SECRET",
      required: false,
      description: "Webhook signature secret for testing",
    },
  ]
}

/**
 * Generate comprehensive Razorpay configuration report
 */
export function generateRazorpayConfigReport(): {
  timestamp: string
  mode: string
  isTestMode: boolean
  configured: boolean
  configStatus: {
    [key: string]: boolean | string
  }
  validation: {
    valid: boolean
    errors: string[]
    warnings: string[]
  }
} {
  const config = getRazorpayConfigFromEnv()
  const validation = validateRazorpayConfig(config)

  return {
    timestamp: new Date().toISOString(),
    mode: getRazorpayMode(),
    isTestMode: isRazorpayTestMode(),
    configured: validation.valid,
    configStatus: {
      hasKeyId: !!config.key_id,
      hasKeySecret: !!config.key_secret,
      hasRazorpayAccount: !!config.razorpay_account,
      hasWebhookSecret: !!config.webhook_secret,
      expiryPeriod: String(config.automatic_expiry_period || 30),
    },
    validation,
  }
}
