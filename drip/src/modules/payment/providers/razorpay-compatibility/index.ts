/**
 * Razorpay Payment Provider Compatibility Module for Medusa v2.13.1
 * Provides a wrapper around @tsc_tech/medusa-plugin-razorpay-payment (v0.0.11)
 * built for v2.7.1 to work with v2.13.1
 */

import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { RazorpayServiceWrapper } from "./service-wrapper"
import { RazorpayCompatibilityConfig } from "./types"

/**
 * Get compatibility wrapper provider export
 * This is called by Medusa's module system during initialization
 */
export default ModuleProvider(Modules.PAYMENT, {
  services: [RazorpayServiceWrapper],
})

/**
 * Export types for external use
 */
export type { RazorpayCompatibilityConfig } from "./types"
export { RazorpayServiceWrapper } from "./service-wrapper"
export { RazorpayProviderAdapter } from "./adapter"

/**
 * Helper to validate plugin setup
 */
export async function validateRazorpaySetup(
  container: any,
  options: RazorpayCompatibilityConfig
): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
}> {
  const logger = container.logger as any
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Check for required configuration
    if (!options.key_id) {
      errors.push("Missing required configuration: key_id")
    }

    if (!options.key_secret) {
      errors.push("Missing required configuration: key_secret")
    }

    // Check if @tsc_tech plugin is installed
    try {
      require("@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay")
    } catch (err) {
      errors.push(
        "@tsc_tech/medusa-plugin-razorpay-payment is not installed or not found"
      )
    }

    // Check for optional webhook secret in production
    if (process.env.NODE_ENV === "production" && !options.webhook_secret) {
      warnings.push(
        "webhook_secret not configured; webhook validation will be skipped in production"
      )
    }

    if (errors.length > 0) {
      logger.error("Razorpay configuration validation failed", errors)
    }

    if (warnings.length > 0) {
      logger.warn("Razorpay configuration warnings", warnings)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error) {
    logger.error("Error validating Razorpay setup", error)
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
      warnings,
    }
  }
}

/**
 * Get provider identifier
 */
export function getRazorpayProviderID(): string {
  return "razorpay"
}
